# Active Work

<!-- Build OS's own active-work control board. Protocol work only. -->

**Updated:** 2026-09-06 · **Build OS v0.12**

The Project Intelligence Companion program moved to
[`50thycal/build-os-companion`](https://github.com/50thycal/build-os-companion) on 2026-08-24,
taking WS-001 … WS-006 and their board with it (`DEC-008`, `DEC-011`). Its board now lives at
[`docs/workstreams/ACTIVE.md`](https://github.com/50thycal/build-os-companion/blob/main/docs/workstreams/ACTIVE.md)
in that repository.

This board tracks protocol work in this repository: `framework/`, `contracts/`, `templates/`.

| ID | Workstream | Phase | Status | Current Next Step | Related PR |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

<!-- Phase: IDEA · EXPLORE · MODEL · DECIDE · BUILD_CARD · READY_TO_BUILD · BUILDING · REVIEW
     Status: Active · Paused · Blocked · Abandoned
     Completed and abandoned workstreams leave this table; their files remain.

     ACTIVE-WORK LIMIT: three (the v0.12 default) — one being built, one being reviewed or
     verified, one investigation or operational concern. A fourth requires completing, pausing
     or abandoning one of the three. See framework/FINITE_WORK.md. -->

## Parked

<!-- Deferred candidates. One line each, no ID, no phase, no owner, no estimate. Nothing
     schedules this and no agent starts anything here; the owner promotes a candidate, or it
     stays. See framework/FINITE_WORK.md. -->

- None.

## Recently completed

| ID | Workstream | Completed | Outcome |
|---|---|---|---|
| WS-010 | Finite work admission and closure | 2026-09-06 | Discovery no longer creates work; only owner admission does. Protocol and skill in #21, integration and v0.12 in #22 (`DEC-025`). Boards gain an active-work limit of three and a parking lot; a completed workstream's next step is `None.` |
| WS-009 | Agent-invokable skills surface | 2026-08-30 | `skills/` accepted in #17 and integrated in #18 as v0.9; framework stays canonical where both apply (`DEC-022`) |
| WS-008 | Mobile-first owner interface | 2026-08-30 | Owner layer shipped as v0.6, corrected to v0.7, and v0.8 added operating modes |
| WS-001 … WS-006 | Companion program | 2026-08-24 | Moved to `50thycal/build-os-companion` with the application (`DEC-011`) |
| WS-007 | Closed-loop feedback, review, and merge delivery | 2026-08-24 | Build OS v0.5 released in #7 (`DEC-012`, `DEC-013`, `DEC-014`), finalized in #9. Both merged without an approved verdict on their final heads — recorded in the workstream, not reversed. `DEC-015` (#10) makes the gate satisfiable where GitHub allows no review, and #10 is the first PR here to clear it. |
