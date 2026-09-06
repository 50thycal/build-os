# WS-010 — Finite work admission and closure

**Phase:** COMPLETE
**Status:** Complete
**Created:** 2026-09-06
**Updated:** 2026-09-06
**Build OS:** v0.12
**Implementation State:** Protocol, skill and full adoption-surface integration are in #21, the integration arriving through #22. Released as v0.12.
**Related PRs:** #21, #22
**Next Step:** None.

## Goal

Make a Build OS mission end when its approved outcome is complete, instead of allowing every
adjacent observation to become another active task.

## Context

Build OS had no rule about where work comes from, and an absent rule is still a policy: any
observation by any agent was sufficient grounds to commit the owner's future attention. Boards
grew monotonically from the agent's side, a new session could become a new workstream because
the chat window was new, and a completed workstream could carry a `Next Step` of "open a ticket"
and still read as finished.

## Decisions Made

- Discovery does not itself create work; owner admission does.
- In-scope defects remain in the same workstream and PR.
- Deferred improvements are compact parked candidates, not automatically opened tickets.
- The reusable skill carries one mission across sessions and is bounded by its acceptance checks.
- The parking lot is a `## Parked` list under the board, deliberately given no ID, phase, owner
  or estimate — a parking lot pleasant to work from is a backlog, and the backlog is what made
  the board unreadable.
- The owner result default drops to 100 words and leads with the outcome; 150 stays as a ceiling
  for a material deviation or residual risk that needs a sentence.

## Non-Goals

- Changing the existing lifecycle phases or review gate.
- Deleting project issue trackers or forbidding deliberately owner-created work.
- Retroactively rewriting completed workstreams.
- Adding required sections to workstream files written under earlier versions.

## Acceptance Checks

- [x] A canonical protocol defines `FIX NOW`, `PARK`, `DISCARD`, and `OWNER DECISION` —
      `framework/FINITE_WORK.md`.
- [x] Handoff and workstream guidance require a mission contract and prohibit automatic
      activation — `CLAUDE_HANDOFF.md` → *Findings outside the mission*, `WORKSTREAMS.md` →
      *Session-start behavior*, and `## Acceptance Checks` in the workstream file and template.
- [x] A reusable `finite-work-handoff` skill is included and points to the canonical protocol,
      and `skills/README.md` carries a registry naming the framework document behind each skill.
- [x] Default owner results become brief, plain-language, and explicit about completion —
      `OWNER_INTERFACE.md` → *Length, and what leads*, and the owner-result template.
- [x] Adoption surfaces carry it: the parse contract admits `## Parked` and `## Acceptance
      Checks` as optional and forbids rendering parked lines as work; `ACTIVE_WORK`, `WORKSTREAM`
      and `PR_HANDOFF` templates carry the parking lot, the active-work limit and the
      disposition-bearing follow-up section; `README.md` lists the document.
- [x] v0.12 is published with migration notes an adopting project can act on, and `DEC-025`
      records the rationale.

## Current Mental Model

```text
observation ──► disposition ──┬─► FIX NOW        ─► this workstream, this PR
                              ├─► PARK           ─► ACTIVE.md ## Parked   (owner promotes, or never)
                              ├─► DISCARD        ─► gone
                              └─► OWNER DECISION ─► DECISION result

board ──► at most three owner-attention workstreams
          a fourth requires one to complete, pause or be abandoned
```

The framework document is canonical; the skill is the agent procedure for applying it, per
`DEC-022`. Nothing here adds a lifecycle phase or touches the review and merge gates.

## Findings dispositioned during this workstream

Integration surfaced four things the original protocol document did not settle, and all four
were `FIX NOW` — each was required by an acceptance check, so none was ever deferrable:

- **The parking lot had no home.** "The project's parking lot" named nothing that existed. It is
  now a `## Parked` list under the board, mirrored in the workstream file.
- **The mission contract had no carrier.** Workstream files had `Goal` and `Non-Goals` but no
  finish condition. `## Acceptance Checks` was added to the section list and the template.
- **Machine consumers would have read parked lines as work.** Two new optional sections and a
  board list are a parse-contract change; `BUILD_OS_PARSE_CONTRACT.md` now states that parked
  lines are never rendered as work, and flags a `COMPLETE` workstream whose `Next Step` is not
  `None` as an integrity warning.
- **Two word budgets contradicted each other.** `OWNER_INTERFACE.md` said 150, `FINITE_WORK.md`
  said 100. Resolved as 100 default / 150 ceiling, with the ceiling reserved for material
  disclosure.

Putting all four in this PR rather than into follow-up tickets is the workstream's own first
test of its rule, and the reason the acceptance checks above can be ticked without a tail.

## Parked

None.

## Review State

| PR | Verdict | Reviewed head | Accepted head | Finalization |
|---|---|---|---|---|
| #21 | Not started | — | — | pushed |

This repository runs in `solo` mode (`DEC-021`), so conditions 3 and 5 of the `SHIP` gate — an
independent verdict and a reviewer's verification of the final head — have no available
satisfier. They are absent, not waived, and the owner result says so. Acceptance is recorded by
the owner at merge, or relayed with its channel named (`DEC-024`). No verdict is pre-written
here (`DEC-023`).

**The work reaches #21 through #22.** #21 carried the protocol document, the skill and this
workstream file; #22 carried the integration, v0.12, `DEC-025` and this finalization, and targets
#21's branch rather than `main`. That is one change in two pushes — the acceptance checks above
are met only when both land, and #21 is the PR that reaches `main`. If #21 is abandoned after
this, the completion recorded here is false and must be undone rather than left standing.

## Related Decisions

`DEC-025`. Bounded by `DEC-021` (solo mode), `DEC-022` (framework stays canonical where both
surfaces apply), and `DEC-023` (a finalization commit never writes a verdict it does not have).

## Related PRs

#21, #22.
