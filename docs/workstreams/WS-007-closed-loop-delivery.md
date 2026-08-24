# WS-007 — Closed-loop feedback, review, and merge delivery

**Phase:** BUILD_CARD
**Status:** Active
**Created:** 2026-08-24
**Updated:** 2026-08-24

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

None yet. The Build Card below contains the recommended protocol decisions and awaits owner approval.

## Open Decisions

- **D1. Add an explicit capture-only mode?** Recommendation: yes. It protects live playtest note-taking from premature synthesis or repository writes and requires a consolidation pass before any observation becomes a rule.
- **D2. Standardize the draft Design Handoff PR?** Recommendation: yes. A design agent with write access may open the future implementation PR at `READY_TO_BUILD`; the implementation agent continues that exact branch and PR.
- **D3. Make independent review a hard merge gate for significant work?** Recommendation: yes. The implementation agent does not merge its own significant PR; an approved verdict must name the reviewed head SHA.
- **D4. Use a merge-finalization commit in the same PR?** Recommendation: yes. After approval, a documentation-only finalization commit records the state that becomes true when that PR merges; the reviewer confirms the current head before merge.
- **D5. Publish this as Build OS v0.5 with explicit downstream migration?** Recommendation: yes. This is a minor protocol change affecting artifacts and agent behavior, so every adopting project must encounter it through `VERSION.md` compatibility preflight.

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
**Status:** Draft
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

### Decisions proposed

- Add Capture Only, the draft Design Handoff PR, the independent reviewed-head gate, the correction loop, and merge finalization as one v0.5 protocol package.
- Keep enforcement protocol-first; expose structured fields so Companion or future CI may detect violations without making automation mandatory.

### Non-goals

- No mandatory GitHub automation or new service.
- No transcript persistence.
- No retroactive cleanup of historical projects.

### Definition of done

- [ ] Protocol and templates describe capture, design handoff, review/fix loop, reviewed-head approval, finalization, and merge responsibility consistently.
- [ ] Review verdict and reviewed head are stable parseable fields with integrity warnings for stale or missing gates.
- [ ] v0.5 migration notes tell every adopting project exactly what to update and how to handle open PRs.
- [ ] A worked scenario proves the normal path and the already-merged recovery path.
- [ ] Party Games can adopt v0.5 at its next substantial session without rewriting game architecture or historical decisions.

---

**After this change, the system should** preserve owner feedback faithfully, route implementation through one durable PR, and prevent significant work from merging until independent review and project memory agree on the current code.

## Implementation State

Proposed Build Spec drafted in [`plans/BUILD_OS_V0_5_CLOSED_LOOP_DELIVERY.md`](../../plans/BUILD_OS_V0_5_CLOSED_LOOP_DELIVERY.md). Implementation must not begin until the owner approves or revises the Build Card decisions.

## Review State

Not started.

## Related Decisions

Existing foundations: DEC-002 (GitHub is the handoff), DEC-004 (workstreams are durable state), DEC-005 (persistence claims require write access), DEC-006 (version preflight), and DEC-007 (framework state in agent instructions).

Expected from implementation after approval: one consequential decision covering the reviewed-head merge gate and truthful finalization transaction; capture-only behavior may share that entry or receive a second entry if implementation shows it is independently durable.

## Related PRs

The design/spec PR will be linked after it is opened.

## Next Step

Owner approves or revises D1–D5 and the Build Card; Claude then implements the v0.5 protocol package on the same branch and PR.
