# Build OS Parse Contract

**Build OS — protocol contract**

Build OS artifacts are written for humans and agents to read. This document defines the narrow
subset that **machine consumers may rely on**, so tooling can extract project state without
guessing — and so a project can reformat its prose without silently breaking someone's parser.

The Project Intelligence Companion is the first consumer. The contract is not specific to it.

---

## Principles

**Conservative parsing.** A field that cannot be read confidently is *absent*, never guessed. An
absent phase is a parser saying "I don't know", which a consumer can show honestly. A guessed
phase is a lie with a confident face.

**Prose is not a schema.** Only the markers below are stable. Everything else in a Build OS
document may be rewritten at any time.

**Reading only.** A consumer parses Build OS artifacts. It does not write them. Agents write
durable state; tools read it.

---

## Detection

A consumer should decide whether a repository uses Build OS by, in order:

1. A framework block in the repository's agent-instructions file (`CLAUDE.md` or equivalent),
   naming the canonical framework and the adopted version.
2. The conventional paths:
   - `docs/PROJECT_MODEL.md`
   - `docs/DECISIONS.md`
   - `docs/workstreams/ACTIVE.md`
3. Per-repository path overrides configured by the owner.

Build OS explicitly permits repository-specific documentation conventions, so **a consumer must
not require the conventional paths**. Absence of them means "look at the overrides", not "this
project does not use Build OS".

---

## `ACTIVE.md` — the board

Stable surface: a Markdown table whose header row contains the columns

```text
| ID | Workstream | Phase | Status | Current Next Step | Related PR |
```

Consumers should match column headers case-insensitively and by substring (`Next Step` matches
`Current Next Step`), and should tolerate extra columns and reordering.

Per row, the reliable fields are:

| Field | Rule |
|---|---|
| ID | Matches `WS-\d{3,}`. A row whose ID does not match is skipped, not repaired. |
| Workstream | Free text title. |
| Phase | One of the lifecycle phases below, case-insensitive. Unrecognized → absent. |
| Status | `Active` · `Paused` · `Blocked` · `Abandoned`, case-insensitive. Unrecognized → absent. |
| Current Next Step | Free text. `—`, `-`, and empty mean absent. |
| Related PR | Zero or more `#\d+`, possibly comma-separated. `—` means none. |

Lifecycle phases:

```text
IDEA · EXPLORE · MODEL · DECIDE · BUILD_CARD · READY_TO_BUILD · BUILDING · REVIEW · COMPLETE
```

A `## Recently completed` table may follow. It is informational; consumers should not treat its
rows as active work.

---

## Workstream files — the detail

Path shape: `WS-###-<slug>.md` alongside `ACTIVE.md`. The ID in the **filename** and the ID in
the **heading** must agree; a disagreement is an integrity warning, and the filename wins for
addressing while the heading is reported as suspect.

Stable surface:

- A level-1 heading matching `# WS-### — <title>`. The separator may be an em dash or a hyphen.
- Header fields near the top, one per line, as `**Field:** value` or `Field: value`:
  `Phase`, `Status`, `Created`, `Updated`.
- Level-2 section headings, matched case-insensitively:

```text
## Goal
## Context
## Current Mental Model
## Decisions Made
## Open Decisions
## Assumptions
## Non-Goals
## Build Card
## Implementation State
## Review State
## Related Decisions
## Related PRs
## Next Step
```

Rules consumers may rely on:

| Section | Rule |
|---|---|
| Goal, Context, Next Step | Free prose. Take the section body. |
| Open Decisions | List items; `None`, `None yet`, or empty means no open decisions. |
| Decisions Made | List items; may be empty. |
| Build Card | The literal `Not ready` means not ready. Anything else is a link or inline card. |
| Implementation State | Free text; `None` means none. PR references extracted as `#\d+`. |
| Review State | Free text; `Not started` means not started. |
| Related PRs | Zero or more `#\d+`; `None yet` / `—` means none. |
| Related Decisions | Zero or more `DEC-\d{3,}`. |

**Blocker.** Build OS records a blocker as `Status: Blocked` plus the reason in `Next Step`.
Consumers should read it from there rather than expecting a dedicated section.

**Missing sections are normal.** A workstream in `IDEA` legitimately has almost nothing. Absence
is not an error.

---

## `DECISIONS.md` — the rationale log

Stable surface: level-3 headings matching `### DEC-### — <title>`, each followed by:

```text
**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded by DEC-0NN | Deprecated
```

on one or two lines, then `**Context**`, `**Decision**`, `**Rationale**`,
`**Alternatives considered**`, `**Consequences**` blocks.

Consumers may rely on the ID, title, date, and status. The bodies are prose and should be
treated as such.

**Decision IDs are stable and never renumbered**, so a consumer may safely use `DEC-###` as a
durable key. A newly *accepted* decision is a meaningful event; a status change from `Accepted`
to `Superseded by …` is also meaningful. Editing prose in an existing entry is not.

---

## `PROJECT_MODEL.md` — current architecture

Deliberately unstructured. It is a human/agent mental model, not a schema, and a consumer should
not attempt to extract fields from it.

A consumer may note that it changed. It should **not** emit an event for every text edit —
a whitespace fix is not an architectural change. Prefer emitting nothing until a semantic
threshold exists.

---

## Integrity warnings

When artifacts disagree, a consumer **surfaces the disagreement** and does not silently pick a
winner. Cases worth reporting:

| Case | Handling |
|---|---|
| `ACTIVE.md` row and workstream file disagree on phase or status | Prefer the workstream file for detail; report the mismatch. |
| A workstream file exists with no `ACTIVE.md` row, and is not `COMPLETE`/`ABANDONED` | Report: work that is invisible on the board. |
| An `ACTIVE.md` row with no workstream file | Report: a board entry with no detail behind it. |
| Filename ID and heading ID differ | Report; address by filename. |
| A workstream marked `COMPLETE` still on the active board | Report: completion is supposed to remove the row. |
| Duplicate `WS-###` across files | Report; do not merge. |

These are warnings about the *project's* records, addressed to its owner. They are not parser
errors, and they must not stop the rest of the parse.

---

## Relationships that must not be flattened

- **One workstream may span several PRs.** This is normal Build OS behavior, not an anomaly.
- **One PR may serve several workstreams.**

A consumer's storage must model this as many-to-many, even where its UI shows a single primary
workstream per PR.

---

## Versioning

This contract versions with Build OS. A consumer should read the project's adopted Build OS
version where available and parse accordingly; where the version is unknown, it should parse
conservatively and report what it could not read.

Changes to this document are protocol changes and follow the normal versioning rules in
`VERSION.md`.
