# Decisions — Build OS

Consequential decisions about the framework itself, recorded in the format Build OS
prescribes for projects. Build OS dogfoods its own protocol.

**Build OS v0.3**

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

---

### DEC-006 — Adopted versions are pinned, and a preflight makes staleness visible

**Date:** 2026-08-22
**Status:** Accepted

**Context**
Downstream projects reference a Build OS version rather than forking the framework, which
keeps work reproducible and stops a framework change from redefining an in-flight effort. But
nothing required anyone to notice when canonical moved. A real case: `50thycal/build-os`
reached v0.2 while `50thycal/party-games` still declared v0.1, so any session on that project
would run the pre-workstream process indefinitely, with nothing looking wrong.

**Decision**
Keep pinning. Add a framework compatibility check — compare the project's adopted version
against canonical `VERSION.md` before substantial design work, a Build Spec, significant
architectural implementation, or review of a significant PR. Act on the delta according to
version semantics: acknowledge a patch, inspect and migrate a minor, migrate before continuing
on a major. Explicitly not for every trivial edit or message.

**Rationale**
The two failure modes are symmetric and both silent: working under a version that no longer
exists, and adopting whatever is on `main` without reading what changed. A pin without a check
produces the first; dropping the pin produces the second. A preflight at four named moments
costs one file read per session and converts the pin from an accident into a decision.

Migration notes live in `VERSION.md` because that is the file the check already reads —
splitting "what version" from "what changed" across two files would mean an agent reads the
first and skips the second.

**Alternatives considered**
- **Track `main`.** No staleness by construction. Rejected: an in-flight effort silently
  changes shape mid-design, which is the thing pinning exists to prevent.
- **Check on every message.** Maximally safe. Rejected: it becomes ceremony, then noise, then
  the first thing skipped.
- **CI that opens issues on stale repositories.** Attractive, and documented as possible
  future work. Rejected for now: automation built before the manual protocol has been
  exercised encodes guesses, and a bot filing upgrade issues nobody acts on is worse than no
  bot. The protocol must work through agents first.

**Consequences**
- Every version bump now owes a migration-notes entry, including "no project changes
  required" — that entry is what lets a downstream agent stop reading quickly.
- Review gains an eleventh item, and the handoff a `Framework:` field, so a claimed check is
  falsifiable.
- Projects may legitimately sit behind canonical after inspecting a delta. That is a decision
  and should be recorded as one; what is ruled out is sitting behind with nobody having
  looked.
- A migration is bounded to protocol artifacts. Rewriting a project's architecture or decision
  log because the framework changed is a defect, not thoroughness.

---

### DEC-007 — Framework state lives in the agent-instructions file, and local rules are marked

**Date:** 2026-08-22
**Status:** Accepted

**Context**
The compatibility check needs three facts from an adopted repository: where canonical lives,
which version the project follows, and which version was last compared against. It also needs
to tell the difference between a deliberate project-specific rule and a leftover from an old
framework version — otherwise a migration either clobbers local decisions or preserves
staleness, and cannot tell which it is doing.

**Decision**
Record the three fields as a small block in the project's existing agent-instructions file
(`CLAUDE.md` or equivalent) — no new metadata file, no schema, no tooling. Require
project-specific protocol additions to be marked `Project-specific:`. When a project-specific
rule conflicts with a newer Build OS requirement, surface the conflict to the owner rather
than resolving it silently.

**Rationale**
`CLAUDE.md` is already read at the start of every session by every agent that matters; a
dedicated metadata file would be read by nothing that does not already read it, and would be
one more thing to forget to update. Keeping last-checked separate from adopted version is what
distinguishes *checked and unchanged* from *never checked* — the adopted version alone cannot
express the difference, and that difference is the entire signal.

The `Project-specific:` marker is cheap and load-bearing: without it, local additions and
framework staleness are textually identical.

**Alternatives considered**
- **A `.buildos.yml` or similar.** Machine-readable, easy to lint later. Rejected: unnecessary
  infrastructure for three fields, and it would need its own discovery mechanism.
- **Infer the version from which artifacts exist.** No metadata at all. Rejected: unreliable,
  and silently wrong for a project that partially migrated.
- **Let agents resolve project-vs-framework conflicts themselves.** Rejected: the project rule
  may exist for a reason the framework does not know about. Either answer can be right, so the
  owner picks.

**Consequences**
- Adoption gains three lines in a file every project already has.
- Future automation, if built, has a stable thing to read — noted in `FRAMEWORK_SYNC.md`
  rather than built.
- Projects that never mark their local rules will have them treated as framework text during a
  migration. The marker is documented in adoption instructions and in the ChatGPT Project
  template to make that unlikely.
