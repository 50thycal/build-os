# Build Spec

**Build OS v0.3**

The Build Spec is the standard implementation packet handed to Claude or another coding
agent. It is produced by the design agent in stage E of the Design Room, after the Build
Card is approved — that is, when the workstream reaches `READY_TO_BUILD`.

**Audience:** the implementation agent.
**Not the audience:** the owner. The owner reads the Build Card. The design agent is
responsible for the spec being a faithful translation of it.

**Property to preserve:** an implementation agent with no memory of the Design Room
conversation should be able to build the right thing from the Build Card plus this spec
plus the repository.

**Before writing one:** run the framework compatibility check
(`framework/FRAMEWORK_SYNC.md`). A spec written against an obsolete protocol propagates that
protocol into the implementation, the handoff, and the review.

---

## The three-way split

Every Build Spec must distinguish three categories. This is the most important thing the
document does, and it should appear near the top where it cannot be missed.

### Owner decisions

Behavior explicitly chosen during the Design Room.

**These may not be silently changed by the implementation agent.**

If implementation reveals that an owner decision is impossible, prohibitively expensive,
or incoherent with the code as it exists, stop and escalate. Do not substitute a
reasonable alternative and mention it in the handoff — by then the product has already
been changed.

State each owner decision so that a violation is detectable:

```markdown
- **OD-1.** A paused subscription does not hold its seats. On resume, seats are requested
  from current availability, and resume fails with `SEATS_UNAVAILABLE` if there are none.
- **OD-2.** Pausing is available only on annual plans.
- **OD-3.** A pause has a maximum duration of 90 days; the subscription auto-resumes or
  auto-cancels per OD-4 at expiry.
```

### Implementation discretion

Technical decisions the implementation agent is empowered to make without asking.

By default this includes: internal structure and module layout, naming, data structures
and query shape, algorithm choice, library selection within existing dependencies, error
handling mechanics, logging detail, test structure, refactoring encountered along the way
that does not change behavior.

State it positively so the agent does not over-escalate:

```markdown
Yours to decide: schema shape for pause state, whether pause is a column or a separate
table, how the expiry job is scheduled, caching, naming, test layout, and any
behavior-preserving refactor of the billing module you find useful.
```

**Prefer reasonable technical judgment where the owner-facing behavior is unaffected.**
An agent that stops every twenty minutes to confirm a naming choice is as much a failure
as one that redesigns the product.

### Stop / escalation conditions

Situations where the implementation agent should **not** improvise a product-level
behavior change.

Escalate when:

- An owner decision cannot be implemented as written.
- Two owner decisions conflict in a case neither anticipated.
- The change requires user-visible behavior the Build Card does not cover, and the answer
  is not obvious from the card's rules.
- The change would break an invariant recorded in `PROJECT_MODEL.md`.
- Existing behavior outside the Build Card's scope must change to make this work.
- Data loss, destructive migration, or an irreversible operation is required and was not
  anticipated.
- A security, privacy, or compliance constraint appears to be in tension with the spec.

Escalation means: stop that thread of work, continue anything not blocked by it, and
raise the question with the specific options and your recommendation. If the work is far
enough along that a PR exists, raise it in the PR. State it in one place, clearly, and do
not bury it in a handoff section.

**Avoid unnecessary blocking.** Escalation is for product-level behavior, not technical
uncertainty. When only the owner's answer can settle it, escalate. When a competent
engineer would just pick one, pick one and note it under *Design Decisions* in the handoff.

---

## Standard sections

Include every section that applies. Mark the ones that do not as `N/A` rather than
deleting them — an explicit `N/A` tells the reviewer the question was considered.

### 1. Objective
One paragraph. What this change accomplishes and why now. Link the Build Card, name the
workstream (`WS-###`) the change belongs to, if there is one, and state the Build OS version
this spec was written under. Where the workstream will take
more than one PR, say which part of it this spec covers.

### 2. Owner-approved behavior
The `After this change, the system should...` sentence, verbatim from the Build Card,
followed by the numbered owner decisions (`OD-1`, `OD-2`, …) and the card's important
rules restated in enforceable form.

### 3. Repository context
Where this lives. Relevant modules, entry points, existing patterns to follow, and the
sections of `PROJECT_MODEL.md` that apply. Enough that the agent does not have to
rediscover the codebase's shape from scratch — not a file inventory.

### 4. Architecture constraints
What must not change: boundaries, layering rules, dependency direction, invariants that
must survive, performance or resource budgets, deployment constraints.

### 5. Implementation requirements
The substance. Numbered, testable requirements. Each one should be checkable against the
finished code.

```markdown
- **R-1.** `POST /subscriptions/{id}/pause` transitions `active → paused`, sets
  `paused_at`, and computes `pause_expires_at = paused_at + 90d`.
- **R-2.** Pause is rejected with `409 PLAN_NOT_ELIGIBLE` for any non-annual plan (OD-2).
- **R-3.** Seats held by the subscription are released on pause (OD-1).
```

Tag requirements that come from an owner decision with the `OD-n` they implement. That
tag is what makes review able to check "were owner decisions silently changed?"

### 6. State transitions
The state machine, if the change has one. Every state, every legal transition and its
trigger, and what happens to transitions that are not legal. Include terminal states and
transitions that fire on time rather than on user action.

### 7. Interfaces
Public surface: HTTP endpoints, function/module signatures, events published or consumed,
CLI commands, UI contracts. Request and response shapes, status codes, error codes.
Everything another component or client can observe.

### 8. Persistence changes
New or modified tables, columns, indexes, documents, keys. Nullability, defaults,
constraints, retention. Note which fields are authoritative versus derived.

### 9. Migration requirements
How existing data reaches the new shape. Backfill strategy, ordering, whether the
migration is online, whether it is reversible, and what happens to rows that cannot be
migrated. If the deploy has an ordering requirement — migrate before deploy, deploy before
backfill — say so explicitly.

### 10. Failure behavior
What happens when each dependency fails, times out, or returns garbage. Which failures are
retryable, which are terminal, what the user sees, what state the system is left in.
Partial failure deserves particular attention: if step three of five fails, what is true?

### 11. Concurrency / idempotency
Simultaneous requests, duplicate deliveries, retries, races between a user action and a
scheduled job. Which operations must be idempotent and what the idempotency key is.
Locking, ordering, and transaction boundaries where they matter.

### 12. Observability
What must be logged, measured, or traced for this to be operable. Metric names and
dimensions. What a responder needs when this misbehaves at 3am. Keep it proportional —
a handful of the right signals, not instrumentation of everything.

### 13. Backwards compatibility
Existing clients, existing data, existing integrations. Which contracts must keep working
and for how long. Deprecation path if one is needed. Feature flag or rollout strategy if
the change is risky.

### 14. Security / privacy constraints
Authorization: who may perform each new operation. What is sensitive, what must not be
logged, what must be encrypted or redacted. Retention and deletion obligations. Rate
limiting or abuse surface introduced by the change.

### 15. Edge cases
An explicit list, not a gesture at thoroughness. Empty, zero, one, maximum. Already in the
target state. Concurrent opposite actions. Expired, deleted, or partially-created entities.
Clock skew and timezone boundaries. Each edge case gets a defined expected behavior — an
edge case without a stated expectation is an unresolved design question.

### 16. Tests
What must be covered and at what level. **Specify behaviors to verify, not test file
layout** — layout is implementation discretion. Call out the cases where a passing test
would be the only thing standing between a subtle bug and production.

### 17. Acceptance criteria
The checklist that says this is done. Observable, verifiable, and traceable to the Build
Card's definition of done. This is what the implementation agent validates against and
what review checks first.

### 18. Non-goals
From the Build Card, plus any that emerged while writing the spec. Explicitly out of
scope, so that "while I was in there" does not become a design change.

### 19. Required documentation updates
Which docs must change: `PROJECT_MODEL.md` (and which sections), `DECISIONS.md` (and the
decisions expected), the workstream file and `ACTIVE.md`, READMEs, API docs, runbooks. Be
specific — "update the docs" is reliably ignored.

If the design agent could not write to GitHub, its checkpoint belongs here as a precise
repository-update block — exact file, exact fields, exact replacement text — for the
implementation agent to apply. See `framework/WORKSTREAMS.md` → *GitHub capability
boundary*.

### 20. Handoff requirements
Anything beyond the standard `CLAUDE_HANDOFF.md` protocol: specific validation to run,
specific risks to call out, a reviewer to request, an area to flag for review focus.

---

## Writing a good spec

**Be exhaustive about behavior, quiet about implementation.** The spec's job is to leave
no behavioral question unanswered while leaving as many technical questions as possible
open. Every technical choice made here is one the agent — which is looking at the actual
code — cannot make better.

**Number things.** `OD-1`, `R-4`, `AC-2`. Numbered items can be referenced in handoffs and
review findings. Prose cannot.

**Write requirements that can fail.** "Handle errors gracefully" cannot fail. "On timeout,
return `503` and leave the subscription in `active`" can.

**Don't restate the codebase.** The agent can read the repository. Point at what matters
and move on.

**Length follows the change.** A one-rule change gets a one-page spec. Resist the pull
toward a uniform ceremonial document.

Template: `templates/BUILD_SPEC.template.md`
