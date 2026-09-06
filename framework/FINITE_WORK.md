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

Keep at most three parked candidates per completed mission. A project may set a smaller limit. The parking lot is a compact, deliberately non-active list; it is reviewed only when the owner is choosing the next priority.

## Active-work limit

By default, a repository has at most three owner-attention workstreams at once: one being built, one being reviewed or verified, and one investigation or operational concern. Automated monitoring does not count unless it requires owner attention. Promoting another workstream requires completing, pausing, or abandoning one of the active three. Projects may choose a different limit in their framework block.

## Owner-facing result

The existing `SHIP | DECISION | BLOCKED` result remains canonical in [`OWNER_INTERFACE.md`](OWNER_INTERFACE.md). Default owner results are 100 words or fewer, plain-language, and begin with the outcome rather than technical chronology. They name only material deviations or residual risks. Technical detail belongs in the PR and durable record.

This document adds no lifecycle phase and does not weaken the review or merge gate.
