# WS-008 — Mobile-first owner interface

**Phase:** READY_TO_BUILD
**Status:** Active
**Updated:** 2026-08-29
**Implementation State:** Approved design; draft handoff PR #13 open; implementation not started
**Related PRs:** #13
**Next Step:** Claude implements the approved vNext owner-interface protocol on PR #13 and its existing branch.

## Goal

Make Build OS fast to operate from a phone by separating the framework's internal engineering artifacts from the owner's interface. The owner should be able to start work from ChatGPT, Claude, or another capable agent, approve only the intent/plan that needs judgment, let implementation and independent verification run without acting as a message bus, and receive a short terminal result: **SHIP**, **DECISION**, or **BLOCKED**.

Build OS remains transport-agnostic. GitHub is durable shared memory; no specific chat product becomes mandatory.

## Owner observations

- Long implementation responses are the bottleneck on mobile, not generation speed.
- The existing Build Card / Build Spec / PR handoff / review evidence are useful internally but too technical as the default owner-facing surface.
- Some changes are simple enough to originate directly in Claude; others benefit from a ChatGPT design conversation. Both entry paths must be first-class.
- The owner should not have to relay reviewer findings back to the implementation agent during normal correction loops.
- Technical evidence must remain durable and inspectable even when the default owner summary is heavily compressed.

## Decisions made

- **OD-1 — Entry is agent-agnostic.** Intent may originate in ChatGPT, Claude, another agent, or directly through GitHub. Build OS governs the durable artifacts and gates, not which chat produced the intent.
- **OD-2 — Proportional planning.** Small, low-risk changes may use a compact intent/plan without a full design-room ceremony. Significant or ambiguous changes still receive the existing deeper design treatment underneath.
- **OD-3 — Owner interface is compressed by default.** Owner-facing plan and terminal result are short, plain-language summaries. Full Build Card, Build Spec, implementation handoff, review findings, validation, and evidence remain available but are not the default reading path.
- **OD-4 — Three terminal owner states.** Significant work returns one of: `SHIP`, `DECISION`, or `BLOCKED`.
- **OD-5 — DECISION is scarce.** Use it only when owner judgment is actually required. Routine implementation choices, test failures, and reviewer corrections stay inside the agent loop.
- **OD-6 — BLOCKED is scarcer still.** Use it only when implementation/review cannot responsibly continue without owner input or an external dependency/action outside the agents' authority.
- **OD-7 — Closed verification loop.** After implementation, an independent reviewer verifies actual code against approved intent. Valid findings return directly to the implementation agent on the same PR; the owner does not manually shuttle messages between agents.
- **OD-8 — SHIP must be evidence-backed.** `SHIP` means approved intent is satisfied, required validation is green, independent review clears the current head, material deviations are disclosed, and the merge gate is otherwise satisfied.
- **OD-9 — Mobile-first brevity is normative.** If the owner must read a long technical report to know the next action, the owner interface has failed. Detailed evidence lives behind the summary, not inside it.
- **OD-10 — Existing rigor stays internal.** Build OS does not remove durable specs, workstreams, review evidence, decisions, or project memory. It changes what the owner must consume.

## Build Card

### After this change, the system should...

Let an owner initiate software work from any supported AI surface, approve only a concise behavior-level plan when approval is needed, allow implementation and independent verification to proceed without owner message-shuttling, and return a mobile-friendly **SHIP / DECISION / BLOCKED** result backed by the existing durable Build OS evidence.

### Owner experience

1. **INTENT** — owner describes the desired outcome in natural language from ChatGPT, Claude, or another entry surface.
2. **PLAN** — when the change is significant or ambiguous, Build OS presents a short approval card focused on outcome, scope, notable risk, and unresolved owner choices. Simple changes may proceed under proportionality without a ceremonial plan approval.
3. **BUILD + VERIFY** — implementation agent works the PR; CI/validation runs; independent reviewer checks code against approved intent; valid findings loop back to implementation until clear or escalation is genuinely required.
4. **RESULT** — owner sees exactly one primary state:
   - **SHIP** — safe/recommended to merge; summarize what changed, what was verified, any meaningful residual risk, and the PR.
   - **DECISION** — one or more owner choices are required; present concise options and a recommendation where appropriate.
   - **BLOCKED** — work cannot responsibly continue; state the blocker, why agents cannot resolve it, and the smallest owner/external action needed.

### Definition of done

- The protocol explicitly supports intent originating from ChatGPT, Claude, or another capable agent without changing the lifecycle semantics.
- A normative owner-facing Plan Card exists and is materially shorter/less technical than the Build Spec.
- A normative Owner Result exists with `SHIP`, `DECISION`, and `BLOCKED` states.
- Implementation handoff remains detailed for reviewers/agents but no longer acts as the default owner report.
- Review protocol defines the closed correction loop and when owner escalation is allowed.
- Proportionality distinguishes trivial/simple work from significant work without weakening the merge gate for significant changes.
- Templates and examples make the mobile-first path the path of least resistance.
- README/adoption guidance tells projects to keep final chat responses terse and point owners to the result summary, not the technical handoff.
- No mandatory runtime service, proprietary chat integration, or product-specific dependency is introduced.

### Non-goals

- Building a new mobile app or web UI in this workstream.
- Replacing GitHub as durable state.
- Removing Build Specs, project memory, workstreams, or independent review.
- Making Claude, ChatGPT, or any single vendor mandatory.
- Automatically merging significant PRs without owner authorization.

## Risks / open design constraints

- Compression must not hide a real deviation or unresolved risk. A short summary may omit detail, but not material truth.
- `SHIP` should remain a recommendation/gate state, not an agent silently exercising merge authority.
- The protocol should avoid duplicating the same facts across Plan Card, PR handoff, review summary, and Owner Result; each surface needs a clear audience.
- Closed-loop reviewer/implementer exchange may be automated differently by each project. The protocol should specify the contract and state transitions without requiring a specific GitHub bot or CI product.

## Review State

**Verdict:** Not started
**Reviewed head:** —

No implementation review yet.
