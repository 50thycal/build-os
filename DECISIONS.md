# Decisions — Build OS

Consequential decisions about the framework itself, recorded in the format Build OS
prescribes for projects. Build OS dogfoods its own protocol.

**Build OS v0.2**

---

### DEC-001 — The Build Card is the owner's contract; the Build Spec is not owner-facing

**Date:** 2026-08-22
**Status:** Accepted

**Context**
Agent-produced specifications are long, technical, and written for a machine. Owners either
read them and lose hours, or skim them and unknowingly approve behavior they did not
intend. Both outcomes make the owner's approval meaningless, which is the failure the whole
framework exists to prevent.

**Decision**
Two documents, two audiences. The Build Card is owner-facing, understandable in 30–60
seconds, and is the artifact the owner approves. The Build Spec is agent-facing, exhaustive,
and explicitly not something the owner is expected to review line by line. The design agent
is accountable for the spec being a faithful expansion of the card.

**Rationale**
The owner's scarce resource is attention on product behavior. Spending it on schema shape
and error-handling mechanics is a bad trade, and asking for it anyway produces approval
theater. Separating the documents lets each be written well for its actual reader.

**Alternatives considered**
- **One document with an owner-facing summary at the top.** Rejected: the summary drifts
  from the body, and there is no forcing function to keep it honest.
- **Owner reviews the spec.** Rejected: it does not survive contact with a real owner's
  calendar, and pretending otherwise makes the approval gate fictional.

**Consequences**
- Translation fidelity becomes a named responsibility, and a review item.
- Review must check the built code against the *card*, not only the spec — the spec could
  be a faithful expansion of nothing.
- The 30–60 second constraint puts real pressure on feature size, which is a benefit.

---

### DEC-002 — GitHub is the authoritative handoff surface; chat is transport

**Date:** 2026-08-22
**Status:** Accepted

**Context**
Implementation agents naturally produce their most complete account of the work in the chat
response. That account is not attached to the diff, not searchable by the next agent, not
visible to a reviewer weeks later, and gone when the session ends.

**Decision**
The full Implementation Handoff goes in the pull request body. The final chat response is
deliberately minimal — a PR reference, completion status, headline validation, whether
there were deviations. Project memory updates ship in the same PR.

**Rationale**
Durability and attachment. A handoff in the PR sits next to the code it describes, forever.
Keeping chat minimal is not stylistic: a full duplicate in chat teaches everyone that chat
is where the real information lives, and immediately starts diverging from the PR.

**Alternatives considered**
- **Full handoff in both places.** Rejected: two versions, one of which is wrong.
- **Handoff in a committed file rather than the PR body.** Rejected: the PR body is where
  reviewers already look, and it updates without a commit.

**Consequences**
- An agent working without GitHub access cannot complete a Build OS handoff. Accepted.
- Chat responses that look terse are correct, and reviewers should not read terseness as
  incomplete work.

---

### DEC-003 — Specs classify every choice as owner decision, implementation discretion, or escalation

**Date:** 2026-08-22
**Status:** Accepted

**Context**
Two opposite failures are common. An agent silently changes product behavior because a
requirement was awkward. Or an agent stops every twenty minutes to confirm a naming choice.
Both come from the same missing thing: no stated boundary between what is the owner's to
decide and what is the agent's.

**Decision**
Every Build Spec states three categories explicitly — numbered owner decisions that may not
be silently changed, an affirmative statement of what the agent may decide alone, and the
specific conditions that require stopping. The default posture is reasonable technical
judgment where owner-facing behavior is unaffected.

**Rationale**
Naming the boundary is what makes both failure modes detectable. Numbered owner decisions
(`OD-n`) can be traced to code in review, which turns "were owner decisions silently
changed?" from a judgment call into a checklist.

**Alternatives considered**
- **List only escalation conditions.** Rejected: an agent unsure of its authority
  over-escalates, and the framework becomes slow enough that people route around it.
- **Trust the agent's judgment throughout.** Rejected: it works until it doesn't, and the
  failure is invisible until someone notices the product changed.

**Consequences**
- Spec writing takes longer, because the design agent must decide which category each
  behavior falls into.
- Review gains a mechanical check it would otherwise have to perform by intuition.
- Escalation is defined narrowly, on purpose: it is for product behavior, not technical
  uncertainty.

---

### DEC-004 — Durable design state lives in the repository as workstreams, not in chat history

**Date:** 2026-08-22
**Status:** Accepted

**Context**
v0.1 assumed one design conversation per feature. Real projects run several efforts at once,
across many conversations, over weeks. The state of those efforts — what is settled, what is
open, what the current model is — lived only in chat history and in the owner's memory of
which chat said what. Resuming meant the owner reconstructing context by hand, and a new
agent could not start at all.

**Decision**
Introduce the workstream: one meaningful design/build thread with a stable `WS-###` ID, a
phase from a defined lifecycle, and a file in the project repository. Add
`docs/workstreams/` as a third project-memory layer with an `ACTIVE.md` control board.
Persist conclusions, models, decisions, unresolved questions, and current state at
meaningful checkpoints. Never archive whole chat transcripts.

**Rationale**
The unit of design work is a thread of intent, not a conversation, a branch, or a PR — all
three of which a single effort routinely outlives. Giving that thread an ID and a file makes
it addressable from a chat, a Build Card, a spec, a PR, and a decision entry. Distillation
rather than transcript archiving is what keeps the layer readable: a transcript records
thinking, a workstream file records what the thinking produced, and only the second is worth
reading three weeks later.

**Alternatives considered**
- **Track design state in GitHub issues.** Native, linkable, already there. Rejected: issues
  are a task list, not a mental model; long-form design state renders badly in comment
  threads and cannot be diffed or reviewed alongside the code it describes.
- **One long-lived design document per project.** Simpler. Rejected: parallel efforts in
  different phases collapse into one narrative, and the board view — what is in flight and
  where — disappears.
- **Archive chat transcripts in the repository.** Complete by construction. Rejected: at
  volume it is unreadable, and it buries the conclusions it was meant to preserve.

**Consequences**
- Projects gain a third memory layer, and with it the obligation to keep three files from
  drifting. `PROJECT_MEMORY.md` and `WORKSTREAMS.md` both address this by assigning each
  layer a narrower home and preferring links over restatement.
- Workstream completion becomes the moment that feeds the other two layers: outcome to
  `PROJECT_MODEL.md`, rationale to `DECISIONS.md`. `COMPLETE` now means more than merged.
- Review gains a tenth item, checking the workstream record against what happened.
- The checkpoint policy is deliberately loose. Requiring a write per exchange would be
  precise and would be abandoned within a week.

---

### DEC-005 — Persistence is never claimed without write access

**Date:** 2026-08-22
**Status:** Accepted

**Context**
Design agents run in environments with varying GitHub access: full write, read-only, or none
at all. A protocol whose value rests on "the repository is authoritative" fails completely if
an agent reports a checkpoint it could not actually perform. The owner then believes state is
durable when it is not, and discovers otherwise at the worst moment — when resuming from it.

**Decision**
Define three explicit cases. With write access, the agent updates the checkpoint directly and
says what it wrote. With read-only access, it produces a precise repository-update block —
exact file, exact fields, exact replacement text — carried into the next implementation
handoff for an authorized agent to apply. With no access, it continues the Design Room and
states clearly that repository state is not synchronized. In all three:
**never falsely claim durable persistence.**

**Rationale**
Degraded capability is fine; silent degradation is not. Making the read-only path produce a
mechanically applicable block means the checkpoint is only delayed, not lost — which removes
the incentive to paper over the gap. Making the implementation agent's application of that
block an explicit step of the handoff protocol closes the loop.

**Alternatives considered**
- **Require write access to run the protocol.** Clean guarantee. Rejected: it excludes the
  most common ChatGPT configuration, which is exactly where this framework's design work
  happens.
- **Let the agent decide how to report partial persistence.** Rejected: this is precisely the
  situation where a helpful-sounding summary does the most damage.

**Consequences**
- The implementation agent inherits a duty it did not have in v0.1: apply the design agent's
  update block, and report it if the block conflicts with what was built.
- Build Specs gain a home for that block, in *Required documentation updates*.
- "Phantom persistence" is named as an anti-pattern in both `WORKSTREAMS.md` and
  `DESIGN_ROOM.md`, because it is the single failure that would make the whole memory layer
  worthless.
