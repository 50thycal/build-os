# WS-010 — Finite work admission and closure

**Phase:** REVIEW
**Status:** Active
**Created:** 2026-09-06
**Updated:** 2026-09-06
**Build OS:** v0.12
**Implementation State:** Core protocol and reusable skill are in PR review; adoption surfaces remain to be integrated before merge.
**Related PRs:** This PR
**Next Step:** Review the protocol and integrate its cross-references before merge.

## Goal

Make a Build OS mission end when its approved outcome is complete, instead of allowing every adjacent observation to become another active task.

## Decisions Made

- Discovery does not itself create work; owner admission does.
- In-scope defects remain in the same workstream and PR.
- Deferred improvements are compact parked candidates, not automatically opened tickets.
- The reusable skill carries one mission across sessions and is bounded by its acceptance checks.

## Non-Goals

- Changing the existing lifecycle phases or review gate.
- Deleting project issue trackers or forbidding deliberately owner-created work.
- Retroactively rewriting completed workstreams.

## Acceptance Checks

- A canonical protocol defines `FIX NOW`, `PARK`, `DISCARD`, and `OWNER DECISION`.
- Handoff and workstream guidance require a mission contract and prohibit automatic activation.
- A reusable `finite-work-handoff` skill is included and points to the canonical protocol.
- Default owner results become brief, plain-language, and explicit about completion.

## Related Decisions

DEC-025.
