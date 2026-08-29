# Active Work

<!-- Build OS's own active-work control board. Protocol work only. -->

**Updated:** 2026-08-29 · **Build OS v0.5**

The Project Intelligence Companion program moved to
[`50thycal/build-os-companion`](https://github.com/50thycal/build-os-companion) on 2026-08-24,
taking WS-001 … WS-006 and their board with it (`DEC-008`, `DEC-011`). Its board now lives at
[`docs/workstreams/ACTIVE.md`](https://github.com/50thycal/build-os-companion/blob/main/docs/workstreams/ACTIVE.md)
in that repository.

This board tracks protocol work in this repository: `framework/`, `contracts/`, `templates/`.

| ID | Workstream | Phase | Status | Current Next Step | Related PR |
|---|---|---|---|---|---|
| WS-008 | Mobile-first owner interface | READY_TO_BUILD | Active | Claude implements approved vNext spec on the design-handoff PR; preserve entry-point neutrality and SHIP / DECISION / BLOCKED owner states | design handoff pending |

<!-- Phase: IDEA · EXPLORE · MODEL · DECIDE · BUILD_CARD · READY_TO_BUILD · BUILDING · REVIEW
     Status: Active · Paused · Blocked · Abandoned
     Completed and abandoned workstreams leave this table; their files remain. -->

## Recently completed

| ID | Workstream | Completed | Outcome |
|---|---|---|---|
| WS-001 … WS-006 | Companion program | 2026-08-24 | Moved to `50thycal/build-os-companion` with the application (`DEC-011`) |
| WS-007 | Closed-loop feedback, review, and merge delivery | 2026-08-24 | Build OS v0.5 released in #7 (`DEC-012`, `DEC-013`, `DEC-014`), finalized in #9. Both merged without an approved verdict on their final heads — recorded in the workstream, not reversed. `DEC-015` (#10) makes the gate satisfiable where GitHub allows no review, and #10 is the first PR here to clear it. |
