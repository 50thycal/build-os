# Workstreams

**Build OS v0.12**

A **workstream** is one meaningful design/build thread — procurement redesign, an
authentication rewrite, a scoring rebalance, a new simulation system. Several may proceed
concurrently within the same project.

This document defines how a project keeps durable state for parallel design threads, so
that a design or implementation agent arriving with no conversational history can resume
meaningful work from the repository alone.

---

## Two memory layers

Design work now happens across many conversations, in more than one tool, over weeks.
Chat is where thinking happens; it is not where state lives.

### The agent's working context — working conversational memory

Holds design conversations, project instructions, conversational context, and temporary
exploration. It is fast, rich, and lossy. A ChatGPT Project is the common shape of it and the
one this document uses for examples, but a Claude session, another capable agent, or a person
with a notebook occupies the same slot. **Nothing below depends on which.**

### GitHub project repository — durable authoritative project memory

Holds current architecture, consequential decisions, active development and design state,
and implementation PRs. It is slower, distilled, and authoritative.

**Chat history must not be treated as the only durable project state.** GitHub must contain
enough distilled state that a new design or implementation agent can resume meaningful work
without reconstructing the project from old chats.

**Do not archive entire chat transcripts in GitHub.** Persist conclusions, models,
decisions, unresolved questions, and current state instead. A transcript is a recording of
thinking; a workstream file is the result of it. The first is unreadable at volume and rots
into noise; the second is the artifact that makes the next session cheap.

---

## What a workstream is

One meaningful design/build thread, tracked from raw idea to merged, documented outcome.

**A workstream is not synonymous with:**

- **one chat** — a workstream commonly spans several conversations, and one conversation
  may touch more than one workstream
- **one branch** — a workstream may produce several branches, or none yet
- **one PR** — a workstream may span multiple PRs, and often does when the design is
  delivered in stages

The unit is the *thread of intent*, not the vessel it travels in.

### Where a workstream comes from

Any entry surface. Intent may arrive in a Design Room conversation, in an implementation
session, in a GitHub issue, or from an agent noticing something adjacent to what it was
doing — and **the lifecycle is identical in all four cases.** What decides whether a
workstream exists is the *classification*, never the origin:

| Classification | Workstream |
|---|---|
| **Simple** | None. A workstream for a copy fix is the sprawl anti-pattern below, not diligence. |
| **Significant** | Created, or resumed if the intent belongs to one already open — check `ACTIVE.md` first. |
| **Promoted mid-flight** | Created at the moment of promotion, recording that it began as simple and what changed. |

That third row is the one that gets skipped. Work promoted from simple to significant partway
through has no workstream, and creating one retroactively feels like paperwork for something
already half-built. It is not: the promotion is exactly the moment the effort acquired owner
decisions worth remembering, and a PR that reaches review with no workstream behind it is a PR
the reviewer cannot measure against anything.

Intake, the classification, and the promotion rule are defined in
`framework/OWNER_INTERFACE.md`. **They add no lifecycle phase** — a workstream created from a
GitHub issue starts at `IDEA` or `EXPLORE` like any other, and the nine phases below are
unchanged from v0.2.

Workstreams get stable IDs — `WS-001`, `WS-002` — assigned in order and never reused. The
ID is how a conversation, a Build Card, a Build Spec, a PR, and a decision entry all refer
to the same effort.

**Granularity.** One workstream should have one coherent goal and, eventually, one Build
Card. If a thread would need three Build Cards to describe it, it is a programme of work
containing three workstreams. If two threads cannot be decided independently, they are one.

---

## Lifecycle

```text
IDEA
 ↓
EXPLORE
 ↓
MODEL
 ↓
DECIDE
 ↓
BUILD_CARD
 ↓
READY_TO_BUILD
 ↓
BUILDING
 ↓
REVIEW
 ↓
COMPLETE
```

Plus three states that can apply at any phase: `PAUSED`, `BLOCKED`, `ABANDONED`.

Movement is usually forward, but backward movement is normal and healthy: a decision taken
in `DECIDE` can invalidate the model and send the workstream back to `MODEL`; review can
send `REVIEW` back to `BUILDING`. Record the move; do not hide it.

### Phase definitions

**`IDEA`** — Raw idea exists but has not been explored. Someone said a sentence worth
keeping. Nothing has been investigated. A workstream can sit here indefinitely without
cost, which is exactly what makes it worth creating one.

**`EXPLORE`** — Problem, goal, assumptions, alternatives, and implications are being
investigated. Current behavior is being established. Second-order effects are being found.
The workstream leaves this phase when the desired outcome can be stated in one sentence the
owner recognizes as theirs.

**`MODEL`** — The conceptual flow, state, or system model is being developed. The output is
a compact representation understandable without implementation detail. The workstream
leaves this phase when the model makes the hard cases obvious.

**`DECIDE`** — Meaningful owner-level decisions remain. Each is stated with options,
consequences, and a recommendation. The workstream leaves this phase when no unanswered
question would change what a user experiences.

**`BUILD_CARD`** — The owner-facing design is being finalized. The card is being written,
tightened to a 30–60 second read, and put in front of the owner. The workstream leaves this
phase on explicit owner approval.

**`READY_TO_BUILD`** — Build Card is settled and an implementation specification can be
issued. The design is done; the spec may not be written yet. This phase exists because
approval and implementation are frequently separated by days, and a workstream parked here
is in a genuinely different state from one still being designed.

A **Design Handoff PR** may already be open here. A draft PR carrying the spec and the
workstream checkpoint, waiting for an implementation agent, is still `READY_TO_BUILD` —
Implementation State `spec issued; draft handoff open`. Opening a PR is not starting work.

**`BUILDING`** — Implementation agent is actively implementing the approved design. A Build
Spec has been issued. There may or may not be a PR yet.

The move from `READY_TO_BUILD` happens when implementation actually begins, not when the
spec is issued and not when the PR appears.

**`REVIEW`** — Implementation exists and is undergoing independent review against design
intent, per `REVIEW_PROTOCOL.md`. A PR exists. Findings may return the workstream to
`BUILDING`, and frequently do — `REVIEW → BUILDING → REVIEW` is the ordinary shape of a
reviewed change, not a failure.

A workstream stays in `REVIEW` through approval and through the merge-finalization commit.
It leaves when the reviewed head merges.

**`COMPLETE`** — Work is merged/accepted and durable architecture and decision
documentation reflects the result. `COMPLETE` is not "the PR merged" — it is "the PR merged
*and* `PROJECT_MODEL.md` and `DECISIONS.md` are true again." See *Completion* below.

### Status states

These are orthogonal to phase: a workstream is *in* a phase and *has* a status. A blocked
workstream retains the phase it was blocked in, because that is where it resumes.

**`PAUSED`** — Deliberately set down. Nothing is preventing progress; it is not the
priority. Record why and what would restart it. A paused workstream stays on `ACTIVE.md` —
it is still real work, just not now.

**`BLOCKED`** — Cannot proceed until something external resolves: an owner decision, a
dependency, another workstream, information nobody has. **Record what specifically unblocks
it**, in one line, as the next step. A blocked workstream with a vague blocker is an
abandoned workstream that nobody has admitted to.

**`ABANDONED`** — Deliberately stopped, permanently. Record why. Abandonment is a real
outcome and worth keeping: the reasoning stops the same idea from being re-proposed every
quarter. Leaves `ACTIVE.md`; the file remains.

### Mapping to the Design Room

The lifecycle is the same process as `DESIGN_ROOM.md`, tracked over time rather than within
a conversation:

| Workstream phase | Design Room stage |
|---|---|
| `IDEA` | before stage A |
| `EXPLORE` | A. Explore |
| `MODEL` | B. Model |
| `DECIDE` | C. Decide |
| `BUILD_CARD` | D. Build Card |
| `READY_TO_BUILD` | D approved; E not yet issued |
| `BUILDING` | E. Build Spec issued; implementation running |
| `REVIEW` | `REVIEW_PROTOCOL.md` |
| `COMPLETE` | `PROJECT_MEMORY.md` updated |

The workstream file is the Design Room's memory between sessions. Nothing in it duplicates
the Design Room process; it records where that process got to.

---

## Per-project structure

```text
docs/
├── PROJECT_MODEL.md
├── DECISIONS.md
└── workstreams/
    ├── ACTIVE.md
    ├── WS-001-<slug>.md
    ├── WS-002-<slug>.md
    └── ...
```

**This exact location is not required** if the repository has a strong existing
documentation convention — but preserve the conceptual structure: current architecture,
historical rationale, and active design state as three distinct, discoverable things.
Whatever location is chosen, name it in the project's `CLAUDE.md` so agents find it without
searching.

---

## ACTIVE.md

`docs/workstreams/ACTIVE.md` is the project's active-work control board: a concise view of
all non-complete workstreams.

It answers: **What are we currently working on and where is each effort?**

| ID | Workstream | Phase | Status | Current Next Step | Related PR |
|---|---|---|---|---|---|
| WS-001 | Procurement redesign | BUILDING | Active | Awaiting first PR from implementation agent | — |
| WS-002 | Construction cards | DECIDE | Active | Owner to answer D2 (cost visibility) | — |
| WS-003 | Map geometry | EXPLORE | Active | Establish how adjacency works today | — |
| WS-004 | Scoring changes | MODEL | Paused | Resume after WS-001 lands; scoring depends on procurement costs | — |

**Keep this document short.** It is a board, not a report. One line per workstream, and the
next step in a dozen words. If a row needs a paragraph, that paragraph belongs in the
workstream file.

Completed and abandoned workstreams **leave the active table**. Their individual files
remain as historical records. A short "Recently completed" list beneath the table is
optional and useful — cap it at the last handful and let older entries fall off.

The board is what a new conversation reads first. Everything about its format should serve
being read in fifteen seconds.

### The active-work limit

**By default a repository carries at most three owner-attention workstreams at once**
([`FINITE_WORK.md`](FINITE_WORK.md)): one being built, one being reviewed or verified, and one
investigation or operational concern. Automated monitoring does not count unless it needs the
owner. A project may declare a different limit in its framework block; three is the default
because it is roughly what one owner can hold, and a board past it stops being read at all —
which is the failure the fifteen-second rule above is already fighting.

The limit is not a queue depth. **Promoting a fourth workstream requires completing, pausing or
abandoning one of the three**, and that is the point: the cost of starting something new is paid
visibly, by the owner, at the moment they start it. A board that can grow without that
transaction will grow, because every individual addition looks reasonable.

### The parking lot

Beneath the board, a `## Parked` list holds deferred candidates — one line each, no owner,
no phase, no PR. It is where a `PARK` disposition lands, and it is deliberately not a backlog:
nothing schedules it, nothing reports on it, and an agent may not start anything in it. The
owner reads it when they are choosing what to do next, which is the only moment it is useful.

A parked candidate becomes work by exactly one route: **the owner promotes it**, at which point
it becomes a workstream under the active-work limit like anything else. Nothing else in Build OS
reads it, and an agent that finds a parked line describing something it is about to build has
found an owner decision, not a permission.

Template: `templates/ACTIVE_WORK.template.md`

---

## Workstream file

One file per workstream: `docs/workstreams/WS-###-<slug>.md`.

```markdown
# WS-### — Title

Phase:
Status:
Created:
Updated:

## Goal
What outcome are we trying to produce?

## Context
Why does this workstream exist?

## Current Mental Model
The best current conceptual description.
Prefer diagrams, state flows, or concise systems descriptions where useful.

## Decisions Made
Owner-level decisions already resolved.

## Open Decisions
Questions still requiring product/design judgment.

## Assumptions
Important assumptions currently being made.

## Non-Goals
What this effort deliberately does not cover.

## Acceptance Checks
What must be true for this workstream to be finished. The finish condition, stated so that
someone other than its author could tell whether it holds.

## Build Card
The current owner-facing Build Card. Use `Not ready` before this phase.

## Implementation State
None / spec ready / building / PR reference / merged.

## Review State
**Verdict:** <Not started | In review | Changes required | Approved | Approved with follow-ups>
**Reviewed head:** <full 40-character SHA, or —>

Findings and follow-ups, in prose.

## Related Decisions
Links/IDs from DECISIONS.md.

## Related PRs
PR references.

## Parked
Deferred candidates, one line each. `None.` when there are none.

## Next Step
The single most useful next action. `None.` once the workstream is complete.
```

Notes on the sections that are most often done badly:

- **Current Mental Model** is the highest-value section in the file. It is what a new
  conversation reads to become useful. Keep it current — a stale model is worse than none,
  because it will be believed.
- **Open Decisions** is what makes a workstream resumable. A workstream in `DECIDE` whose
  open decisions are not written down has lost the thing it was in the middle of.
- **Assumptions** age badly and are worth re-reading at every checkpoint. An assumption that
  has since been falsified is usually the reason a design stopped making sense.
- **Build OS** in the header names the protocol version this workstream runs under, defaulting
  to the project's adopted version. From v0.5 it is what decides whether the merge gate applies —
  deliberately, so that removing a review record cannot quietly remove the gate with it. Stating
  it explicitly matters most in two places: on a workstream that should stay under the old rules
  while the project moves on, and on one that should stay gated after it completes. An inherited
  default covers current work only, never finished history.
- **Review State** leads with machine-readable fields — `Verdict` and `Reviewed head`, plus
  `Reviewed PR` and `Finalization` where they apply — before any prose. A workstream spanning
  several PRs records one row per PR; a verdict never applies to a PR it does not name. The head is the full 40-character SHA the verdict was reached against —
  an abbreviation is not accepted, because it cannot prove which commit was reviewed. An
  approval that names no head does not open the merge gate. See `REVIEW_PROTOCOL.md`.
- **Goal, Non-Goals and Acceptance Checks together are the mission contract**
  ([`FINITE_WORK.md`](FINITE_WORK.md)) — the desired outcome, what is deliberately excluded, the
  material interrupt risks worth naming, and what counts as finished. They are written when the
  workstream is established, not reconstructed at the end, because a finish condition invented
  after the work is a description of where the work stopped.
- **Parked** holds deferred candidates, at most three on a completed workstream, one line each.
  It is not a backlog and nothing reads it looking for work: the owner reads it when choosing a
  next priority, and an agent may not activate anything in it without the owner saying so. A
  parked candidate that turns out to be required for an acceptance check was never parked — it
  was in scope, and it comes back into this workstream as `FIX NOW`.
- **Next Step** is one action, not a plan. If it takes three sentences, the workstream is
  blocked on something that has not been named. On a **completed** workstream it is `None.` and
  nothing else — not "open a ticket", not "follow up later". An open-ended next step on a
  finished mission is a tail hiding inside a completed record, and the parking lot exists so it
  does not have to.

Everything else is short. The file should be readable in two minutes at any phase.

Template: `templates/WORKSTREAM.template.md`

---

## Checkpoint policy

**Do not require agents to update GitHub after every conversational exchange.** Persist
workstream state at meaningful checkpoints.

At minimum, checkpoint when:

1. a meaningful new workstream is established,
2. the mental model becomes materially clearer,
3. an important owner decision is made,
4. the Build Card becomes ready,
5. a Build Spec is issued,
6. implementation begins or a PR is created,
7. review identifies a material issue or approves the work,
8. a PR is about to merge — the **merge-finalization** checkpoint, below,
9. the workstream is completed, paused, blocked, or abandoned.

The goal is **durable continuity without excessive administrative overhead**. The test for
whether a checkpoint is due: *if this conversation ended right now, would the repository
still contain what we just worked out?* If yes, keep talking. If no, checkpoint.

A checkpoint updates the workstream file's changed sections, its `Phase`, `Status`, and
`Updated` fields, and the matching row in `ACTIVE.md`. It does not rewrite the whole file
and it does not append a transcript.

Also worth checkpointing, though not required: the end of any substantial working session,
even mid-phase. Sessions rarely end where you expect them to.

---

## The Design Handoff PR

Design ends by publishing an approved Build Card and an issued Build Spec. Where the design
agent has GitHub write access, it publishes them as a **draft PR** — the same PR the
implementation will be built on.

- Created **only after** the Build Card is approved and the spec is issued.
- **Draft**, and titled as the change to be built.
- May contain nothing but the workstream checkpoint and the spec.
- Named in the workstream's `Related PRs` and `Implementation State` from the moment it
  exists.

**It is the single PR for that implementation.** The implementation agent continues this
branch and this PR rather than opening its own, so one PR carries the change from spec to
merge and the review reads one history. Do not open a second PR for the same implementation
unless the first merged or closed, or an escalation genuinely requires a separate change —
and say so in the handoff when it happens.

The workstream stays `READY_TO_BUILD` while the PR is parked. See the phase definitions
above, and `framework/DESIGN_ROOM.md` for the design-side rules.

Without write access, the repository-update block below remains the authoritative path.
**Never describe a Design Handoff PR that does not exist.**

---

## Merge finalization

The last checkpoint on a PR happens *before* the merge, not after it.

After the reviewer approves and before the merge button, the implementation agent pushes one
documentation-only commit to the same PR, setting the workstream and the board to what
becomes true when the PR lands:

- `Phase` and `Status`
- `Implementation State` — `merged in #<n>`, or whatever actually comes next
- `Review State` — verdict and the final head
- `Related PRs`
- `Next Step`
- the row in `ACTIVE.md` — updated, or removed if the workstream completes
- `PROJECT_MODEL.md` and `DECISIONS.md`, if the workstream completes (see *Completion*)

Nothing else. Any executable, test, dependency, configuration, or behavior-documentation
change in that commit invalidates the approval and returns the PR to full review.

`Reviewed head` in that commit stays the last head reviewed **in full** — a commit cannot
contain its own SHA, so it can never name the head it is about to produce. It adds
`Finalization: pushed` instead. The reviewer then verifies the head that commit produced and
records it **on the PR**, where a record can be made after the commit exists, and the merge
targets that exact SHA. See `framework/REVIEW_PROTOCOL.md`.

This is what stops `main` from filling with workstreams that say `REVIEW` about PRs that
merged weeks ago, without a second bookkeeping PR nobody opens. The rules, and why writing
"merged" just before merging is honest rather than a fiction, are in
`framework/REVIEW_PROTOCOL.md`.

If the merge is abandoned after finalization, undo it: a finalized workstream on a PR that
will not merge is a false record waiting to be believed.

---

## Session-start behavior

The owner should not need to manually summarize previous conversations. **Avoid ceremonial
status reporting when it is unnecessary.**

Run the **framework compatibility check** at session start, before either path below —
once per session, before the first substantial piece of work. See
`framework/FRAMEWORK_SYNC.md`. If the project is behind canonical, that is part of the
orientation; if it is current, say nothing about it.

**Continuation is the default.** A new session resumes the mission that was already running; it
does not become a new workstream by virtue of being a new chat window, and it does not become
one because implementation revealed something adjacent. Read `ACTIVE.md` first and assume what
you find there is the work, unless the owner has said otherwise or nothing is open at all. The
two paths below are not symmetrical, and the asymmetry is the point ([`FINITE_WORK.md`](FINITE_WORK.md)).

### For a clearly new idea

1. Identify whether it belongs to an existing workstream. Check `ACTIVE.md` first — new
   ideas are frequently the unresolved part of something already open.
2. Confirm the idea is **the owner's**, and that the board has room for it. An idea an agent
   arrived at on its own is a `PARK` or a `DISCARD`, not a workstream, and a fourth workstream
   on a board of three is an owner decision about what stops.
3. Otherwise establish a new workstream: next free ID, a title, a goal, its non-goals and
   acceptance checks, and the context that produced it.
4. Begin at `IDEA`/`EXPLORE` and run the Design Room.

Creating the workstream file can wait until the idea survives first contact — checkpoint 1
says *a meaningful new workstream*, and half of all raw ideas do not become one.

### For a continuation

1. Identify the workstream — from what the owner said, or by reading `ACTIVE.md`.
2. Inspect its current phase and the file's `Acceptance Checks`, `Open Decisions`,
   `Assumptions`, and `Next Step`. The acceptance checks are what tells you when to stop.
3. Briefly orient the owner — one or two sentences.
4. Continue from the unresolved point.

```text
WS-004 is currently in DECIDE. We've settled X and Y; the remaining question is Z.
```

Then continue directly. Do not restate the goal, re-list the decisions already made, or
summarize the mental model back to the person who approved it. Orientation exists to
confirm you are both in the same place, not to demonstrate that you read the file.

---

## GitHub capability boundary

The protocol must not assume that every design-agent environment has GitHub write access.
Three cases, and the rule that governs all three:

**Never falsely claim durable persistence.**

### The design agent can write to GitHub

Update the relevant workstream checkpoint directly: the workstream file, `ACTIVE.md`, and —
where the checkpoint warrants it — `PROJECT_MODEL.md` and `DECISIONS.md`. Say what was
written and where.

### The design agent can read but cannot write

Prepare the required checkpoint update as part of the next implementation handoff, so Claude
or another authorized agent persists it. Make it precise enough to apply mechanically:

```markdown
## Repository update required

**File:** `docs/workstreams/WS-004-scoring-changes.md`
- `Phase:` MODEL → DECIDE
- `Updated:` 2026-08-22
- Replace **Current Mental Model** with: <exact text>
- Add to **Decisions Made**: <exact text>
- Add to **Open Decisions**: D3 — <exact text>
- **Next Step:** Owner to answer D3

**File:** `docs/workstreams/ACTIVE.md`
- WS-004 row: Phase MODEL → DECIDE; Next Step → "Owner to answer D3 (tiebreak rule)"
```

Tell the owner plainly that state is not yet persisted and what will persist it.

### GitHub is unavailable

Continue the Design Room — the thinking is still worth doing. Clearly identify that
repository state has not been synchronized, and produce the same precise update block at the
end of the session so nothing is lost when access returns.

---

## Completion

When a workstream reaches `COMPLETE`:

1. **Verify implementation against the Build Card.** Not against the spec, and not against
   the handoff. The card is what the owner approved.
2. **Update `PROJECT_MODEL.md`** with the new current system behavior where material.
3. **Record consequential rationale in `DECISIONS.md`.**
4. **Mark the workstream `COMPLETE`** — phase, status, `Updated`, and a final `Next Step` of
   `None.` An open-ended next step here is not a completion; see below.
5. **Disposition every open observation.** Anything noticed during the work and not done is
   `PARK`ed to the board's parking lot (at most three, one line each), `DISCARD`ed, or — if an
   acceptance check depends on it — was never deferrable and the workstream is not complete.
6. **Remove it from the active-work list** in `ACTIVE.md`, which also frees a slot under the
   active-work limit.
7. **Preserve the workstream file** as historical development context, unless project
   retention rules say otherwise.

In the normal v0.5 flow, steps 2–6 happen in the **merge-finalization commit on the PR
itself**, so `main` is true the moment the PR lands. Completion after the fact — a separate
commit to `main` — remains valid; it is simply the slower path, and the one that gets
forgotten.

This establishes two flows:

```text
Workstream outcome    →  PROJECT_MODEL
Workstream rationale  →  DECISIONS
```

**A completed workstream holds no tail.** Step 5 is what keeps that true, and it is the one
most easily skipped, because a next step reading "open a ticket for the caching work" feels
diligent rather than evasive. It is neither: it is active work smuggled into a record that
claims to be finished, where nothing will schedule it and nothing will read it. Deferred ideas
live in the parking lot, where they are visibly not being worked on, and the completed
workstream's next step is `None.` — see [`FINITE_WORK.md`](FINITE_WORK.md).

Steps 2 and 3 are what make `COMPLETE` mean something. A workstream marked complete while
`PROJECT_MODEL.md` still describes the old behavior has moved the problem rather than
finished the work — the next agent will read the model, believe it, and be wrong.

---

## The three project-memory layers

| File | Answers | Shape |
|---|---|---|
| `PROJECT_MODEL.md` | **How does the system work today?** | Overwritten; always current |
| `DECISIONS.md` | **Why does the system work this way?** | Appended; never rewritten |
| `workstreams/` | **What are we currently designing/building, what have we settled, and what remains?** | Living while active; frozen when done |

**Avoid duplicating large amounts of information between the three.**

Where they overlap, prefer the narrower home and link:

- A mental model of a *shipped* system belongs in `PROJECT_MODEL.md`. A workstream's
  **Current Mental Model** describes the system *as it will be*, and is superseded by the
  model update at completion — at which point the workstream section can be left as the
  historical record it now is, not copied forward.
- A decision that is still open belongs in the workstream. Once accepted **and
  consequential**, it belongs in `DECISIONS.md`, and the workstream's **Related Decisions**
  section links to the `DEC-n` rather than restating it.
- Not every decision made in a workstream earns a `DEC-n`. Most owner decisions are
  ordinary product choices and live and die in the Build Card. `DECISIONS.md` is for the
  consequential ones — see `PROJECT_MEMORY.md`.

The failure mode to avoid is three files describing the same system in three drifting
voices, at which point nobody knows which one is true.

---

## Anti-patterns

| Anti-pattern | What it looks like | Why it hurts |
|---|---|---|
| Transcript archiving | Chat logs committed under `workstreams/` | Unreadable at volume; buries the conclusions it was meant to preserve |
| Checkpoint spam | A commit after every exchange | Overhead swamps value; people stop doing it entirely |
| Stale model | **Current Mental Model** two designs behind | Worse than empty — it will be believed |
| Vague blocker | `Status: BLOCKED`, next step "waiting" | Nothing can unblock it; it is abandoned but undeclared |
| Board bloat | `ACTIVE.md` with paragraphs per row | Stops being readable in fifteen seconds, so it stops being read |
| Zombie completion | `COMPLETE` with `PROJECT_MODEL.md` untouched | The next agent trusts a model that is now false |
| Phantom persistence | "I've updated the workstream" with no write access | Destroys the guarantee the whole layer exists to provide |
| Workstream sprawl | One per idea anyone mentions | The board stops distinguishing real work from noise |
| Unchecked framework | Resuming a workstream without confirming the adopted Build OS version | The effort continues under a protocol that has since changed |
| Second PR for one build | The implementation agent opens its own PR beside the design handoff | The change's history splits; review reads half of it |
| Post-merge bookkeeping | Leaving the workstream at `REVIEW` and planning a cleanup PR | `main` describes a state that ended at merge; the cleanup PR never comes |
| Orphan promotion | Work promoted to significant that never gets the workstream it now needs | Review has nothing to measure the change against, and the decisions made along the way are unrecorded |
| Approval without a commit | `Review State: Approved`, no reviewed head | Proves nothing, and the gate it opens was never really closed |
| Discovery as admission | A new workstream opened because an agent noticed something mid-task | Work is created by observation rather than by the owner, and the board outgrows the person who has to read it |
| Tail in a completed file | `COMPLETE` whose next step is "open a ticket" or "follow up later" | Unfinished work hides inside a record that claims to be finished, and nothing will ever pick it up |
| Parking lot as backlog | Parked candidates given owners, phases, estimates or a PR | It becomes a second board with none of the first one's limits, and the limit was the whole mechanism |
| Session as new workstream | A resumed mission restarted as WS-### + 1 because the chat is new | The original acceptance checks are lost, and the same work now exists twice on the board |
