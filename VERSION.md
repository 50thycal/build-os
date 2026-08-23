# Build OS Version

**Build OS v0.4**

| Field | Value |
|---|---|
| Version | 0.4 |
| Status | Draft — protocol and templates only |
| Scope | Documentation, protocol, reusable templates |
| Contains code | No |

This file is canonical. An adopted repository's framework compatibility check reads the
version above and the migration notes below. See `framework/FRAMEWORK_SYNC.md`.

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
