# Build OS Version

**Build OS v0.5**

| Field | Value |
|---|---|
| Version | 0.5 |
| Status | Draft |
| Scope | Documentation, protocol, reusable templates, contracts |
| Contains code | No |

This file is canonical. An adopted repository's framework compatibility check reads the
version above and the migration notes below. See `framework/FRAMEWORK_SYNC.md`.

**"Contains code: No" is true again as of 2026-08-24.** It briefly was not: the Project
Intelligence Companion was staged here as a self-contained `companion/` package under `DEC-008`,
and while it sat in the tree this line was stale — exactly the kind of durable record v0.5 exists
to catch. The application has since moved to `50thycal/build-os-companion` (`DEC-011`), and what
remains is Markdown plus the JSON schemas in `contracts/`. Adopting Build OS requires no
dependency, no build step, and no runtime, and nothing in the protocol depends on the Companion
existing.

---

## Version semantics

- **Patch (0.x.y)** — wording, clarifications, template polish. No protocol behavior change.
  An adopting project usually needs no changes; acknowledge and record the check.
- **Minor (0.x)** — new artifacts, stages, requirements, or agent behavior. An adopting agent
  must inspect the migration notes and update project protocol artifacts as applicable.
- **Major (x.0)** — lifecycle, role, or responsibility changes. Treat as an explicit protocol
  migration, performed before substantial project work continues.

Downstream projects **pin** a version. Pinning is deliberate: it keeps work reproducible and
stops a framework change from silently redefining an in-flight effort. The compatibility
check exists so that a pin is a decision rather than an accident.

---

## Migration notes

Each entry says what changed and what an adopting project must do to move to it. An agent
performing a compatibility check reads every entry between the project's adopted version and
the version above.

### v0.4 → v0.5 — Closed-loop delivery

**Type:** Minor. **Date:** 2026-08-24.

**What changed**

Four demonstrated gaps between owner feedback and a merged change, closed as one protocol:

- **Capture Only** (`framework/DESIGN_ROOM.md`) — a named session mode for playtest notes,
  feedback dumps, and multi-message input. While active, the design agent records and does
  nothing else: no analysis, no recommendations, no decisions, no repository writes. Ending
  it requires a consolidation that keeps observations, interpretations, proposed rules, and
  approved decisions separate. Only approved decisions travel onward. It stores no
  transcripts and no recordings.
- **The Design Handoff PR** (`DESIGN_ROOM.md`, `WORKSTREAMS.md`, `CLAUDE_HANDOFF.md`) — a
  design agent with GitHub write access may open the implementation PR itself, as a draft,
  once the Build Card is approved and the spec issued. It is the single PR for that
  implementation; the implementation agent continues it rather than opening a second one.
  Opening it does not start `BUILDING`.
- **The reviewed-head merge gate** (`framework/REVIEW_PROTOCOL.md`) — a significant PR does
  not merge until an independent reviewer records `Approved` or `Approved with follow-ups`
  against the PR's **current head**, named as a full 40-character SHA. An approval that names
  no head does not count. The agent that wrote the code neither approves nor merges it. Any
  executable, test, dependency, migration, configuration, or behavior-documentation change
  after the reviewed head invalidates the approval.
- **Merge finalization** (`REVIEW_PROTOCOL.md`, `WORKSTREAMS.md`) — the last commit before
  merge is documentation-only, on the same PR, setting the workstream, `ACTIVE.md`, and
  `Review State` to what becomes true when the PR lands. It is what stops `main` from
  carrying workstreams that describe a state that ended at merge, without a second
  bookkeeping PR.

Two rules keep the review fields honest, and both matter to anyone writing them by hand:

- **A verdict belongs to one PR.** A workstream spanning several records one verdict per PR, in
  a `| PR | Verdict | Reviewed head | Finalization |` table. A record says nothing about a PR it
  does not name, so approving a new PR never re-opens the question of one that merged long ago.
- **A workstream declares which protocol it runs under.** A `**Build OS:** v0.5` header, or the
  project's adopted version, is what puts a workstream under the merge gate — never the presence
  of the review fields, or deleting a row would remove a significant PR from the gate. An
  inherited project pin covers **current work only**: adopting v0.5 does not reach back and gate
  a completed v0.4 workstream, a workstream untouched since before adoption, or a PR that was
  opened and merged before it. That boundary is the date on your `Last compatibility check` line,
  which is why step 1 below asks for today's date rather than a bare version.
- **A GitHub approval closes the gate readily and opens it narrowly.** Only a reviewer's current
  position counts, any outstanding `Changes required` keeps the gate shut, and a current-head
  approval verifies the finalization head only when the workstream's own record already approves.
  It never overrides a record that says `Changes required` — that is a contradiction to report.
- **A finalization commit cannot contain its own SHA.** `Reviewed head` names the last commit
  reviewed *in full*; `Finalization: pushed` says the PR head is legitimately ahead of it; and
  the head that commit produced is recorded by the reviewer **on the PR**, after it exists —
  a GitHub review carries the commit id it was submitted against. Merge targets that SHA.
- **A verdict may be a comment** (clarified 2026-08-25, DEC-015). GitHub refuses a review on a
  pull request the account authored, so a repository worked by one account cannot produce an
  approving review at all — the gate is not strict there, it is inoperable, and this repository
  proved it by merging v0.5 itself twice without one. A verdict may therefore be a PR comment
  carrying a `Build OS review verdict:` line, a `Reviewed head:` line with a full SHA, and a
  `Review actor:` line naming who issued it, and an `Implementation actor reviewed:` line naming
  who the reviewer understood they were reviewing — read only where it is stated and never where
  it is quoted, fenced, or commented out. **An edited comment never clears the gate**, and both
  actors travel inside the verdict, because a comment and a PR body can both be rewritten after
  a review while the commit named stays fixed. The actor matters because in such a repository the
  login is transport: several actors share it, and a record keyed on the login merges them.
  Positions are therefore keyed on the actor, and a comment verdict clears the
  independent-review gate only when **the two actors named inside it differ** — never by
  comparison against the PR body, which is editable and would let an old verdict change meaning.
  The body stays a cross-check: where it names a different implementation actor than the verdict
  captured, the gate fails closed and reports. It records that a verdict was given; it does not
  verify that whoever gave it was independent. Where that matters most, use a second identity.

Supporting changes: structured `Verdict`, `Reviewed head`, `Reviewed PR`, and `Finalization`
fields in `templates/WORKSTREAM.template.md` and `templates/REVIEW_SUMMARY.template.md`; a
`Review gate` section in `templates/PR_HANDOFF.template.md`; capture and review behavior in
`templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md`; parsing rules and integrity warnings in
`framework/BUILD_OS_PARSE_CONTRACT.md`; open-PR applicability in `framework/FRAMEWORK_SYNC.md`.

**What an adopting project must do**

1. **Read this entry, then update the Build OS block** in the project's agent-instructions
   file to adopted v0.5 and last-checked v0.5 with today's date. Read before recording — the
   check is the point, not the field.
2. **Merge the capture, review, and merge bullets into the project's agent instructions** and
   into its ChatGPT Project instructions: Capture Only entry and exit, the Design Handoff PR,
   the reviewed-head gate, no self-approval, and the merge-finalization commit. Merge — do not
   replace a project's own instructions, and leave `Project-specific:` rules intact.
3. **Refresh local copies of the Workstream, Review Summary, and PR Handoff templates**, where
   the project keeps copies rather than referencing the canonical ones.
4. **Add the review fields to active workstreams at their next review checkpoint** — with a
   `**Build OS:** v0.5` header on each one — not in a bulk edit, and never to completed
   historical workstream files. The header is worth writing even though the project pin would
   cover an active workstream anyway: it survives the workstream's completion, where an inherited
   pin deliberately does not. A file written before v0.5
   parses correctly with the fields absent; adding them retrospectively would record a review
   that never happened. A workstream with more than one PR uses the per-PR table from the start,
   so that a verdict on the current PR never makes a claim about an older merged one.
5. **Apply the merge gate to significant PRs that are still open**, including ones opened
   under v0.4. Merged history is not reopened and nothing already landed is retroactively
   invalidated.
6. **If the project cannot adopt now, record an explicit deferral** — a `DEC-n` naming the
   reason and what would trigger a revisit — keep the prior adopted version, and update
   last-checked to v0.5. A deferral on the record is a legitimate outcome; silent
   non-adoption is not.

No project architecture, product decision, or completed workstream is rewritten by this
migration. Nothing here requires automation, CI, branch protection, or a Companion
deployment: v0.5 is enforceable by people reading and writing Markdown, which is the only way
it can apply to every adopting project.

---

### v0.3 → v0.4 — Protocol contracts for machine consumers

**Type:** Minor. **Date:** 2026-08-23.

**What changed**

- `framework/AGENT_SESSION_CHECKPOINT.md` and
  `contracts/agent-session-checkpoint.v1.schema.json` — how an agent publishes the *state* of a
  working session, so tooling and owners can see what is live without anyone reading a chat
  window. The schema has no field capable of holding conversation text and forbids additional
  properties; `UNKNOWN` is excluded from its status enum, because silence is a conclusion a
  consumer draws, never a state an agent claims.
- `framework/BUILD_OS_PARSE_CONTRACT.md` — the subset of `ACTIVE.md`, workstream files, and
  `DECISIONS.md` that machine consumers may rely on, plus detection, path overrides, and the
  integrity warnings raised when artifacts disagree.

**What an adopting project must do**

**Nothing, for most projects.** Both documents describe surfaces that already exist; neither
changes how a project writes Build OS artifacts, and neither adds an obligation to a project
that has no tooling reading it.

Act only if one of these applies:

1. **Your agents will publish session checkpoints.** Have them POST against
   `contracts/agent-session-checkpoint.v1.schema.json`, at the moments listed in
   `framework/AGENT_SESSION_CHECKPOINT.md`. State only — never transcripts.
2. **You are building something that reads Build OS artifacts.** Follow
   `framework/BUILD_OS_PARSE_CONTRACT.md`: parse conservatively, surface disagreements rather
   than merging them, and keep workstream-to-PR relationships many-to-many.

No project memory, workstream, or decision content needs rewriting.

### v0.2 → v0.3 — Framework compatibility protocol

**Type:** Minor. **Date:** 2026-08-22.

**What changed**

- A standard **framework compatibility preflight**: compare the project's adopted version
  against this file before substantial design/build work, and act on the delta.
- A canonical **project framework block** recorded in the adopted repository's agent
  instructions file (`CLAUDE.md` or equivalent).
- A compact **Framework** field in the PR handoff.
- Rules for project-specific additions, and for surfacing conflicts between a project rule
  and a newer Build OS requirement.
- `framework/FRAMEWORK_SYNC.md`, and a worked upgrade scenario.

**What an adopting project must do**

1. Add the framework block to `CLAUDE.md`:
   ```markdown
   ## Build OS
   - Canonical framework: 50thycal/build-os
   - Adopted version: v0.3
   - Last compatibility check: v0.3 on YYYY-MM-DD
   ```
2. Mark any project-specific protocol additions as `Project-specific:` so they cannot be
   mistaken for Build OS itself.
3. Include the `Framework:` field in subsequent PR handoffs.

Nothing in v0.2 changed meaning. No project memory, workstream, or decision content needs
rewriting.

### v0.1 → v0.2 — Persistent design workstreams

**Type:** Minor. **Date:** 2026-08-22.

**What changed**

- The **workstream** concept: one meaningful design/build thread with a stable `WS-###` ID,
  spanning multiple conversations and potentially multiple PRs.
- A workstream lifecycle — `IDEA` → `EXPLORE` → `MODEL` → `DECIDE` → `BUILD_CARD` →
  `READY_TO_BUILD` → `BUILDING` → `REVIEW` → `COMPLETE`, plus `PAUSED`, `BLOCKED`,
  `ABANDONED` — mapped onto the existing Design Room stages.
- A third project-memory layer, `docs/workstreams/`, alongside `PROJECT_MODEL.md` and
  `DECISIONS.md`, with an `ACTIVE.md` control board.
- A checkpoint policy: persist at meaningful moments, not after every exchange.
- A ChatGPT Project operating model, session-start protocol, and reusable Project
  instructions.
- The GitHub capability boundary, and the rule that persistence is never claimed falsely.
- `framework/WORKSTREAMS.md`, three new templates, and a worked acceptance scenario.

**What an adopting project must do**

1. Create `docs/workstreams/` with an `ACTIVE.md` from `templates/ACTIVE_WORK.template.md`.
2. Add a workstream file for each effort already in flight, from
   `templates/WORKSTREAM.template.md`. Most projects have three or four.
3. Update `CLAUDE.md` to reference the workstream layer and the checkpoint duty.
4. Set up the ChatGPT Project instructions from
   `templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md`.

Nothing in v0.1 changed meaning. Existing `PROJECT_MODEL.md` and `DECISIONS.md` content
carries over untouched.

### v0.1 — Initial protocol

**Type:** Initial. **Date:** 2026-08-22.

- The lifecycle: Abstract Idea → Design Room → Mental Model → Decisions → Build Card → Build
  Spec → Claude Implementation → GitHub PR Handoff → Independent Review → Project Memory
  Update
- The five-stage Design Room process
- The Build Spec packet standard, including the owner-decision / implementation-discretion /
  escalation split
- The GitHub-as-handoff-surface protocol
- The two durable memory artifacts: `PROJECT_MODEL.md` and `DECISIONS.md`
- The independent review protocol
- Reusable templates for all of the above

---

## What Build OS deliberately does not include

- Automation, CI, scripts, or linting of framework artifacts
- Package dependencies or services
- Project-specific instructions

---

## Changing the version

Build OS evolves through versioned changes to this repository. Downstream projects reference
a version; they do not fork the protocol. See `README.md` → *Evolving Build OS*.

Every version bump adds a migration-notes entry above, whatever its size — a patch entry that
says "no project changes required" is what lets a downstream agent stop reading quickly.
Record the reasoning for consequential framework changes in this repository's own
`DECISIONS.md`, using the same ADR format Build OS prescribes for projects.
