# Review Protocol

**Build OS v0.5**

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

## The merge gate

A **significant** PR does not merge until all four of these hold:

1. An **independent reviewer** has recorded `Approved` or `Approved with follow-ups`.
2. The verdict names a **reviewed head**, and that head is the PR's **current head**.
3. No **Blocking** or **Should fix** finding is unresolved.
4. The project's own required validation is green — whatever the project names: tests, CI,
   type checks, a build.

"Significant" is the same threshold used everywhere else in Build OS: work that runs through
a Build Card. A typo fix, a broken link, a one-line bug fix outside a significant workstream
does not need a ceremonial review artifact — see *Proportionality* below. But **any PR that
claims to complete a significant workstream is significant**, however small its diff.

This gate is a protocol rule, not a piece of automation. Build OS requires no branch
protection, no GitHub App, and no CI job to enforce it. A project may add those; a project
that has not is still bound by the gate.

### Who may do what

| Role | May |
|---|---|
| Implementation agent | Prepare the PR, respond to findings, push corrections, write the finalization commit, request review |
| Independent reviewer | Record `Approved`, `Approved with follow-ups`, or `Changes required` against a named head |
| Owner, or a merger they authorize | Merge |

**An implementation agent may not approve or merge its own significant PR.** Not "should
not" — may not. The one exception is explicit owner direction to merge, *and* an independent
approved verdict already exists for the current head. Owner direction replaces the merger,
never the reviewer.

"Independent" means no memory of writing the code: a human, or a separate agent session that
did not implement it. An agent reviewing its own work in the same session is reading its own
intent back to itself.

### Recording the verdict

Every review summary and every workstream `Review State` records two fields:

```markdown
**Verdict:** Approved
**Reviewed head:** 0123456789abcdef0123456789abcdef01234567
```

| Verdict | Means |
|---|---|
| `Not started` | No review yet |
| `In review` | A reviewer has the PR; no verdict yet |
| `Changes required` | At least one unresolved Blocking or Should fix finding |
| `Approved` | Clears the gate |
| `Approved with follow-ups` | Clears the gate; named non-blocking work is filed to happen later |

`Reviewed head` is the **full 40-character commit SHA** the verdict was reached against, or
`—` when there is none. An abbreviation is not accepted: a seven-character prefix cannot
prove which commit was reviewed, and proof is the entire purpose of the field.

**A verdict belongs to one PR.** A workstream spanning several records one verdict per PR, as a
table:

```markdown
## Review State

| PR | Verdict | Reviewed head | Finalization |
|---|---|---|---|
| #84 | Approved | 0123456789abcdef0123456789abcdef01234567 | pushed |
| #91 | In review | — | — |
```

A record says nothing about any PR but its own. Approving #91 does not un-approve #84, and a PR
with no row is a PR this workstream makes no claim about.

**But silence is not a way out of the gate.** A workstream running v0.5 that has reached an
approved Build Card owes a record for every PR it links. Missing one is reported, not excused: an
open PR raises a missing-record warning, a merged one raises `MERGED_WITHOUT_APPROVAL`. Deleting a
row is not how a significant PR leaves the gate.

Which brings the opposite risk, and it is the one that bites during a migration: **adopting v0.5
must not reach back and condemn the work that came before it.** A project that upgrades has not
claimed its finished v0.4 workstreams were reviewed under v0.5, and the migration rules promise
completed history is neither rewritten nor retroactively invalidated.

So the two are held apart by *where the version came from*:

| Source | What it covers |
|---|---|
| The workstream's own `Build OS:` header | That workstream, in both directions — `v0.5` gates it even once complete, `v0.4` exempts it even under a v0.5 project |
| The project's adopted version, inherited | Current work only: not a `COMPLETE` or `ABANDONED` workstream, not one last updated before the project's adoption date, and not a PR opened before that date that has already settled |

The adoption date is the one `FRAMEWORK_SYNC.md` already asks every project to keep —
`Last compatibility check: v0.5 on 2026-08-24`. A project that records no date gets the
conservative reading: work already merged is left alone, because a false accusation about landed
work is worse than a missed reminder.

None of this turns on whether the review fields are present. Their absence is what is being
reported; it can never be what excuses the report.

**An approval with no reviewed head does not clear the gate.** Treat it as `In review`. This
is not pedantry — an approval that names no commit is a statement about a conversation, not
about code.

Where a reviewer's finding is genuinely the owner's to settle, the verdict is
`Changes required` and the summary's *Decisions requiring owner attention* section carries
the question. The gate stays closed while an owner decision is outstanding; there is no
separate verdict for it, because from the code's point of view the outcome is the same.

### Staleness

A verdict belongs to a commit, not to a PR. When the head moves, the approval does not move
with it.

Any of these after `Reviewed head` invalidates the approval:

- executable code
- tests
- dependencies or lockfiles
- migrations
- configuration
- documentation that describes behavior

Which is nearly everything. **Tests count**: they are the evidence the review rested on, and
a change to them changes what was proved.

What remains is the narrow set of **finalization surfaces** (below). A change limited to
those may be verified against the final head rather than re-reviewed in full — the reviewer
reads the diff since the approved head, confirms it touches nothing else, and records the
final head. That is a real verification with a real reader; it is not a formality, and it is
not something the implementation agent performs on its own PR.

A stale approval is not a lie, and finding one is not an accusation. It is the ordinary
consequence of a PR that kept moving, and the remedy is a re-review of the current head.

---

## Merge finalization

At the moment a PR merges, the workstream file on `main` should already describe what is
true *after* the merge — not the state the PR was in while it was open. Otherwise `main`
carries a workstream that says `REVIEW`, `Implementation State: PR open`, forever, or until
somebody opens a second PR to clean up after the first.

Build OS closes that with a **merge-finalization commit**: the last commit on the same PR,
after approval and before merge, containing documentation only.

It sets, to what becomes true when the PR lands:

- the workstream's **Phase** and **Status**
- **Implementation State** (`merged in #<n>`, or what actually comes next)
- **Review State** — verdict and the final head
- **Related PRs**
- **Next Step**
- the row in `ACTIVE.md`

If the PR completes the workstream, it also does what completion requires — updates
`PROJECT_MODEL.md` and `DECISIONS.md` and removes the active row — per the completion
sequence in `framework/WORKSTREAMS.md`.

### The permitted surfaces

The finalization commit may touch **only**:

- the workstream file
- `ACTIVE.md`
- `PROJECT_MODEL.md` and `DECISIONS.md`, where completion requires it
- the PR's own description and handoff block

Nothing else. Any executable, test, dependency, configuration, or behavior-documentation
change in that commit **reopens full review** — the lightweight final-head verification is
available only because the surfaces are known to be inert.

### Where the final head is recorded

A finalization commit **cannot contain its own SHA**. Writing the SHA into the commit changes
the commit, and the SHA is stale before it is pushed. Any protocol that asks for one is asking
for a number that cannot exist.

So the two heads are recorded in two different places, by two different parties:

| | What it names | Who writes it | When |
|---|---|---|---|
| `Reviewed head` in the workstream file | The last head reviewed **in full** | The implementation agent, at finalization | Before the finalization commit — the head it names already exists |
| The **final head** | The head produced by the finalization commit | The **reviewer**, on the PR | After that commit exists |

The workstream file therefore keeps naming the last fully-reviewed commit, and adds
`Finalization: pushed` to say the PR head is legitimately ahead of it. That is a true statement
about a commit that exists, written by someone who can know it.

The final head is verified by the reviewer **on the pull request**: they read the diff since the
approved head, confirm it touches only the permitted surfaces, and submit their approval on the
PR. GitHub stamps that review with the commit id it was submitted against — a record created
after the commit exists, by someone other than the commit's author. That is the authority. A
project without GitHub reviews uses any equivalent record made after the fact: a PR comment
naming the final SHA, a signed tag, a reviewer's note in the merge. The comment form has a
required shape, below, because a tool has to be able to tell a verdict from a sentence about one.

#### The comment verdict form

GitHub will not let an account submit `APPROVE` or `REQUEST_CHANGES` on a pull request it
authored. A repository worked by one account — one owner, one agent, one identity — therefore
**cannot produce an approving review at all**, and a merge gate that reads only reviews is not
strict there, it is inoperable. Build OS's own v0.5 release merged twice under exactly that
condition, each merge correctly reported as `MERGED_WITHOUT_APPROVAL` by a gate that had no way
to be satisfied.

A verdict may therefore be given as a PR comment, in this form and no other:

```markdown
Build OS review verdict: Approved
Reviewed head: 42ea13c260a8e8952f8dc044e4ac20a6dcfc60e5
Review actor: chatgpt-independent-session
Implementation actor reviewed: claude-implementation-session
```

- All four lines are required. A verdict naming no head is not a verdict — the head is the
  whole point, and it must be a **full 40-character SHA** for the same reason the workstream
  field refuses an abbreviation: a prefix cannot prove which commit was reviewed.
- The verdict word is one of the five in this document. Emphasis (`**Reviewed head:**`) is fine.
- It is read only where it is **stated**, never where it is discussed. Text that is quoted
  (`>`), fenced, or inside an HTML comment carries no verdict — otherwise replying to an
  approval, or quoting the review table to argue with it, would issue one.
- It is a position of the same standing as a review. This is not the `Commented` review state,
  which is a review deliberately withholding a verdict.

#### `Review actor` — who spoke, as distinct from what carried it

This is the field the form turns on, and the reason is the same one that makes the form
necessary: **in a single-account repository the GitHub login is transport, not identity.** The
owner, the implementation agent and an independent reviewer all post as the same account. A
record keyed on that login cannot answer who issued a verdict, and — worse — treats them as one
reviewer, so the last to speak silently replaces the others. An implementation agent's own
position could supersede an independent reviewer's for no reason but sharing a pipe.

So the actor is named in the artifact, and it is the actor, not the login, that identifies a
position:

- A stable identifier for the actor — `chatgpt-independent-session`, `claude-implementation-session`,
  a person's own GitHub identity. The vocabulary is the project's; stability across comments is
  what matters, since that is what lets one actor's later verdict replace their earlier one.
- **Two actors relayed through one account are two reviewers.** Each holds their own current
  position, and one actor's approval never cancels another's outstanding `Changes required`.
- A GitHub review needs no such field: GitHub authenticated it, so there the login *is* the actor.

The implementing side names itself too. A PR handoff carries **`Implementation actor:`** in its
`Review Gate` section, which is what makes self-review recognisable rather than merely
discouraged.

But the verdict carries that name as well, in **`Implementation actor reviewed:`** — *who the
reviewer understood they were reviewing*, recorded at the moment of the verdict. That is not
duplication, and the reason is the next section.

#### Evidence must not be able to move after it is given

A verdict is a statement about one commit, fixed when it was made. Two things can break that,
and both are ordinary GitHub features rather than exotic attacks:

- **A comment is editable in place.** A `Changes required` can be rewritten to `Approved`, and
  the head or the actor swapped, while the commit named stays exactly as it was.
- **The PR body is editable, and the head does not move when it changes.** A self-review that is
  correctly non-clearing today could be made clearing tomorrow by editing the body to name a
  different implementer. The old comment would silently begin opening the gate.

So:

1. **An edited comment never clears the gate.** A consumer compares the comment's created and
   last-edited times and refuses an edited one as gate-clearing evidence. Corrections and
   retractions are posted as **new comments**, which preserves the history rather than replacing
   it. An edited comment *does* still close the gate when it objects: refusing to open on
   doubtful evidence and refusing to close on it are not symmetric, and only one of them is safe.
2. **Independence is decided by the pair inside the verdict** — `Review actor` against
   `Implementation actor reviewed` — never against the PR body's current declaration.
3. **The body remains a cross-check.** Where it disagrees with what a verdict says it reviewed,
   something changed after the review. Which side is not knowable from the outside, so the gate
   **fails closed and reports** rather than choosing one.

The rule underneath all three: a record that can be rewritten after the fact is not evidence,
and the gate must prefer saying "I cannot tell" to saying "approved".

#### What clears the independent-review gate

A comment verdict clears DEC-013's independent-review requirement only when **its recorded actor
is independent of implementation, immutably** — the comment names both actors, they differ, the
comment has not been edited since it was posted, and nothing since contradicts it.

Short of that, the verdict is **evidence that a verdict was given, not gate-clearing independent
approval**. That covers three cases, all deliberate:

| Case | Why it does not clear |
|---|---|
| No `Review actor` | The record cannot say who spoke |
| No `Implementation actor reviewed` | The verdict cannot say who it believed it was reviewing, and the body could change later |
| The two actors are the same | Self-review, named as such |
| The comment was edited after posting | The verdict could have been written after the fact; post a new one |
| The body now names a different implementer | Something changed after the review; fail closed and report |

Non-clearing positions are still positions. They displace an earlier position by the same actor,
and an **objection closes the gate whoever raised it** — including one from the implementing
agent, because closing is always the safe direction and a self-identified problem is still a
problem.

**None of this verifies the claim.** An actor identifier is an assertion, and in a single-account
repository nothing stops one from being false. What the field buys is that independence is now
something the record *states* and can be checked against, rather than something a reader has to
assume — and that two actors stop being silently merged. **Where independence matters most, use
a second GitHub identity**, which GitHub itself authenticates; treat the comment form as what
keeps the record honest in its absence, not as a substitute for it.

**A verdict is a current position, not a history.** An approval a reviewer has since replaced with
`Changes required` is not evidence of anything, and while *any* reviewer has an outstanding
changes request the gate is closed — one reviewer's approval never cancels another's objection.
This matters because a PR accumulates reviews: what counts is each reviewer's latest word, not
the union of everything they have ever said.

And this verification opens exactly one thing: the head the finalization commit produced, on a PR
whose workstream record is already approving. It is not a general override. An approval on the PR
against a workstream that records `Changes required` or `In review` is a contradiction between two
durable records — report it and leave the gate shut. The rule everywhere in Build OS holds here
too: **surface the disagreement, never repair it**.

Then **merge targets that exact SHA**. A merge that takes whatever is at the tip of the branch at
click time is a merge of something nobody named.

A consumer reading these artifacts treats an approving review that names the current head as
satisfying the gate, and flags a workstream that declares finalization with no such record. It
never accepts a SHA a commit claims about itself.

### Is this honest?

It is worth naming the tension, because it looks like a violation of Build OS's own rule
that durable memory must describe current reality: the finalization commit writes "merged"
before the merge happens.

It is honest for one reason — **the commit is only ever true on `main`**. On the PR branch
it is a proposal, like every other commit in an open PR; the branch is not project memory. If
the PR is closed instead of merged, the commit never reaches `main` and the claim it makes
never becomes a claim about the project. What would be dishonest is finalizing a PR that is
not about to merge, or leaving it finalized while the merge is abandoned.

The alternative — a routine second PR whose only job is to correct the first PR's
bookkeeping — was tried and rejected: it doubles the review surface for zero information, and
in practice it is the PR that never gets opened.

---

## Review transitions

What a verdict does to the workstream. Phases are the standard ones in
`framework/WORKSTREAMS.md`; nothing here adds a phase.

| Situation | Workstream goes | Also required |
|---|---|---|
| Implementation reported complete, PR ready | `BUILDING` → `REVIEW` | Verdict `In review`, reviewed head `—` |
| Reviewer records `Approved` | stays `REVIEW` | Verdict + full reviewed head; then finalization |
| Reviewer records `Approved with follow-ups` | stays `REVIEW` | Follow-ups filed as named work — a new workstream, an open decision, or an issue — never as a sentence in a review nobody reads again |
| Reviewer records `Changes required`, PR open | `REVIEW` → `BUILDING` | Findings persisted on the workstream; corrections stay **on the same PR** |
| Corrections pushed, ready again | `BUILDING` → `REVIEW` | New head awaiting review; verdict back to `In review` |
| Finalization commit pushed | stays `REVIEW` | Only permitted surfaces changed; `Finalization: pushed` on the record; reviewer verifies the head that commit produced and records it **on the PR** |
| Exact reviewed head merged, workstream done | `REVIEW` → `COMPLETE` | Completion sequence already in the merged commit |
| Exact reviewed head merged, workstream continues | `REVIEW` → whatever is next | Finalization named the real next phase, not `COMPLETE` |
| Finding is the owner's to settle | `REVIEW` → `BLOCKED` | The question, verbatim, in Next Step; gate stays closed |
| Merged before review, or under an older protocol | stays active | Recovery, below |
| Finding withdrawn after discussion | as it was | Say why in the review summary; a finding that quietly disappears looks like one that was suppressed |

The `REVIEW → BUILDING → REVIEW` loop may run any number of times. It is the normal shape of
a reviewed change, not a sign that something went wrong.

---

## Recovery: merged before review

It happens. A PR merges under an older protocol, or because someone had the button and the
tests were green, and only afterwards does a reviewer look at it.

The response is not to pretend the review happened, and not to treat the code as settled
because it is on `main`. It is:

1. **Publish the finding on the merged PR.** That is where anyone tracing this change will
   look. Say plainly that the PR merged without an independent approved verdict, and record
   what review found.
2. **Open a focused corrective PR**, if the findings require code. Focused: it fixes the
   findings and does not become a second implementation. Link it from the merged PR and from
   the workstream.
3. **Checkpoint the workstream.** It returns to `BUILDING` with the findings in Next Step,
   and both PRs in Related PRs.
4. **Re-review independently**, under the full gate, including the reviewed head.
5. **Do not call the workstream complete** while a correction is outstanding. A merged PR is
   not a finished workstream, and this is exactly the case where the two come apart.

If the findings need no code — the review was clean, the process was skipped — record that
plainly too: verdict, reviewed head (the merge commit's parent on the branch), and a note
that the review was retrospective. A retrospective approval is worth having. It is simply
not the same thing as a gate that was honoured, and the record should not blur them.

**Merged history is not rewritten.** Nothing here reopens a PR that landed before the
project adopted v0.5.

---

## Proportionality

The gate is for significant work. Build OS has never required a Build Card for a typo, and
v0.5 does not require a review artifact for one.

A change is small enough to skip the ceremony when all of these hold: it does not implement
or alter owner-visible behavior, it is not part of a significant workstream, it changes no
architecture and no invariant, and describing it takes one sentence. Fix it, say what it was,
merge it.

The moment a PR claims to complete a significant workstream, it is significant — the size of
the diff has nothing to do with it. So is any PR that touches a documented invariant, an
owner decision, or the definition of done.

When it is genuinely unclear which side a change falls on, treat it as significant. The cost
of an unnecessary review is an hour; the cost of an unreviewed owner-decision change is
discovered by the owner, in production.

---

## Owner-facing review summary

The reviewer produces a summary for the owner. **It should be understandable without
reading the PR.** No file names, no function names, no diffs.

Structure:

### Verdict

Two stable fields, first, before the prose:

```markdown
**Verdict:** Approved
**Reviewed head:** 0123456789abcdef0123456789abcdef01234567
```

`Not started` · `In review` · `Changes required` · `Approved` · `Approved with follow-ups`.
The head is the full 40-character SHA the verdict was reached against, and the summary says
whether it is still the PR's current head at publication. A finding that only the owner can
settle is `Changes required`, with the question in *Decisions requiring owner attention*.

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
One clear instruction: finalize and merge; merge and file the follow-ups; fix the blocking
items and re-review; answer the decisions above first.

Note that "merge" is never the reviewer's own next action. The reviewer approves; the owner
or an authorized merger merges.

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

**Name the commit.** Every verdict carries the full head SHA it was reached against. A review
that does not say what it reviewed cannot be checked, cannot go stale, and cannot be relied
on later — which means it cannot open the gate.
