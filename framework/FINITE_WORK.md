# Finite Work Protocol

**Build OS v0.12**

Work stays finite when an observation is not allowed to become active work merely because an agent noticed it. This protocol governs discovery, follow-up admission, and honest closure.

## The rule

> Discovery does not create work. Only admission creates work.

Every mission begins with a small contract: desired outcome, acceptance checks, explicit non-goals, material interrupt risks, and what counts as finished. A new session continues that same mission; it does not create another workstream merely by resuming it.

When an agent notices something beyond the mission, it must disposition it before acting:

| Disposition | Use when | Agent action |
|---|---|---|
| `FIX NOW` | Required to meet an acceptance check or an immediate material safety, security, data-loss, or real-money risk | Fix within the current workstream and PR. |
| `PARK` | Valuable but unrelated, and safe to defer | Add one compact candidate to the project's parking lot; do not create a ticket, branch, PR, or session. |
| `DISCARD` | Speculative, cosmetic, duplicate, or not worth its cost | Record only if useful to avoid rediscovery; otherwise drop it. |
| `OWNER DECISION` | Requires a product, priority, budget, or risk judgement only the owner can make | Return one concise `DECISION`; do not open work pre-emptively. |

An agent may activate a new workstream only when the owner explicitly promotes a parked candidate, except for an immediate material risk. If the original ask cannot honestly ship without it, it was in scope and belongs in the current workstream as `FIX NOW`.

## Closure

`SHIP` means the mission's acceptance checks are met and there is no hidden tail. Optional follow-ups do not block it. They must be `PARK`ed, `DISCARD`ed, or brought to the owner as a real decision.

Completed workstream files and their final owner result must not use an open-ended next step such as “open a ticket,” “start the next job,” or “follow up later.” Their next step is `None.` The parking lot, not a completed mission, holds deferred ideas.

**The parking lot is a `## Parked` list beneath the board in `docs/workstreams/ACTIVE.md`**, and the workstream mirrors its own candidates in a `## Parked` section. One line each: no ID, no phase, no owner, no estimate, no PR. Keep at most three per completed mission; a project may set a smaller limit.

Giving it those fields would make it a second board, with none of the first one's limits — which is precisely the thing it exists instead of. Nothing schedules it, nothing reports on it, and no agent starts anything in it. **A parked candidate becomes work only when the owner promotes it**, at which point it enters the active board like anything else. An agent that finds a parked line describing what it is about to build has found an owner decision, not a permission.

A candidate an acceptance check turns out to depend on was never parkable. It was in scope, and it returns to the current workstream as `FIX NOW`.

## Active-work limit

By default, a repository has at most three owner-attention workstreams at once: one being built, one being reviewed or verified, and one investigation or operational concern. Automated monitoring does not count unless it requires owner attention. Promoting another workstream requires completing, pausing, or abandoning one of the active three. Projects may choose a different limit in their framework block.

The limit is not a queue depth, and the transaction is the point: the cost of starting something new is paid visibly, by the owner, at the moment they start it. A board that can grow without that transaction will grow, because every individual addition looks reasonable on its own. Three is the default because it is roughly what one owner can hold, and a board past it stops being read — which defeats the fifteen-second board [`WORKSTREAMS.md`](WORKSTREAMS.md) asks for.

## Owner-facing result

The existing `SHIP | DECISION | BLOCKED` result remains canonical in [`OWNER_INTERFACE.md`](OWNER_INTERFACE.md). Default owner results are 100 words or fewer, plain-language, and begin with the outcome rather than technical chronology. They name only material deviations or residual risks. Technical detail belongs in the PR and durable record.

This document adds no lifecycle phase and does not weaken the review or merge gate.

## Where this lands

| Surface | What it carries |
|---|---|
| [`OWNER_INTERFACE.md`](OWNER_INTERFACE.md) | The 100-word outcome-first default, `SHIP` with no hidden tail, and `OWNER DECISION` arriving as a `DECISION` result |
| [`WORKSTREAMS.md`](WORKSTREAMS.md) | The mission contract in `Goal` / `Non-Goals` / `Acceptance Checks`, continuation as the session-start default, the active-work limit, the parking lot, and `Next Step: None.` at completion |
| [`CLAUDE_HANDOFF.md`](CLAUDE_HANDOFF.md) | The disposition table at implementation time, and *Follow-up Work* as `PARK` / `DISCARD` lines only |
| [`BUILD_OS_PARSE_CONTRACT.md`](BUILD_OS_PARSE_CONTRACT.md) | `## Parked` and `## Acceptance Checks` as optional sections, and parked lines as never-work |
| [`skills/finite-work-handoff/`](../skills/finite-work-handoff/SKILL.md) | The agent procedure for applying all of the above, mid-task |

Rationale is recorded in `DEC-025`.
