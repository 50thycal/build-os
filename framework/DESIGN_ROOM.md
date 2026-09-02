# Design Room

**Build OS v0.11**

The Design Room is where an abstract idea becomes something buildable. It is run by the
design agent with the owner. It ends with three artifacts: an **Owner Plan** the owner
approves, a **Build Card** that plan expands into, and a **Build Spec** the implementation
agent executes.

**The room is not the only way in, and from v0.6 it is not assumed to be.** Every piece of
work starts with *Intent Intake*, and only some of it earns the five stages below. That
routing decision is the first section of this document rather than an aside, because the
common failure it prevents is a one-line fix waiting on a design ceremony nobody wanted.

Five stages, in order:

```text
A. Explore  →  B. Model  →  C. Decide  →  D. Build Card  →  E. Build Spec
   ▲                            │
   └────────────────────────────┘
      loop back freely until the design is coherent
```

Stages A–C loop. Stage D happens once the design is coherent. Stage E happens only after
the Build Card is settled.

The room runs across many sessions, not one. Each session belongs to a **workstream** — one
meaningful design/build thread, with a stable ID and durable state in the repository. The
five stages map onto the workstream lifecycle exactly: `EXPLORE` → `MODEL` → `DECIDE` →
`BUILD_CARD` → `READY_TO_BUILD`. See `framework/WORKSTREAMS.md`; how to run the room from a
ChatGPT Project is at the end of this document.

Before beginning or resuming substantial work in this room, run the **framework
compatibility check** — is the project's adopted Build OS version still current? See
`framework/FRAMEWORK_SYNC.md`. Once per session, before the first substantial piece of work;
not before every message.

Two modes cut across the five stages: **Capture Only**, when the owner is feeding the room
raw material and does not want it processed yet, and the **Design Handoff PR**, when an
approved card and issued spec are published to GitHub. Both are described after stage E.

The single rule that governs the whole room: **do not write an implementation
specification before the design is understood.** A specification produced too early
encodes the first plausible interpretation of a vague idea and gives it the authority of
detail.

---

## Intent Intake, and what it routes to

Before any of the five stages, one step happens, and it happens wherever the intent landed —
in this room, in an implementation session, in a GitHub issue, in another agent entirely.
**Intent Intake** is defined once, in `framework/OWNER_INTERFACE.md`; the short version is:
establish the outcome in one sentence the owner would recognize as theirs, capture the
constraints and non-goals they actually stated, classify the work, and route genuine product
choices to the owner rather than settling them quietly.

The classification decides how much of this document runs:

| Classification | What runs |
|---|---|
| **Simple** — unambiguous, no owner trade-off, nothing consequential to architecture, data or security, not part of a significant workstream | Nothing here. Implement, validate, return a result. |
| **Significant** — everything else, including anything claiming to complete a significant workstream | Stages A–E, proportionate to the change |

**Proportionate is doing real work in that sentence.** A significant change is not
automatically a five-session exploration. A well-understood feature with one open question
may spend a single exchange in A–C and go straight to a card; a contested one earns the full
loop. What proportionality never buys is skipping the *approval* — significant work is
approved by the owner before implementation, however fast the design was.

The room's own bias is toward more exploration, and that bias is usually right. It is wrong
in exactly one case, which v0.6 exists to fix: when the owner already knows what they want,
has said so unambiguously, and is waiting on a ceremony to agree with them.

**Promotion is one-way.** Work classified simple that turns out to touch an owner decision,
an invariant, or documented behavior becomes significant from that moment — including
retroactively, for what it now needs before merge. Nothing is ever demoted, and where the
classification is genuinely unclear it is significant.

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

### The Owner Plan — what the owner actually approves

The card is a 30–60 second read at a desk. On a phone, between two other things, it is still
longer than it needs to be for the question being asked, which is *should we build this?*

So stage D produces two things: the **Build Card**, which is the durable behavior contract
review measures against, and the **Owner Plan** derived from it — roughly 100–200 words, goal,
scope, non-goals, risk, decisions needed, recommendation. The owner approves the plan.

```markdown
## Owner Plan

**Goal:** <plain-language intended outcome>
**Scope:** <3–7 concise behavior-level bullets>
**Not changing:** <only material non-goals>
**Risk:** Low | Medium | High — <one sentence>
**Owner decisions needed:** None | <concise choices>
**Recommendation:** Proceed | Revise plan | <specific recommendation>
```

That produces a chain, and the chain is the framework's central mechanic stated once:

```text
Owner Plan  ──faithfully expands to──►  Build Card  ──faithfully expands to──►  Build Spec
     ▲                                                                              │
     └───── a new owner-visible choice at any level returns here ───────────────────┘
```

**Approval attaches at the top and flows down only through faithfulness.** The design agent is
accountable for each expansion adding nothing the owner did not agree to and dropping nothing
they did — the responsibility stage E already carries for the spec, now stated for the card as
well. An owner-visible choice appearing at any level that the plan did not carry is not an
expansion; it goes back to the owner.

Where the change is small enough that the plan and the card would say the same thing, write
the card and derive the plan from it. Never maintain two divergent descriptions of one intent.

Get explicit owner approval before stage E. This is the approval gate of the whole framework.

Full rules and the compression contract: `framework/OWNER_INTERFACE.md`.
Templates: `templates/BUILD_CARD.template.md`, `templates/OWNER_PLAN.template.md`

---

## E. Build Spec

**Only after the conceptual design is settled** should the detailed implementation
specification be produced.

Producing a Build Spec is one of the four moments that warrant a framework compatibility
check (`framework/FRAMEWORK_SYNC.md`). A spec is the most expensive artifact to have written
against an obsolete protocol, because everything downstream inherits its shape.

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

## Capture Only

Some owner input is not a question. A playtest running in another window, a walk-and-talk
list of grievances, a stream of half-formed ideas — the owner is producing raw material and
wants it kept, not processed. An agent that answers each item as it arrives destroys the
run: the owner stops reporting in order to argue, and the observations that were coming next
never arrive.

**Capture Only** is a named session mode for exactly that. It is a mode of the conversation,
not a lifecycle phase. The workstream's phase and status do not change while it is active.

### Entering

The owner enters Capture Only by saying so, or by making the intent clear:

> "Just capture this for now."
> "Don't act on this yet."
> "Keep track of these."
> "Playtest notes, I'll be dumping a while."
> "Let me get through this list first."

Enter on the first such signal. Acknowledge once, in one line, and start capturing. Do not
ask the owner to confirm, and do not ask again on the next message — a second confirmation
request is itself an interruption of the thing they asked you not to interrupt.

If the intent is genuinely unreadable, ask once, briefly, and default to capturing while you
wait.

### While active

Record each observation as the owner states it. Then stop.

Prohibited while Capture Only is active:

| Prohibited | Why |
|---|---|
| Analysis, diagnosis, root-causing | It redirects the owner's attention to your theory instead of their next observation |
| Recommendations or proposed fixes | The observation set is incomplete; a fix proposed at item 3 anchors items 4–20 |
| Decisions, or treating an offhand remark as one | The owner is describing, not deciding |
| Creating or updating repository artifacts | Nothing here has been consolidated yet; durable memory is for conclusions |
| Triggering implementation, specs, or Build Cards | There is no approved card behind this |
| Asking clarifying questions that are not blocking | Each question costs the owner the item they were about to report |

Permitted: a short acknowledgement, a numbered log of what you have captured so far, and a
direct answer to a question the owner clearly asks you (see overrides).

Acknowledgement is lightweight. `Noted (7).` is a good acknowledgement. A paragraph
restating what the owner just said is not.

**Observations accumulate across messages.** The capture set is everything since the mode
began, not the current message. If the owner corrects an earlier observation, the latest
statement wins and the correction is preserved explicitly — keep both, marked, rather than
overwriting the first.

**Nothing is stored verbatim beyond what the owner wrote.** Capture Only never records a
transcript, an audio capture, or a video of a playtest. It holds the owner's observations,
in the owner's words, for the length of the session.

### Overrides

A direct owner instruction always wins. If the owner asks a question inside Capture Only —
"wait, does the scoring rule already handle that?" — answer it, then return to capturing.
Answering one question does not end the mode. Only the owner ends it.

### Ending

Capture Only ends when the owner ends it. Silence never ends it, and neither does the end of
a message. If a session ends while capture is still active, durable state is unchanged and
the observations were never consolidated: say so plainly rather than writing a partial
consolidation nobody approved.

Ending requires a **consolidation pass**, and the consolidation separates four things that
are routinely and expensively confused:

```markdown
## Capture consolidation — <workstream or topic>, <date>

### Observations
What the owner reported. Their words, deduplicated, not interpreted.

1. Round 4 stalled for about ten minutes with nobody able to move.
2. Two players said the trade prompt was confusing.

### Interpretations
What I think is happening. Mine, not theirs, and labelled as such.

- (1) looks like a deadlock when every player is holding for the same resource.

### Proposed rules
Candidate changes. None of these is decided.

- P1. Force a discard at the end of any round where no trade completed.

### Approved decisions
Only what the owner explicitly approved during this session. Usually empty.

- None.

### Still open
Questions the capture raised and did not answer.

- Does the deadlock also occur at three players?
```

Rules for the consolidation:

- **Only approved decisions travel.** A `Decisions made` line in a Build Card, or an owner
  decision in a Build Spec, may come only from the fourth section. An interpretation or a
  proposed rule that reaches a Build Card without owner approval is the failure this mode
  exists to prevent.
- **Observations stay separate from fixes.** A consolidation that merges them cannot be
  audited later, when the fix turns out to be wrong and the observation is still true.
- **Empty sections stay.** "Approved decisions: none" is information. A missing section
  reads as an oversight.
- **The consolidation is what gets persisted**, if anything does — into the workstream's
  design notes or open decisions, per the checkpoint policy. Never the raw exchange.

After consolidating, the room resumes at whichever stage the material serves: usually
`EXPLORE` for a fresh problem or `DECIDE` for a set of proposed rules awaiting an owner call.

---

## The Design Handoff PR

Historically the design agent finished by producing a **repository update block** — precise
file contents for the owner to commit. That path remains fully supported and is the
authoritative fallback.

When the design agent *does* have GitHub write access, there is a better ending: open the
implementation PR itself, as a draft.

**A Design Handoff PR is created only after the Build Card is approved and the Build Spec is
issued.** Not before. A draft PR opened during stage B is a design in progress wearing the
costume of an implementation.

What it is:

- **Draft**, always, at creation.
- Named as the future implementation PR — the title describes the change to be built, not
  the design activity.
- Allowed to contain nothing but the workstream checkpoint and the spec at first. An empty
  diff of production code is expected.
- **The single PR for this implementation.** The implementation agent continues this branch
  and this PR. It does not open its own.

Opening it does not move the workstream to `BUILDING`. A spec issued and a draft PR parked
awaiting an implementation agent is still `READY_TO_BUILD`, with Implementation State
`spec issued; draft handoff open`. `BUILDING` begins when implementation begins.

Do not open a second PR for the same implementation. The exceptions are narrow: the first PR
was merged or closed, or an escalation genuinely requires a separate change. Both are worth
stating in the handoff.

Without write access, say so and produce the repository update block. **Never describe a
Design Handoff PR that does not exist.**

---

## Running the Design Room from a ChatGPT Project

The Design Room is usually a ChatGPT Project. The recommended operating model:

**One ChatGPT Project per software/project repository.**

Multiple separate chats exist inside that Project. Each chat may start a new workstream,
resume an existing one, review an implementation, or investigate an adjacent question. None
of them is the record.

The ChatGPT Project should carry explicit project instructions identifying the canonical
GitHub repository:

```text
Canonical repository: 50thycal/example-project
```

Template: `templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md`.

### Durable state is in the repository, not the chat

**Do not assume conversational memory alone is authoritative.** Before resuming substantial
existing work, the design agent should use the repository's workstream state,
`PROJECT_MODEL.md`, and the relevant `DECISIONS.md` entries as the durable checkpoint, when
accessible.

Conversational memory may enrich that state. It should not contradict durable project
records without surfacing the conflict — say plainly that the file says one thing and you
remember another, and let the owner settle which is current. Silently trusting either one is
how a design drifts from the system it is supposed to be changing.

### Session start

The owner should not need to manually summarize previous conversations. Avoid ceremonial
status reporting when it is unnecessary.

**For a clearly new idea:** check whether it belongs to an existing workstream — new ideas
are often the unresolved part of something already open. Otherwise establish a new
workstream and begin at `IDEA`/`EXPLORE`, in stage A.

**For a continuation:** identify the workstream, inspect its current phase and its open
decisions, orient the owner in a sentence or two, and continue from the unresolved point.

```text
WS-004 is currently in DECIDE. We've settled X and Y; the remaining question is Z.
```

Then continue directly into the work. Orientation confirms you are both in the same place;
it is not a status report and it is not evidence that you read the file.

### Framework compatibility

At session start, alongside orienting on the workstream, confirm the project's adopted Build
OS version against canonical. If the project is behind, say so before the design work rather
than after it:

```text
Project is on Build OS v0.1; canonical is v0.3. v0.2 added persistent workstreams — I'll set
that up before we continue on WS-004.
```

The full protocol, including what to do about the delta, is in `framework/FRAMEWORK_SYNC.md`.
Do not announce a version check that returned "unchanged" — silence is the correct report.

### Checkpointing

Design conversations produce conclusions faster than they produce artifacts. Persist
workstream state at meaningful checkpoints — a new workstream, a materially clearer mental
model, an owner decision, a ready Build Card, a spec issued — not after every exchange. The
full list, and what to do when the design agent cannot write to GitHub, is in
`framework/WORKSTREAMS.md`.

One rule from that document is worth repeating here, because the Design Room is where it is
most easily broken: **never claim that state has been written to GitHub when it has not.**

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
| Chat as memory | Resuming from what the agent remembers rather than the workstream file | The design drifts from the system it is changing |
| Ceremonial orientation | Re-summarizing goal, model, and settled decisions every session | The owner stops reading the orientation that matters |
| Phantom persistence | "I've updated the workstream" without write access | Destroys the guarantee the memory layer exists to provide |
| Framework drift | Designing under a pinned version months behind canonical | The session runs a process that no longer exists |
| Helpful interruption | Diagnosing observation 3 while the owner is still on their list | The owner stops reporting; the remaining observations are lost |
| Consolidation creep | A proposed rule appearing in `Decisions made` because it sounded agreed | The owner is bound by a decision they never made |
| Costume PR | A draft PR opened mid-design so work "looks started" | The implementation PR's history begins before the design existed |
| Ceremony tax | A one-line fix routed through five stages because that is what the room does | The owner routes around Build OS for anything small, and the protocol stops covering real work |
| Plan-card drift | An Owner Plan maintained separately from the card it summarizes | Two descriptions of one intent, and the owner approved whichever was shorter |
