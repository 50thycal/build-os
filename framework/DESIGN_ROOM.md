# Design Room

**Build OS v0.1**

The Design Room is where an abstract idea becomes something buildable. It is run by the
design agent with the owner. It ends with two artifacts: a **Build Card** the owner
approves, and a **Build Spec** the implementation agent executes.

Five stages, in order:

```text
A. Explore  →  B. Model  →  C. Decide  →  D. Build Card  →  E. Build Spec
   ▲                            │
   └────────────────────────────┘
      loop back freely until the design is coherent
```

Stages A–C loop. Stage D happens once the design is coherent. Stage E happens only after
the Build Card is settled.

The single rule that governs the whole room: **do not write an implementation
specification before the design is understood.** A specification produced too early
encodes the first plausible interpretation of a vague idea and gives it the authority of
detail.

---

## A. Explore

The design agent receives ideas from the owner that are informal, incomplete, abstract,
or internally contradictory. This is normal and expected. The owner is not required to
arrive with a coherent design.

**Do not immediately generate an implementation spec.** Do not immediately generate a
Build Card either. Explore first.

Determine, through conversation:

- **Desired outcome** — what the owner actually wants to be true afterwards. Often
  different from the mechanism they proposed. "Add a retry button" may mean "stop losing
  the user's work."
- **Current behavior** — what the system does today, concretely. If this is unknown, find
  out before designing; half of all design work disappears once current behavior is clear.
- **User experience being sought** — what someone using the system notices, feels, or
  stops having to do.
- **System being changed** — which components, boundaries, and data this touches.
  Check `PROJECT_MODEL.md`.
- **Assumptions** — everything being taken for granted, made explicit. Especially
  assumptions about scale, trust, ordering, and failure.
- **Unresolved questions** — what is genuinely not yet known, separated from what merely
  has not been said.
- **Likely second-order effects** — what else changes as a consequence. New states other
  code must handle, existing invariants under pressure, data that becomes stale, support
  burden, migration cost.

**Alternative designs.** Where useful, propose alternatives — especially a materially
simpler one. If a smaller change achieves most of the outcome, say so plainly; the owner
may not know it was available. Proposing alternatives is not obstruction, and it is not a
substitute for eventually committing to one.

**Contradictions.** When the owner's stated ideas conflict, name the conflict directly and
ask which side wins. Do not silently resolve it — a silently resolved contradiction becomes
a silently wrong feature.

Exit Explore when you can state the desired outcome in one sentence the owner would
recognize as theirs, and you know what currently happens instead.

---

## B. Model

Translate the idea into a **compact conceptual representation**. This is the heart of the
framework: the model is what the owner reasons about, what the reviewer checks against,
and what the Build Spec is derived from.

Prefer formats such as:

- **state machines** — where an entity has meaningful states and legal transitions
- **before / after flows** — where behavior is changing rather than being introduced
- **system diagrams** — where the change spans components or services
- **inputs → transformations → outputs** — for processing, computation, or pipelines
- **lifecycle diagrams** — where something is created, changes hands, and ends
- **interaction flows** — where the sequence between actors or systems is the point

Plain ASCII, Mermaid, tables, and short numbered flows are all fine. Reach for whichever
makes the *mechanism* visible.

**The model must be understandable without reading implementation details.** No function
names, no table names, no framework vocabulary. If the model cannot be drawn without
naming a class, the design is not yet understood — it is being described rather than
modeled.

A good model makes the hard cases obvious. If the state machine has an edge nobody can
name, that edge is the design problem.

Show the model to the owner. Their reaction to a picture is a much better signal than
their reaction to prose.

**Example shapes:**

```text
State machine
  draft ──submit──► pending ──approve──► active ──expire──► lapsed
                       │                    │                 │
                       └──reject──► draft   └──cancel──► ended └──renew──► active

Before / after
  Before:  upload → validate → store → (on failure: 500, file lost)
  After:   upload → validate → store → (on failure: quarantine + retry token)

Inputs → transformations → outputs
  raw events + user timezone  →  bucket by local day  →  daily rollup rows
```

---

## C. Decide

Separate **implementation details** from **product/design decisions**.

Only surface decisions requiring owner judgment. A decision needs the owner when it
changes what someone using the system experiences, what the business commits to, what
data is kept or lost, or what becomes hard to reverse.

A decision does **not** need the owner when it is invisible in behavior: storage shape,
library choice, module layout, naming, algorithm, whether something is one query or three.
Those belong to the implementation agent (see `BUILD_SPEC.md` → *Implementation discretion*).

**Prefer roughly 1–5 meaningful decisions per decision pass.** More than that usually
means implementation details have leaked into the list, or the feature should be split.
Fewer than one means either the design is genuinely mechanical — fine, say so and move on —
or the real choices have not been found yet.

For each decision, include:

- **Question** — stated so that either answer is a real, defensible position
- **Options** — usually two or three, each genuinely viable
- **Consequences** — what follows from each, including what becomes hard later
- **Recommendation and rationale** — when the design agent has a view, give it, with the
  reasoning that produced it

Do not pad the list with false choices to appear thorough. Do not hide a real choice
inside a recommendation.

**Format:**

```markdown
**D1. When a paused subscription's seats are reassigned, do the original seats return?**

- **Option A — seats return on resume.** Simple mental model. Risks over-allocation if
  the team grew while paused; someone gets bumped.
- **Option B — seats do not return; resume requests current availability.** No
  over-allocation. A long pause can mean resuming into a smaller team, which will
  generate support contacts.

*Recommendation: B.* Over-allocation is a correctness problem that surfaces at the worst
moment; the smaller team on resume is a communication problem we can handle with copy.
```

Record the owner's answers verbatim. They become the *Decisions made* section of the Build
Card and the *Owner decisions* section of the Build Spec — and, if consequential, an entry
in `DECISIONS.md`.

Loop back to A or B when a decision invalidates the model. That is the loop working.

---

## D. Build Card

Once the design is coherent, write the owner-facing description.

**It should usually be understandable in 30–60 seconds.** This is a hard constraint, not
an aspiration. If it takes three minutes, the feature is too large or the card is doing
the Build Spec's job. Split the feature or cut the card.

The Build Card is the owner's contract with the system. Everything downstream — spec,
implementation, review — is measured against it.

Include:

- **Goal** — one or two sentences. Why this exists.
- **Current behavior** — what happens today.
- **New behavior** — what will happen instead.
- **Mental model / flow** — the diagram from stage B.
- **Important rules** — the handful of rules that must hold. Behavioral, not technical.
- **Decisions made** — the owner's answers from stage C, with one line of reasoning each.
- **Explicit non-goals** — what this deliberately does not do. Non-goals prevent the most
  expensive kind of scope drift: the well-intentioned kind.
- **Definition of done** — observable conditions. Someone should be able to check them
  without reading code.

**Also include a sentence beginning:**

```text
After this change, the system should...
```

One sentence, plain language, describing intended behavior. It is the single line quoted
in the PR handoff and checked first in review. If it cannot be written in one sentence,
the design is still doing more than one thing.

Get explicit owner approval on the Build Card before stage E. This is the approval gate
of the whole framework.

Template: `templates/BUILD_CARD.template.md`

---

## E. Build Spec

**Only after the conceptual design is settled** should the detailed implementation
specification be produced.

The Build Spec is written for the implementation agent. It is exhaustive, technical, and
long. **The owner is not expected to review it line by line.**

That makes translation the design agent's responsibility. The design agent is accountable
for the Build Spec being a faithful expansion of the Build Card — nothing added that the
owner did not agree to, nothing dropped that they did.

Three checks before handing the spec over:

1. **Nothing new.** Every behavior in the spec traces to the Build Card, to an owner
   decision, or to an explicitly-marked implementation detail.
2. **Nothing lost.** Every rule, non-goal, and done-condition in the card appears in the
   spec in enforceable form.
3. **Nothing ambiguous where it matters.** Where the card is silent and the answer is
   visible to users, either decide it and mark it as implementation discretion, or take
   it back to the owner. Do not leave it to be discovered mid-implementation.

If writing the spec reveals a real design gap — and it often will — return to stage A, B,
or C. Do not resolve a product question inside a specification.

Structure, contents, and the owner-decision / discretion / escalation split:
`framework/BUILD_SPEC.md`.

---

## Anti-patterns

| Anti-pattern | What it looks like | Why it hurts |
|---|---|---|
| Spec-first | A 2,000-word spec produced from a one-line idea | Encodes the first guess as the design |
| Decision flood | Fifteen "decisions" including error copy and column types | Owner disengages; real decisions get rubber-stamped |
| Model theater | A diagram drawn after the spec, to match it | The model no longer constrains anything |
| Card bloat | A Build Card that takes five minutes and mentions modules | Owner stops reading; the contract goes unread |
| Silent resolution | An ambiguity resolved quietly during spec writing | The owner learns the answer from the shipped product |
| Infinite exploration | Stages A–C looping with no card | Nothing gets built; the owner loses confidence |
