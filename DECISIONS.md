# Decisions — Build OS

Consequential decisions about the framework itself, recorded in the format Build OS
prescribes for projects. Build OS dogfoods its own protocol.

**Build OS v0.5**

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

---

### DEC-008 — The Project Intelligence Companion is a separate application, staged out of this repository

**Date:** 2026-08-23
**Status:** Accepted

**Context**
Build OS defines itself as a protocol, not an application: documentation, templates, and
contracts, with no code, dependencies, or services. The Companion (design PR #4,
`plans/PROJECT_INTELLIGENCE_FEED.md`) is the opposite — a web service with a database,
background workers, GitHub authentication, and eventually an audio pipeline. Putting it in this
repository would make "Build OS is a protocol" false the moment the first dependency lands.

**Decision**
The Companion application targets a dedicated repository, `50thycal/build-os-companion`.
Protocol contracts and Build OS integration specifications stay here:
`framework/AGENT_SESSION_CHECKPOINT.md`, `framework/BUILD_OS_PARSE_CONTRACT.md`, and
`contracts/`.

Because that repository does not exist yet and could not be created from the implementing
session, the move is **staged**:

1. Phase 0 — pure domain, parsers, attention rules, fixtures, and tests — lands here as a
   self-contained package under `companion/`, with its own manifest and no imports from anything
   outside that directory.
2. The package is extracted to `50thycal/build-os-companion` before any infrastructure —
   database, web server, authentication, hosting — is added.

**Rationale**
The boundary matters more than the timing. A self-contained package with its own manifest can be
extracted in one commit; a Companion whose modules reach into the protocol documentation cannot
be extracted at all. Staging lets the domain work proceed immediately, which is what the owner
asked for, without pre-committing this repository to housing a web service.

Phase 0 is also the safest thing to host temporarily: it is pure logic with test-only
dependencies, so this repository gains nothing that would survive the extraction.

**Alternatives considered**
- **Build the whole Companion here under `companion/`.** Simplest today. Rejected: the first
  Postgres migration and the first server process turn the protocol repository into an
  application repository, and nothing later un-does that.
- **Block until the dedicated repository exists.** Cleanest boundary. Rejected: the owner
  explicitly asked that this question not block the domain-model work, and the domain model is
  the part that most needs to be settled early.
- **Split protocol contracts into a third repository.** Rejected: the contracts describe Build OS
  artifacts, so they belong with Build OS. A third repository would be one more thing to keep in
  version step.

**Consequences**
- The extraction is a scheduled, named piece of work rather than a vague intention. Until it
  happens, `companion/` must not import from outside itself, and this repository must not gain
  runtime dependencies on its account.
- `50thycal/build-os-companion` must be created by the owner; the implementing session's GitHub
  app could not create repositories.
- The Companion's workstream board lives in `docs/workstreams/` here for now and moves with the
  package. Build OS thereby runs its own protocol on itself, which had been an open follow-up
  since v0.2.

---

### DEC-009 — One normalized event ledger; the feed and the podcast are renderers

**Date:** 2026-08-23
**Status:** Accepted

**Context**
The Companion has to answer both "what changed across my projects" on screen and "read me a
catch-up" as audio. The obvious implementation — a feed that reads GitHub directly, and a
briefing generator that also reads GitHub directly — produces two pipelines over the same
sources.

**Decision**
All sources normalize into one append-only event ledger. A state projection is built from it.
Feed, written briefing, and podcast are renderers over that shared state and have no source
access of their own.

Every event carries a `source_fingerprint` derived from the source facts, making ingestion
idempotent, and provenance identifying exactly which source produced it.

When sources disagree, precedence is fixed:

```text
canonical Build OS artifact in GitHub
    > GitHub PR / review / CI state
    > explicit agent session checkpoint
    > AI-derived inference
```

Disagreements are surfaced, never silently merged. LLM output is derived content and may never
become canonical state.

**Rationale**
Two pipelines over one set of sources drift, and the drift shows up as the feed and the podcast
telling the owner different things — at which point the owner has to reconcile them, which is
the burden the product exists to remove. The plan names this as a failure condition outright.

Idempotency and precedence are cheap to build in and effectively impossible to retrofit: they
determine the shape of the ledger table and the ingestion path.

**Alternatives considered**
- **Query GitHub per renderer, cache aggressively.** Simpler, no ledger. Rejected: no history, so
  "what changed since I last checked" cannot be answered, and each renderer re-derives meaning
  independently.
- **Store raw webhook payloads and interpret at read time.** Rejected: pushes interpretation into
  every renderer, which is the drift problem in a different place.
- **Let an LLM resolve source conflicts.** Rejected: conflicts are precisely where the owner
  needs to see both facts, and a plausible merge is worse than a visible contradiction.

**Consequences**
- Ingestion must compute a stable fingerprint per source fact before writing. Getting this wrong
  produces duplicate feed cards, which is the most visible possible failure.
- The written briefing becomes a required intermediate for the podcast — it is the layer where
  factual errors are caught before they are spoken.
- Adding a renderer later (weekly retrospective, notifications, health scoring) is cheap, because
  none of them need source access.

---

### DEC-010 — Agent session checkpoints carry state, never transcripts

**Date:** 2026-08-23
**Status:** Accepted

**Context**
Between durable Build OS checkpoints there is a visibility gap: an agent may work for hours with
nothing observable outside its chat window. The obvious fix is to read the transcript. Build OS
exists partly to prevent exactly that, and DEC-002 and DEC-004 already say chat is transport,
not memory.

**Decision**
Agents publish structured session checkpoints describing state — objective, phase, completed,
in progress, blockers, next step, related PR — against
`contracts/agent-session-checkpoint.v1.schema.json`. The schema has no field capable of holding
conversation text and sets `additionalProperties: false` so one cannot be added by accident.

A checkpoint committed to GitHub is durable and authoritative. A checkpoint posted to a service
is ephemeral, marked derived, and outranked by durable state.

`UNKNOWN` is excluded from the status enum: a session that stops checkpointing is assigned
`UNKNOWN` by the consumer. Silence never becomes `COMPLETED`.

**Rationale**
State is what anyone actually needs — the owner wants to know whether a session is live, on
what, and whether it is stuck. A transcript is a recording of thinking, unreadable at volume, and
making it the integration would quietly reinstate chat as the source of truth.

Excluding `UNKNOWN` from the enum enforces the important asymmetry in the schema rather than in
prose: an agent can report what it knows, but only a consumer can conclude that a session went
quiet.

**Alternatives considered**
- **Scrape transcripts.** Richest data, zero agent cooperation required. Rejected on the
  framework's central principle, and because it makes an unreviewable artifact load-bearing.
- **Infer session state from commit and CI patterns.** No agent cooperation needed. Rejected:
  inference is bottom of the precedence order for good reason, and a wrong inference about
  whether work is live is exactly the error the owner would act on.
- **Let agents report `UNKNOWN`.** Rejected: it invites an agent to close out its own ambiguity,
  which is the one thing it cannot do honestly.

**Consequences**
- Adoption depends on the checkpoint being one small POST. Anything heavier will not be called,
  and the contract is deliberately small for that reason.
- Consumers must run a staleness sweep, and must show a checkpoint that contradicts GitHub as a
  contradiction rather than resolving it.
- The visibility gap narrows but does not close: a session that never checkpoints is invisible,
  which is the correct outcome — invisible is honest, inferred is not.

---

### DEC-011 — The Companion has been extracted; this repository is protocol only

**Date:** 2026-08-24
**Status:** Accepted

**Context**
`DEC-008` staged the Companion here as a self-contained `companion/` package and committed to
extracting it before any infrastructure landed. That point arrived: the application needed
durable persistence, a web server, and a configuration file naming the repositories it follows.

**Decision**
The application now lives in `50thycal/build-os-companion`, moved with its history via
`git subtree split`. `companion/` is removed from this repository, and the Companion program's
workstreams — WS-001 … WS-006 and their board — move with it, exactly as
`docs/workstreams/ACTIVE.md` said they would.

This repository keeps what makes it a protocol: `framework/`, `contracts/`, `templates/`,
`plans/`, `DECISIONS.md`, and `VERSION.md`. It contains no code and no dependencies again.

The Companion vendors protocol contracts under its own `contracts/` directory so it can parse
offline and test deterministically. That copy is checked rather than trusted: an offline test
pins each file to a recorded hash, and a networked check compares that hash against this
repository. **This repository remains canonical.** A contract change is made here first and
vendored down afterwards, never the reverse.

**Rationale**
`DEC-008` said the boundary mattered more than the timing, and that a self-contained package
with its own manifest could be extracted in one commit. That held — the extraction was
mechanical. Doing it before the first database migration is what kept it that way.

Leaving the package here after the application acquired a server would have made "Build OS is a
protocol" false in the same way `DEC-008` set out to prevent, only later and with more to unpick.

**Alternatives considered**
- **Copy rather than move.** Rejected outright: two independently evolving copies of an
  application is the failure mode staging existed to avoid, and the second copy is always the
  one somebody edits by accident.
- **Move the contracts too, and have the Companion own them.** Rejected: the contracts describe
  the protocol, and other projects adopt them without adopting the Companion. Vendoring with a
  drift check gives the Companion offline determinism without moving canonical authority out of
  the protocol repository.

**Consequences**
- This repository has no build, no tests, and no dependencies.
- A protocol contract change must be vendored down to the Companion; its
  `npm run contracts:check` is what notices.
- The Companion program's history is split across two repositories at the extraction commit.
  `git log --follow` does not cross that boundary; this entry is the pointer.

---

### DEC-012 — Owner input is captured before it is processed

**Date:** 2026-08-24
**Status:** Accepted

**Context**
A recurring failure in real sessions: the owner is producing raw material — playtest notes, a
list of complaints, a stream of ideas — and the agent responds to each item as it arrives.
The owner then has to argue with the analysis instead of reporting the next observation, and
the rest of the run never gets recorded. Worse, an offhand remark treated as a decision
reaches a Build Card as something the owner "agreed."

**Decision**
Build OS adds **Capture Only**, a named session mode. On the first clear signal — "just
capture this", "don't act yet", "playtest notes" — the design agent acknowledges once and
records. While active it does not analyze, recommend, decide, write to the repository, or
start implementation, and does not ask again for confirmation. Observations accumulate across
messages. A direct owner question is answered and the mode continues; only the owner ends it.

Ending requires a consolidation separating four things: **Observations** in the owner's
words, **Interpretations** labelled as the agent's, **Proposed rules** that are not decided,
and **Approved decisions** — only what the owner explicitly approved, usually empty. Only the
fourth may reach a Build Card.

Capture Only stores no transcripts and no recordings.

**Rationale**
The confusion this prevents is not between good and bad ideas; it is between *who said what*.
Once an interpretation is written in the same voice as an observation, no later reader can
separate them, and the fix that turns out to be wrong takes the true observation down with
it.

It is a session mode rather than a lifecycle phase because the workstream has not moved: the
owner is feeding the same phase it was already in.

**Alternatives considered**
- **Ask the owner to confirm capture mode each time.** Rejected: the confirmation is itself
  the interruption the mode exists to prevent.
- **Let the agent decide when input is "raw enough" to hold.** Rejected: the agent's judgment
  about when to start analyzing is exactly what is failing.
- **Record the session and consolidate from the recording.** Rejected outright — it
  reinstates transcripts as project memory, against DEC-002 and DEC-004.

**Consequences**
- The design agent must hold an unbounded observation set for the length of a session, and
  say plainly if a session ends before consolidation rather than writing a partial one.
- Consolidations will often end with "Approved decisions: none." That is the mode working.
- Instructions templates carry the entry phrases, because a mode nobody knows how to enter
  does not exist.

---

### DEC-013 — Significant work merges only on an independent verdict naming the current head

**Date:** 2026-08-24
**Status:** Accepted

**Context**
Build OS has required independent review since v0.1, but review had no closing condition. A
PR could be approved in conversation, or approved and then pushed to five more times, or
merged by the agent that wrote it, and nothing in the protocol distinguished any of those
from a reviewed change. In practice work merged before review and was only examined
afterwards.

**Decision**
A significant PR does not merge until an independent reviewer records `Approved` or
`Approved with follow-ups` against the PR's **current head**, written as a full
40-character SHA, with no unresolved Blocking or Should fix finding and the project's own
validation green.

An approval that names no head does not count; it is treated as `In review`. An abbreviated
SHA is not accepted. Any executable, test, dependency, migration, configuration, or
behavior-documentation change after the reviewed head invalidates the approval — tests
included, because they are the evidence the review rested on. The implementation agent may
not approve or merge its own significant PR; owner direction can replace the merger, never
the reviewer.

Work merged before review is recovered explicitly — finding published on the merged PR,
focused corrective PR, workstream back to `BUILDING`, independent re-review — and merged
history is never rewritten.

**Rationale**
A verdict belongs to a commit, not to a pull request. Without a named head, "approved" is a
statement about a conversation, and the thing that eventually merges may share nothing with
what was read. The full SHA is the cheapest possible proof and the only one that survives a
force-push.

Requiring it as protocol rather than as branch protection keeps the rule available to every
adopting project, including those where nobody can configure the repository.

**Alternatives considered**
- **Require branch protection and a CI gate.** Stronger, and unavailable to most projects
  Build OS targets. Rejected as a *requirement*; projects remain free to add it.
- **Approve the PR rather than a commit.** Rejected: it is the current behavior, and it is
  what allowed a review of one diff to authorize the merge of another.
- **Allow abbreviated SHAs for readability.** Rejected: a seven-character prefix cannot prove
  which commit was reviewed, and proof is the entire purpose of the field.
- **Let the implementation agent merge when tests are green.** Rejected: green tests prove
  the tests pass, not that the built thing is what the owner approved.

**Consequences**
- Reviews become slightly more expensive: a PR that keeps moving needs re-verification.
  That cost is the mechanism, not a side effect.
- Adopting projects bring still-open significant PRs under the gate, which will occasionally
  be discovered at merge time. The migration notes say so explicitly.
- `Verdict` and `Reviewed head` become machine-readable fields, so a consumer can surface a
  stale or missing approval without any project running tooling.

---

### DEC-014 — Durable memory is finalized on the PR, before the merge

**Date:** 2026-08-24
**Status:** Accepted

**Context**
Workstream files on `main` were routinely false the moment a PR merged: phase `REVIEW`,
Implementation State "PR open", next step "await review" — describing a state that ended at
merge. The remedy available under v0.4 was a second PR whose only content was bookkeeping,
and that PR was rarely opened.

**Decision**
After approval and before merge, the implementation agent pushes one **documentation-only**
commit to the same PR, setting the workstream, `ACTIVE.md`, `Review State`, Implementation
State, Related PRs, and Next Step — plus `PROJECT_MODEL.md` and `DECISIONS.md` where the
workstream completes — to what becomes true when the PR lands.

That commit may touch only those surfaces. Any executable, test, dependency, configuration,
or behavior-documentation change in it reopens full review. The reviewer verifies the final
head and records it; the merge targets that exact SHA.

**Rationale**
It looks like a violation of the rule that durable memory describes current reality, and it
is worth stating why it is not: the commit is only ever true on `main`. On the branch it is a
proposal like every other commit in an open PR, and if the PR is closed the claim never
becomes a claim about the project.

The lightweight final-head verification is safe only because the permitted surfaces are inert
— which is why the list is closed rather than "documentation, broadly."

**Alternatives considered**
- **A routine follow-up PR.** Rejected: doubles the review surface for zero information, and
  empirically does not get opened.
- **Update `main` directly after merging.** Rejected: an unreviewed direct commit to `main`,
  and it leaves a window where the record is false.
- **Accept stale workstreams and rely on tooling to flag them.** Rejected: it makes the
  durable layer unreliable and offloads the consequence onto projects running a Companion,
  which most do not.

**Consequences**
- A PR abandoned after finalization must be un-finalized, and the protocol says so.
- The reviewer is asked for one more small verification per PR.
- `main` becomes readable as a true record of the board at any commit, which is what makes an
  arriving agent's first read trustworthy.

