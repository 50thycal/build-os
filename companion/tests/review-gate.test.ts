import { describe, expect, it } from "vitest";

import { checkReviewGate } from "../src/projection/review-gate.ts";
import type {
  IntegrityWarning,
  PullRequestState,
  ReviewRecord,
  WorkstreamState,
} from "../src/domain/state.ts";
import type { SourceRef } from "../src/domain/provenance.ts";

const APPROVED_HEAD = "1111111111111111111111111111111111111111";
const CURRENT_HEAD = "2222222222222222222222222222222222222222";
const FINAL_HEAD = "3333333333333333333333333333333333333333";
const MERGED_HEAD = "4444444444444444444444444444444444444444";

const SOURCE: SourceRef = {
  sourceType: "BUILD_OS_ARTIFACT",
  sourceId: "docs/workstreams/WS-011.md",
  sourceUrl: "https://github.com/50thycal/cargo-ship/blob/main/docs/workstreams/WS-011.md",
  observedAt: "2026-08-23T18:00:00Z",
};

const PR_SOURCE: SourceRef = {
  sourceType: "GITHUB_STATE",
  sourceId: "pr:84",
  sourceUrl: "https://github.com/50thycal/cargo-ship/pull/84",
  observedAt: "2026-08-23T18:00:00Z",
};

function record(overrides: Partial<ReviewRecord> = {}): ReviewRecord {
  return {
    prNumber: 84,
    verdict: "APPROVED",
    reviewedHead: APPROVED_HEAD,
    finalized: false,
    ...overrides,
  };
}

function workstream(overrides: Partial<WorkstreamState> = {}): WorkstreamState {
  return {
    projectId: "proj_cargo_ship",
    workstreamId: "WS-011",
    title: "Review gate",
    phase: "REVIEW",
    status: "ACTIVE",
    openDecisions: [],
    relatedPrNumbers: [84],
    relatedDecisionIds: [],
    buildCardReady: true,
    reviewRecords: [record()],
    sourcePath: "docs/workstreams/WS-011.md",
    source: SOURCE,
    conflicts: [],
    ...overrides,
  };
}

function pullRequest(overrides: Partial<PullRequestState> = {}): PullRequestState {
  return {
    projectId: "proj_cargo_ship",
    number: 84,
    title: "Region-aware simulation",
    lifecycle: "OPEN",
    draft: false,
    headBranch: "claude/regions",
    headSha: APPROVED_HEAD,
    baseBranch: "main",
    author: "50thycal",
    createdAt: "2026-08-21T09:00:00Z",
    updatedAt: "2026-08-23T17:00:00Z",
    mergeability: "CLEAN",
    reviewState: "APPROVED",
    ciState: "PASSED",
    requestedReviewers: [],
    approvedHeadShas: [],
    workstreamIds: ["WS-011"],
    sourceUrl: "https://github.com/50thycal/cargo-ship/pull/84",
    source: PR_SOURCE,
    ...overrides,
  };
}

const codes = (warnings: IntegrityWarning[]) => warnings.map((w) => w.code);

describe("REVIEW_STALE", () => {
  it("fires when the PR head moved past the approved head", () => {
    const warnings = checkReviewGate([workstream()], [pullRequest({ headSha: CURRENT_HEAD })]);
    expect(codes(warnings)).toEqual(["REVIEW_STALE"]);
    expect(warnings[0]!.message).toContain("1111111");
    expect(warnings[0]!.message).toContain("2222222");
  });

  it("stays quiet while the approved head is still the head", () => {
    expect(checkReviewGate([workstream()], [pullRequest()])).toEqual([]);
  });

  it("treats approved-with-follow-ups exactly like approved", () => {
    const ws = workstream({ reviewRecords: [record({ verdict: "APPROVED_WITH_FOLLOW_UPS" })] });
    expect(checkReviewGate([ws], [pullRequest()])).toEqual([]);
    expect(codes(checkReviewGate([ws], [pullRequest({ headSha: CURRENT_HEAD })]))).toEqual([
      "REVIEW_STALE",
    ]);
  });

  it("does not fire on an approval that names no head — that is a different warning", () => {
    // APPROVED_WITHOUT_REVIEWED_HEAD is raised at reconcile time, from the workstream alone.
    const ws = workstream({ reviewRecords: [record({ reviewedHead: undefined })] });
    expect(checkReviewGate([ws], [pullRequest({ headSha: CURRENT_HEAD })])).toEqual([]);
  });

  it("is satisfied by a GitHub review naming the current head, whatever the file says", () => {
    const pr = pullRequest({ headSha: CURRENT_HEAD, approvedHeadShas: [CURRENT_HEAD] });
    expect(checkReviewGate([workstream()], [pr])).toEqual([]);
  });
});

describe("merge finalization — the head a commit cannot name", () => {
  // The finalization commit changes the head by existing, so no SHA inside it can be the head
  // it produces. The file records the last fully-reviewed head and says finalization is pushed.
  const finalized = () => workstream({ reviewRecords: [record({ finalized: true })] });

  it("does not call a finalized PR stale — the divergence is expected", () => {
    const warnings = checkReviewGate([finalized()], [pullRequest({ headSha: FINAL_HEAD })]);
    expect(codes(warnings)).not.toContain("REVIEW_STALE");
  });

  it("asks for the final head to be verified on the PR instead", () => {
    const warnings = checkReviewGate([finalized()], [pullRequest({ headSha: FINAL_HEAD })]);
    expect(codes(warnings)).toEqual(["FINAL_HEAD_UNVERIFIED"]);
    expect(warnings[0]!.message).toContain("3333333");
    expect(warnings[0]!.message).toContain("1111111");
  });

  it("goes quiet once a GitHub review names the final head", () => {
    const pr = pullRequest({ headSha: FINAL_HEAD, approvedHeadShas: [APPROVED_HEAD, FINAL_HEAD] });
    expect(checkReviewGate([finalized()], [pr])).toEqual([]);
  });

  it("still reports a merge at a head nobody verified", () => {
    const ws = workstream({ phase: "COMPLETE", status: "COMPLETE" });
    const pr = pullRequest({ lifecycle: "MERGED", headSha: MERGED_HEAD });
    expect(codes(checkReviewGate([ws], [pr]))).toEqual(["MERGED_WITHOUT_APPROVAL"]);
  });
});

describe("MERGED_WITHOUT_APPROVAL", () => {
  it("fires when a merged PR's record never approved", () => {
    const ws = workstream({
      phase: "BUILDING",
      reviewRecords: [record({ verdict: "IN_REVIEW", reviewedHead: undefined })],
    });
    const warnings = checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })]);
    expect(codes(warnings)).toEqual(["MERGED_WITHOUT_APPROVAL"]);
    expect(warnings[0]!.message).toContain("IN_REVIEW");
  });

  it("fires when the merged commit is not the approved commit", () => {
    const ws = workstream({ phase: "COMPLETE", status: "COMPLETE" });
    const warnings = checkReviewGate(
      [ws],
      [pullRequest({ lifecycle: "MERGED", headSha: CURRENT_HEAD })],
    );
    expect(codes(warnings)).toEqual(["MERGED_WITHOUT_APPROVAL"]);
  });

  it("stays quiet when the merged commit is the approved commit", () => {
    const ws = workstream({ phase: "COMPLETE", status: "COMPLETE" });
    expect(checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })])).toEqual([]);
  });

  it("exempts a workstream written before v0.5, which records nothing at all", () => {
    const ws = workstream({ reviewRecords: [], phase: "COMPLETE", status: "COMPLETE" });
    expect(checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })])).toEqual([]);
  });

  it("does not fire on a closed-unmerged PR", () => {
    const ws = workstream({
      phase: "BUILDING",
      reviewRecords: [record({ verdict: "CHANGES_REQUIRED", reviewedHead: undefined })],
    });
    expect(checkReviewGate([ws], [pullRequest({ lifecycle: "CLOSED" })])).toEqual([]);
  });
});

describe("a workstream spanning several PRs", () => {
  // The regression: one workstream-level reviewed head compared against every linked PR. The
  // moment #91 was approved, #84 — merged weeks earlier at its own approved head — was reported
  // as merged without approval.
  const merged = () =>
    pullRequest({ number: 84, lifecycle: "MERGED", headSha: MERGED_HEAD, source: PR_SOURCE });
  const open = () =>
    pullRequest({
      number: 91,
      lifecycle: "OPEN",
      headSha: CURRENT_HEAD,
      source: { ...PR_SOURCE, sourceId: "pr:91" },
    });

  const spanning = (records: ReviewRecord[]) =>
    workstream({ phase: "REVIEW", relatedPrNumbers: [84, 91], reviewRecords: records });

  it("does not report an older merged PR because a newer one was approved", () => {
    const ws = spanning([
      record({ prNumber: 84, reviewedHead: MERGED_HEAD }),
      record({ prNumber: 91, reviewedHead: CURRENT_HEAD }),
    ]);
    expect(checkReviewGate([ws], [merged(), open()])).toEqual([]);
  });

  it("says nothing about a linked PR that has no record", () => {
    const ws = spanning([record({ prNumber: 91, reviewedHead: CURRENT_HEAD })]);
    expect(checkReviewGate([ws], [merged(), open()])).toEqual([]);
  });

  it("still reports the specific PR whose own record is contradicted", () => {
    const ws = spanning([
      record({ prNumber: 84, reviewedHead: APPROVED_HEAD }),
      record({ prNumber: 91, reviewedHead: CURRENT_HEAD }),
    ]);
    const warnings = checkReviewGate([ws], [merged(), open()]);
    expect(codes(warnings)).toEqual(["MERGED_WITHOUT_APPROVAL"]);
    expect(warnings[0]!.message).toContain("#84");
  });

  it("reports a stale head on the open PR without touching the merged one", () => {
    const ws = spanning([
      record({ prNumber: 84, reviewedHead: MERGED_HEAD }),
      record({ prNumber: 91, reviewedHead: APPROVED_HEAD }),
    ]);
    const warnings = checkReviewGate([ws], [merged(), open()]);
    expect(codes(warnings)).toEqual(["REVIEW_STALE"]);
    expect(warnings[0]!.message).toContain("#91");
  });

  it("allows a workstream to stay active after one of its PRs merges", () => {
    const ws = spanning([record({ prNumber: 91, reviewedHead: CURRENT_HEAD })]);
    expect(checkReviewGate([{ ...ws, phase: "BUILDING" }], [merged(), open()])).toEqual([]);
  });
});

describe("WORKSTREAM_PR_STATE_MISMATCH", () => {
  it("fires when a workstream is still in REVIEW after its PRs settled", () => {
    const ws = workstream({ reviewRecords: [] });
    const warnings = checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })]);
    expect(codes(warnings)).toEqual(["WORKSTREAM_PR_STATE_MISMATCH"]);
    expect(warnings[0]!.message).toContain("finalization");
  });

  it("fires when a workstream claims COMPLETE while a PR is still open", () => {
    const ws = workstream({ phase: "COMPLETE", status: "COMPLETE", reviewRecords: [] });
    expect(
      codes(checkReviewGate([ws], [pullRequest({ lifecycle: "DRAFT", draft: true })])),
    ).toEqual(["WORKSTREAM_PR_STATE_MISMATCH"]);
  });

  it("says nothing about a workstream with no linked PR", () => {
    const ws = workstream({ relatedPrNumbers: [], reviewRecords: [] });
    expect(checkReviewGate([ws], [pullRequest()])).toEqual([]);
  });

  it("carries both sources so the owner can open either side", () => {
    const ws = workstream({ reviewRecords: [] });
    const warnings = checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })]);
    expect(warnings[0]!.sources.map((s) => s.sourceType)).toEqual([
      "BUILD_OS_ARTIFACT",
      "GITHUB_STATE",
    ]);
  });
});
