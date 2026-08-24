# Framework Sync

**Build OS v0.5**

Adopted repositories **pin** a Build OS version. Pinning keeps work reproducible and stops a
framework change from silently redefining an effort that is already in flight.

The cost of pinning is drift: a project can sit on v0.1 for months while the canonical
framework moves to v0.3, and every agent session continues under obsolete protocol without
anyone noticing. Nothing in the project is wrong, exactly — it is just running a version of
the process that no longer exists.

This document defines the **framework compatibility check**: the preflight that makes
staleness visible and actionable, without turning pinned versions into blind tracking of
`main`.

Two failure modes it exists to prevent, equally:

- **Silent staleness** — an agent works under v0.1 not knowing v0.3 exists.
- **Silent drift** — an agent adopts whatever is on `main` today without inspecting what
  changed, and an in-flight effort quietly changes shape.

Neither pinned nor latest is automatically correct. The check is what makes it a decision.

---

## The preflight

```text
Local adopted Build OS version
        ↓
Canonical 50thycal/build-os VERSION.md
        ↓
      Compare
        ↓
  Same  →  continue
        ↓
 Newer  →  inspect version delta / migration notes
        ↓
  Determine impact
        ↓
  upgrade project protocol where required
        ↓
      continue work
```

### When it runs

Before:

- beginning or resuming **substantial** Design Room work,
- producing a **Build Spec**,
- **significant architectural implementation**,
- **independent review** of a significant PR.

### When it does not

It does **not** need to happen for every trivial edit or every chat message. A typo fix, a
one-line answer, a small bug fix on an existing design, a follow-up exchange inside a session
that already ran the check — none of these need a preflight.

The working test: *if this work would be done differently under a newer protocol, check
first.* Most work would not.

Once per session, before the first substantial piece of work, is the normal cadence. A long
session does not need a second check unless it starts something materially new.

---

## The four outcomes

**Same version.** Continue. Update the last-checked date if you like; nothing else to do.

**Canonical is newer by a patch.** Wording, clarification, template polish. No protocol
behavior change. Acknowledge it, bump the adopted version, record the check, continue. Do not
manufacture project changes for a patch.

**Canonical is newer by a minor.** New artifacts, stages, requirements, or agent behavior.
**Inspect the migration notes** for every version between the project's and canonical, then
apply what they require to the project's protocol artifacts. Then continue, under the new
version.

**Canonical is newer by a major.** Lifecycle, role, or responsibility changes. Treat as an
explicit protocol migration and perform it **before** substantial project work continues —
not alongside. A major version means the process the work would be done under has changed
shape, so doing the work first means doing it under a protocol you have already decided to
leave.

**Canonical is older than adopted.** Something is wrong: a typo in the project's version, a
stale fork, or a mid-flight framework revert. Say so and stop rather than guessing.

---

## Project metadata

An adopted repository records its framework state in its existing agent-instructions file —
`CLAUDE.md`, or the project's equivalent. No new configuration file, no schema, no tooling.

```markdown
## Build OS

- Canonical framework: 50thycal/build-os
- Adopted version: v0.5
- Last compatibility check: v0.5 on 2026-08-24
```

Three fields, and each earns its place:

- **Canonical framework** — where to check. Explicit, so an agent never has to infer it.
- **Adopted version** — what this project's protocol actually is. The pin.
- **Last compatibility check** — which canonical version was last compared against, and when.
  This is what distinguishes *checked and unchanged* from *never checked*, which the adopted
  version alone cannot express.

From v0.5 the date on that line does a second job: it is the project's **adoption boundary**.
Work that predates it was done under the previous version, and nothing a later version introduces
reaches back to judge it — a completed workstream, or a PR opened and merged before that date, is
not retroactively brought under the new rules. That is why the date matters and why an upgrade
should carry the day it happened rather than a version alone.

The block lives in the agent-instructions file because that file is already read at the start
of every session by every agent that matters. A dedicated metadata file would be read by
nothing that does not already read `CLAUDE.md`, and would be one more thing to forget.

**Adopted version and last-checked can differ**, legitimately: a project that checked v0.3,
inspected the delta, and deliberately chose to stay on v0.2 until an in-flight effort lands
records `Adopted version: v0.2` and `Last compatibility check: v0.3`. That is a decision, and
it should also be a `DEC-n` entry saying why and when it will be revisited. What must never
happen is a project sitting behind canonical with nobody having looked.

---

## Session behavior

When an agent discovers that canonical Build OS is newer than the adopted version:

1. **Read `VERSION.md` and the relevant migration notes** — every entry between the project's
   adopted version and canonical, not just the newest.
2. **Determine whether the difference affects this project's workflow.** A new artifact the
   project already has an equivalent of, or a stage the project never reaches, may need
   nothing. Say so explicitly rather than assuming it.
3. **State the mismatch.** One or two lines, to the owner, before doing the work:

   > Project is on Build OS v0.1; canonical is v0.3. v0.2 added persistent workstreams and
   > v0.3 added this compatibility check. Both affect how we run design sessions, so I'll set
   > those up before we continue.

4. **Apply required protocol migration changes** before or alongside substantive work —
   before, for a major.
5. **Update the project's adopted-version reference.**
6. **Record the compatibility check** — the last-checked field, and the `Framework:` field in
   the resulting PR handoff.
7. **Do not silently continue under obsolete protocol** when the newer version materially
   changes required behavior.

If no migration is required, still update and record the check. "Checked, nothing needed" is
a valuable record — it is what stops the next session from re-deriving the same conclusion.

### A minor upgrade can change what is required of work already in flight

Most minor upgrades add artifacts or clarify process, and in-flight work continues under
them without friction. Some impose a *rule* — and a rule applies to the open PRs the project
already has.

v0.5's merge gate is the first of these. On adoption:

- **Still-open significant PRs come under the gate.** They need an independent verdict naming
  their current head before they merge, even though they were opened under v0.4. That is the
  point of adopting the version, and it is cheaper than discovering afterwards which PRs
  slipped through.
- **Merged history is not reopened.** Nothing retroactively invalidates a PR that landed
  before adoption, and no completed workstream is rewritten to add fields it never had.
- **Active workstreams gain the new fields at their next review checkpoint**, not in a
  bulk edit of every file in the directory.
- **Completed workstreams are untouched, and stay untouched.** Adopting v0.5 does not gate the
  history the project already has. Where a finished workstream should nonetheless remain under
  the new rules — an audit trail worth keeping honest — say so explicitly with a `Build OS:`
  header on that file, rather than relying on the project pin, which deliberately does not reach
  finished work.

State the effect on open PRs when announcing the upgrade — an owner who learns at merge time
that a new gate applies will reasonably read it as the framework getting in the way.

If a project genuinely cannot absorb the change mid-flight, defer it explicitly: keep the
adopted version, update last-checked, and record a decision naming the reason and what would
trigger a revisit. A deferral on the record is a legitimate outcome. Silent non-adoption is
not.

### What migration does not touch

**Do not automatically rewrite project-specific architecture or decisions merely because
Build OS changed.**

A framework upgrade changes the *protocol* — the artifacts, the process, the agent
obligations. It does not change what the project's system does, why it does it, or what was
decided. `PROJECT_MODEL.md` content, `DECISIONS.md` entries, and in-flight designs carry over
untouched unless a migration note explicitly says otherwise.

A migration that ends up rewriting a project's decision log has gone wrong.

This holds for completed workstreams too. A finished `WS-###` file records what was true when
the work happened; adding v0.5 review fields to it retroactively would fabricate a review
that never occurred.

### When GitHub is unreachable

Same rule as everywhere else in Build OS: **never claim a check that did not happen.** If
canonical `VERSION.md` cannot be read, say the compatibility check could not be performed,
proceed under the pinned version, and record it as unchecked. An unchecked session is
recoverable; a falsely recorded check is not.

---

## Project-specific rules

An adopted repository may contain project-specific protocol additions. These are allowed and
often sensible — a project may want a stricter review bar, an extra artifact, or a
domain-specific Build Card section.

They must be **clearly marked as project-specific** and must not accidentally redefine Build
OS itself:

```markdown
## Build OS

- Canonical framework: 50thycal/build-os
- Adopted version: v0.5
- Last compatibility check: v0.5 on 2026-08-24

### Project-specific: additions to Build OS

- Every Build Card must name the game modes it affects.
- Balance changes require a playtest note in the PR handoff, beyond the standard sections.
```

The `Project-specific:` marker is what lets an upgrading agent tell the difference between
"this project extends the framework here" and "this project is running an old version of the
framework here." Without it, a local rule that happens to contradict a newer Build OS
requirement is indistinguishable from staleness, and gets silently overwritten by migration.

**When a project-specific rule conflicts with a newer Build OS requirement, surface the
conflict rather than silently choosing one.** State both, say which work is affected, and let
the owner decide. Either answer can be right — the project rule may exist for a reason the
framework does not know about, or it may be a workaround the new version makes unnecessary.
What is never right is picking one quietly.

---

## PR handoff field

Significant Build OS implementation handoffs carry a compact framework field:

```markdown
Framework:
- Project adopted: v0.3
- Canonical checked: v0.3
- Compatibility: current
```

or, where an upgrade was performed:

```markdown
Framework:
- Project adopted: v0.1 → v0.2
- Canonical checked: v0.2
- Compatibility: upgrade required
- Migration performed: workstreams added
```

Four lines at most. It exists so a reviewer can see at a glance which protocol the work was
done under, and so a migration performed mid-PR is visible rather than buried in a diff.

Small PRs do not need it. See `framework/CLAUDE_HANDOFF.md`.

---

## Future automation

A future CI job or scheduled task could detect repositories whose adopted Build OS version is
behind canonical — reading the framework block from each project's `CLAUDE.md`, comparing
against this repository's `VERSION.md`, and opening an issue or a notification for those that
have fallen behind.

That is deliberately **not built yet**, and this document does not depend on it. The protocol
must work manually through agents first: automation built before the manual process has been
exercised encodes guesses about what the check should do, and a bot that files upgrade issues
nobody acts on is worse than no bot.

If it is built later, it should stay lightweight — a scheduled read of a few files, not a
service. It would report staleness; it would not perform migrations. Deciding whether an
upgrade affects in-flight work is the judgment the protocol exists to preserve.

---

## Anti-patterns

| Anti-pattern | What it looks like | Why it hurts |
|---|---|---|
| Blind tracking | Adopting whatever is on `main` without reading the delta | In-flight work silently changes shape mid-effort |
| Silent staleness | Sessions continuing under v0.1 with v0.3 canonical | The project runs a process that no longer exists |
| Phantom check | Recording a check that could not be performed | Removes the one signal that says whether anyone looked |
| Migration overreach | Rewriting `DECISIONS.md` because the framework changed | Destroys project history to satisfy a protocol change |
| Unmarked local rules | Project additions indistinguishable from framework text | Upgrades either clobber them or preserve staleness |
| Silent conflict resolution | Choosing between a project rule and a new requirement alone | The owner learns their rule was overridden from the diff |
| Preflight ceremony | A version check announced before every message | The check becomes noise, then gets skipped entirely |
