# Claude Handoff

**Build OS v0.3**

**GitHub is the authoritative implementation handoff surface. Claude chat is not the
durable handoff.**

A chat transcript is not searchable by the next agent, not readable by a reviewer three
weeks later, not attached to the diff it describes, and not there at all once the session
ends. Everything that matters about an implementation goes into the pull request.

This applies to any implementation agent. "Claude" is used throughout because it is the
common case.

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

**7. Apply any repository-update block supplied with the spec.**
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

### Owner Summary
**Maximum approximately 100 words.** Plain language. No file names, no function names, no
jargon. This is often the only part of the PR the owner reads.

Explain:

- what changed,
- what behaves differently,
- meaningful deviations,
- unresolved owner decisions.

If there is an unresolved owner decision, it goes in the first sentence — not the last.

```markdown
Subscriptions on annual plans can now be paused for up to 90 days. While paused, billing
stops and the subscription's seats return to the pool, so resuming requires seats to be
available — resume fails with a clear message if the team has since filled up. Pauses that
hit 90 days auto-resume, or cancel if seats are unavailable. No deviations from what was
agreed. One thing needs your call: we don't currently email anyone when an auto-resume
fails, and that's likely worth adding.
```

---

## The final chat response

**Claude's final chat response should be deliberately minimal because the PR is
authoritative.**

Duplicating the handoff into chat undermines the whole protocol: it teaches everyone that
chat is where the real information lives, and it creates a second version that immediately
starts diverging from the PR.

Example:

```text
PR #267 opened. Implementation complete. 94 tests passed. No spec deviations.
Full handoff is in GitHub.
```

Include: the PR reference, completion status, headline validation result, whether there
were deviations, and a pointer to GitHub.

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
- [ ] Any repository-update block supplied by the design agent has been applied
- [ ] Framework compatibility checked for significant work, and the `Framework:` field reflects what actually happened
- [ ] Owner Summary is under ~100 words and free of jargon
- [ ] The final chat response is two or three lines

Template: `templates/PR_HANDOFF.template.md`
