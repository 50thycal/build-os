# WS-007 — Closed-loop feedback, review, and merge delivery

**Phase:** COMPLETE
**Status:** Complete
**Created:** 2026-08-24
**Updated:** 2026-08-24
**Build OS:** v0.5

## Goal

Make Build OS carry a project cleanly from live owner feedback through an implementation PR, independent review, corrections, and merge without premature action, merge-before-review, stale workstream records, or manual chat handoffs.

## Context

Party Games WS-002 was the first full owner playtest-driven feature run under Build OS v0.4. The design result was strong: a stream of informal observations became a coherent Build Card, an exhaustive Build Spec, one GitHub implementation surface, a detailed implementation handoff, and an independent review that found a real reducer defect missed by the implementation tests.

The run also exposed protocol gaps rather than Subway-specific mistakes:

| What happened | Result | Protocol lesson |
|---|---|---|
| The owner said “capture only” during a live playtest and sent observations over many messages. | The observations were retained, but the behavior depended on conversational discipline rather than a named mode. | Build OS needs a capture-only mode that keeps observations separate from hypotheses and approved decisions. |
| The design agent committed the workstream and spec to a draft PR that Claude continued. | This removed copy/paste and kept one durable implementation surface. | The useful design-handoff PR pattern should be explicit rather than improvised. |
| PR #141 was merged before independent review, despite v0.4 saying review happens before acceptance. | Review became post-merge and required corrective PR #142. | “Review before merge” needs an enforceable protocol gate, named responsibility, and reviewed-head rule. |
| The reviewer found that a no-op schedule action consumed Undo. | The independent review proved its value and the focused correction was small. | Findings need a formal REVIEW → BUILDING → REVIEW loop, including recovery when the original PR is already merged. |
| Workstream text repeatedly lagged the actual PR state (“draft,” “Claude fixes,” “ready for review”). | Small cleanup commits were required after the code was already correct. | Build OS needs a merge-finalization checkpoint and structured review metadata so durable state advances atomically with delivery. |

## Current Mental Model

```text
owner observations
      │
      ▼
CAPTURE ONLY ──end capture──► consolidate: observation ≠ proposal ≠ decision
                                      │
                                      ▼
                         approved Build Card + Build Spec
                                      │
                                      ▼
                     draft Design Handoff / implementation PR
                                      │
                              implementation + validation
                                      │
                                      ▼
                         READY FOR INDEPENDENT REVIEW
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
             changes required                       approved
          REVIEW → BUILDING → REVIEW                    │
                    │                                   ▼
                    └──────────────────────► merge-finalization checkpoint
                                                        │
                                                reviewed current head
                                                        │
                                                        ▼
                                                      merge
                                                        │
                                            next true workstream state
```

The merge gate is a relationship among four facts, not a new lifecycle phase:

```text
approved verdict + reviewed current head + green required validation + truthful final memory
```

## Decisions Made

**Source of authority — read this before relying on the decisions below.**

Implementation proceeded on an owner instruction given **in the Claude Code implementation session on 2026-08-24**, not on any record in this repository: *"I published the proposed solution as Build OS draft PR #7. It contains WS-007, a draft Build Card, and the complete proposed v0.5 specification. Please proceed with this build."*

That is a session message, and by Build OS's own rule — chat is transport, not memory (DEC-002) — **it is not independently verifiable from the project record.** No comment, review, or commit on PR #7 carries it. It is quoted here so a reader can judge it, not so it can pass as a durable artifact.

What it establishes: an instruction to build what PR #7 published. What it does not establish on its own: an itemized owner ruling on D1–D5, each of which the design agent had marked *recommended*, not *approved*. A recommendation is not an approval.

**Owner confirmation, 2026-08-24.** The owner (Calvin, `50thycal`) confirmed, verbatim:

> I approve D1–D5 for WS-007 as recorded and authorize the Build OS v0.5 implementation.

**Where that was said, precisely:** in the Claude Code implementation session, in reply to the request for it — not typed by the owner into this repository. It is written down here, and relayed onto PR #7 and PR #9, by the implementation agent. That is what makes it durable: a session statement transcribed into the project record, attributed to who said it and through whom.

It is a weaker artifact than a comment posted by the owner's own hand, and this file says so rather than blurring the two. What it is sufficient for: D1–D5 are approved, and the approval is on the record with its provenance intact. What would strengthen it: the same sentence in a comment authored by the owner directly.

With that, D1–D5 below are **approved**, not merely recommended. The distinction this file drew between the two — a recommendation is not an approval — is resolved in favour of approval on the owner's own words.

- **D1. Explicit capture-only mode — approved.** Named `Capture Only`; a session mode, not a lifecycle phase. Recorded as DEC-012.
- **D2. Standardized draft Design Handoff PR — approved.** A design agent with write access opens the future implementation PR at `READY_TO_BUILD`; the implementation agent continues that exact branch and PR.
- **D3. Independent review as a hard merge gate for significant work — approved.** The approved verdict must name the PR's current head as a full 40-character SHA, and the implementation agent neither approves nor merges its own significant PR. Recorded as DEC-013.
- **D4. Merge-finalization commit in the same PR — approved.** Documentation-only, after approval, verified against the final head. Recorded as DEC-014.
- **D5. Publish as Build OS v0.5 with explicit downstream migration — approved.** Minor release; `VERSION.md` carries six exact adoption steps.

## Open Decisions

None.

## Assumptions

- Build OS remains a protocol, not a CI product; enforcement is agent/reviewer behavior plus machine-readable state, with automation optional.
- GitHub PRs and commits remain the durable handoff and review surface.
- Downstream projects continue to pin a version and run the compatibility preflight before substantial work.
- A draft design-handoff PR is available only when the design agent has GitHub write access; the existing repository-update-block fallback remains valid.
- Small bug fixes may use a lighter review, but cannot claim a significant workstream complete without an independent verdict.

## Non-Goals

- Building a GitHub App, branch-protection installer, or automated merger.
- Requiring a repository write after every playtest comment or chat message.
- Storing chat transcripts or raw audio from playtests.
- Replacing project-specific CI, validation, or approval rules.
- Retroactively rewriting completed workstreams or old PRs.

## Build Card

# Build Card — Closed-loop feedback, review, and merge delivery

**Workstream:** WS-007
**Status:** Approved 2026-08-24 — see Decisions Made for the confirmation and its provenance
**Date:** 2026-08-24
**Build Spec:** [`plans/BUILD_OS_V0_5_CLOSED_LOOP_DELIVERY.md`](../../plans/BUILD_OS_V0_5_CLOSED_LOOP_DELIVERY.md)

### Goal

Close the gap between “the owner is still giving feedback” and “the change is safely merged,” while keeping GitHub state accurate enough that another agent can resume without chat history.

### Current behavior

Build OS separates design, implementation, and review, but it does not name capture-only playtest sessions, the draft design-handoff PR pattern, a reviewed-head merge gate, or the exact finalization step that keeps workstream files synchronized with a merge.

### New behavior

- Live feedback may enter **Capture Only** mode: record observations, but do not synthesize, decide, or write until the owner ends capture.
- A design agent may open one draft **Design Handoff PR** containing the approved card/spec; the implementation agent continues it instead of creating another PR.
- Significant changes cannot merge without an independent `Approved` or `Approved with follow-ups` verdict tied to the current reviewed head.
- `Changes required` formally returns the workstream to `BUILDING`; the same PR is corrected when open, or a linked corrective PR is used after an accidental merge.
- A final documentation-only checkpoint makes the workstream, active board, and PR state truthful at merge.
- Build OS v0.5 migration notes make every pinned downstream project adopt or explicitly defer the change during compatibility preflight.

### Mental model

```text
Capture → Consolidate → Approve card → Draft handoff PR → Build → Review
                                                        ▲         │
                                                        └─ fix ◄──┘
                                                                  │ approved current head
                                                                  ▼
                                                       Finalize memory → Merge
```

### Important rules

- An observation is not a decision; capture mode cannot silently promote it into one.
- The implementation agent may not self-approve or self-merge significant work.
- A review is stale when executable behavior changed after the reviewed head.
- Main-branch workstream state must describe what is true after the merge, not a prior step.
- Downstream uptake occurs through a version bump and complete migration notes, never silent tracking of `main`.

### Decisions made

- Add Capture Only, the draft Design Handoff PR, the independent reviewed-head gate, the correction loop, and merge finalization as one v0.5 protocol package.
- Keep enforcement protocol-first; expose structured fields so Companion or future CI may detect violations without making automation mandatory.

### Non-goals

- No mandatory GitHub automation or new service.
- No transcript persistence.
- No retroactive cleanup of historical projects.

### Definition of done

- [x] Protocol and templates describe capture, design handoff, review/fix loop, reviewed-head approval, finalization, and merge responsibility consistently.
- [x] Review verdict and reviewed head are stable parseable fields with integrity warnings for stale or missing gates.
- [x] v0.5 migration notes tell every adopting project exactly what to update and how to handle open PRs.
- [x] A worked scenario proves the normal path and the already-merged recovery path.
- [x] Party Games can adopt v0.5 at its next substantial session without rewriting game architecture or historical decisions.

---

**After this change, the system should** preserve owner feedback faithfully, route implementation through one durable PR, and prevent significant work from merging until independent review and project memory agree on the current code.

## Implementation State

Merged in #7 (`8de3b8c`), the same branch the design handoff opened. The v0.5 protocol package is complete: `DESIGN_ROOM.md` (Capture Only, Design Handoff PR), `REVIEW_PROTOCOL.md` (merge gate, verdicts, staleness, transitions, recovery, finalization, proportionality), `WORKSTREAMS.md` (handoff PR, finalization checkpoint, phase boundaries), `CLAUDE_HANDOFF.md` (single-PR ownership, no self-approval), `FRAMEWORK_SYNC.md` (open-PR applicability), `BUILD_OS_PARSE_CONTRACT.md` (fields and integrity warnings), four templates, two examples, `VERSION.md` v0.5 with migration notes, `README.md`, and DEC-012/013/014.

Companion support for the new fields is in the same PR: per-PR review records, verdict and reviewed-head parsing in both field and table form, HTML-comment stripping, the PR head SHA and GitHub review commit ids threaded through observation and projection, and the cross-source integrity checks. Suite green at 200 tests.

Review rounds 1–3 (2026-08-24) each returned Changes required; every finding is corrected on this same PR — see Review State.

## Review State

| PR | Verdict | Reviewed head | Finalization |
|---|---|---|---|
| #7 | Changes required | 39f2f3d2483a05c8781e0886162673a38fa38d9d | not pushed |
| #9 | Changes required | c76922734c6de1572a2a1a49f5b9ab9b1ea72993 | not pushed |
| #10 | Approved | 035f2ca1eabf937ff5edba48cd4c175b6dcfe72a | pushed |

Three PRs, three records, because a verdict belongs to one pull request. #7 delivered v0.5 and merged; #9 is the corrective PR that finalized this workstream afterwards; #10 is the protocol clarification that made the merge gate satisfiable at all. Each is significant under the same rule — a PR claiming to complete or change a significant workstream is significant however small its diff.

### #7 — merged without an approved verdict on its final head, 2026-08-24

Recording that plainly rather than tidying it away.

Three rounds of independent review ran on PR #7 and each returned `Changes required`:

- Round 1 against `1607e800168eac17d7b81b1d6c13aa7a9d99ca50`, reported outside GitHub — the finalization commit was specified to contain its own SHA; one workstream-level reviewed head was compared against every linked PR; `VERSION.md` claimed the repository contained no code; `git diff --check` failed.
- Round 2 against `c1b9316b6b6e13e2b6f0db104ba1400ea12306ea` — a historical GitHub approval could outlive its own reviewer's later objection, and a current-head approval could override a workstream record saying `Changes required`; omitting a review record removed a significant PR from the gate.
- Round 3 against `39f2f3d2483a05c8781e0886162673a38fa38d9d` — the project pin was copied onto every headerless workstream, so adopting v0.5 retroactively gated completed v0.4 work.

Every finding was corrected, and the corrections were published as `caca3e031f410c83713a55492caec78c8e28f84e` together with the Companion extraction folded in from PR #8. **That head was never independently reviewed.** No approving verdict names it, no merge-finalization commit was pushed, and the owner merged it as `8de3b8c`.

Under the gate this release introduces, that is `MERGED_WITHOUT_APPROVAL`. It is not reversed — the merge stands, the content is what three rounds of review shaped, and reverting a landed change to satisfy process is a second risk in service of bookkeeping. What is required is that the record says so, which is what this section is.

Retrospective assessment, offered as evidence rather than as a verdict the implementing agent may issue: the delta from `39f2f3d` to `caca3e0` is the PR #8 merge plus decision renumbering, `VERSION.md`'s contains-code line, `ACTIVE.md`, and a resolution note in the spec. No protocol rule changed in it. An independent reviewer may still find otherwise, and this workstream's completion does not foreclose that.

### #9 — the corrective and finalization PR

Independent review of `c769227` returned `Changes required` on 2026-08-25, with one blocking finding: this section recorded #7 and not #9, leaving the record incomplete in exactly the dimension #9 exists to repair. Corrected here, along with a stale PR handoff and a duplicated heading.

**#9 carried the finalization content for this workstream**, but its `Finalization` column reads `not pushed`, and that distinction is the protocol's rather than a quibble: finalization is the commit made *after* an approving verdict, and #9 never had one. Claiming otherwise would be a record declaring finalization ahead of approval — which the gate reports, and which it reported on this very file before that correction. #9 touched only finalization surfaces — this file, `ACTIVE.md`, and the spec's owner-decisions heading — and nothing else.

The two heads for #9, kept apart because conflating them is the failure being recorded:

| | SHA |
|---|---|
| Head the `Changes required` verdict was reached against | `c76922734c6de1572a2a1a49f5b9ab9b1ea72993` |
| Final head that merged, never independently reviewed | `42ea13c260a8e8952f8dc044e4ac20a6dcfc60e5` |
| Merge commit on `main` | `5029a5f0a0220529ac82d4ec24c6c96714c64618` |

The verdict against `c769227` says nothing about `42ea13c`. No approval is manufactured here, and none should be read into the corrections having been made: correcting findings is not the same as someone confirming they were corrected.

**On this file having said `COMPLETE` while #9 was still open:** that was the finalization pattern working, not an oversight. A finalization commit always describes the state that becomes true when its PR lands; on the branch it is a proposal, and it is only ever true on `main`. #9 merged on 2026-08-25, so the claim is now a claim about the project.

**#9 also merged without an approving verdict on its own head**, as `5029a5f`. Its last recorded verdict is `Changes required` against `c769227`; the head that merged was `42ea13c`, and no verdict names it. The same code as #7, recorded the same way and for the same reason: the correction stands, and reverting it to satisfy process would put the false record back on `main` to buy nothing.

**Why that stopped happening rather than repeating.** Both merges landed ungated because the gate could not be satisfied at all: GitHub refuses an `APPROVE` review on a pull request the account authored, and this repository has one account. Three rounds of real review ran on #7 and one on #9 — every one of them arrived as a *comment*, because GitHub had nowhere else to put it, and a gate reading only reviews saw none of them. Chasing each merge with a corrective PR would have produced another PR merging under the same condition, indefinitely.

`REVIEW_PROTOCOL.md` now defines a comment verdict form, and the Companion reads it. That is the fix: the gate becomes satisfiable by the evidence this project actually produces, instead of demanding an artifact GitHub will not issue. Recorded here rather than corrected away — two ungated merges happened, and the record of a release about honest records should say so.

### #10 — the first PR here to clear the gate

Independent review ran four rounds against `6e4d8c7`, `78bcf3e`, `57b1b61` and `035f2ca`, each returning `Changes required` until the last:

| Round | Head | Finding |
|---|---|---|
| 1 | `6e4d8c7` | Reviewer identity collapsed into the transport account — distinct actors sharing one login overwrote each other |
| 2 | `78bcf3e` | The gate rested on mutable metadata: a comment and a PR body can both be rewritten after a review without the head moving |
| 3 | `57b1b61` | DEC-015 and `VERSION.md` still stated the rule the protocol had replaced, putting the editable body back in authority; and "all four lines are required" contradicted the degraded evidence the same document defines |
| 4 | `035f2ca` | **Approved** — verdict, reviewed head, `Review actor: chatgpt-independent-session`, `Implementation actor reviewed: claude-implementation-session` |

**This is the demonstration the workstream was missing.** #7 and #9 both merged ungated, and the record above says so. #10 is the first head here to carry an approving verdict naming it — given in the comment form the same PR defines, by an actor named apart from the account that carried it, on evidence that cannot be edited afterwards without voiding itself.

`Finalization: pushed` means the commit that wrote this row exists on the PR. Per `REVIEW_PROTOCOL.md`, that commit cannot name the head it produces: `Reviewed head` keeps naming `035f2ca`, the last head reviewed in full, and the head this commit creates is verified by the reviewer on the PR before the owner merges.

## Related Decisions

Existing foundations: DEC-002 (GitHub is the handoff), DEC-004 (workstreams are durable state), DEC-005 (persistence claims require write access), DEC-006 (version preflight), and DEC-007 (framework state in agent instructions).

Added by this implementation: DEC-012 (owner input is captured before it is processed), DEC-013 (significant work merges only on an independent verdict naming the current head), DEC-014 (durable memory is finalized on the PR, before the merge), DEC-015 (a verdict may be a comment, in a form nothing writes by accident — added after this workstream's own merges proved the gate unsatisfiable in a single-account repository). DEC-011 is the Companion extraction, folded in from PR #8. Capture Only received its own entry because its rules stand independently of the merge gate.

## Related PRs

- [#7 — WS-007: Build OS v0.5 closed-loop delivery](https://github.com/50thycal/build-os/pull/7) — the design handoff PR, continued as the implementation PR, merged as `8de3b8c`.
- [#9 — Finalize WS-007 after the merge, and record how it merged](https://github.com/50thycal/build-os/pull/9) — the corrective and finalization PR. It exists because #7 merged without the finalization commit that would normally have preceded it, leaving `main` describing a state that had ended.
- [#10 — Let a verdict be a comment, because GitHub allows no review](https://github.com/50thycal/build-os/pull/10) — `DEC-015`. The clarification that made this release's own gate satisfiable, and the first PR here to clear it.
- [#11 — WS-007: record PR #9 merge-without-approval and close the loop](https://github.com/50thycal/build-os/pull/11) — a design handoff opened by the reviewer, **closed without merging** as superseded by #10, which implements its audit requirements. Listed so the record does not have a gap where a PR used to be.

The Companion half lives in another repository and is deliberately not listed above: `Related PRs`
holds pull requests of *this* repository, and a cross-repository reference written as a bare
number would be read as one. It is
[build-os-companion pull request 2](https://github.com/50thycal/build-os-companion/pull/2)
(`DEC-011`), and the reader for the comment verdict form is
[build-os-companion pull request 8](https://github.com/50thycal/build-os-companion/pull/8).

## Next Step

None. Build OS v0.5 is released on `main`; the Companion half is `50thycal/build-os-companion#2`, and the reader for `DEC-015` is `50thycal/build-os-companion#8`.

Two things remain on the record rather than open as work. `caca3e0` merged without an approving verdict naming it, and so did `42ea13c` (see Review State). Neither is resolvable by this workstream and neither is being reversed — what closed that loop was making the gate satisfiable in #10, not chasing the merges that happened while it was not.

The owner's approval of D1–D5 landed on 2026-08-24 and is recorded in Decisions Made with its provenance.
