# Worked Example — five parallel workstreams, one new conversation

**Build OS v0.3**

This is the acceptance scenario for the workstream protocol. A fictional project —
**Meridian**, a digital strategy board game — has five design/build threads that have run
across many separate ChatGPT conversations over several weeks:

1. procurement redesign — `BUILDING`
2. construction cards — `DECIDE`
3. map geometry — `EXPLORE`
4. scoring changes — `PAUSED`
5. AI playtesting — `COMPLETE`

**The criterion:** a brand-new ChatGPT conversation, with no memory of any of it, must be
able to determine the current state of the four live efforts from repository project memory
alone — without the owner copying in a single prior transcript. For each, it must know what
the effort is trying to accomplish, its phase, decisions already made, unresolved questions,
the next action, and implementation/PR state where applicable. The completed effort must be
off the board while its record survives.

What follows is the repository state that satisfies it, then what the new conversation
actually does with it.

---

## The repository

```text
docs/
├── PROJECT_MODEL.md
├── DECISIONS.md
└── workstreams/
    ├── ACTIVE.md
    ├── WS-001-procurement-redesign.md
    ├── WS-002-construction-cards.md
    ├── WS-003-map-geometry.md
    ├── WS-004-scoring-changes.md
    └── WS-005-ai-playtesting.md
```

### `docs/workstreams/ACTIVE.md`

```markdown
# Active Work

**Updated:** 2026-08-20 · **Build OS v0.3**

| ID | Workstream | Phase | Status | Current Next Step | Related PR |
|---|---|---|---|---|---|
| WS-001 | Procurement redesign | BUILDING | Active | Await PR; spec issued 08-18 | — |
| WS-002 | Construction cards | DECIDE | Active | Owner to answer D3 (discard timing) | — |
| WS-003 | Map geometry | EXPLORE | Active | Establish how adjacency works today | — |
| WS-004 | Scoring changes | MODEL | Paused | Resume once WS-001 lands — scoring reads procurement costs | — |

## Recently completed

| ID | Workstream | Completed | Outcome |
|---|---|---|---|
| WS-005 | AI playtesting | 2026-08-11 | Headless self-play harness; DEC-014, DEC-015 |
```

Four rows, one glance. That table alone answers "what are we working on and where is each
effort" — the rest is depth on demand.

---

## The workstream files

Abridged to the sections a resuming conversation actually reads.

### `WS-001-procurement-redesign.md` — BUILDING

```markdown
# WS-001 — Procurement redesign

**Phase:** BUILDING · **Status:** Active
**Created:** 2026-07-29 · **Updated:** 2026-08-18

## Goal
Make procurement a decision players think about rather than a queue they drain. Today the
optimal play is "buy the cheapest available thing every turn," which every playtester
found within two games.

## Current Mental Model
    Before:  market row (6 slots) ──buy──► hand
             refill immediately, cheapest-first is always correct

    After:   market row (6 slots), each with a rising cost clock
             ──buy──► hand, slot stays empty until end of round
             ──pass──► every unbought slot's cost drops one step

    The pass mechanic is the point: not buying makes the row better for you next turn,
    so "wait" becomes a real move with a real cost (your opponents also see the cheaper row).

## Decisions Made
- **Do empty slots refill immediately?** → No, end of round. Immediate refill removes the
  scarcity that makes waiting meaningful.
- **Does the cost drop apply to all players or only the passing player?** → All players.
  Private discounts are invisible to opponents and kill the read.
- **Floor on the cost clock?** → Yes, base cost. Free cards break the economy.

## Open Decisions
None. All resolved before the Build Card was approved 2026-08-17.

## Assumptions
- Round length stays at 4 turns. If WS-002 changes it, the cost clock needs retuning.
- The market row stays at 6 slots.

## Non-Goals
- No change to what cards are in the procurement deck.
- No change to hand limits.
- No AI opponent retuning — tracked separately, will need WS-005's harness.

## Build Card
Approved 2026-08-17 — docs/cards/WS-001-procurement.md

## Implementation State
Build Spec issued 2026-08-18 — docs/specs/WS-001-procurement.md. Implementation agent
working. No PR yet.

## Review State
Not started.

## Related Decisions
DEC-016 (deferred refill), DEC-017 (public cost clock)

## Next Step
Await the implementation PR. On arrival, review against the Build Card per REVIEW_PROTOCOL.
```

### `WS-002-construction-cards.md` — DECIDE

```markdown
# WS-002 — Construction cards

**Phase:** DECIDE · **Status:** Active
**Created:** 2026-08-04 · **Updated:** 2026-08-19

## Goal
Give players a mid-game use for resources they currently hoard, without adding a fourth
resource type or a new board area.

## Current Mental Model
    hand ──play construction──► under construction (n rounds)
                                      │
                    pay upkeep each round │  miss upkeep
                                      ▼      ▼
                                 completed  abandoned (card discarded, resources lost)

    Constructions are a commitment: they consume resources over several rounds and pay out
    only on completion. The tension is committing during a round when you might need those
    resources for procurement.

## Decisions Made
- **Do constructions occupy board space?** → No. Board space is already the scarcest
  resource; adding pressure there would drown procurement.
- **Can a construction be cancelled voluntarily?** → No. Abandonment only happens by
  missing upkeep, so the decision to commit stays weighty.

## Open Decisions
- **D3. When an abandoned construction is discarded, does the card return to the deck or
  leave the game?**
  - *A — returns to deck.* Deck composition stays stable; a player can re-attempt.
    Risks the same card cycling all game.
  - *B — leaves the game.* Failure has a permanent cost and the deck thins over time,
    which naturally shortens late game. Harder to reason about for new players.
  - *Recommendation: B.* The permanence is what makes the upkeep decision land, and the
    deck thinning is a useful accelerant in a game that currently runs long.

## Assumptions
- Upkeep is paid at the start of a player's turn, not end of round. Not yet validated with
  playtesters.
- Construction duration is 2–4 rounds depending on card. Placeholder numbers.

## Non-Goals
- No new resource type.
- No new board region.
- No changes to procurement — WS-001 owns that surface.

## Build Card
Not ready. Blocked on D3.

## Implementation State
None.

## Review State
Not started.

## Related Decisions
None yet — nothing here has been consequential enough for DECISIONS.md.

## Next Step
Owner to answer D3 (discard timing). Everything else is settled enough to write the card.
```

### `WS-003-map-geometry.md` — EXPLORE

```markdown
# WS-003 — Map geometry

**Phase:** EXPLORE · **Status:** Active
**Created:** 2026-08-15 · **Updated:** 2026-08-15

## Goal
Unclear — that's why this is in EXPLORE. The owner's observation: "the map always plays the
same way and I don't know if it's the geometry or the starting positions."

## Context
Three playtest groups independently converged on the same two opening expansions. Either
the hex adjacency makes some regions structurally dominant, or the starting positions do.
Nobody has established which.

## Current Mental Model
None yet. First job is to describe how adjacency and region scoring actually work today —
the code is the only current source of truth and nobody has written it down.

## Decisions Made
None.

## Open Decisions
None surfaced yet. Too early — we don't know what the question is.

## Assumptions
- The problem is real and not a small-sample artifact. Three groups is suggestive, not
  conclusive; worth confirming before designing anything.

## Non-Goals
- Not redesigning the map art or hex count.
- Not touching scoring — WS-004 owns that, and it's paused.

## Build Card
Not ready.

## Implementation State
None.

## Review State
Not started.

## Next Step
Establish how adjacency works today and write it into PROJECT_MODEL — it's missing there,
which is itself part of the problem.
```

### `WS-004-scoring-changes.md` — MODEL, paused

```markdown
# WS-004 — Scoring changes

**Phase:** MODEL · **Status:** Paused
**Created:** 2026-07-22 · **Updated:** 2026-08-06

## Goal
Stop the endgame being decided by a single scoring category. Currently ~70% of games are
won on trade-route points, so the other three categories are decoration.

## Current Mental Model
    Current:  four categories, each scored independently, summed
              trade routes scale superlinearly ⇒ dominate

    Candidate: four categories, each capped at a share of total
               ──► forces spread, but may flatten strategy into "do everything"

    Second candidate under consideration: keep uncapped, but make trade-route cost scale
    with route count so the superlinear payoff meets a superlinear cost. Not yet modelled.

## Decisions Made
- **Are we changing the number of categories?** → No. Four is the right shape; the problem
  is their relative weight.

## Open Decisions
Not yet formed — the model isn't settled enough to put real options in front of the owner.

## Assumptions
- Trade-route dominance is a payoff-curve problem, not a cost problem. The second candidate
  above exists because this assumption might be wrong.
- **Procurement costs feed scoring.** WS-001 is changing procurement costs, so any scoring
  model built now would be built on numbers that are about to move.

## Non-Goals
- No new scoring categories.
- No change to endgame trigger conditions.

## Build Card
Not ready.

## Implementation State
None.

## Review State
Not started.

## Next Step
**Paused deliberately.** Resume once WS-001 merges and procurement costs are settled —
modelling scoring against numbers that are about to change would waste the work. Nothing
external is blocking this; it is a sequencing choice.
```

### `WS-005-ai-playtesting.md` — COMPLETE

```markdown
# WS-005 — AI playtesting

**Phase:** COMPLETE · **Status:** Complete
**Created:** 2026-06-30 · **Updated:** 2026-08-11

## Goal
Play thousands of games without humans, so balance questions get answered in hours rather
than playtest cycles.

## Current Mental Model
Superseded by PROJECT_MODEL.md → "Simulation harness". Retained below as the design-time
record.

    scenario config ──► headless match runner ──► per-game result rows
                              │
                        N policies (greedy, random, weighted-heuristic)
                              ▼
                        aggregate report: win rate by policy, by starting seat, by category

## Decisions Made
- **Do AI policies need to play well?** → No. They need to play *consistently*. A
  consistent mediocre policy surfaces structural imbalance; a strong one hides it behind
  skill.
- **Do we simulate the full rules or a reduced model?** → Full rules. A reduced model
  answers questions about the reduced model.

## Build Card
Approved 2026-07-14 — docs/cards/WS-005-playtesting.md

## Implementation State
Merged — PR #212, PR #219 (harness), PR #226 (reporting).

## Review State
Reviewed 2026-08-09. One should-fix found and corrected: seat rotation wasn't applied in
the aggregate report, which would have made seat-order bias invisible.

## Related Decisions
DEC-014 (consistency over strength), DEC-015 (full-rules simulation)

## Related PRs
#212, #219, #226

## Next Step
None. Complete.
```

Note what completion did: the mental model moved into `PROJECT_MODEL.md`, the reasoning moved
into `DECISIONS.md` as `DEC-014` and `DEC-015`, the row left `ACTIVE.md`, and the file stayed
put as history. Three artifacts, three jobs, no duplication.

---

## The new conversation

The owner opens a fresh chat in the Meridian ChatGPT Project and types:

> ok so about the construction cards

No transcript, no summary, no context dump.

**What the agent reads:** `ACTIVE.md` (finds WS-002 in `DECIDE`), then
`WS-002-construction-cards.md`. Two files. It does not read the other four workstreams, and
it does not read `PROJECT_MODEL.md` yet — nothing so far requires it.

**What it says:**

> WS-002 is in DECIDE. Constructions are settled as an off-board, non-cancellable
> commitment with per-round upkeep. The one open question is D3: when a construction is
> abandoned, does the card go back to the deck or leave the game? I'd lean toward leaving
> the game — the permanence is what makes the upkeep decision matter, and the deck thinning
> would help with the long late game. What do you think?

Two sentences of orientation, then straight into the unresolved point. No recap of the goal,
no re-listing of settled decisions, no ceremony.

### The same conversation, redirected

The owner replies:

> hold on, before that — where did the scoring stuff get to?

> WS-004 is in MODEL and paused on purpose. We'd settled that we're keeping four categories
> and that the problem is trade routes scaling superlinearly. There were two candidate
> fixes on the table — capping each category's share, or making route cost scale with route
> count — and neither was modelled out. It's paused because WS-001 is changing procurement
> costs and scoring reads those, so anything we model now gets rebuilt. Want to pick it up
> anyway, or wait for procurement to land?

That last question comes from the workstream file's `Next Step` and its assumptions section.
The dependency between WS-004 and WS-001 is not in anyone's head; it is written down where a
new agent trips over it.

---

## Checking the criterion

| Requirement | Where it comes from |
|---|---|
| What each effort is trying to accomplish | `Goal` + `Context` in each workstream file |
| Its current Design Room phase | `Phase` field, and the `ACTIVE.md` row |
| Decisions already made | `Decisions Made` — with reasoning, so they can be defended or revisited |
| Unresolved questions | `Open Decisions` — with options and a recommendation, so the owner can just answer |
| Next action | `Next Step` — one action, per workstream, plus the board's short form |
| Implementation/PR state | `Implementation State` + `Related PRs` + the board's PR column |
| Completed work off the board | WS-005 absent from the active table, present as a file, its outcome in `PROJECT_MODEL.md` and `DECISIONS.md` |

No transcripts were archived. Every file above is a distillation — conclusions, models,
decisions, unresolved questions, current state — and the whole set is a ten-minute read for
a project with five threads and two months of history.

**What would break it.** Any one of these, and the scenario fails:

- WS-002 in `DECIDE` with an empty `Open Decisions` — the new conversation knows the phase
  but not what to ask, and the owner has to remember D3.
- WS-004 paused with a `Next Step` of "resume later" — the WS-001 dependency lives only in
  someone's memory, and the work restarts on numbers that are about to move.
- WS-005 marked `COMPLETE` without the `PROJECT_MODEL.md` update — WS-003, which needs to
  understand current systems, reads a model that predates the harness.
- WS-001's spec issued without a checkpoint — a new conversation sees `READY_TO_BUILD` and
  re-issues a spec that already exists.

Each of those is a checkpoint from `WORKSTREAMS.md` that someone skipped. The protocol is
mostly a list of the moments where skipping is expensive.
