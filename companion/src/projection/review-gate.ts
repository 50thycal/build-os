/**
 * Cross-source review-gate checks (Build OS v0.5).
 *
 * These are the only checks that need both sides of the story: the workstream file says what was
 * reviewed, GitHub says what actually exists. Neither source can produce them alone, which is why
 * they live in the projection layer rather than in the Build OS reconciler.
 *
 * Every check reports. None repairs. A contradiction between durable records is the owner's to
 * resolve — a consumer that quietly picks a winner destroys the evidence that something went wrong.
 */

import { isApprovingVerdict } from "../domain/state.ts";
import type { IntegrityWarning, PullRequestState, WorkstreamState } from "../domain/state.ts";

/** Lifecycles where the branch can still move under an approval. */
const LIVE = new Set(["OPEN", "DRAFT"]);

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

/**
 * A workstream written before v0.5 has no review section at all. Its PRs are not retroactively
 * invalidated (plan §13), so the merge gate only applies once the workstream declares a verdict.
 * `Not started` counts as declared: a v0.5 workstream carries that value from its first commit.
 */
function participatesInGate(ws: WorkstreamState): boolean {
  return ws.reviewVerdict !== undefined;
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

    if (participatesInGate(ws)) {
      const approved = isApprovingVerdict(ws.reviewVerdict);

      for (const pr of linked) {
        if (approved && ws.reviewedHead && ws.reviewedHead !== pr.headSha) {
          // Stale in both directions: a live PR moved past its approval, and a merged PR merged
          // something nobody approved. The second is worse, so it is reported as the merge failure.
          if (LIVE.has(pr.lifecycle)) {
            warnings.push({
              code: "REVIEW_STALE",
              workstreamId: ws.workstreamId,
              message:
                `${ws.workstreamId} approved ${shortSha(ws.reviewedHead)} but PR #${pr.number} is now at ` +
                `${shortSha(pr.headSha)}. The approval is against an older commit; re-review the current head.`,
              sources: [ws.source, pr.source],
            });
          } else if (pr.lifecycle === "MERGED") {
            warnings.push({
              code: "MERGED_WITHOUT_APPROVAL",
              workstreamId: ws.workstreamId,
              message:
                `PR #${pr.number} merged at ${shortSha(pr.headSha)}, but ${ws.workstreamId} only approved ` +
                `${shortSha(ws.reviewedHead)}. The merged commit was never reviewed.`,
              sources: [ws.source, pr.source],
            });
          }
        }

        if (!approved && pr.lifecycle === "MERGED") {
          warnings.push({
            code: "MERGED_WITHOUT_APPROVAL",
            workstreamId: ws.workstreamId,
            message:
              `PR #${pr.number} is merged while ${ws.workstreamId} records verdict ` +
              `${ws.reviewVerdict}. Merge requires an approved verdict naming the merged head.`,
            sources: [ws.source, pr.source],
          });
        }
      }
    }

    warnings.push(...checkStateAgreement(ws, linked));
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
