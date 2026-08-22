# Decisions — Build OS

Consequential decisions about the framework itself, recorded in the format Build OS
prescribes for projects. Build OS dogfoods its own protocol.

**Build OS v0.1**

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
