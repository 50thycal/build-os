# WS-007 — Closed-loop feedback, review, and merge delivery

**Phase:** REVIEW
**Status:** Active
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

**Owner confirmation outstanding.** Independent review has asked for this to be settled durably before merge. The confirming statement, if the owner agrees, is one line on PR #7:

> I approve D1–D5 for WS-007 as recorded and authorize the Build OS v0.5 implementation.

Until that appears, D1–D5 below record **what was built and on whose recommendation**, and each is provisional in exactly that sense. The implementation stands as a proposal for the owner to accept or revise; nothing here should be read as the owner having ruled on each decision individually.

- **D1. Explicit capture-only mode — built as recommended.** Named `Capture Only`; a session mode, not a lifecycle phase. Recorded as DEC-012.
- **D2. Standardized draft Design Handoff PR — built as recommended.** A design agent with write access opens the future implementation PR at `READY_TO_BUILD`; the implementation agent continues that exact branch and PR.
- **D3. Independent review as a hard merge gate for significant work — built as recommended.** The approved verdict must name the PR's current head as a full 40-character SHA, and the implementation agent neither approves nor merges its own significant PR. Recorded as DEC-013.
- **D4. Merge-finalization commit in the same PR — built as recommended.** Documentation-only, after approval, verified against the final head. Recorded as DEC-014.
- **D5. Publish as Build OS v0.5 with explicit downstream migration — built as recommended.** Minor release; `VERSION.md` carries six exact adoption steps.

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
**Status:** Built as published; owner confirmation of D1–D5 outstanding — see Decisions Made
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

Implemented on PR #7, the same branch the design handoff opened. The v0.5 protocol package is complete: `DESIGN_ROOM.md` (Capture Only, Design Handoff PR), `REVIEW_PROTOCOL.md` (merge gate, verdicts, staleness, transitions, recovery, finalization, proportionality), `WORKSTREAMS.md` (handoff PR, finalization checkpoint, phase boundaries), `CLAUDE_HANDOFF.md` (single-PR ownership, no self-approval), `FRAMEWORK_SYNC.md` (open-PR applicability), `BUILD_OS_PARSE_CONTRACT.md` (fields and integrity warnings), four templates, two examples, `VERSION.md` v0.5 with migration notes, `README.md`, and DEC-012/013/014.

Companion support for the new fields is in the same PR: per-PR review records, verdict and reviewed-head parsing in both field and table form, HTML-comment stripping, the PR head SHA and GitHub review commit ids threaded through observation and projection, and the cross-source integrity checks. Suite green at 200 tests.

Review rounds 1–3 (2026-08-24) each returned Changes required; every finding is corrected on this same PR — see Review State.

## Review State

**Verdict:** In review
**Reviewed head:** —
**Reviewed PR:** #7
**Finalization:** —

Round 1 — `Changes required` against `1607e800168eac17d7b81b1d6c13aa7a9d99ca50`, reported outside GitHub. Five findings: the finalization commit was specified to contain its own SHA; one workstream-level reviewed head was compared against every linked PR; both needed regression tests; `VERSION.md` claimed the repository contained no code; `git diff --check` failed. All corrected on this PR.

Round 2 — `Changes required` against `c1b9316b6b6e13e2b6f0db104ba1400ea12306ea`, published on PR #7. Two gate bypasses: a historical GitHub approval could outlive the reviewer's own later changes request and clear the gate, and a current-head approval could override a workstream record saying `Changes required`; and omitting a review record silently removed a significant PR from the gate, because absence of a record was what marked a workstream legacy. Plus an approval-provenance correction and a test-count fix. All corrected on this PR; the workstream returned to `BUILDING` for the round and back to `REVIEW` with a new head.

Round 3 — `Changes required` against `39f2f3d2483a05c8781e0886162673a38fa38d9d`, published on PR #7. One blocking regression: the project's adopted version was copied onto every workstream without its own header, so upgrading a project to v0.5 retroactively gated its completed v0.4 workstreams and re-opened the round-1 multi-PR false positive. Fixed by distinguishing a declared version from an inherited pin and honouring the project's adoption boundary. Corrected on this PR.

Awaiting an independent verdict on the current head. This PR is subject to the gate it introduces: it does not merge without an approved verdict naming that head, and the implementing agent neither approves nor merges it.

## Related Decisions

Existing foundations: DEC-002 (GitHub is the handoff), DEC-004 (workstreams are durable state), DEC-005 (persistence claims require write access), DEC-006 (version preflight), and DEC-007 (framework state in agent instructions).

Added by this implementation: DEC-012 (owner input is captured before it is processed), DEC-013 (significant work merges only on an independent verdict naming the current head), DEC-014 (durable memory is finalized on the PR, before the merge). DEC-011 is the Companion extraction, folded in from PR #8. Capture Only received its own entry because its rules stand independently of the merge gate.

## Related PRs

- [#7 — WS-007: Build OS v0.5 closed-loop delivery](https://github.com/50thycal/build-os/pull/7) — the design handoff PR, continued as the implementation PR. One workstream, one PR.

## Next Step

Independent review of PR #7 against this Build Card. On approval, the merge-finalization commit sets this workstream to COMPLETE and removes its row from `ACTIVE.md`.
