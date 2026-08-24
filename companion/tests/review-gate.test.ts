import { describe, expect, it } from "vitest";

import { checkReviewGate } from "../src/projection/review-gate.ts";
import type {
  IntegrityWarning,
  PullRequestState,
  WorkstreamState,
} from "../src/domain/state.ts";
import type { SourceRef } from "../src/domain/provenance.ts";

const APPROVED_HEAD = "1111111111111111111111111111111111111111";
const CURRENT_HEAD = "2222222222222222222222222222222222222222";

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
    reviewVerdict: "APPROVED",
    reviewedHead: APPROVED_HEAD,
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
    const ws = workstream({ reviewVerdict: "APPROVED_WITH_FOLLOW_UPS" });
    expect(checkReviewGate([ws], [pullRequest()])).toEqual([]);
    expect(codes(checkReviewGate([ws], [pullRequest({ headSha: CURRENT_HEAD })]))).toEqual([
      "REVIEW_STALE",
    ]);
  });

  it("does not fire on an approval that names no head — that is a different warning", () => {
    // APPROVED_WITHOUT_REVIEWED_HEAD is raised at reconcile time, from the workstream alone.
    const ws = workstream({ reviewedHead: undefined });
    expect(checkReviewGate([ws], [pullRequest({ headSha: CURRENT_HEAD })])).toEqual([]);
  });
});

describe("MERGED_WITHOUT_APPROVAL", () => {
  it("fires when a merged PR's workstream never approved", () => {
    const ws = workstream({ reviewVerdict: "IN_REVIEW", reviewedHead: undefined, phase: "BUILDING" });
    const warnings = checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })]);
    expect(codes(warnings)).toEqual(["MERGED_WITHOUT_APPROVAL"]);
    expect(warnings[0]!.message).toContain("IN_REVIEW");
  });

  it("fires when the merged commit is not the approved commit", () => {
    const ws = workstream({ phase: "COMPLETE", status: "COMPLETE" });
    const warnings = checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED", headSha: CURRENT_HEAD })]);
    expect(codes(warnings)).toEqual(["MERGED_WITHOUT_APPROVAL"]);
  });

  it("stays quiet when the merged commit is the approved commit", () => {
    const ws = workstream({ phase: "COMPLETE", status: "COMPLETE" });
    expect(checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })])).toEqual([]);
  });

  it("exempts a workstream written before v0.5, which records no verdict at all", () => {
    const ws = workstream({ reviewVerdict: undefined, reviewedHead: undefined, phase: "COMPLETE", status: "COMPLETE" });
    expect(checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })])).toEqual([]);
  });

  it("does not fire on a closed-unmerged PR", () => {
    const ws = workstream({ reviewVerdict: "CHANGES_REQUIRED", reviewedHead: undefined, phase: "BUILDING" });
    expect(checkReviewGate([ws], [pullRequest({ lifecycle: "CLOSED" })])).toEqual([]);
  });
});

describe("WORKSTREAM_PR_STATE_MISMATCH", () => {
  it("fires when a workstream is still in REVIEW after its PRs settled", () => {
    const ws = workstream({ reviewVerdict: undefined, reviewedHead: undefined });
    const warnings = checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })]);
    expect(codes(warnings)).toEqual(["WORKSTREAM_PR_STATE_MISMATCH"]);
    expect(warnings[0]!.message).toContain("finalization");
  });

  it("fires when a workstream claims COMPLETE while a PR is still open", () => {
    const ws = workstream({ phase: "COMPLETE", status: "COMPLETE", reviewVerdict: undefined, reviewedHead: undefined });
    expect(codes(checkReviewGate([ws], [pullRequest({ lifecycle: "DRAFT", draft: true })]))).toEqual([
      "WORKSTREAM_PR_STATE_MISMATCH",
    ]);
  });

  it("allows a workstream to stay active after one of its PRs merges", () => {
    // A workstream may span several PRs; merging one does not finish it.
    const ws = workstream({
      phase: "BUILDING",
      relatedPrNumbers: [84, 91],
      reviewVerdict: undefined,
      reviewedHead: undefined,
    });
    const prs = [
      pullRequest({ lifecycle: "MERGED" }),
      pullRequest({ number: 91, lifecycle: "OPEN", headSha: CURRENT_HEAD }),
    ];
    expect(checkReviewGate([ws], prs)).toEqual([]);
  });

  it("says nothing about a workstream with no linked PR", () => {
    const ws = workstream({ relatedPrNumbers: [], reviewVerdict: undefined, reviewedHead: undefined });
    expect(checkReviewGate([ws], [pullRequest()])).toEqual([]);
  });

  it("carries both sources so the owner can open either side", () => {
    const ws = workstream({ reviewVerdict: undefined, reviewedHead: undefined });
    const warnings = checkReviewGate([ws], [pullRequest({ lifecycle: "MERGED" })]);
    expect(warnings[0]!.sources.map((s) => s.sourceType)).toEqual(["BUILD_OS_ARTIFACT", "GITHUB_STATE"]);
  });
});
