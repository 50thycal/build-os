# Active Work

**Updated:** 2026-08-24 · **Build OS v0.5**

Build OS's own active-work board. The Project Intelligence Companion program (design: PR #4,
plan: `plans/PROJECT_INTELLIGENCE_FEED.md`) is tracked here until the Companion application is
extracted to `50thycal/build-os-companion` — see `DEC-008`. On extraction, WS-001 … WS-006 and
this board move with it; protocol contracts stay in this repository.

| ID | Workstream | Phase | Status | Current Next Step | Related PR |
|---|---|---|---|---|---|
| WS-001 | Companion domain + event ledger | BUILDING | Active | Land Phase 0 domain, parsers, attention rules, fixtures | #5, #6 |
| WS-002 | GitHub feed MVP | BUILDING | Active | Wire polling sync + feed cards on the Phase 0 domain | #6 |
| WS-003 | Build OS workstream integration | READY_TO_BUILD | Active | Promote the Phase 0 parsers to a live per-repository sync | #6 |
| WS-004 | Agent session checkpoint protocol | READY_TO_BUILD | Active | Implement the checkpoint intake API against the v1 contract | #5 |
| WS-005 | Attention engine + catch-up briefing | BUILDING | Active | Extend deterministic rules into `Needs Me` and `Since I last checked` | #6 |
| WS-006 | Podcast renderer | IDEA | Blocked | Blocked until WS-005 produces a validated fact pack + written briefing | — |
| WS-007 | Closed-loop feedback, review, and merge delivery | REVIEW | Active | Re-review #7 (round 2 findings corrected); owner to confirm D1–D5 | #7 |

## Recently completed

| ID | Workstream | Completed | Outcome |
|---|---|---|---|
| — | — | — | — |
