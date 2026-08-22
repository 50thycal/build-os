# Build OS Project Intelligence Feed + Podcast

**Status:** implementation plan  
**Target:** Build OS companion service  
**Owner intent:** provide one place to understand what is happening across followed GitHub projects, active PRs, Build OS workstreams, and agent sessions — and generate an audio catch-up from the same canonical state.

---

## 1. Executive summary

Build OS already solves the durable-memory problem inside an individual repository: GitHub is the record, workstreams track intent, PRs track implementation, and chat is temporary transport.

The next problem is cross-project awareness.

When several Build OS projects are active at once, the owner still has to open repositories, PRs, workstream files, and chat sessions to reconstruct:

- what changed,
- what is still running,
- what is waiting on the owner,
- which PRs are active,
- which workstreams are blocked,
- which agent sessions are still in implementation or review,
- and what matters enough to pay attention to now.

This plan adds a **Build OS Companion**: an online, owner-facing project intelligence service that reads durable Build OS/GitHub state, converts changes into a normalized event ledger, derives current project/workstream/session state, and renders that state in multiple ways.

The first two renderers are:

1. **Project Feed** — a social-media-style stream of project updates, PR state, workstream movement, decisions, blockers, and attention items.
2. **Catch-Up Podcast** — a generated audio briefing, optionally in a two-host discussion format, covering everything important since the owner last checked.

The core architectural rule is:

> **The feed and podcast are not separate products. They are two renderers of the same normalized project-state and event system.**

The service should never treat a chat transcript as the authoritative source of project state. Chat/agent sessions may submit checkpoints, but durable GitHub artifacts remain canonical.

---

## 2. Product goal

The owner should be able to open one page and answer, within roughly one minute:

1. What changed across the projects I follow?
2. Which active PRs exist and what state are they in?
3. Where is each Build OS workstream currently sitting?
4. Which implementation/design/review sessions are active or recently completed?
5. What specifically needs my attention?
6. What can I safely ignore because it is progressing autonomously?
7. What happened since I last checked?

The same underlying state should support a button such as:

**Catch me up → 5 min / 15 min / Deep dive**

which creates a briefing suitable for listening while driving, walking, or running.

---

## 3. Product principles

### 3.1 GitHub remains durable truth

Build OS's existing rule remains unchanged:

- project memory belongs in the repository,
- PRs are implementation handoffs,
- workstream files are the durable state of design/build threads,
- project model and decisions files are durable architecture/rationale,
- chat sessions are not the system of record.

The Companion may cache and summarize GitHub data, but it must preserve links and provenance back to canonical artifacts.

### 3.2 Derived state is explicitly derived

Some state is stored directly in GitHub, such as:

- workstream phase,
- blocker,
- next step,
- PR state,
- CI status.

Other state is inferred, such as:

- `Needs owner attention`,
- `Likely stalled`,
- `Autonomous / no action needed`,
- importance ranking,
- briefing priority.

The system must distinguish those classes internally. Derived labels must never overwrite canonical source fields.

### 3.3 The owner should consume summaries, not machine paperwork

The UI should not reproduce workstream files or PR bodies by default.

Every feed card should compress an event into the following owner-facing structure:

**What changed → Why it matters → Current state → Blocker/attention → Next action**

### 3.4 One event/state layer, many renderers

Feed, dashboard, notifications, written briefings, audio briefings, future mobile widgets, and future automated actions should all read from the same normalized event/state APIs.

Do not build the podcast by independently scraping GitHub again.

### 3.5 Incremental adoption

A plain GitHub repository should provide useful data even without full Build OS adoption.

Capability improves in layers:

1. GitHub only: PRs, issues, commits, CI.
2. Build OS workstreams: phases, blockers, next steps.
3. Agent checkpoints: richer live session state.
4. Cross-project dependency and attention intelligence.
5. Audio and other derived experiences.

---

## 4. Scope

### In scope

- Follow/unfollow GitHub repositories.
- Ingest GitHub PR, issue, commit, review, and CI activity.
- Detect Build OS adoption and read canonical Build OS memory files.
- Normalize activity into an append-only event ledger.
- Materialize current project/workstream/PR/session state.
- Owner-facing feed.
- `Since I last checked` mode.
- `Needs me` prioritization.
- Session checkpoint API/contract for agents.
- Written catch-up brief.
- Audio catch-up generation.
- Two-host podcast mode.
- Provenance links back to GitHub artifacts.
- Basic user authentication and private-repository authorization.

### Not in the first release

- Replacing GitHub as the canonical source of truth.
- Persisting full chat transcripts.
- General project-management features unrelated to Build OS.
- Autonomous merging, deployment, or code modification from the feed.
- Complex team/organization permissions beyond the owner use case.
- Real-time collaboration between multiple owners.
- Automatic product decisions.

Those can be future workstreams.

---

## 5. System mental model

```text
                 SOURCE SYSTEMS
       ┌────────────────────────────────┐
       │ GitHub                         │
       │ - repos / PRs / reviews        │
       │ - issues / commits / CI        │
       │ - Build OS memory files        │
       └───────────────┬────────────────┘
                       │
       ┌───────────────▼────────────────┐
       │ Agent Checkpoints              │
       │ ChatGPT / Claude / Codex       │
       │ - session state only           │
       │ - no transcript dependency     │
       └───────────────┬────────────────┘
                       │
                       ▼
              NORMALIZATION LAYER
       ┌────────────────────────────────┐
       │ Append-only Event Ledger       │
       │ Provenance + deduplication     │
       └───────────────┬────────────────┘
                       │
                       ▼
               STATE PROJECTION
       ┌────────────────────────────────┐
       │ Projects                       │
       │ Workstreams                    │
       │ PRs                            │
       │ Sessions                       │
       │ Attention items                │
       └───────────────┬────────────────┘
                       │
              ┌────────┼───────────┐
              ▼        ▼           ▼
           Feed     Briefing    Podcast
```

The append-only ledger answers **what happened**.

The state projection answers **where everything is now**.

The renderers answer **what the owner should consume**.

---

## 6. Companion service boundary

Build OS currently defines itself as a protocol rather than an application. Preserve that property.

The recommended implementation is:

- the existing Build OS repository continues to hold protocol/specification/templates,
- a companion application implements the online feed and briefing experience,
- the protocol defines the machine-readable integration contracts that participating repositories and agents follow.

The implementation agent should decide whether the first code lives:

1. inside this repository under a clearly isolated `companion/` application directory, or
2. in a new repository such as `50thycal/build-os-companion`.

**Recommendation:** begin in this repository only if the application will remain small enough that protocol and product code can coexist cleanly. If a full web service, background workers, persistence, and audio pipelines are required, split the Companion into its own repository early and keep the contracts in `build-os`.

The critical requirement is not repository placement; it is preserving the protocol/application boundary.

---

## 7. Canonical data model

### 7.1 FollowedProject

```text
id
owner_user_id
github_repository_id
repository_full_name
default_branch
build_os_detected
build_os_version
project_model_path
decisions_path
active_work_path
enabled
created_at
last_synced_at
```

### 7.2 Event

All meaningful change becomes one normalized event.

```text
id
project_id
event_type
source_type
source_id
source_url
actor_type
actor_name
occurred_at
ingested_at
workstream_id nullable
pull_request_number nullable
session_id nullable
importance_score
owner_attention_state
summary_short
summary_detail
raw_metadata_json
source_fingerprint
```

`source_fingerprint` provides idempotent ingestion.

Suggested `event_type` values:

```text
PR_OPENED
PR_UPDATED
PR_READY_FOR_REVIEW
PR_REVIEWED
PR_CHANGES_REQUESTED
PR_MERGED
PR_CLOSED
CI_STARTED
CI_PASSED
CI_FAILED
ISSUE_OPENED
ISSUE_UPDATED
WORKSTREAM_CREATED
WORKSTREAM_PHASE_CHANGED
WORKSTREAM_BLOCKED
WORKSTREAM_UNBLOCKED
WORKSTREAM_COMPLETED
DECISION_ADDED
PROJECT_MODEL_CHANGED
SESSION_STARTED
SESSION_CHECKPOINTED
SESSION_BLOCKED
SESSION_COMPLETED
OWNER_ACTION_REQUIRED
OWNER_ACTION_CLEARED
```

Do not prematurely force every GitHub webhook subtype into a distinct public event. Normalize to owner-meaningful events.

### 7.3 WorkstreamState

Materialized from canonical workstream files.

```text
project_id
workstream_id
title
phase
status
goal
next_step
blocker
updated_at
related_prs[]
open_decisions[]
source_path
source_commit_sha
```

### 7.4 PullRequestState

```text
project_id
number
title
state
draft
head_branch
base_branch
author
updated_at
mergeable_state
review_state
ci_state
workstream_id nullable
summary
source_url
```

### 7.5 SessionState

A session represents an active or completed agent working context. It is not the transcript.

```text
id
project_id
workstream_id nullable
agent_type
agent_name
session_kind
objective
phase
status
started_at
updated_at
completed_at nullable
related_pr nullable
blocker nullable
next_step
checkpoint_source
```

Suggested `session_kind`:

```text
DESIGN
IMPLEMENTATION
REVIEW
INVESTIGATION
OPERATIONS
```

Suggested `status`:

```text
ACTIVE
WAITING
BLOCKED
COMPLETED
ABANDONED
UNKNOWN
```

### 7.6 AttentionItem

Attention is a derived view and should be recomputable.

```text
id
project_id
entity_type
entity_id
severity
reason_code
reason_text
created_at
cleared_at nullable
recommended_action
```

Suggested reasons:

```text
OWNER_DECISION_REQUIRED
PR_WAITING_FOR_OWNER_REVIEW
PR_CI_FAILED
WORKSTREAM_BLOCKED
WORKSTREAM_STALE
SESSION_BLOCKED
MERGE_CONFLICT
REVIEW_CHANGES_REQUESTED
AUTONOMOUS_PROGRESS
```

`AUTONOMOUS_PROGRESS` is useful internally for explicitly suppressing noise from `Needs me`.

---

## 8. Build OS machine-readable checkpoint contract

The existing Markdown artifacts remain human-readable and canonical.

For the Companion, agents should additionally be able to publish a concise session checkpoint without persisting transcripts.

Recommended schema:

```json
{
  "schema_version": "1",
  "repository": "owner/repo",
  "workstream_id": "WS-004",
  "session_id": "stable-session-id",
  "agent": "claude",
  "session_kind": "IMPLEMENTATION",
  "objective": "Add region-aware simulation",
  "status": "ACTIVE",
  "phase": "BUILDING",
  "completed": [
    "Region schema",
    "Existing 100-round simulation preserved"
  ],
  "in_progress": [
    "Baltic region configuration"
  ],
  "blockers": [],
  "next_step": "Run balancing simulation",
  "related_pr": 84,
  "updated_at": "2026-08-22T18:00:00-05:00"
}
```

### Persistence options

Order of preference:

1. **Committed session checkpoint / workstream update in GitHub** where the checkpoint materially changes durable state.
2. **Companion checkpoint API** for ephemeral live-session visibility between durable GitHub checkpoints.
3. Never rely on transcript scraping as the normal path.

A Companion-only checkpoint should be visibly marked as ephemeral/derived. Durable workstream state always wins when the two disagree.

### Conflict rule

When data disagree:

```text
GitHub canonical artifact
    > GitHub PR/CI state
    > explicit session checkpoint
    > AI-derived inference
```

The UI should surface stale/conflicting checkpoint data rather than silently merging contradictions.

---

## 9. GitHub ingestion

### Phase A: polling-first MVP

For the first implementation, polling is acceptable and dramatically simpler than webhooks.

For each followed repository, retrieve:

- repository metadata,
- open PRs,
- recently changed PRs,
- review state,
- CI/check state,
- issues if configured,
- default-branch commits,
- Build OS canonical files if present.

Track cursors/timestamps to avoid reprocessing the full history.

### Phase B: GitHub webhooks

After the event model stabilizes, add webhooks for low-latency events:

- pull request,
- pull request review,
- issue,
- workflow/check run,
- push.

Keep reconciliation polling even after webhooks exist. Webhooks are a delivery mechanism, not a guarantee of perfect state.

### Build OS detection

Attempt the following:

1. Read project `CLAUDE.md` / documented protocol location if available.
2. Detect common Build OS paths:
   - `docs/PROJECT_MODEL.md`
   - `docs/DECISIONS.md`
   - `docs/workstreams/ACTIVE.md`
3. Parse explicit Build OS version if present.
4. Allow manual path overrides per repository.

Do not require exact paths because Build OS already permits repository-specific documentation conventions.

---

## 10. Parsing Build OS state

The parser should be conservative.

### ACTIVE.md

Extract:

- workstream ID,
- title,
- phase,
- status,
- next step,
- related PR.

### Workstream file

Extract fields from standard headings:

- Goal,
- Current Mental Model,
- Decisions Made,
- Open Decisions,
- Implementation State,
- Review State,
- Related PRs,
- Next Step.

### DECISIONS.md

A new accepted decision should create one `DECISION_ADDED` event with:

- decision ID,
- title,
- status,
- short owner-facing summary,
- source URL.

### PROJECT_MODEL.md

Do not emit noisy events for every text edit. Generate `PROJECT_MODEL_CHANGED` only when a meaningful architectural change is detected.

For MVP this may simply be triggered by file change and summarized by an LLM. Later, introduce semantic-diff thresholds.

---

## 11. Feed experience

### 11.1 Home feed

Default feed order should not be pure chronology.

Rank by a blend of:

- owner attention requirement,
- recency,
- project priority,
- event significance,
- whether the user has already viewed the event,
- whether multiple low-level events should collapse into one narrative update.

### 11.2 Card format

Each card should contain:

```text
Project · entity · relative time
Headline
What changed
Why it matters
Current state
Next step / attention request
[Open source]
```

Example:

```text
Build OS · PR #17 · 24 min ago
Project Intelligence architecture ready for implementation

The design PR defines one normalized event/state layer for GitHub,
Build OS workstreams, and agent checkpoints.

Why it matters: the feed and podcast can now share the same truth model.
Current: ready for implementation review.
Next: Claude to validate application-repository placement.
```

### 11.3 Filters

MVP filters:

```text
Everything
Needs Me
Pull Requests
Workstreams
Sessions
Decisions
```

Project filter should support one or many followed projects.

### 11.4 Since I last checked

Persist a per-user read cursor.

`Since I last checked` should summarize newly relevant events since the user's last meaningful feed visit rather than simply showing every raw event after a timestamp.

Low-value events should collapse.

Example:

```text
7 commits + 3 CI reruns + PR description edit
```

may become one feed event:

```text
PR #84 moved from implementation to review; CI is now green.
```

---

## 12. Attention engine

This is the major value beyond a GitHub activity feed.

### Owner attention should become true when

- an open decision is assigned to the owner,
- a Build Card requires approval,
- a PR is explicitly waiting on owner review,
- CI failure prevents progress and no agent session is actively fixing it,
- a workstream is blocked on owner input,
- a review requested changes requiring product judgment,
- a session checkpoint marks an owner dependency,
- an entity has been stale beyond configurable thresholds while expected to be active.

### Owner attention should remain false when

- implementation is actively progressing,
- CI is running normally,
- an agent is resolving review comments,
- a workstream is intentionally paused,
- a PR is waiting on external automation,
- a project has normal low-value commit churn.

### Initial severity model

```text
CRITICAL  — explicit blocking owner decision / failed release / security issue
HIGH      — owner review/action needed to continue
MEDIUM    — likely stalled or unusual state
LOW       — informational follow-up
NONE      — autonomous progress
```

Use deterministic rules first. Add LLM ranking only as a second layer.

The system must be explainable: every attention badge should have a reason code and a human-readable reason.

---

## 13. Written briefing engine

The briefing engine consumes normalized events and current state.

Inputs:

```text
user
selected projects
start cursor/time
end time
briefing length
include/exclude low-priority work
```

Output sections:

1. Biggest changes.
2. What needs the owner's attention.
3. Project-by-project movement.
4. Important decisions or findings.
5. Active work that is progressing normally.
6. What to watch next.

The written briefing becomes the canonical content input for audio generation.

This provides a valuable test seam: podcast quality can be debugged independently of TTS.

---

## 14. Podcast generation

### 14.1 User modes

```text
5 minute — headlines + owner actions
15 minute — normal project catch-up
Deep dive — broader project-by-project discussion
```

### 14.2 Two-host structure

Recommended host roles:

**Host A — Reporter**
- establishes facts,
- describes what changed,
- maintains chronology and transitions.

**Host B — Analyst**
- explains implications,
- connects related workstreams,
- highlights risks and owner decisions,
- distinguishes noise from strategic movement.

This is preferable to two generic personalities because each voice has an information role.

### 14.3 Script pipeline

```text
Normalized events/state
        ↓
Briefing fact pack
        ↓
Structured podcast outline
        ↓
Two-host script
        ↓
Fact/provenance validation
        ↓
TTS per speaker segment
        ↓
Audio assembly
        ↓
MP3/M4A artifact
```

### 14.4 Script constraints

- Every factual claim must be grounded in the fact pack.
- Do not invent agent intentions.
- Clearly distinguish resolved facts from interpretation.
- Avoid reading PR titles, hashes, or IDs excessively aloud.
- Mention PR/workstream numbers only when useful for returning to the project later.
- End with a short `what needs you next` segment.

### 14.5 Audio implementation

Initial implementation can use any provider with:

- reliable TTS API,
- at least two distinguishable voices,
- segment-level generation,
- MP3 or WAV output,
- acceptable latency and cost.

Keep provider choice behind an interface:

```text
TextToSpeechProvider.generate(text, voice, options) -> audio segment
```

Do not couple product logic to a single TTS vendor.

### 14.6 Delivery

MVP:

- generated briefing appears in the web app,
- user can play it in browser,
- audio file has a stable signed/downloadable URL.

Later:

- private podcast RSS feed,
- mobile notifications,
- CarPlay-friendly delivery,
- scheduled morning/evening briefings.

---

## 15. API surface

Suggested initial endpoints:

```text
POST   /api/projects/follow
DELETE /api/projects/:id
GET    /api/projects
POST   /api/sync
GET    /api/feed
GET    /api/attention
GET    /api/projects/:id/state
POST   /api/sessions/checkpoint
GET    /api/sessions
POST   /api/briefings
GET    /api/briefings/:id
POST   /api/briefings/:id/audio
GET    /api/audio/:id
POST   /api/read-cursor
```

Internal/background jobs:

```text
sync_repository
normalize_events
project_state
compute_attention
summarize_event
build_briefing
render_podcast
```

---

## 16. Persistence and infrastructure

Implementation agent may choose technology based on the existing stack available at build time, but the following capabilities are required:

### Relational store

Needed for:

- users,
- followed projects,
- event ledger,
- materialized states,
- read cursors,
- briefing metadata,
- job state.

Postgres is the default recommendation.

### Object storage

Needed for generated audio files.

### Background worker

Needed for:

- repository sync,
- LLM summaries,
- briefing generation,
- TTS,
- audio concatenation.

### Queue

Can begin with database-backed jobs if load is low. Do not add queue infrastructure only for fashion.

### Hosting

The owner wants an online service. Choose a deploy path that supports:

- authenticated web UI,
- background jobs,
- private GitHub access,
- durable Postgres,
- audio storage.

---

## 17. Authentication and GitHub authorization

MVP should be single-owner friendly but built correctly.

Recommended:

- GitHub OAuth or GitHub App installation.
- Request only repository permissions needed to read metadata/content/checks for followed repositories.
- Store provider tokens encrypted at rest.
- Never expose GitHub tokens to the browser after initial auth.
- For private repos, enforce per-user authorization at every API boundary.

A GitHub App is likely preferable once webhook support is added.

---

## 18. Summarization and LLM responsibilities

Use LLMs for semantic compression, not source-of-truth decisions.

Good uses:

- summarize a PR update,
- explain why a workstream phase change matters,
- collapse several events into one narrative card,
- generate written briefings,
- generate podcast scripts,
- identify likely relationships between events.

Do not let an LLM alone decide:

- whether a PR is open/merged,
- CI pass/fail,
- stored workstream phase,
- whether the owner explicitly approved a Build Card,
- source URLs,
- canonical blocker text when directly available.

All generated summaries should retain source references internally.

---

## 19. Implementation phases

## Phase 0 — Contracts and fixtures

**Goal:** stabilize the domain before building UI.

Build:

- data-model definitions,
- event taxonomy,
- Build OS parser interfaces,
- session-checkpoint schema,
- provenance rules,
- fixture repositories / fixture documents,
- deterministic attention rules.

Acceptance:

- representative GitHub + Build OS inputs normalize into stable events,
- duplicate ingestion is idempotent,
- workstream state can be rebuilt from canonical fixtures,
- conflict precedence is tested.

---

## Phase 1 — GitHub project feed MVP

**Goal:** useful even before agent checkpoints exist.

Build:

- authentication,
- follow repository,
- GitHub polling sync,
- PR + CI ingestion,
- event ledger,
- basic project feed,
- project filter,
- source links.

Acceptance:

- follow at least three repositories,
- new/updated PRs appear without duplicates,
- merged/closed state reconciles correctly,
- CI status is current,
- user can click from a feed card to canonical GitHub source.

---

## Phase 2 — Build OS state integration

**Goal:** show where each Build OS thread is sitting, not merely GitHub activity.

Build:

- Build OS detection,
- ACTIVE.md parser,
- workstream parser,
- decision parser,
- current workstream board,
- phase-change events,
- blockers and next steps,
- related PR linking.

Acceptance:

- workstream phases in the Companion match repository state,
- a workstream phase edit produces one normalized event,
- related PR is connected where declared,
- Build OS repositories and plain GitHub repositories can coexist.

---

## Phase 3 — Session checkpoints

**Goal:** provide live visibility into where an agent session is sitting between GitHub checkpoints.

Build:

- checkpoint API,
- agent authentication token/scoped credential,
- session state UI,
- staleness detection,
- conflict labeling when checkpoint disagrees with GitHub.

Acceptance:

- Claude/other agent can post a checkpoint with one API call,
- session is visible in the feed and project state,
- no transcript is required,
- durable GitHub state overrides conflicting session state,
- stale sessions do not appear permanently active.

---

## Phase 4 — Attention and catch-up

**Goal:** turn the feed into an attention-management tool.

Build:

- `Needs Me` view,
- deterministic attention engine,
- attention reasons,
- read cursors,
- `Since I last checked`,
- event collapsing,
- written catch-up briefing.

Acceptance:

- owner-decision blockers surface above ordinary activity,
- active autonomous implementation does not create false attention,
- already-viewed low-value events do not dominate catch-up,
- briefing covers all high-priority events in the selected period.

---

## Phase 5 — Podcast

**Goal:** create a reliable audio catch-up from the same state.

Build:

- briefing-to-outline step,
- two-host script generation,
- fact validation,
- TTS adapter,
- two voices,
- audio assembly,
- playback UI,
- 5/15/deep-dive length modes.

Acceptance:

- one click creates playable audio,
- every material factual claim is traceable to the briefing fact pack,
- two hosts have distinct Reporter/Analyst roles,
- no project is omitted when it contains high-priority activity,
- `Needs me` appears near the end as a clear action recap.

---

## Phase 6 — Low-latency + automation

Only after the above works well:

- GitHub webhooks,
- scheduled briefing generation,
- private RSS/podcast feed,
- notification system,
- dependency links across repos,
- safe owner-triggered actions from feed cards.

Do not start here.

---

## 20. Testing strategy

### Parser fixtures

Versioned fixtures for:

- ACTIVE.md,
- workstream files,
- DECISIONS.md,
- plain GitHub repo with no Build OS,
- custom Build OS paths,
- malformed/incomplete workstream files.

### Event normalization tests

Prove:

- idempotency,
- chronological ordering,
- source provenance,
- duplicate webhook/poll delivery safety,
- materialized state rebuild from events where applicable.

### Attention tests

Use table-driven deterministic scenarios.

Example:

```text
PR green + agent ACTIVE + no owner blocker -> no owner attention
PR changes requested + owner decision required -> HIGH attention
workstream PAUSED intentionally -> no stale warning
session ACTIVE with no checkpoint for threshold -> stale warning
```

### Briefing tests

Use a fixed fact pack and verify:

- no high-priority event omitted,
- no unsupported project/PR/workstream invented,
- source references preserved.

### Podcast tests

Do not snapshot binary audio.

Test:

- script structure,
- speaker alternation,
- fact references,
- provider adapter calls,
- segment ordering,
- output manifest.

Include one manual listening acceptance test before declaring the feature complete.

---

## 21. Observability

Track at least:

```text
repository sync success/failure
last successful sync per repository
events created per sync
event dedupe count
parser failures
attention items created/cleared
briefing generation failures
TTS latency/cost
audio assembly failures
```

The owner-facing UI should visibly show when repository data is stale.

Never display old data as though it were live merely because the last sync record exists.

---

## 22. Cost controls

The architecture should avoid unnecessary LLM/TTS use.

- Parse deterministic fields without an LLM.
- Summarize only material events.
- Cache summaries by source fingerprint.
- Collapse events before asking for long-form briefing generation.
- Generate audio only on demand initially.
- Cache generated briefings/audio for identical time windows and source state where practical.

Record model/TTS usage per briefing so cost can be measured before scheduled podcasts are introduced.

---

## 23. Important edge cases

### Repository is temporarily inaccessible

Keep previous state, mark it stale, and generate a sync-failure event. Do not erase project state.

### Workstream file and ACTIVE.md disagree

Surface inconsistency. Prefer the individual workstream file for detailed fields but treat the mismatch as a Build OS integrity warning requiring reconciliation.

### PR is related to multiple workstreams

Support many-to-many relationships internally even if UI initially shows one primary workstream.

### One workstream spans multiple PRs

This is valid by Build OS design. The state projection must not assume one workstream = one PR.

### Session dies without final checkpoint

Mark it stale/unknown after threshold. Do not call it completed without evidence.

### Agent claims implementation complete but PR/CI disagree

Show the agent claim as session state and the GitHub state separately. GitHub remains authoritative.

### User has not checked the feed for several days

Collapse repetitive low-level events and produce a narrative catch-up rather than an enormous chronological backlog.

---

## 24. Future extensions enabled by this architecture

Once the event/state layer is reliable, several features become cheap rather than bespoke:

- morning project brief,
- evening commute podcast,
- weekly project retrospective,
- project health scoring,
- cross-repository dependency warnings,
- `What is stalled?`,
- `What changed while I was away?`,
- `Which PRs need review?`,
- `Which project has the most unresolved owner decisions?`,
- push notifications only for high-attention events,
- resume an agent session from the exact durable workstream state,
- future action cards such as `review PR`, `resume workstream`, or `launch investigation`.

The architecture should therefore optimize for a trustworthy canonical event/state layer rather than optimizing only for the first feed screen.

---

## 25. Implementation-agent instructions

Treat this PR as the implementation design handoff, not permission to improvise a materially different product.

Before coding:

1. Inspect the current Build OS protocol and preserve its core rule that GitHub is durable shared memory.
2. Decide and document whether the Companion application belongs in this repository or a dedicated repository. Prefer separation if application infrastructure becomes substantial.
3. Convert this plan into one or more Build OS workstreams rather than implementing all six phases as one giant PR.
4. Start with Phase 0 and Phase 1 only.
5. Keep all later phases represented as explicit follow-on workstreams/issues so the architecture does not silently collapse into a PR dashboard.

Do not:

- build transcript scraping as the core session integration,
- make LLM summaries canonical state,
- build podcast generation before the event/state layer is tested,
- implement autonomous merge/deploy actions in the MVP,
- add webhooks before polling/reconciliation semantics are correct.

### Recommended workstream decomposition

```text
WS-A — Companion domain + event ledger
WS-B — GitHub feed MVP
WS-C — Build OS workstream integration
WS-D — Agent session checkpoint protocol
WS-E — Attention + catch-up briefing
WS-F — Podcast renderer
```

The actual IDs should use the next available IDs in the implementation repository.

---

## 26. Definition of success

The system is successful when the owner can stop reconstructing project state from memory.

A successful normal interaction looks like this:

1. Open Build OS Companion.
2. Scan `Needs Me` and understand all blocking owner actions.
3. Scan `Since I last checked` and understand material project movement.
4. See current PR/workstream/session state without opening individual chat sessions.
5. Optionally generate a 5- or 15-minute audio briefing and leave the screen.
6. Follow any important statement back to a canonical GitHub artifact.

If the system becomes another place that itself needs manual status maintenance, the design has failed.

If the feed and podcast disagree because they have separate ingestion pipelines, the design has failed.

If a new agent still needs old chat transcripts to know where a workstream is sitting, the design has failed.

The intended end state is one durable project-intelligence layer with multiple ways to consume it.