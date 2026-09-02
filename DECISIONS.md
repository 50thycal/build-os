# Decisions — Build OS

Consequential decisions about the framework itself, recorded in the format Build OS
prescribes for projects. Build OS dogfoods its own protocol.

**Build OS v0.10**

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


---

### DEC-015 — A verdict may be a comment, in a form nothing writes by accident

**Date:** 2026-08-25
**Status:** Accepted

**Context**
DEC-013 makes a merge conditional on an independent verdict naming the current head, and v0.5
implemented that verification against GitHub's review record, which stamps a review with the
commit id it was submitted against.

GitHub refuses to let an account submit `APPROVE` or `REQUEST_CHANGES` on a pull request it
authored. A repository worked by one account therefore cannot produce that artifact at all.
This one is such a repository, and the consequence was immediate rather than theoretical:
v0.5 shipped through four rounds of genuine independent review, every one of which arrived as
a **comment** because GitHub had nowhere else to put it, and both PRs merged reported as
`MERGED_WITHOUT_APPROVAL` by a gate with no reachable satisfying state.

A gate that cannot be satisfied is not strict. It trains everyone to merge past it.

**Decision**
A verdict may be given as a pull request comment, read only in a fixed form: a
`Build OS review verdict:` line naming one of the five verdicts, a `Reviewed head:` line naming
a full 40-character SHA, a `Review actor:` line naming who issued it, and an
`Implementation actor reviewed:` line naming who the reviewer understood they were reviewing.
Quoted, fenced and HTML-commented text carries no verdict.

**Positions are keyed on the actor, never on the GitHub login.** That is the substance of this
decision rather than a detail of it: the premise is a repository where the login is transport
and several actors share it, so keying on the login merges an independent reviewer with the
implementation agent and lets whichever spoke last replace the other. Two actors through one
account are two reviewers; one actor speaking twice is one position, the later one.

**Evidence must not be able to move after it is given**, which is the other half of the same
principle. A comment is editable in place and the PR body is editable without moving the head,
so both authoritative inputs could otherwise be rewritten after a review: a `Changes required`
turned into an `Approved`, or a self-review made independent by editing the body to name a
different implementer. Therefore independence is decided by the **pair inside the verdict** —
`Review actor` against `Implementation actor reviewed` — never against the body's current
declaration; an **edited comment never clears the gate** (corrections go in a new comment); and
where the body disagrees with what a verdict recorded, the gate **fails closed and reports**
rather than choosing a side.

Absent either actor, or where they match, the verdict is recorded as given but does not clear
the gate — while an objection closes the gate whoever raised it, edited or not. Refusing to open
on doubtful evidence and refusing to close on it are not symmetric, and only one is safe.

This is stated as a clarification of v0.5, not a new version: `REVIEW_PROTOCOL.md` already
named a PR comment as equivalent evidence, and this fixes the shape so a tool can read it. No
existing file becomes invalid and no new obligation is added.

**Rationale**
The alternative to reading the evidence a project actually produces is a gate that reports a
violation forever, which is worse than no gate: a permanent warning is indistinguishable from
noise, and the first thing anyone does with it is stop reading it.

The form carries the head for the same reason a review's `commit_id` is trusted — it ties the
verdict to a commit that already existed when the verdict was given, so a later push cannot
inherit it.

**What this deliberately does not claim.** It does not *verify* independence. An actor
identifier is an assertion, and in a single-account repository nothing stops a false one. What
the form buys is that independence becomes something the record states and can be checked
against — rather than something a reader must assume — and that two actors stop being silently
merged. The same standing as an owner decision relayed through an agent, which must name its
channel rather than pass as something stronger.

The first draft of this decision stopped at "does not establish independence" and left it there,
documenting the limitation instead of narrowing it. Independent review of the PR pointed out
that the reader then actively *merged* distinct actors — weakening the very invariant the form
claimed to serve — and that the record could not answer who issued a verdict. The actor field is
the correction. Where independence matters most, use a second GitHub identity, which GitHub
itself authenticates.

**Alternatives considered**
- **Require a second GitHub identity.** Not rejected — it is the stronger answer and the
  protocol says to use one where independence matters most. Rejected as a *precondition*,
  because it makes the gate depend on account administration a solo project may not do, and
  until then every merge is ungated.
- **Accept `MERGED_WITHOUT_APPROVAL` as the permanent state here.** Rejected: it makes the
  release's central check inert on the project that wrote it.
- **Read any comment containing an approving word.** Rejected: it makes "looks good to me" a
  merge authorization, and every quoted review table an approval.
- **Key positions on the GitHub login and note the limitation in prose.** Rejected on review,
  correctly: it silently merges actors, so the gate could be opened or closed by the wrong one.
- **Infer independence from the actor's name** (a `-independent-` convention, say). Rejected:
  magic strings that anyone can type, dressed as verification.
- **Compare the verdict against the PR body's current `Implementation actor`.** Rejected on
  review, correctly: the body is editable and the head does not move when it changes, so a
  non-clearing self-review could be made clearing afterwards without touching the code.
- **Accept edited comments and note the edit.** Rejected: an approval that can be written after
  the fact is not evidence of what was approved, and a note beside it does not change that.

**Consequences**
- The gate is satisfiable in a single-account repository, which is most projects adopting this.
- Reviewers have one form to learn, and it is four lines. Two of them — the actor pair — exist
  only because the record has to survive later edits to the surfaces it lives on.
- A reviewer who edits their own verdict silently disarms it. The protocol says to post a new
  comment instead, and the tool reports the edit rather than failing quietly.
- A consumer reading verdicts must strip quotes, fences and HTML comments first — Build OS's
  own PR comments quote the review table, and would otherwise issue verdicts by discussing them.
- The strength of the evidence now varies by who posted it, which the record has to carry
  rather than flatten.
- **The PR handoff's `Implementation actor` is a cross-check, not a gate.** A complete verdict
  clears on its own captured pair even where the handoff declares nothing; where the handoff
  declares something different, the gate fails closed and reports. An earlier draft of this
  decision made the handoff authoritative, which reintroduced the mutability this decision
  exists to remove — a body edit could have turned a self-review independent. The field is still
  worth writing: it is what makes a contradiction detectable at all.

---

### DEC-016 — The owner reads a projection of the record, never a second copy of it

**Date:** 2026-08-29
**Status:** Accepted

**Context**
By v0.5 the framework was working and the artifacts were durable, and an owner who wanted to
know whether they could merge read a Build Card, a PR handoff, a review summary and a
workstream file — four documents, three of them written for somebody else. The handoff carried
an *Owner Summary*, which described what changed but not what to do about it, leaving the owner
to derive the answer from the sections above it.

That is a real cost and it compounds: rigor that only survives at a desk is rigor a project
abandons on the first busy week, and the way it gets abandoned is not a decision anyone records.

The obvious fix — write the owner a short summary — is the one that fails, because a summary
written independently of the record becomes a second record, and the two disagree within a week.

**Decision**
Build OS has an **owner layer** and an **engineering layer**, and the owner layer is a
**projection** of the engineering layer rather than a source of truth. It has three surfaces:
intent, an Owner Plan where approval is needed, and an Owner Result that is exactly one of
`SHIP`, `DECISION`, or `BLOCKED`.

The Owner Result **replaces** the handoff's Owner Summary rather than joining it. One
owner-facing surface per PR.

Two rules make the compression safe, and they are the substance of this decision:

**A summary may omit detail. It may never omit material truth.** Brevity constrains the
writing, not the content. A deviation, a red check, a stale approval, or an unresolved blocking
finding is material by definition, and no word count excuses dropping one.

**`SHIP` is a report of the merge gate, never a route through it.** It may not be written for
significant work while validation is red, a `Blocking` or `Should fix` finding is unresolved,
there is no independent approved verdict, that verdict is stale, or a material deviation is
undisclosed. Writing one approves and merges nothing. Where the record and the result disagree,
the record wins and the disagreement is reported — never repaired.

A corollary that took a draft to find: **most PRs have no owner result at all.** The three
states are terminal, not a running status, so a PR awaiting review says so and carries no
marker. `SHIP` is written when review clears, not when coding stops — the same error as marking
a workstream `COMPLETE` at merge, where the claim outruns the evidence.

**Rationale**
The projection framing is what stops this becoming the failure it is trying to fix. A summary
that is *derived* can be checked against what it derives from, and a consumer finding a `SHIP`
against a non-approving record has caught something rather than been misled by it. A summary
that is *authored* has no such property, and its being short makes it worse rather than better.

Naming the three states as an enum, rather than leaving the ending to prose, is what lets the
owner know which of three situations they are in before reading a word of it — and what lets a
tool sort a board by "what needs me". Prose cannot be sorted and cannot be checked.

**Alternatives considered**
- **Keep the Owner Summary and add a result beside it.** Rejected: two owner-facing surfaces on
  one PR, drifting immediately, with no rule for which is current.
- **A single summary with a status word in the first sentence.** Rejected: it is prose, so it
  cannot be parsed conservatively, and "mostly ready" would appear within a month.
- **More states — `IN_PROGRESS`, `NEEDS_REVIEW`, `PARTIAL`.** Rejected: every one of them is a
  status the engineering layer already carries, and a status is not a terminal result. The
  absence of a result already says "in flight", which is why the pre-result case needed no
  fourth state.
- **Let `SHIP` mean "the implementation agent believes this is done".** Rejected: that is what
  the handoff already says, and attaching it to a word the owner will read as authorization
  hands the implementing party the approval the gate exists to withhold.

**Consequences**
- The owner's default reading path is one section, and the durable evidence is untouched
  beneath it.
- The gate is unchanged, and a `SHIP` that contradicts it is now a *detectable* error rather
  than an unexamined claim — `OWNER_RESULT_CONTRADICTED` in the parse contract.
- An implementation agent has one more thing it can get wrong in a visible way, which is the
  trade being made deliberately: a false `SHIP` is worse than a false handoff section, and it is
  also much easier to catch.
- Projects with local PR templates must replace a section. Nothing else in their history changes.

---

### DEC-017 — Intent has no privileged entry point

**Date:** 2026-08-29
**Status:** Accepted

**Context**
Build OS was written around a design agent and an implementation agent, and the documents said
so concretely enough that the shape hardened into a requirement: the Design Room was where
features came from, and `DESIGN_ROOM.md` described a ChatGPT Project as though it were the
front door rather than one door.

In practice intent arrives wherever the owner is. A one-line fix typed at an implementation
agent is not a lesser kind of work with no protocol; it is ordinary work, and a framework that
has nothing to say about it is a framework people route around for anything small — which is
most changes.

**Decision**
Intent may originate with a design agent, an implementation agent, another capable agent, or
directly in GitHub. **The lifecycle semantics are identical in all four cases**, and nothing
about which one it was changes what the work needs.

A single **Intent Intake** contract, satisfiable by any capable agent, is the shared front door:
establish the desired outcome, capture the constraints and non-goals the owner actually stated,
classify the work, create or resume the durable workstream where it is significant, and route
genuine product choices to the owner rather than settling them quietly.

**No product is mandatory** — not ChatGPT, not Claude, not a mobile app, a bot, a hosted
service, or a CI integration. Where documents name a product, they name it as the common case.

**Rationale**
The alternative is not neutrality-by-omission but a de facto requirement nobody wrote down, and
the cost of it is paid entirely by small work — the work most likely to be done at all.

Intake being a contract rather than a document is what keeps it cheap. An implementation agent
performing intake writes nothing; it establishes four things and proceeds. The obligation only
grows where the work does.

Step 5 is the one that carries the weight. Intake is allowed to be fast; it is not allowed to be
where owner decisions get made by an agent in a hurry, which is the failure a fast front door
would otherwise introduce.

**Alternatives considered**
- **Require every change to pass through the Design Room.** Rejected: it is the status quo, and
  it is what sends owners around the framework for anything small.
- **Define a separate lightweight lifecycle for agent-originated work.** Rejected: two
  lifecycles diverge, and work that starts in one and belongs in the other has nowhere to go.
  Proportionality within one lifecycle does the same job without the fork.
- **Say nothing and let projects work it out.** Rejected: they already were, differently, which
  is the drift the framework exists to prevent.

**Consequences**
- An implementation agent now has an obligation before writing code, and it is four lines.
- `DESIGN_ROOM.md` describes an optional deep-design path rather than the universal one, which
  is what it always actually was.
- Work promoted to significant mid-flight needs a workstream created retroactively. That feels
  like paperwork and is not: the promotion is the moment the effort acquired owner decisions
  worth remembering.

---

### DEC-018 — Ceremony is proportional, and the classification only ever ratchets up

**Date:** 2026-08-29
**Status:** Accepted

**Context**
v0.5 said the merge gate is for significant work and that a typo needs no Build Card, but left
"significant" to be judged case by case, in three places, by three different readers. Its one
concrete criterion excluded any change that "does not implement or alter owner-visible
behavior" — which, read literally, made a copy fix the owner had dictated word for word into
significant work needing a Build Card, a spec, and independent review.

**Decision**
Three named classes — **simple**, **significant**, **escalated** — defined once in
`framework/OWNER_INTERFACE.md` and used at intake, at implementation, and at review.

Work is **simple** when the intended behavior is unambiguous, **no owner trade-off is being
chosen on the owner's behalf**, nothing consequential to architecture, data, or security is
involved, and it is not part of a significant workstream and does not claim to complete one.
That second clause replaces v0.5's owner-visibility test and is a deliberate loosening: behavior
the owner supplied is theirs already, while behavior an agent selects for them is not, however
small it looks. "Change the subject line to X" is simple; "make the error message clearer" is
not, because the second half of it is a decision.

**Classification is promoted, never demoted.** Work becomes significant the moment it turns out
to touch an owner decision, an invariant, or documented behavior — including partway through,
and including for what it now needs before merge. Where it is genuinely unclear, it is
significant.

**A result for simple work names the classification.** That sentence is not ceremony; it is what
makes a misclassification visible to the owner while it is still cheap.

**Rationale**
The asymmetry is the whole design, and it exists because the party doing the classifying is the
party the classification constrains. An agent that under-classifies buys itself less work; an
agent that over-classifies costs an hour. A rule that ratchets one way makes the cheap error the
recoverable one.

Stating the criterion positively — *am I choosing something on the owner's behalf?* — turns out
to be the question that actually separates the cases, and it separates them better than size,
than diff count, and than owner-visibility, all of which were tried in drafting and each of
which puts an obvious case on the wrong side.

**Alternatives considered**
- **Keep v0.5's owner-visibility criterion.** Rejected: it makes an owner's own dictated sentence
  into significant work, which is ceremony with nothing on the other end, and it is the kind of
  rule people quietly stop applying.
- **Size or diff thresholds.** Rejected: a one-line change to an owner decision is significant
  and a thousand-line mechanical rename is not. Size correlates with nothing that matters here.
- **Let the owner classify.** Rejected: it puts the owner back in the loop for every small
  change, which is precisely the cost this release exists to remove.
- **Allow demotion when a change turns out smaller than expected.** Rejected: it makes the gate
  opt-out at the discretion of the party it constrains, and a gate with that property is not a
  gate.

**Consequences**
- The same line is drawn in three places instead of three lines being drawn by feel.
- One narrow class of change that was significant under v0.5 is simple under v0.6. Nothing moves
  the other way.
- Owners can audit classifications after the fact, because every simple result states its own.
- An agent that misclassifies and then discovers it must promote mid-flight, which is more work
  than classifying correctly. That cost is deliberate and falls in the right place.

---

### DEC-019 — Reviewer findings return to the implementation agent, not to the owner

**Date:** 2026-08-29
**Status:** Accepted

**Context**
v0.5 established independent review, the reviewed-head gate, and the
`REVIEW → BUILDING → REVIEW` loop, and left one thing to circumstance: *who carries a finding
from the reviewer to the implementation agent.* In practice, where the two are separate sessions
in separate tools, the answer was the owner — reading a review summary, relaying its findings
into another window, and relaying the response back.

That makes the owner a message bus between two agents, on work neither of them needs them for.
It is also the single largest consumer of owner attention in the framework, and none of it is
judgment.

**Decision**
A reviewer's findings are addressed to the implementation agent. Four requirements:

1. The reviewer publishes findings to the **durable surface** — the PR, or the review summary
   committed beside it — not only to a chat transcript. A finding that exists in one session's
   conversation cannot be answered by a different session, which is the condition that made the
   relay necessary.
2. Fixable `Blocking` and `Should fix` findings return to the implementation agent **on the same
   PR**.
3. The implementation agent responds, fixes, validates, restates the head, and requests
   re-review — without owner involvement.
4. The owner is interrupted for exactly three things: a decision genuinely theirs, a genuine
   blocker, and the final ship or merge action.

Reviewer escalation to `DECISION` or `BLOCKED` is defined and deliberately narrow: a finding
only the owner can settle, or a condition that stops work responsibly continuing. Everything
else stays in the loop.

**Automation is optional.** Build OS specifies the contract and the state transitions; a project
may realize the loop with GitHub reviews, agent sessions, CI, or two people talking.

**Rationale**
The requirement that does the work is the first one. Once findings are durable and attached to
the PR, the relay is not so much prohibited as unnecessary — any session can read them, and the
owner was only ever compensating for their absence.

Keeping automation out is what makes this apply to every adopting project. A rule that needs a
bot is a rule most projects do not have, and the framework has held since v0.5 that a gate
nobody can satisfy trains everyone to ignore it.

**Alternatives considered**
- **Specify a GitHub-based automation.** Rejected: it makes the loop conditional on tooling, and
  Build OS deliberately requires none.
- **Let the owner opt into relaying.** Rejected: a default nobody chose is what the status quo
  already was.
- **Allow the reviewer to fix findings directly.** Rejected: it collapses reviewer and
  implementer, which is the one separation the protocol will not bend.

**Consequences**
- The owner's attention is spent on judgment rather than transport.
- Reviewers must publish durably rather than conversationally, which is a real change of habit
  for a reviewer working in a chat window.
- A reviewer can no longer discharge a finding by mentioning it. It has to land somewhere a
  different session can read it.
- The gate, the independence rule, and the reviewed head are untouched: fixing three findings
  has never approved a PR and still does not.

---

### DEC-020 — A terminal result waits until no agent has work left

**Date:** 2026-08-29
**Status:** Accepted

**Context**
`DEC-016` established three terminal owner states and made `SHIP` a report of the merge gate
rather than a route through it. It listed what `SHIP` may not be written over — red validation,
an unresolved blocking finding, a missing or stale verdict, an undisclosed deviation — and that
list stopped at the verdict.

But the v0.5 gate does not stop at the verdict. Two steps follow it, and neither is the
owner's: the implementation agent pushes a documentation-only **merge-finalization** commit, and
the **reviewer verifies the head that commit produced**, on the PR, because a commit cannot name
its own SHA. v0.6 permitted `SHIP` at both of those points and tried to carry the difference in
`Next action` — "Finalize and merge PR #n", "Reviewer verifies the final head, then merge that
SHA".

That is a terminal state whose next action is somebody else's work. The owner, who cannot
perform either step and has no way to tell the three variants apart, is told the thing is ready
and then waits. v0.6's own README called `SHIP` "done and verified" while its operative rules
allowed it twice before that was true — the contradiction was inside the release.

Independent review of PR #13 raised it as `Changes required`, correctly.

**Decision**
**No terminal owner result while agents still have work to do.**

For significant work, `SHIP` requires all six of: green validation actually run; no unresolved
`Blocking` or `Should fix` finding; an independent approved verdict; the merge-finalization
commit pushed; the final head independently verified by the reviewer on the PR; and no
undisclosed material deviation. `Next action` is then **the merge and nothing else**, naming the
exact verified SHA where useful.

The two earlier moments become **no-result** states, alongside first push and the correction
loop. The no-result form now spans the whole mid-flight period and says plainly that nothing is
needed from the owner yet.

`DECISION` and `BLOCKED` are deliberately **not** narrowed, and remain reachable at any point.
The asymmetry is the substance: the rule is not "delay the owner", it is "do not summon the
owner for work that is not theirs". A decision and a blocker *are* theirs, at whatever moment
they appear.

This narrows `DEC-016`'s timing clause. It does not supersede it: the projection model, the
compression contract, the report-not-a-gate rule, and the three-state enum all stand exactly as
recorded there. Per this repository's own rule against rewriting accepted entries, `DEC-016` is
left as written and this entry carries the correction.

**Rationale**
A terminal state earns its name by being terminal. Once `SHIP` can mean "ready, except for two
things somebody else must do", the owner has to read `Next action` closely enough to work out
which of three situations they are in — which is the reading burden the owner layer exists to
remove, reintroduced at the last field.

The narrowing also costs nothing real. The owner was never going to act during those two steps;
all v0.6 bought them was an earlier notification of something they could not use. Trading that
for a state that always means the same thing is a good trade at any exchange rate.

There is a second-order benefit worth recording: `SHIP` is now checkable end to end. A consumer
holding the workstream record and the PR's review evidence can decide whether a `SHIP` is
warranted, because every one of the six conditions is written down somewhere durable. Under
v0.6 two of the three variants were distinguishable only by reading English prose in
`Next action`.

**Alternatives considered**
- **Keep the three moments and rely on `Next action`.** Rejected — this is what review found.
  The distinction is invisible to the owner precisely because they cannot perform either step,
  and a state that means three things means none of them.
- **Add a fourth state for "ready but for bookkeeping".** Rejected: it is a status, not a
  result, and `DEC-016` already rejected adding statuses to a terminal enum. The absence of a
  result says it better and costs no vocabulary.
- **Drop the finalization and final-head steps so approval is the end of the gate.** Rejected
  outright: `DEC-014` and the v0.5 gate exist for good reasons, and weakening review mechanics
  to make a summary field easier to write is exactly backwards.
- **Let the implementation agent verify the final head itself.** Rejected: it is review work on
  its own PR, and the one separation the protocol will not bend.
- **Narrow `DECISION` and `BLOCKED` the same way for symmetry.** Rejected: it would delay the
  two results the owner actually needs early. Symmetry is not the goal; not wasting the owner's
  attention is.

**Consequences**
- `SHIP` always means the same thing, and the owner's next action after reading one is always
  the merge.
- Two more points in a PR's life are no-result states, which makes the no-result form the
  normal content of the Owner Result section rather than a first-push special case.
- The reviewer's final-head verification becomes load-bearing in a way it was not: it is now the
  event that produces the owner's result. A reviewer who approves and walks away leaves the PR
  without one.
- Projects on v0.6 must change agent behavior, which is why this is a minor version rather than
  a patch.
- Simple work is untouched. It has no finalization or independent review to wait on, so three of
  the six conditions do not apply, and its `SHIP` still names the classification that let it
  skip them.

---

### DEC-021 — A project declares whether a reviewer exists, and a solo project says so

**Date:** 2026-08-30
**Status:** Accepted

**Context**
`DEC-013` made a significant merge conditional on an independent verdict naming the current
head. `DEC-015` then met the first obstacle to it: GitHub refuses a review on a pull request the
account authored, so a single-account repository could not produce the artifact at all. The
answer was the comment verdict form.

That fixed the *venue*. It did not fix the *shortage*. There was still one person, one identity,
and one agent, and no amount of form design produces a second party. The evidence is this
repository's own record: **v0.6, its recovery PR, and v0.7 all merged with no verdict of any
kind**, minutes after being opened, each correctly reported as `MERGED_WITHOUT_APPROVAL` by a
gate with no reachable satisfying state. Three consecutive releases of a framework whose central
claim is that nothing significant merges unreviewed.

That is not a discipline problem to be solved by trying harder. `DEC-015` already named the
principle and then under-applied it: *a gate that cannot be satisfied is not strict — it trains
everyone to merge past it.* Applied fully, the same reasoning reaches further than the comment
form did.

**Decision**
A project **declares an operating mode** in its framework block: `reviewed` (default, and what
an absent line means) or `solo`.

In `solo` mode — declared only where no independent actor genuinely exists — acceptance comes
from the **owner**, recorded as `Owner-accepted` against an `Accepted head`, at merge. The
verdict and its head field are deliberately distinct from `Approved` and `Reviewed head`,
because they record a materially weaker thing: that the owner accepted a change **no independent
party examined**. A consumer must never let one satisfy a check written for the other, and a
project that later gains a reviewer does not convert its history into approvals.

**Exactly one thing changes: who accepts.** In particular the implementation agent still may not
approve, accept, or merge its own work — `solo` moves acceptance to the owner, and an agent
writing `Owner-accepted` would be approving its own PR through a differently-spelled field.
Validation, the complete handoff, deviation disclosure, durable memory, finalization, and
`Changes required` closing the gate from any source all stand unchanged. Disclosure becomes
*more* load-bearing, not less: with no reviewer, *Spec Deviations* is the only thing that can
catch an undisclosed deviation.

`solo` is a fallback, not a preference, and the protocol says so: the moment a second actor
exists, the project moves to `reviewed`.

**Rationale**
The choice was between a rule that is aspirational and permanently violated, and a rule that is
narrower and actually true. Build OS's entire premise is that the durable record must describe
reality — `PROJECT_MODEL.md` must not describe the intended design, a workstream must not claim
a state that ended at merge, a verdict must name the commit it saw. A gate asserting a review
that never happens is the same failure, at the level of the protocol itself, and it is the one
place the framework was not applying its own standard.

Making the mode **declared rather than inferred** is what keeps this from becoming an escape
hatch. If a missing reviewer implied `solo`, the gate would be opt-out by neglect, and every
project that simply forgot to get a review would be reclassified as one that could not. A
project must state that it has no second party, and record why.

Keeping `Owner-accepted` in separate fields, rather than letting a solo project write
`Approved`, is the other half. The record's job is to stay honest twenty commits later, when
nobody remembers which mode was in force. Two verdicts that mean different things must look
different.

**Alternatives considered**
- **Keep the gate and try harder to get reviews.** Rejected on evidence: three releases, zero
  reviews, and no mechanism that would have changed it. Restating a rule that is already being
  ignored is not enforcement.
- **Drop independent review from the protocol.** Rejected outright. It is correct and valuable
  wherever a second actor exists, which is most projects. The problem was never the requirement,
  it was asserting it where it cannot be met.
- **Let a solo project record `Approved` and note the mode elsewhere.** Rejected: it makes the
  strongest field in the record ambiguous, and the ambiguity is invisible at exactly the moment
  it matters — someone reading history later.
- **Let the implementation agent accept in solo mode.** Rejected, firmly. It is self-approval
  with extra steps, and it removes the last party between an agent and `main`. The owner is a
  real second party to the *agent*, which is the separation that survives here even when
  independence does not.
- **Infer `solo` from the absence of a reviewer.** Rejected: it makes the gate opt-out by
  neglect, which is the failure mode the declaration exists to prevent.
- **Treat a fresh agent session as the independent reviewer.** Rejected as a general answer,
  though `DEC-013` already permits it where a project genuinely runs one. It does not describe a
  project where the same session does everything, and pretending otherwise would reintroduce the
  false claim this decision removes.

**Consequences**
- The gate becomes satisfiable in every project, which means a violation of it means something
  again.
- `MERGED_WITHOUT_APPROVAL` stops firing permanently on solo projects that record acceptance —
  and still fires where they do not, because the mode replaces the reviewer, not the record.
- The record now carries two grades of acceptance, and consumers must keep them apart. That is
  new surface area, accepted deliberately: the alternative is one grade that lies.
- This repository moves to `solo` and can close WS-008 honestly for the first time. Its three
  unreviewed merges are **not** retrofitted with acceptances — they happened without one, the
  reports about them were accurate, and rewriting that would repeat the error this decision
  exists to end.
- A project can now under-declare `solo` to avoid review. Nothing prevents that, and nothing in
  a document could. What the protocol can do, and does, is make the choice explicit, recorded,
  and visible in every verdict it produces afterwards.

---

### DEC-022 — Skills are a second surface, and the framework document stays canonical

**Date:** 2026-08-30
**Status:** Accepted

**Context**
Build OS had one audience for its protocol: a person reading a document and following it. That
works while the person remembers the document exists. Increasingly the party that should be
following a procedure is an agent, mid-task, at the moment it applies — and asking the owner to
remember that the framework says so is exactly the dependency the framework was built to remove.

#17 introduced `skills/` with the first one, and flagged the structural choice rather than
presenting it as settled: a new top-level artifact class in a repository whose `VERSION.md` says
*Contains code: No*.

**Decision**
`skills/` is a supported surface for **agent-invokable procedures**. A skill is markdown with
frontmatter, so *Contains code: No* still holds.

The boundary: **if the owner needs to read it to make a decision it is a `framework/` document;
if an agent needs to act on it mid-task it is a skill.** Where both are true, the framework
document is **canonical** and the skill points at it. The protocol never carries two statements
of one rule.

**Skills are versionless and adopted by copy.** They are the one part of Build OS exempt from
the compatibility check: a project takes the copy it wants and is not obliged to track later
changes here.

**Rationale**
The boundary is the whole decision; the directory is bookkeeping. Without it a skill is simply a
second place to write protocol, and a second place to write protocol is a guaranteed
divergence — the failure `PROJECT_MEMORY.md` already names for the three memory layers, arriving
by a new route.

It was not a hypothetical risk. The first skill restated the owner-facing decision contract
without referencing `OWNER_INTERFACE.md`, which already specifies one terminal result per piece
of work in a machine-readable form. Two descriptions of the same thing, from the first commit.
Enforcing the boundary on arrival is what this decision is for, and it is worth noticing that
the skill's own README stated the rule correctly and the skill beside it broke it anyway. A rule
in a README does not enforce itself.

Versionlessness cuts the other way from most of Build OS, deliberately. The compatibility check
exists because a *protocol* that drifts silently corrupts in-flight work. A skill is a procedure
a project has chosen and made its own; changing it underneath them mid-thread would be the
corruption, not the cure.

**Alternatives considered**
- **Fold skills into `framework/`.** Rejected: it loses the property that makes them useful. A
  framework document is loaded because someone remembered it; a skill is loaded because its
  description matched. That difference is the entire value.
- **Keep skills out of Build OS and let projects hold their own.** Rejected: the first one
  generalised cleanly out of the project it came from, which is the test this repository applies
  to everything else it holds.
- **Let skills restate framework rules for convenience, and reconcile periodically.** Rejected —
  "reconcile periodically" is how every drifting-documents problem starts, and this repository
  already has a rule against duplicating one fact across surfaces.
- **Version skills like the protocol.** Rejected: it would make a project's own copy of a
  procedure into something it must chase, for no benefit it asked for.

**Consequences**
- Build OS has an agent-facing surface, and a stated rule for what belongs there.
- Every future skill has one review question that outranks the others: *does this restate
  something `framework/` already says?*
- A skill can still drift from its framework document without anything detecting it. Nothing
  here prevents that; the boundary makes it a reviewable error rather than an ambiguity.
- One rule travelled from the skill into the framework — *where stopping is a real option, list
  it* — which is the traffic working in the direction it should.

---

### DEC-023 — Evidence is written by the party that produces it, never anticipated

**Date:** 2026-08-31
**Status:** Accepted

**Context**
`DEC-014` established the merge-finalization commit and worked out carefully that it cannot
contain its own SHA: writing the SHA changes the commit, so the number is wrong before it is
pushed. The reasoning was about a mechanical impossibility, and it stopped there.

The same commit was still free to write the **verdict** — a value that is not mechanically
impossible to write early, merely false. And a false verdict is worse than a stale SHA, because
a stale SHA looks obviously wrong to a reader while `Verdict: Owner-accepted` looks like
ordinary bookkeeping.

This repository demonstrated it twice within a day. WS-008 and WS-009 both reached `main`
asserting `Owner-accepted` for a PR nobody had accepted, written by finalization commits
anticipating an acceptance that never came. The second was authored while explicitly criticising
the first, which is the clearest evidence available that the rule needed to be written down
rather than left to care.

**Decision**
**A finalization commit never writes a verdict it does not yet have.**

The verdict belongs to the party that produces it, recorded after the fact: a reviewer in
`reviewed` mode, the owner at merge in `solo` mode. Either way the commit precedes the act, so it
leaves `Verdict` at whatever was true when it was authored — exactly as it leaves `Reviewed head`
at the last head reviewed in full.

Generalised, and this is the form worth keeping: **a record may state what has happened and what
is expected, but only ever in fields that distinguish the two.** `Finalization: pushed` is a fact
about a commit that exists. `Verdict` is a claim about somebody else's act. The first belongs in
a finalization commit and the second does not.

New warning `VERDICT_UNSUPPORTED` reports a file claiming a verdict that nothing outside it
records.

Separately, `Owner-accepted` gains the PR-comment form v0.8 omitted, using `Accepted head:` in
place of `Reviewed head:` so the two can never be confused by a reader or a parser.

**Rationale**
The distinction that matters is not *early versus late* but *who is entitled to say it*. A
finalization commit is authored by the implementation agent, and a verdict is precisely the thing
an implementation agent may not issue about its own work. Pre-writing it is therefore not a
timing shortcut but a small act of self-approval, and it is invisible because the value it writes
is the value that was going to be true anyway.

"A row briefly behind is a much smaller problem than a row confidently wrong" is the trade being
made, and it is not close. A behind row is corrected by anyone who notices. A wrong row is
believed.

**Alternatives considered**
- **Allow a pre-written verdict with a `(pending)` marker.** Rejected: it was tried informally
  here — WS-009 wrote `pending` into the *head* cell while leaving `Owner-accepted` in the
  verdict cell — and the qualifier did not travel with the claim. The field a consumer keys on
  was still wrong.
- **Have the finalization commit omit the review table entirely.** Rejected: the table's other
  rows are true and useful, and removing them to prevent one error loses more than it saves.
- **Rely on reviewers to catch pre-written verdicts.** Rejected on evidence: in `solo` mode there
  is no reviewer, which is exactly where this failed.
- **Treat it as covered by DEC-014.** Rejected: it plainly was not. DEC-014 reasoned about a
  mechanical impossibility and did not generalise to claims that are merely false, and two
  violations in one day are the argument against assuming the general case was implied.

**Consequences**
- A workstream row can legitimately lag its PR for a short window. That is the intended cost.
- `VERDICT_UNSUPPORTED` gives consumers a way to spot the failure rather than inheriting it.
- `solo` projects can finally record acceptance on a PR in a specified form.
- `WORKSTREAM_PR_STATE_MISMATCH` had to stop firing on finalization-before-verdict in `solo`
  mode, where that ordering is correct rather than an error.
- The two rows this decision came from are **corrected to the truth**, not left standing. Those
  are two different things and the distinction is worth stating: the *commits* that wrote them
  stay exactly as they are, because rewriting history to look as though the rule had always been
  followed is the failure mode Build OS exists to prevent — but a *current* row asserting an
  acceptance nobody gave is not history, it is a live false claim, and leaving it there while
  shipping the rule against it would be the same error a third time.
