# Owner Interface

**Build OS v0.6**

Build OS has always had two audiences and one reading path. The Build Card, the Build Spec,
the PR handoff, the review summary and the workstream are all written for someone — and by
the time an owner has found which of them answers *what do I do now?*, they have read four
documents written for somebody else.

This document defines the **owner layer**: the small set of surfaces an owner is expected to
read, and the rules that keep them short without letting them become untrue.

```text
INTENT → [ PLAN / APPROVE, when needed ] → BUILD + VERIFY → SHIP | DECISION | BLOCKED
```

Everything else in Build OS is the **engineering layer**, and none of it goes away.

---

## The two layers

| Owner layer | Engineering layer |
|---|---|
| Intent | workstream, Build Card, Build Spec |
| Owner Plan, when approval is needed | implementation handoff, code, tests, CI |
| Owner Result — `SHIP`, `DECISION`, `BLOCKED` | review findings, verdict, reviewed head |
| | merge finalization, project memory, decisions |

**The owner layer is a projection of the engineering layer, not a second source of truth.**
Every claim an Owner Result makes is a claim some durable artifact already supports. Nothing
is decided in the owner layer that is not recorded underneath it, and where the two disagree
the durable artifact wins and the disagreement is reported — the same rule that governs every
other pair of records in Build OS.

That is the whole of the compression contract, and it is worth stating as a prohibition too:
**a short summary may omit detail. It may not omit material truth.** Brevity is a constraint
on the writing, never a licence about the content. A deviation, a red check, a stale approval,
or an unresolved blocking finding is material by definition, and no word count excuses
dropping one.

---

## Intent Intake

Build OS does not care which chat window an idea arrives in. A design agent running a
five-stage Design Room, an implementation agent handed a one-line fix, a reviewer noticing
something adjacent, an owner opening a GitHub issue — all of them are performing the same
first step.

**Intent Intake** is that step, and any capable agent can satisfy it:

1. **Establish the desired outcome** — what the owner wants to be true afterwards, in one
   sentence they would recognize as theirs.
2. **Capture material constraints and non-goals** the owner has already stated. Not invented
   ones.
3. **Classify the work** — simple or significant, per *Proportionality* below.
4. **Create or resume the durable workstream**, when the work is significant.
5. **Route genuine product choices to an Owner Plan** rather than deciding them quietly.

Step 5 is the one that matters. Intake is allowed to be fast; it is not allowed to be a place
where owner decisions get made by an agent in a hurry.

### Entry-point neutrality

Intent may originate in ChatGPT, in Claude, in another capable agent, or directly in GitHub.
None of those is privileged, and the lifecycle semantics do not change based on which one it
was.

What does change is how much of the Design Room runs. A vague, contested, or far-reaching
idea earns the full five stages in `framework/DESIGN_ROOM.md`. An unambiguous small change
does not, and never did — v0.5 already said a typo does not need a Build Card. What v0.6 adds
is that the *front door* is the same either way, so an owner does not have to know which tool
implies which ceremony.

**A project needs no particular product to run Build OS.** ChatGPT is the common Design Room
and Claude the common implementation agent because that is what most projects have, not
because the protocol requires either. Nothing here depends on a mobile app, a bot, a hosted
service, or a CI integration.

---

## Proportionality

Three classes. The first two are how work starts; the third is where work goes when it hits
something only the owner can settle.

### Simple

An obvious bug fix, a copy change, an isolated visual tweak, a narrowly scoped parameter
adjustment with a small blast radius.

May proceed from direct intent, with no Design Room and no Owner Plan, when **all** hold:

- the intended behavior is unambiguous;
- **no owner trade-off is being chosen on the owner's behalf**;
- no consequential architecture, data, or security change is involved;
- it is not part of a significant workstream and does not claim to complete one.

The second condition is the one carrying the weight, and it is a deliberate loosening of v0.5,
which excluded *any* owner-visible behavior change from the simple class. That was stricter
than it needed to be: an owner who dictates a subject line word for word has already made the
product decision, and routing their own sentence through a Build Card to have it read back to
them is ceremony with nothing on the other end.

What the condition still catches is the case that actually matters — an agent selecting
behavior the owner did not specify. "Make the error message clearer" is not a copy change; it
is a copy change plus a decision about what the message should say, and the second half is the
owner's. Ask, or write a plan.

Simple work still runs the project's normal validation, and it still ends in an Owner Result.
What it skips is the plan approval and the independent-review ceremony — not the truth-telling.

### Significant

Anything with a Build Card; anything spanning components; anything with architecture, data,
or security implications; anything trading off product behavior; and **any change claiming to
complete a significant workstream, however small its diff.**

Requires an approved Owner Plan (or equivalent explicit owner approval already given in the
owner's own words), a durable Build Spec, independent review under the full v0.5 merge gate,
and a terminal Owner Result.

### Escalated

A significant change that has met an unresolved owner choice or a genuine external blocker.
Its terminal state is `DECISION` or `BLOCKED` until that resolves, at which point it returns
to the build-and-verify loop.

### Classification moves one way

**Work may be promoted from simple to significant at any moment, by anyone, and is never
demoted.** The moment a "simple" change turns out to touch an owner decision, an invariant,
or a documented behavior, it is significant from that point on — including retroactively for
the purpose of what it now needs before merge.

The agent doing the work is the one classifying it, which is a real weakness and the reason
the rule is asymmetric. An agent that under-classifies buys itself less work; an agent that
over-classifies costs an hour. **When it is genuinely unclear which side a change falls on,
it is significant.**

An Owner Result for simple work **names the classification**, because that classification is
itself a claim the owner is entitled to check.

---

## The Owner Plan

For significant or ambiguous work, the owner approves a **short, behavior-level plan** — not
the Build Spec, and not the Build Card's full text.

Target roughly 100–200 words. Longer only when the change genuinely cannot be summarized
safely, which is rarer than it feels.

```markdown
## Owner Plan

**Goal:** <plain-language intended outcome>
**Scope:** <3–7 concise behavior-level bullets>
**Not changing:** <only material non-goals>
**Risk:** Low | Medium | High — <one sentence>
**Owner decisions needed:** None | <concise choices>
**Recommendation:** Proceed | Revise plan | <specific recommendation>
```

Rules:

- **No implementation surface.** No file lists, no architecture, no test commands, no function
  or table names, no internal identifiers — unless the owner's judgment genuinely depends on
  one, which occasionally it does.
- **Material uncertainty cannot be compressed away.** If the risk is real, `Risk:` says so and
  says why in a sentence. A plan that reads Low because Low is shorter is a false plan.
- **Approving the plan authorizes the spec that faithfully expands it** — and only that. A
  Build Spec that introduces an owner-visible choice the plan did not carry is not an
  expansion, and the choice goes back to the owner. See `framework/BUILD_SPEC.md`.
- **Simple work may skip it**, per proportionality, when intent is already unambiguous.

The Owner Plan does not replace the Build Card. The card remains the durable behavior
contract that review measures against; the plan is the approval surface the owner reads on a
phone. Where the work is small enough that the card and the plan would say the same thing,
write the card and derive the plan from it — never maintain two divergent descriptions of the
same intent.

Template: `templates/OWNER_PLAN.template.md`

---

## The Owner Result

Every piece of work ends in exactly one of three states. This is the owner's default reading
path, and for most changes it is the only part of Build OS they read.

| State | Means | Owner does |
|---|---|---|
| `SHIP` | The work is done and the gate is satisfied to the limit of what agents may do | Merges, or authorizes a merge |
| `DECISION` | A choice genuinely requires owner judgment | Chooses |
| `BLOCKED` | Work cannot responsibly continue | Unblocks, or accepts that it stops |

**Exactly one is primary.** A result that is really two states is a `DECISION` or a `BLOCKED`
with some finished work described inside it — never a `SHIP` with a question attached.

The result is **generated from current durable state** at the moment it is written. It is not
a running commentary and it is not written in advance.

### `SHIP`

```markdown
Build OS owner result: SHIP

**What changed:** <1–3 plain-language sentences>
**Intent:** <requirements satisfied, or an equivalent concise statement>
**Verification:** <validation + independent review status, in plain language>
**Deviations:** None | <material deviations only>
**Residual risk:** None | <material remaining risk only>
**Next action:** Merge PR #<n> | <the exact next action>
```

Target 150 words or fewer.

**`SHIP` is a report of the merge gate. It is never a substitute for it, and writing one is
not approving or merging anything.** The rules in `framework/REVIEW_PROTOCOL.md` are unchanged
by this document: the agent that wrote the code neither approves nor merges it, and the owner
or an authorized merger merges.

For **significant** work, `SHIP` may not be written while any of these is true:

- required validation is red, or was not run;
- a `Blocking` or `Should fix` finding is unresolved;
- there is no independent verdict of `Approved` or `Approved with follow-ups`;
- that verdict is **stale** — the PR has moved since the reviewed head, other than by the
  merge-finalization commit;
- a material deviation from approved behavior is undisclosed.

That list is the load-bearing sentence of the whole owner layer, which is why it is a
prohibition rather than an aspiration. A `SHIP` that can be written over red validation is
worth nothing, and everyone learns that within a week.

**Two moments are legitimately `SHIP`, and they have different next actions.** The distinction
exists because of how the v0.5 gate actually terminates:

| Situation | `Next action` says |
|---|---|
| Approved at the current head, finalization not yet pushed | `Finalize and merge PR #<n>` — the documentation-only commit comes first |
| Finalization pushed; the reviewer has not yet verified the head it produced | `Reviewer verifies the final head on PR #<n>, then merge that SHA` |
| Final head verified on the PR | `Merge PR #<n> at <SHA>` |

A finalization commit cannot name its own SHA, so between pushing it and the reviewer's
verification there is a real, expected gap where the PR head is ahead of the reviewed head.
`SHIP` is truthful across that gap **only because `Next action` names what is still
outstanding.** A `SHIP` reading "Merge PR #13" when the final head is unverified is a false
report of the gate, not a rounding error.

For **simple** work, `Verification` states the classification and the validation that ran:

```markdown
**Verification:** Simple change — full test suite green. No independent review required
under proportionality.
```

That sentence is doing real work. It tells the owner which gate this passed through, so a
misclassification is visible to them rather than invisible.

### Before there is a result

**Most of the time there is no owner result, and that is correct.** The three states are
terminal: they are what the work reaches, not a running status. A PR pushed and awaiting
review has not reached one — the implementation is done, but nothing about it has been
verified, and the owner has nothing to do.

So the handoff's Owner Result section says so, and carries **no marker**:

```markdown
## Owner Result

Awaiting independent review. Nothing needed from you yet.
```

This is not a fourth state and it is not a placeholder for a missing one. It is the honest
report of a PR mid-flight, and it is what keeps the owner out of the loop while the loop is
working. A consumer reads no result here, which is exactly right: absence is absence, and
`SHIP` is never what silence means.

The temptation is to write `SHIP` at first push because the *work* feels finished. It is the
same temptation as marking a workstream `COMPLETE` at merge, and it is wrong for the same
reason: the claim outruns the evidence. `SHIP` is written when review clears, not when coding
stops.

### `DECISION`

```markdown
Build OS owner result: DECISION

**Decision:** <one sentence>
**Why now:** <why implementation or review cannot settle this>
**Options:** <2–4 concise choices>
**Recommendation:** <preferred option and why, where appropriate>
**Impact:** <what changes once chosen>
```

`DECISION` is scarce. It is for a choice that changes what someone using the system
experiences, what the business commits to, what data is kept or lost, or what becomes hard to
reverse — the same threshold the Design Room's *Decide* stage has always used.

Not a `DECISION`: a failing test, a merge conflict, a reviewer finding the implementation
agent can fix, a naming choice, a schema shape, a library, an ordinary trade-off a competent
engineer would just make. Those stay inside the agent loop, and `framework/BUILD_SPEC.md`
already says so.

Do not bundle unrelated choices into one `DECISION` unless they are genuinely coupled. Two
questions the owner could answer independently are two results, or one result and a deferral.

### `BLOCKED`

```markdown
Build OS owner result: BLOCKED

**Blocker:** <one sentence>
**Why agents cannot resolve it:** <plain language>
**Smallest action needed:** <specific owner or external action>
**Work preserved:** <what remains safely completed>
```

`BLOCKED` is scarcer than `DECISION`. It means work cannot responsibly continue: a missing
credential or authority, an unavailable external dependency, an action outside the agents'
permission, or a conflict that cannot honestly be reduced to a choice the owner could just
make.

Routine coding problems are not `BLOCKED`. Neither is a failing test, a merge conflict, a
reviewer finding, or an implementation decision within discretion. An agent reaching for
`BLOCKED` because the work got hard has mislabelled its own difficulty as the owner's problem.

**`Work preserved` is not optional.** A blocker with no account of what survived it invites
the owner to assume the worst, and the next session to redo work that was already finished.

Template: `templates/OWNER_RESULT.template.md`

---

## Where the Owner Result lives

On a PR, the Owner Result **is** the handoff's owner-facing section — one surface, not two.
`framework/CLAUDE_HANDOFF.md` carries the full technical handoff for reviewers and future
agents, and ends with the Owner Result for the owner. Nothing in the handoff is duplicated
into it, and nothing in it contradicts the handoff above it.

Where a change has no PR — a `DECISION` reached during design, a `BLOCKED` before any code —
the Owner Result is given in the session, and whatever durable state exists (the workstream's
`Next Step`, usually) carries the same fact.

### The marker

On any durable surface — a PR body, a PR comment — the block opens with one line naming the
state:

```markdown
Build OS owner result: SHIP
```

One line, one state, beginning the line. It is the same shape as the review verdict form and it
is read the same way: only where it is stated, never where it is quoted, fenced, or commented
out, so that describing a result never issues one. Two markers in one body is a writing error,
not a state to be guessed at.

**A `SHIP` marker is a report, not an approval.** It clears nothing. A consumer that finds one
against a PR whose review record is non-approving or stale reports the contradiction and leaves
the gate shut — it never upgrades the record to match the claim. The parsing rules, the
integrity warnings, and the precedence order are in `framework/BUILD_OS_PARSE_CONTRACT.md`.

In a chat response the marker is unnecessary — nothing durable is being written, and the state
is the first word anyway.

### The final chat response

**One or two lines, plus the pointer.** The Owner Result is the report; the chat is not a
second copy of it.

```text
SHIP — PR #341. Reminder suppression works as approved, tests green, review approved the
current head. Full result in the PR.
```

This is the rule the owner interface most depends on and the one most easily broken, because
restating the work in chat always feels helpful. It is not: it teaches everyone that chat is
where the real information lives, and it creates a second version that starts diverging
immediately.

---

## The closed verification loop

For significant work, findings return to the implementation agent — not to the owner.

```text
Implementation agent
  ↓
Validation / CI
  ↓
Independent reviewer
  ├─ Approved ──────────────────► finalization ──► SHIP
  ├─ Fixable findings ──────────► implementation agent ──► validation ──► reviewer
  ├─ Owner choice required ─────► DECISION
  └─ Cannot proceed safely ─────► BLOCKED
```

The owner is not the message bus. A reviewer who publishes `Changes required` with three
findings has addressed the implementation agent, and the correction round happens on the same
PR without the owner relaying anything.

The full rules — what the reviewer publishes, where, when escalation to `DECISION` or
`BLOCKED` is legitimate, and the unchanged v0.5 merge gate — are in
`framework/REVIEW_PROTOCOL.md` → *The correction loop*.

**Automation is optional.** Build OS specifies the contract and the state transitions. A
project may realize the loop with GitHub reviews, with agents, with CI, or by two people
talking; none of that is required, and no product is.

---

## Artifact responsibility

Each surface has one audience. This table is what keeps the same fact from being written four
times in four voices.

| Artifact | Primary audience | Purpose |
|---|---|---|
| Intent | owner + intake agent | the desired outcome |
| Owner Plan | owner | the approval surface |
| Build Card | agents + reviewer | the behavior contract |
| Build Spec | implementation agent + reviewer | exhaustive implementation requirements |
| PR Handoff | reviewer + future agents | a truthful map of what was built |
| Review Summary | implementation agent + merge gate | findings, verdict, evidence |
| Owner Result | owner | the next action |

Where two surfaces would say the same thing, the narrower one links to the wider one. The
Owner Result never restates the handoff, and the handoff never restates the spec.

---

## Anti-patterns

| Anti-pattern | What it looks like | Why it hurts |
|---|---|---|
| Compressed lie | A 90-word `SHIP` that omits a known deviation | Brevity was a constraint on writing, not a licence about content; the owner approved something that did not happen |
| Premature `SHIP` | `SHIP` written while CI is red or review is stale | The state stops meaning anything, and the gate it reports becomes decorative |
| Ceremonial `DECISION` | Asking the owner which library to use | The scarce channel fills with noise and the real decisions stop being read |
| Difficulty as `BLOCKED` | `BLOCKED` because the tests are hard to fix | Hands the owner a problem they cannot act on and the agent could have solved |
| Self-demotion | A change reclassified from significant to simple once review looks expensive | The gate becomes opt-out, chosen by the party it constrains |
| Two owner surfaces | An Owner Summary and an Owner Result on the same PR | They drift within a week and nobody knows which is current |
| Chat as the result | The full result restated in the chat response | Recreates the transcript-as-memory failure the framework exists to prevent |
| Plan-spec drift | A Build Spec introducing an owner-visible choice the approved plan never carried | The owner's approval silently covers something they never saw |
