# Claude Handoff

**Build OS v0.6**

**GitHub is the authoritative implementation handoff surface. Claude chat is not the
durable handoff.**

A chat transcript is not searchable by the next agent, not readable by a reviewer three
weeks later, not attached to the diff it describes, and not there at all once the session
ends. Everything that matters about an implementation goes into the pull request.

This applies to any implementation agent. "Claude" is used throughout because it is the
common case.

---

## When intent arrives here first

Not every change starts in a Design Room. An owner may hand an implementation agent a
sentence — "the export is missing the claimed status", "make the reminder subject line
shorter" — and expect it done, not designed.

That is legitimate, and v0.6 names it. Before writing code, perform **Intent Intake**
(`framework/OWNER_INTERFACE.md`): establish the outcome in one sentence, capture the
constraints the owner actually stated, and **classify the work**.

- **Simple** — unambiguous, no owner trade-off being chosen for them, nothing consequential
  to architecture, data, or security, and not part of or completing a significant workstream.
  Implement it, validate it, and return a `SHIP` whose `Verification` says it was classified
  simple.
- **Significant** — anything else. It gets a workstream, an approved Owner Plan or equivalent
  explicit owner approval, a Build Spec, and the full merge gate. Where the design work has
  not happened, say so and do that first rather than building ahead of an approval.

**The classification is a claim, and it is yours.** Promote to significant the moment the work
turns out to touch an owner decision, an invariant, or documented behavior — including
partway through. Never the reverse. When it is genuinely unclear, it is significant.

---

## Before significant implementation

Run the framework compatibility check (`framework/FRAMEWORK_SYNC.md`) before significant
architectural implementation — is the project's adopted Build OS version still current? A
small fix on an existing design does not need one; a change that reshapes a subsystem does.

If the project is behind canonical and the delta affects how the work should be done, perform
the migration as part of this PR and record it in the `Framework:` field below.

---

## Required sequence

After implementation, the agent must:

**1. Run appropriate validation.**
The project's own checks — tests, linters, type checks, build — at the level a contributor
would run before pushing. If the Build Spec named specific validation, run that too. Fix
what fails. If something cannot be made to pass, that is a finding to report, not a step to
skip.

**2. Commit changes.**
Clear, descriptive commit messages. Group logically related work; do not squash an entire
feature into one opaque commit or scatter it across forty.

**3. Push the branch.**
To the designated branch. Never to a different branch without explicit permission.

**4. Create or update the pull request.**
Ready for review, not a draft. If an open PR already exists for the branch, update it —
a merged or closed PR does not count and must not be reused.

**If a Design Handoff PR already exists for this work, that is the PR.** A design agent with
GitHub write access publishes the approved card and issued spec as a draft PR on the branch
implementation is meant to continue. Continue that branch and that PR; mark it ready for
review when the implementation is ready. Do not open a second PR for the same implementation
unless the first was merged or closed, or an escalation genuinely requires a separate change
— and say so in the handoff when it does. One implementation, one PR, one history a reviewer
can read start to finish.

**5. Write an Implementation Handoff into the PR.**
The full handoff, in the PR body, in the structure below. Not a link to it. Not a summary
of it. If the PR body is updated across multiple rounds of work, keep it current — the PR
body describes the PR as it stands now, not as it stood at first push.

**6. Update project memory where required.**
`PROJECT_MODEL.md` when architecture, flows, invariants, or system responsibilities
materially changed. `DECISIONS.md` when a consequential decision was made. The workstream
file and `ACTIVE.md` when the change belongs to a workstream — at minimum its `Phase`,
`Status`, `Updated`, `Implementation State`, `Related PRs`, and `Next Step`. These are
commits in the same PR, not a follow-up task. See `framework/PROJECT_MEMORY.md` and
`framework/WORKSTREAMS.md`.

**7. Request independent review — and do not approve or merge your own work.**
An implementation agent prepares the PR and responds to findings. An independent reviewer —
a human, or an agent session with no memory of writing this code — records the verdict. The
owner, or a merger they authorize, merges.

For a significant PR that means: **you may not approve it, and you may not merge it.** The
single exception is explicit owner direction to merge *and* an existing independent approved
verdict naming the current head. Owner direction replaces the merger, never the reviewer.

Report the state of the gate honestly in the handoff — `Review gate: Pending independent
review` until a reviewer says otherwise. An implementation agent never writes its own
approval into the workstream's `Review State`.

The full gate, the verdict values, the staleness rules, and the merge-finalization commit
are in `framework/REVIEW_PROTOCOL.md`.

**Findings come back to you, not to the owner.** A reviewer's fixable `Blocking` and
`Should fix` findings are addressed to the implementation agent: fix them on this same PR,
re-validate, restate the head, and request re-review, without asking the owner to carry
messages between the two of you. The owner hears from you when a decision is genuinely
theirs, when work is genuinely blocked, or when the work is ready. See
`framework/REVIEW_PROTOCOL.md` → *The correction loop*.

**8. Apply any repository-update block supplied with the spec.**
A design agent that can read but not write to GitHub hands over its checkpoint as a precise
update block — exact file, exact fields, exact replacement text. Applying it is part of the
implementation, not optional cleanup: until it lands, the design work it records exists only
in a chat window. Apply it as given; if it conflicts with what was actually built, apply
what is true and say so under *Spec Deviations*.

---

## The PR handoff

Every section is required. Sections with nothing to report get an explicit `None` — an
empty section is ambiguous, and `None` is a claim the reviewer can check.

### Goal
The original intended outcome. Quote the Build Card's `After this change, the system
should...` sentence and link the Build Card and Build Spec.

### Implemented
**What behavior actually exists** — not what was attempted, not what the spec asked for.
Write it as though describing the system to someone who will use it. Where the
implementation is narrower than the spec, say so here as well as under *Spec Deviations*.

### Architecture / Flow
The relevant interactions and control flow. How a request or event moves through the
change, which components participate, where state changes, what happens on the unhappy
path. A short diagram often beats three paragraphs. Enough for a reviewer to hold the
change in their head before reading the diff.

### Major Areas Changed
Major files, components, and systems, **without meaningless file dumps.** The diff already
lists every file. This section explains the *shape* of the change: which areas carry the
substance, which changes are mechanical, which existing systems were touched and why.

Good:
```markdown
- `billing/subscription_state.py` — pause/resume transitions and the 90-day expiry rule
- `billing/seats.py` — seat release on pause, reacquisition on resume
- `jobs/expiry.py` — new daily job resolving expired pauses
- ~30 call sites updated mechanically for the new `SubscriptionState` enum member
```

Bad: a bulleted list of all 47 changed files.

### Design Decisions
Technical decisions made during implementation, with the reasoning. These are the
implementation-discretion choices from the Build Spec — schema shape, algorithm, structure,
trade-offs taken. A reviewer should not have to reverse-engineer *why* from the diff.

### Spec Deviations
**Any departure from approved behavior or requirements.** Reference the specific `OD-n`,
`R-n`, or `AC-n`, state what was done instead, and why.

**Write `None` explicitly when there are no deviations.**

This section is load-bearing. Under-reporting here is the single most damaging failure
mode available to an implementation agent: it converts a visible disagreement into an
invisible one. If unsure whether something counts as a deviation, it counts.

### Tests / Validation
What was run and the results. Actual numbers — commands, counts, pass/fail. What is
covered by new tests and what is not. If something was expected to pass and does not, it
belongs here, not omitted.

```markdown
- `pytest tests/billing` — 94 passed, 0 failed
- `ruff check .` — clean
- `mypy billing/` — clean
- New: 18 tests covering pause/resume transitions, seat release, expiry job, and the
  five edge cases in spec §15
- Not covered by automated tests: the 90-day expiry boundary under clock skew (see Risks)
```

### Known Risks / Limitations
Anything remaining: unhandled edge cases, performance characteristics under load,
assumptions that could prove wrong, fragile areas, operational risk at deploy. Be
concrete. "May have performance implications" helps nobody; "the expiry job scans all
paused subscriptions, which is fine at current volume and will need an index at ~100k"
does.

### Recommended Review Focus
Where an independent reviewer should scrutinize the implementation. The agent knows where
the bodies are — where the logic is subtle, where a spec requirement was hard to satisfy,
where a decision could reasonably have gone the other way. Naming three specific places
beats "please review carefully."

### Framework

Which Build OS version the work was done under, and whether a migration happened. Four lines
at most. Omit for small PRs; include it on anything significant.

```markdown
Framework:
- Project adopted: v0.3
- Canonical checked: v0.3
- Compatibility: current
```

```markdown
Framework:
- Project adopted: v0.1 → v0.2
- Canonical checked: v0.2
- Compatibility: upgrade required
- Migration performed: workstreams added
```

If the check could not be performed — no access to canonical `VERSION.md` — say so here.
Never record a check that did not happen.

### Review Gate

The state of the merge gate, written by the implementation agent and never claiming more
than it can:

```markdown
Review gate: Pending independent review
```

Once a reviewer has recorded a verdict, this field repeats it, with the full 40-character
head it was reached against:

```markdown
Review gate: Approved · reviewed head 0123456789abcdef0123456789abcdef01234567
Head at time of writing: 0123456789abcdef0123456789abcdef01234567 (current)
```

If the PR has moved since the verdict, say so — the approval is stale and the new head needs
reviewing. If review has not happened, the value is `Pending independent review` and nothing
else. **An implementation agent never writes an approval here.**

Before merge, the last commit on this PR is the **merge-finalization** commit: documentation
only, setting the workstream, `ACTIVE.md`, and `Review State` to what becomes true when the
PR lands. Note here when it has been pushed, so the reviewer knows which diff to verify.

That commit does not — cannot — name its own SHA: `Reviewed head` keeps naming the last commit
reviewed in full, and gains `Finalization: pushed`. The head it produces is recorded by the
**reviewer, on the PR**, after it exists. See `framework/REVIEW_PROTOCOL.md`.

### Workstream

The workstream ID, its phase before and after this PR, and whether the PR completes it.
`None` if the change does not belong to one.

```markdown
WS-001 — Procurement redesign. BUILDING → REVIEW. Does not complete the workstream; the
cost-clock tuning pass is still to come.
```

### Follow-up Work
Intentional deferrals, with the reason each was deferred. Distinguish "out of scope per
the Build Card's non-goals" from "should be done soon" from "will become a problem at
scale." Do not use this section to park unfinished in-scope work.

### Owner Result

**The last section, and usually the only one the owner reads.** Exactly one of `SHIP`,
`DECISION`, or `BLOCKED`, in the form defined by `framework/OWNER_INTERFACE.md` — or, at first
push, none of them:

```markdown
## Owner Result

Awaiting independent review. Nothing needed from you yet.
```

**That is the correct content for a PR that has just been opened**, and it carries no marker.
The three states are terminal, not a running status: the code being written is not the same as
the work being verified, and `SHIP` may not be written without an independent verdict. Write
the result when review clears.

This is the handoff's owner-facing section — **one surface, not two.** Before v0.6 this slot
held an *Owner Summary*, which described what changed but not what to do about it, and left
the owner to work out from the sections above whether the PR was ready. The result states
both. Do not keep an Owner Summary beside it: two owner-facing summaries on one PR drift
within a week, and nobody knows which is current.

Plain language. No file names, no function names, no jargon. Nothing restated from the
sections above it, and nothing in it that contradicts them — it is generated from the durable
state this PR already carries, not composed independently of it.

```markdown
Build OS owner result: SHIP

**What changed:** Subscriptions on annual plans can now be paused for up to 90 days. Billing
stops while paused and the seats return to the pool, so resuming needs seats to be available.
**Intent:** All four approved behaviors are in place.
**Verification:** Full billing suite green, 18 new tests. Independent review approved the
current head.
**Deviations:** None.
**Residual risk:** The expiry job scans all paused subscriptions — fine now, needs an index
well before 100k.
**Next action:** Finalize and merge PR #267.
```

`SHIP` is a **report** of the merge gate, not a substitute for it, and writing one approves
and merges nothing. It may not be written for significant work while validation is red, a
`Blocking` or `Should fix` finding is unresolved, there is no independent approved verdict,
that verdict is stale, or a material deviation is undisclosed. The full rules, including what
`Next action` must say at each of the three points where the gate terminates, are in
`framework/OWNER_INTERFACE.md`.

An unresolved owner decision is not a caveat inside a `SHIP`. It is a `DECISION`.

The `Build OS owner result:` line is what a machine consumer reads, so it carries exactly one
state. **Delete the two states you are not in** — a handoff left with all three, as the template
ships them, declares nothing and is reported as ambiguous rather than read as the first one.

---

## The final chat response

**Claude's final chat response should be deliberately minimal because the PR is
authoritative.**

Duplicating the handoff into chat undermines the whole protocol: it teaches everyone that
chat is where the real information lives, and it creates a second version that immediately
starts diverging from the PR.

**Lead with the owner result state, then point at it.** One or two lines:

```text
SHIP — PR #267. Pause/resume works as approved, 94 tests green, review approved the current
head. Full result in the PR.
```

```text
DECISION — PR #267. One choice needs you: what happens when an auto-resume fails and nobody
is emailed. Options and recommendation are in the PR.
```

Include: the state, the PR reference, the headline validation result, and a pointer. The
Owner Result in the PR carries the rest — restating it here is the failure this rule exists
to prevent, not thoroughness.

Exceptions — when more belongs in chat:

- **An escalation.** A stop condition was hit and the owner's answer is needed. State the
  question, the options, and the recommendation in chat, and in the PR.
- **A direct question was asked.** Answer it.
- **The work is blocked** and no PR exists. Say what is blocking.

None of these are licence to restate the handoff.

---

## Handoff quality checks

Before considering the work complete:

- [ ] Validation was actually run, and the reported results are the real ones
- [ ] The branch is pushed and the PR is open and ready for review
- [ ] Every handoff section is present; empty ones say `None`
- [ ] *Implemented* describes behavior that exists, not behavior that was intended
- [ ] Every deviation from an `OD-n` or `R-n` is listed
- [ ] *Major Areas Changed* explains shape, not a file dump
- [ ] `PROJECT_MODEL.md` updated if architecture, flows, invariants, or responsibilities changed
- [ ] `DECISIONS.md` entry added for any consequential decision
- [ ] Workstream file and `ACTIVE.md` updated: phase, status, implementation state, PR, next step
- [ ] This is the same PR the design handoff opened, or the handoff says why it is not
- [ ] `Review gate:` states the real state, and claims no approval this agent did not receive
- [ ] Neither approval nor merge was performed by the agent that wrote the code
- [ ] Any repository-update block supplied by the design agent has been applied
- [ ] Framework compatibility checked for significant work, and the `Framework:` field reflects what actually happened
- [ ] The Owner Result is exactly one state — or, before review, says it is awaiting one and carries no marker — and no Owner Summary sits beside it
- [ ] A `SHIP` is true against the gate — validation green, verdict present and not stale, no unresolved Blocking or Should fix, deviations disclosed
- [ ] `Next action` names what is actually outstanding, including an unverified final head
- [ ] Simple-classified work says so in the result's `Verification`
- [ ] The final chat response is one or two lines and leads with the state

Template: `templates/PR_HANDOFF.template.md`
