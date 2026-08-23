# Review Protocol

**Build OS v0.3**

Independent review happens after implementation and before the change is accepted. It is
performed by someone — or something — other than the implementation agent: a human
reviewer, or a separate agent session with no memory of writing the code.

The reviewer compares:

```text
Build Card  →  Build Spec  →  PR Handoff  →  Actual Code  →  Tests
```

Where the change belongs to a workstream, the workstream file is read first — it says which
Build Card is current, which decisions the owner settled, and what the effort was and was
not meant to cover.

**Do not simply trust Claude's handoff. Validate the actual implementation.**

The handoff is a claim about the code. It is a useful map — it says where the hard parts
are and what the agent believes it did — but it was written by the party being reviewed.
Read it to know where to look, then look. Every finding must come from code or tests, not
from the handoff's description of them.

An implementation agent's failure mode is not usually dishonesty. It is that it reports
what it meant to do, and the difference between that and what it did is exactly what
review exists to find.

Before reviewing a significant PR, run the framework compatibility check
(`framework/FRAMEWORK_SYNC.md`). A reviewer working from an older protocol than the
implementation — or a newer one — will measure the work against the wrong standard.

---

## Order of reading

1. **Build Card** — first, before anything else. Load the intended behavior into your head
   from the owner's document, not the agent's. Note the `After this change, the system
   should...` sentence.
2. **Build Spec** — the owner decisions (`OD-n`), requirements (`R-n`), acceptance criteria
   (`AC-n`), edge cases, and non-goals. Note what *should* be checkable.
3. **PR Handoff** — what the agent claims. Note its *Spec Deviations*, *Known Risks*, and
   *Recommended Review Focus*. Treat all three as leads to verify, not conclusions.
4. **Actual code** — the diff, and enough surrounding code to know whether the diff is
   correct in context. A diff can be individually correct and collectively wrong.
5. **Tests** — what they actually assert. Run them if you can.

If the change belongs to a workstream (`WS-###`), read that file before step 1. It is the
fastest way to load the effort's context — its goal, its non-goals, the decisions already
settled, and whether this PR is meant to complete the workstream or only part of it. A PR
that lands mid-workstream is not measured against the whole Build Card.

---

## What review must answer

### 1. Did we build the intended owner behavior?

Take the `After this change, the system should...` sentence and the Build Card's definition
of done, and verify each against the code. Not against the handoff — against the code.

The most common real failure is a change that satisfies every listed requirement while
missing the outcome the owner wanted. Requirements are a proxy for intent; check intent.

### 2. Were any owner decisions silently changed?

Walk the `OD-n` list. For each, find where the code implements it and confirm it does what
the decision said.

A silent change is: implemented differently, implemented partially, implemented but
bypassable through another path, or not implemented and not disclosed. Any of these is a
serious finding regardless of whether the alternative is better — the owner chose, and the
choice was overridden without their knowledge.

If an owner decision genuinely could not be implemented and the agent escalated in the PR,
that is the protocol working, not a finding.

### 3. Are important edge cases correct?

Take the spec's edge case list and check each in code. Then go beyond it — the spec's list
is what the design agent thought of.

Look at: empty and single-element cases, the maximum or boundary, already-in-target-state,
concurrent opposite actions, retries and duplicate delivery, partial failure, expired or
deleted entities, timezone and clock boundaries, and whatever is specific to this domain.

For each: does the code have a defined behavior, and is it the right one? Undefined
behavior at an edge is a finding even when nothing crashes.

### 4. Are tests testing behavior rather than merely implementation?

A test that asserts a function was called with certain arguments proves the code is written
the way it is written. A test that asserts pausing a monthly subscription is rejected
proves the product rule holds.

Ask:

- Would these tests fail if the behavior were wrong?
- Would they fail spuriously if the implementation were restructured without behavior change?
- Do they cover the owner decisions, or only the happy path?
- Are edge cases tested, or only mentioned in the spec?
- Are mocks so thorough that the test verifies the mocks?

A useful check: mentally break one owner decision in the code. Does a test catch it? If
not, coverage is decorative there.

### 5. Did implementation introduce architectural debt or unexpected coupling?

- New dependencies between components that should not know about each other
- Business logic leaking into a layer that should not hold it
- Duplicated logic that will drift
- A boundary crossed for convenience
- An abstraction added speculatively for a use case that does not exist
- An invariant from `PROJECT_MODEL.md` now enforced in two places, or none

Debt knowingly taken and recorded is acceptable. Debt taken silently is a finding.

### 6. Does PROJECT_MODEL reflect current reality?

If the change touched architecture, flows, invariants, or responsibilities, the model must
have been updated in this PR. Read the updated sections against the code: an update that
describes the intended design rather than the built one is worse than no update, because
the next agent will trust it.

### 7. Are new consequential decisions captured in DECISIONS?

Did implementation make a choice that constrains future work, resolves a real trade-off, or
would surprise a future reader? If so, is there a `DEC-n` entry? Is its rationale the real
reason, and are its consequences honest?

Also check the inverse: entries recording trivia dilute the file.

### 8. Are Claude's claimed deviations complete?

Compare the *Spec Deviations* section against what the code actually does. Undisclosed
deviations are the highest-severity finding in this protocol — not because the deviation is
necessarily wrong, but because the framework depends on deviations being visible.

A `None` that is not true is worse than a long list.

### 9. Are there regressions or behavioral changes outside the Build Card?

Read the parts of the diff that are not the feature. Refactors, "while I was in there"
changes, altered shared helpers, modified defaults, changed error handling in a path that
was not in scope.

Check the Build Card's non-goals: did any get quietly built? Check the blast radius of
changed shared code — a modified utility function can change behavior in ten call sites
nobody looked at.

### 10. Does the workstream's recorded state match what happened?

Where the change belongs to a workstream, check the file was checkpointed:

- Is the phase right? A merged PR that completes the effort should not leave the workstream
  in `BUILDING`.
- Do `Implementation State` and `Related PRs` name this PR?
- Were decisions made during implementation recorded — in `Decisions Made` if they were the
  owner's, in `DECISIONS.md` if they were consequential?
- If the workstream is marked `COMPLETE`, did steps 2 and 3 of the completion sequence
  actually happen (see `framework/WORKSTREAMS.md`)? A `COMPLETE` workstream whose outcome
  never reached `PROJECT_MODEL.md` is a false record, and the next agent will act on it.
- If a design agent supplied a repository-update block because it could not write to GitHub,
  was it applied?

This is deliberately the last item, and it is cheap to check. It is here because the memory
layer decays silently: nothing breaks today when a workstream is left stale, and everything
is harder in three weeks.

### 11. Was the framework compatibility check done, and is it honest?

For a significant PR, check the handoff's `Framework:` field against reality:

- Does the project's `CLAUDE.md` adopted version match what the field claims?
- If it reports an upgrade, did the migration actually happen in this PR — and did it stop at
  protocol artifacts, rather than rewriting project architecture or decisions?
- If it reports `current`, is that true against canonical `VERSION.md`?
- If a project-specific rule conflicts with a newer Build OS requirement, was the conflict
  surfaced rather than silently resolved?

A field claiming a check that did not happen is the same class of finding as an undisclosed
deviation: it removes the signal the protocol exists to provide.

---

## Severity

| Severity | Meaning | Examples |
|---|---|---|
| **Blocking** | Must be fixed before merge | Owner decision silently changed; undisclosed deviation; data-loss or security defect; acceptance criterion not met; a test that passes while the behavior is wrong |
| **Should fix** | Fix in this PR unless there is a reason not to | Edge case with wrong or undefined behavior; missing test for an owner decision; `PROJECT_MODEL.md` now inaccurate; coupling that will be expensive later |
| **Consider** | Reasonable to defer; record it | Structural improvement; test quality; missing `DECISIONS.md` entry for a borderline choice; naming that will confuse |
| **Note** | No action; worth saying | Something done well; context for the owner; a risk being accepted deliberately |

State severity on every finding. A review that reports nine things at equal weight forces
the reader to re-triage it.

---

## Owner-facing review summary

The reviewer produces a summary for the owner. **It should be understandable without
reading the PR.** No file names, no function names, no diffs.

Structure:

### Verdict
One line. `Approved` · `Approved with follow-ups` · `Changes required` · `Needs owner decision`.

### What actually changed
Plain language, from the perspective of someone using the system. This is the reviewer's
independent account — not a restatement of the agent's Owner Summary. Where they differ,
the difference is the point.

### Match to intended design
Does the built behavior match the Build Card? Where it diverges, what diverges and how
much it matters. If it matches fully, say so plainly.

### Issues found
The findings, most severe first, in owner-comprehensible terms. Describe the consequence,
not the mechanism: "a subscription paused twice in the same second could keep its seats"
rather than "missing idempotency guard in the pause handler."

### Architecture implications
What this change means for the shape of the system going forward. Debt taken, flexibility
gained or lost, anything that will make the next change harder. Omit only if there truly
are none — and say so.

### Decisions requiring owner attention
Questions only the owner can settle: behavior that was ambiguous, a trade-off surfaced by
implementation, something the agent escalated, something the reviewer thinks the owner
would not want as built. Each with options and a recommendation.

### Recommended next action
One clear instruction: merge; merge and file the follow-ups; fix the blocking items and
re-review; answer the decisions above first.

Where the change belongs to a workstream, say what happens to it: does this PR complete it,
or does it return to `BUILDING` with the findings above?

Template: `templates/REVIEW_SUMMARY.template.md`

---

## Reviewer discipline

**Verify, don't re-design.** Review checks whether the built thing matches the intended
thing and is sound. Preferring a different approach is a *Consider* at most, unless the
chosen one is actually wrong.

**Trace, don't skim.** For each `OD-n` and `AC-n`, point at the code that satisfies it. If
you cannot find it, that is the finding.

**Read the tests as a document.** They describe what someone believed the system should do.
Where they are silent, nobody was thinking.

**Be specific and falsifiable.** "This looks risky" is not a finding. "Two concurrent pause
requests both pass the eligibility check before either writes, so both release seats" is.

**Say what is right.** A review that reports only problems gives the owner no way to judge
overall quality, and gives the implementation agent no signal about what to keep doing.
