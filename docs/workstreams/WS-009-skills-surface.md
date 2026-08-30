# WS-009 — Agent-invokable skills surface

**Phase:** COMPLETE
**Status:** Complete
**Created:** 2026-08-30
**Updated:** 2026-08-30
**Build OS:** v0.9
**Implementation State:** Merged in #17 (the surface and the first skill) and #18 (integration, boundary enforcement, v0.9).
**Related PRs:** #17, #18
**Next Step:** None.

## Goal

Give Build OS a surface for procedures aimed at an **agent acting mid-task**, as distinct from
`framework/` documents aimed at an **owner reading to decide** — without creating a second place
where the protocol gets written.

## Context

Created retroactively, and deliberately so. #17 introduced `skills/` and the first skill,
flagging the structural choice rather than settling it, and merged without a workstream behind
it. Under `framework/WORKSTREAMS.md` a new top-level artifact class in a protocol repository is
significant work, and significant work that acquires a workstream late acquires one anyway —
the *Orphan promotion* anti-pattern is exactly this, and the remedy is a file, not an apology.

## Decisions Made

- **`skills/` is a supported surface.** A skill is markdown with frontmatter, so `Contains code:
  No` still holds. (`DEC-022`)
- **The boundary, and it is the whole decision:** if the owner reads it to decide, it is a
  `framework/` document; if an agent acts on it mid-task, it is a skill. Where both are true the
  framework document is **canonical** and the skill points at it.
- **Skills are versionless and adopted by copy** — the one part of Build OS exempt from the
  compatibility check. A skill changing under a project mid-thread is a worse problem than a
  stale one.
- **Skills are outside the parse surface.** They instruct agents; they are not project state.

## Non-Goals

- Versioning skills, or asking projects to track this repository's copies.
- Any runtime, loader, or tooling. A skill is a file an agent reads.
- Moving anything out of `framework/` into `skills/`.

## Current Mental Model

```text
owner reads to decide  ────►  framework/   (canonical where both apply)
                                  ▲
                                  │ skill points at it, never restates it
                                  │
agent acts mid-task    ────►  skills/
```

## Review State

| PR | Verdict | Reviewed head | Accepted head | Finalization |
|---|---|---|---|---|
| #17 | Not started | — | — | — |
| #18 | Owner-accepted | — | pending — recorded by the owner at merge | pushed |

**#17 merged with no verdict and no workstream.** Recorded as it happened, not retrofitted: v0.8
`solo` mode was on `main` by then and an `Owner-accepted` record was available, but none was
made, so `Not started` is the accurate value and `MERGED_WITHOUT_APPROVAL` against it is correct.

**#18's row is a forward claim until the owner records the acceptance.** `Accepted head` reads
`pending` rather than naming a SHA, because the head this finalization commit produces does not
exist yet and an acceptance nobody has given cannot be written in advance. That distinction is
not pedantry here — WS-008's table pre-wrote exactly such a claim for #16 and made `main` assert
an acceptance that never happened.

## Findings carried into this workstream

`research-decision-brief` restated the owner-facing decision contract — options, costs, a
recommendation — without referencing `framework/OWNER_INTERFACE.md`, which already defines one
terminal result per piece of work in a machine-readable form. Two statements of one rule from
the first commit, in the same PR whose README stated the rule against exactly that.

Corrected in #18: the skill now produces a `DECISION` or `BLOCKED` result in the protocol's form
and treats the brief as the working material behind it. One rule travelled the other way and is
now part of the `DECISION` result itself — *where stopping is a real option, list it.*

The lesson is worth keeping: **a rule stated in a README does not enforce itself.** Every future
skill gets one review question ahead of the others — does this restate something `framework/`
already says?

## Related Decisions

`DEC-022`.

## Related PRs

#17, #18.
