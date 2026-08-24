# Worked Example — a project one version behind

**Build OS v0.3**

This is the acceptance scenario for the framework compatibility protocol.

```text
Build OS canonical  = v0.2
Party Games adopted = v0.1
```

v0.2 introduced persistent workstreams. A new Party Games design/build session begins.

**The criterion:** the agent must detect that Party Games is one minor version behind, inspect
the v0.2 migration, add the required workstream layer and update the agent instructions, then
continue under v0.2. It must **not** simply continue under v0.1 — and it must **not** blindly
assume every future Build OS `main` change applies without inspection.

`50thycal/party-games` here is a stand-in for any adopted repository. Nothing about its
contents matters except its framework block.

---

## Before

`party-games/CLAUDE.md`, written when the project adopted Build OS:

```markdown
## Development protocol

This project follows **Build OS v0.1** — see 50thycal/build-os.

- Features arrive as a Build Card plus a Build Spec. Implement to the spec.
- Owner decisions in the spec may not be silently changed.
- Finish by pushing a branch, opening a PR, and writing the Implementation Handoff into
  the PR body. The PR is the handoff; chat is not.
- Update `docs/PROJECT_MODEL.md` and `docs/DECISIONS.md` where required.
```

```text
party-games/docs/
├── PROJECT_MODEL.md
└── DECISIONS.md          DEC-001 … DEC-009
```

No `workstreams/`. Three efforts are in flight, and they exist only in three ChatGPT
conversations.

---

## The session

The owner opens a chat and types:

> right, let's get back into the card-draft rework

### 1. Preflight

The agent is about to resume substantial Design Room work — one of the four moments that
warrant a compatibility check. Before engaging with card drafting at all, it reads two things:

- `party-games/CLAUDE.md` → **adopted: v0.1**
- `50thycal/build-os/VERSION.md` → **canonical: v0.2**

Behind by one minor version. Minor means *inspect the migration notes and update project
protocol artifacts as applicable* — not "carry on", and not "adopt everything on `main`."

### 2. Inspect the delta

The agent reads the `v0.1 → v0.2` migration entry in `VERSION.md`, not just the version
number. What it finds:

| From the migration notes | Affects Party Games? |
|---|---|
| Workstream concept and lifecycle | **Yes** — three efforts in flight, none tracked |
| `docs/workstreams/` + `ACTIVE.md` | **Yes** — does not exist |
| Checkpoint policy | **Yes** — changes how this very session should end |
| ChatGPT Project operating model and instructions | **Yes** — the Project has no instructions |
| GitHub capability boundary | **Yes** — applies to this agent right now |
| Nothing in v0.1 changed meaning | Existing `PROJECT_MODEL.md` and `DECISIONS.md` carry over untouched |

That last row matters as much as the others. The migration touches **protocol artifacts
only**. Nine decision entries and the project model are not rewritten because the framework
moved.

### 3. State the mismatch

One or two lines, before the design work — not after it, and not buried in a summary at the
end:

> Party Games is on Build OS v0.1; canonical is v0.2. v0.2 added persistent workstreams —
> design state for each effort lives in the repo now instead of in whichever chat we happened
> to use. That directly affects how we run this session, so I'll set it up first: it's a new
> `docs/workstreams/` folder, a board, and a file per effort. Your project model and
> decisions are untouched.

Then it does it, rather than asking permission for each file.

### 4. Perform the migration

Following the migration notes, in order:

```text
party-games/docs/
├── PROJECT_MODEL.md                      unchanged
├── DECISIONS.md                          unchanged (DEC-010 added, see below)
└── workstreams/                          NEW
    ├── ACTIVE.md                         NEW — the three in-flight efforts
    ├── WS-001-card-draft-rework.md       NEW — this session's effort
    ├── WS-002-lobby-reconnect.md         NEW
    └── WS-003-scoring-display.md         NEW
```

The three workstream files are written from what the repository and the owner can supply
today — goal, context, current phase, whatever is already settled. WS-001 gets the most
detail because it is the one being resumed; the other two get enough that the next session
can pick them up. Neither is reconstructed from old chat transcripts.

`CLAUDE.md` is updated:

```diff
+## Build OS
+
+- Canonical framework: 50thycal/build-os
+- Adopted version: v0.2
+- Last compatibility check: v0.2 on 2026-08-22
+
 ## Development protocol

-This project follows **Build OS v0.1** — see 50thycal/build-os.
-
+- Project memory lives in `docs/`: `PROJECT_MODEL.md` (how the system works today),
+  `DECISIONS.md` (why), and `workstreams/` (what is being designed and built now).
 - Features arrive as a Build Card plus a Build Spec. Implement to the spec.
 - Owner decisions in the spec may not be silently changed.
 - Finish by pushing a branch, opening a PR, and writing the Implementation Handoff into
   the PR body. The PR is the handoff; chat is not.
 - Update `docs/PROJECT_MODEL.md` and `docs/DECISIONS.md` where required.
+- Update the workstream file and `docs/workstreams/ACTIVE.md` with phase, PR, and next step.
+- Apply any repository-update block the design agent supplied with the spec.
```

And the ChatGPT Project gets its instructions, from the template, with
`Canonical repository: 50thycal/party-games`.

An upgrade this consequential earns a decision entry — the framework change is Build OS's
history, but *this project moving to it* is this project's:

```markdown
### DEC-010 — Adopt Build OS v0.2; design state moves into the repository
**Date:** 2026-08-22 · **Status:** Accepted
**Context:** Project pinned v0.1. Three efforts in flight, each living in a separate chat …
```

### 5. Continue

> WS-001 — card draft rework — is now in EXPLORE with what we'd settled so far. Where we
> stopped last time was whether a player who leaves mid-draft forfeits their picks. Want to
> start there?

The session continues under v0.2, and ends with a checkpoint — which is itself a v0.2
obligation that would not have existed twenty minutes earlier.

### 6. Record it

The PR that carries the migration and whatever else the session produced:

```markdown
Framework:
- Project adopted: v0.1 → v0.2
- Canonical checked: v0.2
- Compatibility: upgrade required
- Migration performed: workstreams added
```

Four lines. A reviewer sees immediately which protocol the work was done under and that a
migration is inside this diff.

---

## What the agent must not do

Both failures are silent, and both are ruled out by the same check.

**Continue under v0.1.** The session runs the old process, design state stays in the chat, and
the next conversation starts from nothing again. Nothing looks broken. This is the failure the
protocol exists to catch, and the reason the check is a preflight rather than a nicety.

**Blindly adopt `main`.** Reading "canonical is newer" and pulling whatever is on `main`
without opening the migration notes is the opposite failure. An in-flight effort silently
changes shape mid-design, and nobody knows which parts of the delta actually applied. The
agent read the notes, checked each item against this project, and named the one row that
required nothing.

Two more, from the same session:

**Rewriting project history.** The migration touched `CLAUDE.md` and added
`docs/workstreams/`. It did not touch nine decision entries or the project model. A framework
upgrade changes the protocol, not the project's account of itself.

**Recording a check that did not happen.** If canonical `VERSION.md` had been unreachable, the
honest report is "couldn't check, continuing under v0.1, unverified" — not a silent assumption
in either direction.

---

## Checking the criterion

| Requirement | How it was met |
|---|---|
| Detect being one minor behind | Preflight compared `CLAUDE.md` adopted version against canonical `VERSION.md` |
| Inspect the v0.2 migration | Read the `v0.1 → v0.2` entry and checked each item against this project |
| Add the required workstream layer | `docs/workstreams/` with `ACTIVE.md` and three workstream files |
| Update agent instructions | `CLAUDE.md` framework block plus workstream duties; ChatGPT Project instructions added |
| Continue under v0.2 | Session resumed as WS-001 and ended with a checkpoint |
| Not simply continue under v0.1 | The mismatch was stated before the design work, not after |
| Not blindly assume future changes apply | The delta was inspected item by item; one item needed nothing, and that was said |

---

## The same scenario today

Canonical is now **v0.3**, so a Party Games session starting from v0.1 reads **two** migration
entries rather than one: `v0.1 → v0.2` (workstreams, above) and `v0.2 → v0.3` (this
compatibility protocol — add the framework block, mark project-specific rules, include the
`Framework:` field in handoffs).

The mechanics do not change. Read every entry between adopted and canonical, check each item
against the project, apply what applies, say what did not, and record the result:

```markdown
Framework:
- Project adopted: v0.1 → v0.3
- Canonical checked: v0.3
- Compatibility: upgrade required
- Migration performed: workstreams added; framework block recorded
```

That is the whole protocol. It scales by reading more entries, not by doing anything
different.
