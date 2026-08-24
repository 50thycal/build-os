/**
 * Cross-source review-gate checks (Build OS v0.5).
 *
 * These are the only checks that need both sides of the story: the workstream file says what was
 * reviewed, GitHub says what actually exists. Neither source can produce them alone, which is why
 * they live in the projection layer rather than in the Build OS reconciler.
 *
 * Two rules shape everything below.
 *
 * **A verdict belongs to one PR.** A workstream may span several, and comparing one
 * workstream-level head against all of them reports an older merged PR as unapproved the moment
 * a newer one is approved. A PR with no record is a PR this workstream makes no claim about, and
 * silence is the correct output for it.
 *
 * **A commit cannot name itself.** The merge-finalization commit changes the head by existing, so
 * no SHA written inside it can be the head it produces. The workstream file therefore records the
 * last head reviewed *in full*, and the final head is verified on the PR — through GitHub's own
 * review record, which is stamped with a commit id after that commit exists.
 *
 * Every check reports. None repairs. A contradiction between durable records is the owner's to
 * resolve — a consumer that quietly picks a winner destroys the evidence that something went wrong.
 */

import { isApprovingVerdict, reviewRecordFor } from "../domain/state.ts";
import type {
  IntegrityWarning,
  PullRequestState,
  ReviewRecord,
  WorkstreamState,
} from "../domain/state.ts";

/** Lifecycles where the branch can still move under an approval. */
const LIVE = new Set(["OPEN", "DRAFT"]);

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

/** True when an approving GitHub review names this exact commit. */
function approvedOnGitHub(pr: PullRequestState, sha: string): boolean {
  return pr.approvedHeadShas.includes(sha);
}

export function checkReviewGate(
  workstreams: WorkstreamState[],
  pullRequests: PullRequestState[],
): IntegrityWarning[] {
  const warnings: IntegrityWarning[] = [];
  const byNumber = new Map(pullRequests.map((pr) => [pr.number, pr]));

  for (const ws of workstreams) {
    const linked = ws.relatedPrNumbers
      .map((n) => byNumber.get(n))
      .filter((pr): pr is PullRequestState => pr !== undefined);

    for (const pr of linked) {
      const record = reviewRecordFor(ws.reviewRecords, pr.number);
      // No record for this PR: the workstream claims nothing about it, so neither do we. This is
      // what keeps a workstream's older merged PRs quiet, and what exempts pre-v0.5 files.
      if (record) warnings.push(...checkRecord(ws, pr, record));
    }

    warnings.push(...checkStateAgreement(ws, linked));
  }

  return warnings;
}

function checkRecord(
  ws: WorkstreamState,
  pr: PullRequestState,
  record: ReviewRecord,
): IntegrityWarning[] {
  const warnings: IntegrityWarning[] = [];
  const sources = [ws.source, pr.source];
  const approved = isApprovingVerdict(record.verdict);
  const headMatches = record.reviewedHead === pr.headSha;

  // GitHub's own approval on this exact commit satisfies the gate whatever the file says. It is
  // the more recent and less forgeable of the two records.
  if (approvedOnGitHub(pr, pr.headSha)) return warnings;

  if (approved && record.reviewedHead && !headMatches) {
    if (record.finalized) {
      // Expected divergence: the finalization commit moved the head past the reviewed one, and
      // by construction it could not name itself. What is missing is the verification of the
      // head it produced — which only the PR can carry.
      warnings.push({
        code: "FINAL_HEAD_UNVERIFIED",
        workstreamId: ws.workstreamId,
        message:
          `${ws.workstreamId} declares the finalization commit pushed on PR #${pr.number}, but no ` +
          `approving review names its current head ${shortSha(pr.headSha)}. The full review covered ` +
          `${shortSha(record.reviewedHead)}; the final head still needs verifying on the PR.`,
        sources,
      });
    } else if (LIVE.has(pr.lifecycle)) {
      warnings.push({
        code: "REVIEW_STALE",
        workstreamId: ws.workstreamId,
        message:
          `${ws.workstreamId} approved ${shortSha(record.reviewedHead)} but PR #${pr.number} is now at ` +
          `${shortSha(pr.headSha)}. The approval is against an older commit; re-review the current head.`,
        sources,
      });
    } else if (pr.lifecycle === "MERGED") {
      warnings.push({
        code: "MERGED_WITHOUT_APPROVAL",
        workstreamId: ws.workstreamId,
        message:
          `PR #${pr.number} merged at ${shortSha(pr.headSha)}, but ${ws.workstreamId} only approved ` +
          `${shortSha(record.reviewedHead)}. The merged commit was never reviewed.`,
        sources,
      });
    }
  }

  if (!approved && pr.lifecycle === "MERGED") {
    warnings.push({
      code: "MERGED_WITHOUT_APPROVAL",
      workstreamId: ws.workstreamId,
      message:
        `PR #${pr.number} is merged while ${ws.workstreamId} records verdict ` +
        `${record.verdict ?? "none"}. Merge requires an approved verdict naming the merged head.`,
      sources,
    });
  }

  return warnings;
}

/**
 * The v0.4 failure this closes: a workstream left saying `REVIEW` long after its PR merged, so the
 * durable record on main describes a state that no longer exists. Finalization is what moves it.
 */
function checkStateAgreement(ws: WorkstreamState, linked: PullRequestState[]): IntegrityWarning[] {
  if (linked.length === 0) return [];
  const warnings: IntegrityWarning[] = [];

  const settled = linked.every((pr) => pr.lifecycle === "MERGED" || pr.lifecycle === "CLOSED");
  const complete = ws.phase === "COMPLETE" || ws.status === "COMPLETE";

  if (ws.phase === "REVIEW" && settled) {
    const numbers = linked.map((pr) => `#${pr.number}`).join(", ");
    warnings.push({
      code: "WORKSTREAM_PR_STATE_MISMATCH",
      workstreamId: ws.workstreamId,
      message:
        `${ws.workstreamId} is still in REVIEW but every linked PR (${numbers}) is merged or closed. ` +
        `The merge-finalization step has not recorded the actual next phase.`,
      sources: [ws.source, ...linked.map((pr) => pr.source)],
    });
  }

  const stillLive = linked.filter((pr) => LIVE.has(pr.lifecycle));
  if (complete && stillLive.length > 0) {
    const numbers = stillLive.map((pr) => `#${pr.number}`).join(", ");
    warnings.push({
      code: "WORKSTREAM_PR_STATE_MISMATCH",
      workstreamId: ws.workstreamId,
      message:
        `${ws.workstreamId} is recorded COMPLETE but ${numbers} ${stillLive.length === 1 ? "is" : "are"} ` +
        `still open. Either the work is not finished or the PR was left behind.`,
      sources: [ws.source, ...stillLive.map((pr) => pr.source)],
    });
  }

  return warnings;
}
