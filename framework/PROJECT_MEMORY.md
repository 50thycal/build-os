# Project Memory

**Build OS v0.7**

Project memory has **three layers**. Together they are the memory that outlives any chat
session, any agent, and any individual contributor.

| Layer | Answers | Shape |
|---|---|---|
| `PROJECT_MODEL.md` | **How does the system work today?** | Overwritten; always current |
| `DECISIONS.md` | **Why does the system work this way?** | Appended; never rewritten |
| `workstreams/` | **What are we currently designing/building, what have we settled, and what remains?** | Living while active; frozen when done |

The first two are defined in this document. The third — the active design/build state, one
file per workstream plus a control board — is defined in `framework/WORKSTREAMS.md`.

Conventional location:

```text
docs/
├── PROJECT_MODEL.md
├── DECISIONS.md
└── workstreams/
    ├── ACTIVE.md
    └── WS-###-<slug>.md
```

Anywhere is fine as long as it is consistent and the project's `CLAUDE.md` points at it.

These are not optional documentation. They are the mechanism by which an agent that has
never seen the project becomes useful in ten minutes instead of two hours — and the
mechanism by which the reasoning behind the system stops evaporating.

**Avoid duplicating large amounts of information between the three.** They describe the same
system from three angles, and when they drift, nobody knows which one is true. Where they
overlap, prefer the narrower home and link:

- A model of the system **as it is** belongs in `PROJECT_MODEL.md`. A workstream's mental
  model describes the system **as it will be**, and is superseded at completion rather than
  copied forward.
- An **open** question belongs in the workstream. An accepted and consequential decision
  belongs in `DECISIONS.md`; the workstream links to the `DEC-n` instead of restating it.
- Most owner decisions are ordinary product choices that live and die in the Build Card.
  Only the consequential ones become `DEC-n` entries.

---

## PROJECT_MODEL.md

**Represents current architecture and behavior.**

Written in the present tense, describing what is true now. Not a history, not a roadmap,
not a wish. If something is planned but not built, it does not belong here.

Document at a useful conceptual level:

- **Purpose** — what this system is for, in a few sentences. What it does and for whom.
- **Major components** — the handful of parts that matter, what each is responsible for,
  and how they relate. Conceptual units, not directories.
- **System boundaries** — where this system ends. What it owns, what it trusts, what it
  merely calls. Which data is authoritative here versus mirrored from elsewhere.
- **Important data flows** — how information actually moves through the system for the
  two or three flows that matter most. The paths a new contributor must understand.
- **Major state machines / workflows** — entities with meaningful states, their legal
  transitions, and what triggers each. This is usually the highest-value section.
- **External integrations** — third-party services and other internal systems, what each
  is used for, and what happens when each is unavailable.
- **Important invariants** — things that must always be true. "Every order has exactly one
  active fulfillment." "Balances never go negative." Invariants are how a reader knows
  which parts of the system are load-bearing.
- **Important persistence / data structures** — the core entities and their relationships.
  The shapes worth knowing before touching anything, not the full schema.
- **Experiment / game / campaign lifecycle where relevant** — many systems have a central
  domain object with a lifecycle everything else orbits. If this system has one, its
  lifecycle deserves its own section.
- **Current major architectural constraints** — what cannot easily change and why.
  Performance budgets, compliance requirements, compatibility obligations, deliberate
  limitations. This is where readers learn which walls are real.

### What this file is not

**Do not turn this file into generated low-level API documentation.**

No exhaustive endpoint listings, no function-by-function reference, no full schema dumps.
Those are generated from code, go stale instantly, and bury the thing that has value:
the model in someone's head that lets them predict how the system will behave.

**It is a human/agent mental model.** The test is whether a competent engineer who has
never seen the code can read it and correctly predict what the system does in a case the
document does not explicitly mention.

Practical guidance: if a section would be more accurate if generated from the code, it
should not be in this file. If it would be *wrong* if generated from the code — because it
explains intent, responsibility, or invariant — it belongs here.

### When to update

**Agents must update it whenever implementation materially changes the architecture,
important flows, invariants, or system responsibilities.**

Update when:

- A new component, service, or integration is added — or removed
- A system boundary moves; something becomes authoritative here, or stops being
- A state machine gains, loses, or redefines a state or transition
- An important data flow changes shape
- An invariant is added, broken, or replaced
- A responsibility moves between components
- An architectural constraint is introduced or lifted

Do not update for: a bug fix that restores intended behavior, a refactor with no
conceptual change, a new endpoint that follows an existing documented pattern, added tests,
copy changes.

The update ships in the same pull request as the change it describes. A separate
documentation PR is a documentation PR that does not get written.

Template: `templates/PROJECT_MODEL.template.md`

---

## DECISIONS.md

**Represents why consequential design choices were made.**

Lightweight ADR-style entries, appended in order. Newest at the top or bottom — pick one
and be consistent.

Each entry contains:

- **Stable decision ID** such as `DEC-001` — never reused, never renumbered
- **Title** — the decision, stated as a decision
- **Date** — when it was accepted
- **Status** — `Proposed` · `Accepted` · `Superseded by DEC-0NN` · `Deprecated`
- **Context** — the situation that forced a choice. What was true, what pressure existed,
  what was unknown. Written so it makes sense to someone who was not there.
- **Decision** — what was chosen, stated plainly and unambiguously
- **Rationale** — why this option won
- **Alternatives considered** — when meaningful. What else was on the table and why it
  lost. Often the most valuable part: it stops the same rejected option from being
  proposed every six months.
- **Consequences / implications** — what follows. What becomes easy, what becomes hard,
  what is now expensive to reverse, what must be revisited if an assumption changes.

### What counts as consequential

**Record consequential decisions only. Do not record trivial implementation choices.**

Record it when the decision:

- constrains future work, or is expensive to reverse
- resolves a genuine trade-off where the losing option was defensible
- was an owner decision from the Design Room with lasting effect
- explains something a future reader would otherwise find surprising or wrong
- deliberately accepts a cost — debt, a limitation, a risk

Do not record: naming, file layout, library choices with no lasting consequence, anything
a competent engineer would do the same way without discussion, anything the code already
makes obvious.

A `DECISIONS.md` with 20 entries after two years is healthy. One with 200 is a changelog
that nobody reads.

### Never rewrite history

**Never rewrite accepted historical decisions merely because architecture later changes.**

A decision entry records what was decided, when, and with what information available. That
record stays true even after the decision is reversed — and the reversal is far more
legible when the original reasoning survives next to it.

**Instead create a newer decision that supersedes the old one where appropriate.**

```markdown
### DEC-004 — Move seat accounting to the billing service
**Date:** 2026-03-11 · **Status:** Accepted · **Supersedes:** DEC-002
...
```

And on the old entry, change **only** the status line:

```markdown
### DEC-002 — Keep seat accounting in the identity service
**Date:** 2025-08-02 · **Status:** Superseded by DEC-004
```

Leave its context, rationale, and consequences exactly as written. Fixing a typo is fine.
Rewriting the reasoning to look correct in hindsight destroys the only thing the file is
for.

Template: `templates/DECISIONS.template.md`

---

## How the layers relate

They answer different questions and should not be merged.

`PROJECT_MODEL.md` is **overwritten** as the system changes — it always describes now.
`DECISIONS.md` is **appended to** — it never describes now, it describes a sequence of
choices. `workstreams/` is **neither**: each file is live and edited while its thread is
active, then frozen as a historical record when it completes.

A reader who wants to change the system reads the model. A reader who wants to change the
system *and is about to argue with a past choice* reads the decisions first. A reader who
wants to know what is in flight reads `workstreams/ACTIVE.md`.

Cross-reference freely: the model can cite `DEC-004` where a constraint exists for a
recorded reason, and that citation is often the fastest way to stop a bad refactor.

Workstream completion is what feeds the other two layers:

```text
Workstream outcome    →  PROJECT_MODEL
Workstream rationale  →  DECISIONS
```

A workstream marked `COMPLETE` while `PROJECT_MODEL.md` still describes the old behavior has
moved the problem rather than finished the work.

---

## Reviewer's obligation

Review checks all three layers (see `framework/REVIEW_PROTOCOL.md`, items 6, 7, and 10):

- Does `PROJECT_MODEL.md` reflect current reality after this change?
- Are new consequential decisions captured in `DECISIONS.md`?
- Does the workstream's recorded state match what actually happened?

Memory that is only maintained when someone remembers to maintain it is memory that
decays. Making it a review item is what keeps these files true.
