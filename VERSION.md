# Build OS Version

**Build OS v0.2**

| Field | Value |
|---|---|
| Version | 0.2 |
| Status | Draft — protocol and templates only |
| Scope | Documentation, protocol, reusable templates |
| Contains code | No |

## What v0.2 adds

Persistent design-workstream state, so parallel design conversations for one project keep
durable state in GitHub rather than in chat history.

- The **workstream** concept: one meaningful design/build thread, with a stable `WS-###` ID,
  spanning multiple conversations and potentially multiple PRs
- A workstream lifecycle — `IDEA` → `EXPLORE` → `MODEL` → `DECIDE` → `BUILD_CARD` →
  `READY_TO_BUILD` → `BUILDING` → `REVIEW` → `COMPLETE`, plus `PAUSED`, `BLOCKED`,
  `ABANDONED` — mapped onto the existing Design Room stages
- A third project-memory layer, `docs/workstreams/`, alongside `PROJECT_MODEL.md` and
  `DECISIONS.md`, with an `ACTIVE.md` control board
- A checkpoint policy: persist at meaningful moments, not after every exchange
- A ChatGPT Project operating model, session-start protocol, and reusable Project
  instructions
- The GitHub capability boundary: what to do when the design agent can write, can only read,
  or has no access — and the rule that persistence is never claimed falsely
- `framework/WORKSTREAMS.md`, three new templates, and a worked acceptance scenario

Upgrading from v0.1 is additive: nothing in v0.1 changed meaning. A project adopts v0.2 by
adding `docs/workstreams/` and updating the Build OS reference in its `CLAUDE.md`.

## What v0.1 established

- The lifecycle: Abstract Idea → Design Room → Mental Model → Decisions → Build Card → Build Spec → Claude Implementation → GitHub PR Handoff → Independent Review → Project Memory Update
- The five-stage Design Room process
- The Build Spec packet standard, including the owner-decision / implementation-discretion / escalation split
- The GitHub-as-handoff-surface protocol
- The two durable memory artifacts: `PROJECT_MODEL.md` and `DECISIONS.md`
- The independent review protocol
- Reusable templates for all of the above

## What v0.2 deliberately does not include

- Automation, CI, scripts, or linting of framework artifacts
- Package dependencies or services
- Project-specific instructions

## Changing the version

Build OS evolves through versioned changes to this repository. Downstream projects
reference a version; they do not fork the protocol. See `README.md` → *Evolving Build OS*.

When a change lands:

- **Patch (0.x.y)** — wording, clarifications, template polish. No behavior change for adopters.
- **Minor (0.x)** — new stages, new required sections, new artifacts. Adopters can upgrade incrementally.
- **Major (x.0)** — a change to the lifecycle itself, or to what each role is responsible for.

Record the reasoning for consequential framework changes in this repository's own
`DECISIONS.md`, using the same ADR format Build OS prescribes for projects.
