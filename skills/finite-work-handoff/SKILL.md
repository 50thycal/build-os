---
name: finite-work-handoff
description: Continue one approved build or investigation across agent sessions until its original acceptance checks reach SHIP, DECISION, BLOCKED, or an explicit stop. Use for handoffs, status updates, resuming a cloud session, closing a task, or whenever new findings are creating follow-up tickets faster than work is closing.
---

# Finite-work handoff

Follow [`framework/FINITE_WORK.md`](../../framework/FINITE_WORK.md). That framework document is canonical; this skill is the agent procedure for applying it.

## At session start

1. Read the current workstream, active board, Build Card/Spec when present, and the PR state.
2. State the mission contract in the workstream or PR handoff: desired outcome, acceptance checks, non-goals, material interrupt risks, and finish condition.
3. Resume the existing workstream. Do not create a new workstream because this is a new chat or because implementation revealed an adjacent idea.

## While working

For every out-of-scope finding, choose exactly one disposition: `FIX NOW`, `PARK`, `DISCARD`, or `OWNER DECISION`. Fix now only when required for the mission or when it is an immediate material risk. Park useful but unrelated work as one short candidate; do not create a ticket, branch, PR, or another session for it. Discard weak or low-value observations. Ask for an owner decision only for genuine owner judgement; include a recommendation and the option to stop where it is real.

Never use a follow-up as a substitute for correcting an in-scope defect.

## At session end

Update the durable state, then end in exactly one of these states: continue the same workstream with its single next action; `SHIP` when acceptance checks and the normal merge gate are complete; `DECISION` when owner judgement is necessary; `BLOCKED` when responsible progress cannot continue; or `ABANDONED` when the owner chooses to stop.

Use the owner-result format from `framework/OWNER_INTERFACE.md`. Keep the default result under 100 words, lead with the outcome, avoid implementation names and acronyms, and say whether the original ask is done. A completed workstream's next step is `None.`; deferred ideas live only in the parking lot.

## Final check

Before ending, ask: “Did I complete the original ask, repair a genuine blocker, or merely notice something else?” Only the first two justify ongoing active work without owner admission.
