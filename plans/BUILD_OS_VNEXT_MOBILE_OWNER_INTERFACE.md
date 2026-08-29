# Build Spec — Build OS vNext Mobile-first Owner Interface

**Status:** Approved for implementation by owner on 2026-08-29
**Workstream:** WS-008 · **Build Card:** [`docs/workstreams/WS-008-mobile-owner-interface.md`](../docs/workstreams/WS-008-mobile-owner-interface.md#build-card)
**Framework:** Build OS v0.5

## 1. Objective

Refactor Build OS so its default human experience is optimized for fast mobile operation while preserving the existing engineering rigor underneath. The owner should interact primarily with concise intent, plan, and result surfaces; implementation agents and reviewers should consume the detailed specifications, handoffs, tests, and durable evidence.

The target owner loop is:

```text
INTENT → [PLAN / APPROVE when needed] → BUILD + VERIFY LOOP → SHIP | DECISION | BLOCKED
```

The same workflow must work whether intent begins in ChatGPT, Claude, another capable agent, or directly from a GitHub artifact.

## 2. Binding owner decisions

OD-1 through OD-10 in WS-008 are binding. In particular:

- no vendor-specific entry point;
- proportional planning for simple work;
- concise owner-facing surfaces by default;
- three terminal owner states: `SHIP`, `DECISION`, `BLOCKED`;
- independent verification remains mandatory for significant work;
- routine reviewer findings loop back to implementation without owner message-shuttling;
- detailed evidence remains durable and auditable.

## 3. Product model

### 3.1 Two-layer Build OS

Build OS should explicitly describe two layers:

**Owner layer**
- Intent
- Plan Card when approval is needed
- Owner Result (`SHIP`, `DECISION`, `BLOCKED`)

**Engineering layer**
- workstream
- Build Card
- Build Spec
- implementation handoff
- code/tests/CI
- review findings and verdict
- merge-finalization evidence
- project memory / decisions

The owner layer is a projection of the engineering layer, not a second source of truth.

### 3.2 Entry-point neutrality

The protocol must not assume that the Design Agent is ChatGPT or that every change begins in a Design Room. Define an **Intent Intake** contract that any capable agent can satisfy:

- identify desired outcome;
- identify material constraints/non-goals already supplied by the owner;
- determine whether the change is simple/proportional or significant;
- create/update the durable workstream when significant;
- route ambiguous product choices to a Plan Card instead of silently deciding them.

ChatGPT can still be used for deeper exploration. Claude can accept a direct simple change. Both converge on the same durable Build OS artifacts before significant implementation proceeds.

## 4. Owner-facing interfaces

### 4.1 Plan Card

Add a normative compact Plan Card for significant/ambiguous work. Target approximately 100–200 words unless the change genuinely cannot be summarized safely.

Required fields:

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
- no file lists, implementation architecture, test commands, function names, or internal identifiers unless owner judgment depends on them;
- material uncertainty cannot be hidden for brevity;
- approval of this card authorizes implementation of the corresponding detailed Build Spec, provided the spec faithfully expands rather than changes it;
- simple low-risk changes may skip a formal Plan Card under proportionality when intent is already unambiguous.

### 4.2 Owner Result

Add a normative terminal result with exactly one primary state.

#### SHIP

Use only when the significant-work merge gate is satisfied or, before final owner-authorized merge, all prerequisites except the owner's merge action are satisfied.

Required content:

```markdown
## SHIP

**What changed:** <1–3 plain-language sentences>
**Intent:** <x/y requirements satisfied or equivalent concise statement>
**Verification:** <tests/CI + independent review status in plain language>
**Deviations:** None | <material deviations only>
**Residual risk:** None | <material remaining risk only>
**Next action:** Merge PR #<n> | <other exact next action>
```

Target <=150 words.

#### DECISION

Use only when owner judgment is required and agents should not choose safely on the owner's behalf.

Required content:

```markdown
## DECISION

**Decision:** <one sentence>
**Why now:** <why implementation/review cannot choose this>
**Options:** <2–4 concise choices>
**Recommendation:** <preferred option + reason, when appropriate>
**Impact:** <what changes after the choice>
```

Do not mix unrelated choices into one decision unless they are coupled.

#### BLOCKED

Use only when work cannot responsibly continue because of an owner/external dependency, missing authority, unavailable credential/service, or an unresolved conflict that cannot be safely reduced to a normal owner choice.

Required content:

```markdown
## BLOCKED

**Blocker:** <one sentence>
**Why agents cannot resolve it:** <plain language>
**Smallest action needed:** <specific owner/external action>
**Work preserved:** <what remains safely completed>
```

Routine coding problems, failing tests, merge conflicts, reviewer findings, or ordinary implementation decisions are not `BLOCKED` if the agents can resolve them.

## 5. Closed implementation / verification loop

Update the protocol to make this path explicit for significant work:

```text
Implementation agent
  ↓
Validation / CI
  ↓
Independent reviewer
  ├─ Approved ───────────────→ finalization → owner result: SHIP
  ├─ Valid fixable findings ─→ implementation agent → validation → reviewer
  ├─ Owner choice required ─→ owner result: DECISION
  └─ Cannot proceed safely ─→ owner result: BLOCKED
```

Requirements:

- The reviewer publishes findings to the durable PR/review surface, not merely to a chat transcript.
- Fixable `Blocking` / `Should fix` findings return to the implementation agent on the same PR.
- The implementation agent responds, fixes, validates, and requests re-review without owner relay.
- The owner is interrupted only for an actual owner decision, genuine blocker, or final ship/merge action.
- Review independence and reviewed-head rules from v0.5 remain unchanged.
- Automation is optional. Build OS specifies the contract; projects may realize the loop with GitHub reviews, agents, CI, Companion, or other tooling.

## 6. Proportionality

Make the existing small-fix principle operational with three classes:

### Simple
Examples: obvious bug fix, copy change, isolated visual tweak, narrowly scoped parameter adjustment with low blast radius.

May proceed from direct intent without full Design Room / Plan Card if:
- intended behavior is unambiguous;
- no owner trade-off is being silently chosen;
- no consequential architecture/data/security change is involved.

Still requires normal project validation. If the work grows in scope, promote it to significant.

### Significant
Any change with a Build Card, cross-component behavior, architecture/data/security implications, meaningful product trade-offs, or a claim to complete a significant workstream.

Requires Plan approval (unless already explicitly approved in equivalent owner language), durable Build Spec, independent review, and terminal Owner Result.

### Escalated
A significant change that encounters an unresolved owner choice or genuine external blocker. Terminal state becomes `DECISION` or `BLOCKED` until resolved.

## 7. Artifact responsibility

Clarify audience and duplication limits:

| Artifact | Primary audience | Purpose |
|---|---|---|
| Intent | owner + intake agent | desired outcome |
| Owner Plan | owner | approval surface |
| Build Card | agents + reviewer | behavior contract |
| Build Spec | implementation agent + reviewer | exhaustive implementation requirements |
| PR Handoff | reviewer + future agents | truthful map of what was built |
| Review Summary | implementation agent + merge gate | findings/verdict/evidence |
| Owner Result | owner | next action |

The Owner Result should be generated from current durable state. It does not replace or weaken any underlying evidence.

## 8. Required framework changes

Implementation should update at minimum:

- `README.md`
  - make the mobile-first owner loop prominent;
  - explain the two-layer model;
  - remove language that implies every feature must originate with a specific Design Agent;
  - state entry-point neutrality explicitly.
- `framework/DESIGN_ROOM.md`
  - distinguish optional deep design from universal Intent Intake;
  - add proportional routing and Owner Plan contract.
- `framework/BUILD_SPEC.md`
  - define faithful expansion from approved Owner Plan to technical Build Spec;
  - prohibit the detailed spec from introducing new owner-visible choices silently.
- `framework/CLAUDE_HANDOFF.md`
  - retain detailed reviewer-facing handoff;
  - stop treating Owner Summary as the main owner result if that causes duplication;
  - require minimal final chat output pointing to the current Owner Result/PR.
- `framework/REVIEW_PROTOCOL.md`
  - add the closed correction loop;
  - define reviewer escalation to `DECISION` / `BLOCKED`;
  - preserve v0.5 independence/current-head merge gate.
- `framework/WORKSTREAMS.md`
  - define how significant intent from any entry surface creates/resumes a workstream;
  - add owner-interface state if needed without inventing unnecessary lifecycle phases.
- `framework/AGENT_SESSION_CHECKPOINT.md`
  - require sessions to publish durable state and a compact owner-facing current status rather than transcript-like summaries.
- `framework/BUILD_OS_PARSE_CONTRACT.md` and `contracts/`
  - add stable parseable fields only if needed for Plan/Result state;
  - prefer a small stable enum (`SHIP`, `DECISION`, `BLOCKED`) over parsing prose.
- `templates/`
  - add Owner Plan and Owner Result templates;
  - revise agent/project instruction templates so final responses default to concise mobile summaries.
- `examples/FEATURE_LIFECYCLE.example.md`
  - demonstrate ChatGPT-origin significant work.
- Add a second example showing Claude-origin simple intent that promotes to significant only if necessary.
- `VERSION.md` and `DECISIONS.md`
  - record this as a minor protocol evolution if implementation confirms compatibility impact warrants v0.6.

Implementation may adjust exact file boundaries if the resulting protocol is clearer, but all owner-visible behavior above must hold.

## 9. Acceptance criteria

- **AC-1:** A new user can understand the default owner loop from README without reading any framework file.
- **AC-2:** README shows `INTENT → PLAN/APPROVE → BUILD+VERIFY → SHIP|DECISION|BLOCKED` and explains that Plan may be skipped for simple proportional work.
- **AC-3:** Protocol explicitly states intent can begin in ChatGPT, Claude, another agent, or GitHub.
- **AC-4:** Owner Plan template contains no technical implementation section.
- **AC-5:** Owner Result template supports exactly the three primary terminal states.
- **AC-6:** `SHIP` cannot be truthful while significant-work review is stale, unresolved Blocking/Should-fix findings remain, required validation is red, or a material deviation is undisclosed.
- **AC-7:** Routine reviewer findings have a documented path directly back to implementation without owner relay.
- **AC-8:** `DECISION` is reserved for owner judgment; `BLOCKED` is reserved for inability to proceed safely.
- **AC-9:** Existing v0.5 independent-review and current-head rules remain at least as strict as today.
- **AC-10:** Detailed implementation/review evidence remains durable in GitHub even though owner summaries are short.
- **AC-11:** No mandatory Claude, ChatGPT, mobile app, hosted service, bot, or CI integration is introduced.
- **AC-12:** Worked examples cover both a ChatGPT-origin significant change and a Claude-origin simple change.
- **AC-13:** Project adoption instructions tell implementation agents to keep final chat responses terse and use the Owner Result as the default human handoff.
- **AC-14:** Any machine-readable additions are schema-tested / fixture-tested where Build OS currently validates contracts.

## 10. Stop / escalation conditions for implementation

Return `DECISION` rather than improvising if implementation discovers that:

- the three-state model cannot represent a materially necessary owner state without losing truth;
- proportional simple work would weaken the existing significant-work merge gate;
- entry-point neutrality conflicts with a current durable-state invariant;
- the proposed change requires removing independent review or allowing author self-approval;
- a new mandatory runtime service is required.

Otherwise use implementation discretion, keep the protocol Markdown-first, and disclose meaningful deviations.

## 11. Expected owner experience after adoption

### Normal significant change

```text
Owner: natural-language intent from ChatGPT or Claude
→ concise Owner Plan
→ owner approves
→ implementation agent builds
→ reviewer verifies
→ implementation/reviewer loop resolves fixable findings
→ SHIP
```

### Simple change

```text
Owner: direct intent in Claude
→ agent classifies as simple and implements
→ normal validation
→ concise completion result
```

If scope expands or owner trade-offs emerge, promote to significant and issue an Owner Plan.

### Exception

```text
... → reviewer/implementer identifies owner choice → DECISION
... → unavailable authority/external dependency → BLOCKED
```

The owner should never need to read the full technical handoff merely to determine which of these paths they are on.
