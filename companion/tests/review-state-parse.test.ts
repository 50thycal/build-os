import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseReviewState, parseWorkstreamFile } from "../src/ingest/buildos/parse.ts";
import { FIXTURES } from "./helpers.ts";

const SHA = "0123456789abcdef0123456789abcdef01234567";

describe("Review State parser (v0.5)", () => {
  it("reads every legal verdict", () => {
    const cases: [string, string][] = [
      ["Not started", "NOT_STARTED"],
      ["In review", "IN_REVIEW"],
      ["Changes required", "CHANGES_REQUIRED"],
      ["Approved", "APPROVED"],
      ["Approved with follow-ups", "APPROVED_WITH_FOLLOW_UPS"],
    ];
    for (const [written, expected] of cases) {
      expect(parseReviewState(`**Verdict:** ${written}`).verdict).toBe(expected);
    }
  });

  it("tolerates the spellings owners actually type", () => {
    expect(parseReviewState("Verdict: approved.").verdict).toBe("APPROVED");
    expect(parseReviewState("**Verdict:** APPROVED WITH FOLLOWUPS").verdict).toBe(
      "APPROVED_WITH_FOLLOW_UPS",
    );
    expect(parseReviewState("- **Verdict**: Changes Required").verdict).toBe("CHANGES_REQUIRED");
  });

  it("accepts a full SHA and lowercases it", () => {
    expect(parseReviewState(`**Reviewed head:** ${SHA.toUpperCase()}`).reviewedHead).toBe(SHA);
  });

  it("rejects an abbreviated SHA rather than accepting a prefix", () => {
    const parsed = parseReviewState("**Reviewed head:** 0123456");
    expect(parsed.reviewedHead).toBeUndefined();
    expect(parsed.reviewedHeadMalformed).toBe(true);
  });

  it("treats an em dash as no head yet, not as malformed", () => {
    const parsed = parseReviewState("**Reviewed head:** —");
    expect(parsed.reviewedHead).toBeUndefined();
    expect(parsed.reviewedHeadMalformed).toBe(false);
  });

  it("marks an unrecognised verdict malformed and leaves the field absent", () => {
    const parsed = parseReviewState("**Verdict:** looks fine to me");
    expect(parsed.verdict).toBeUndefined();
    expect(parsed.verdictMalformed).toBe(true);
  });

  it("reads a pre-v0.5 prose body as absent metadata, not an error", () => {
    const parsed = parseReviewState("Not started.");
    expect(parsed).toEqual({
      verdict: undefined,
      reviewedHead: undefined,
      verdictMalformed: false,
      reviewedHeadMalformed: false,
    });
  });

  it("ignores a verdict that survives only inside a template comment", () => {
    const parsed = parseReviewState("<!-- Verdict: Approved | In review -->\n\nNot recorded yet.");
    expect(parsed.verdict).toBeUndefined();
    expect(parsed.verdictMalformed).toBe(false);
  });

  it("ignores an example verdict inside a fenced block", () => {
    const parsed = parseReviewState("```markdown\n**Verdict:** Approved\n```\n");
    expect(parsed.verdict).toBeUndefined();
  });
});

describe("workstream file with review fields", () => {
  const markdown = `# WS-011 — Review gate

**Phase:** REVIEW · **Status:** Active

## Review State

**Verdict:** Approved
**Reviewed head:** ${SHA}

No blocking findings.

## Related PRs

#84
`;

  it("carries the review fields onto the parsed file", () => {
    const parsed = parseWorkstreamFile(markdown);
    expect(parsed.review.verdict).toBe("APPROVED");
    expect(parsed.review.reviewedHead).toBe(SHA);
    expect(parsed.relatedPrNumbers).toEqual([84]);
  });

  it("still exposes the free-text review state alongside the fields", () => {
    expect(parseWorkstreamFile(markdown).reviewState).toContain("No blocking findings");
  });
});

describe("shipped templates stay parseable", () => {
  const template = readFileSync(
    join(FIXTURES, "..", "..", "templates", "WORKSTREAM.template.md"),
    "utf8",
  );

  it("parses the v0.5 workstream template's review section", () => {
    const parsed = parseWorkstreamFile(template);
    expect(parsed.review.verdict).toBe("NOT_STARTED");
    expect(parsed.review.reviewedHead).toBeUndefined();
    expect(parsed.review.verdictMalformed).toBe(false);
    expect(parsed.review.reviewedHeadMalformed).toBe(false);
  });
});
