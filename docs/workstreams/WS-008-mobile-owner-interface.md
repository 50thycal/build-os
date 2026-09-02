# WS-008 — Mobile-first owner interface

**Phase:** COMPLETE
**Status:** Complete
**Updated:** 2026-08-30
**Build OS:** v0.5
**Implementation State:** Merged in #13, #14, #15 and #16. The owner interface shipped as v0.6, was corrected to v0.7, and v0.8 added the operating mode that lets this repository record acceptance honestly.
**Related PRs:** #13, #14, #15, #16
**Next Step:** None.

## Goal

Make Build OS fast to operate from a phone by separating the framework's internal engineering artifacts from the owner's interface. The owner should be able to start work from ChatGPT, Claude, or another capable agent, approve only the intent/plan that needs judgment, let implementation and independent verification run without acting as a message bus, and receive a short terminal result: **SHIP**, **DECISION**, or **BLOCKED**.

Build OS remains transport-agnostic. GitHub is durable shared memory; no specific chat product becomes mandatory.

## Owner observations

- Long implementation responses are the bottleneck on mobile, not generation speed.
- The existing Build Card / Build Spec / PR handoff / review evidence are useful internally but too technical as the default owner-facing surface.
- Some changes are simple enough to originate directly in Claude; others benefit from a ChatGPT design conversation. Both entry paths must be first-class.
- The owner should not have to relay reviewer findings back to the implementation agent during normal correction loops.
- Technical evidence must remain durable and inspectable even when the default owner summary is heavily compressed.

## Decisions made

- **OD-1 — Entry is agent-agnostic.** Intent may originate in ChatGPT, Claude, another agent, or directly through GitHub. Build OS governs the durable artifacts and gates, not which chat produced the intent.
- **OD-2 — Proportional planning.** Small, low-risk changes may use a compact intent/plan without a full design-room ceremony. Significant or ambiguous changes still receive the existing deeper design treatment underneath.
- **OD-3 — Owner interface is compressed by default.** Owner-facing plan and terminal result are short, plain-language summaries. Full Build Card, Build Spec, implementation handoff, review findings, validation, and evidence remain available but are not the default reading path.
- **OD-4 — Three terminal owner states.** Significant work returns one of: `SHIP`, `DECISION`, or `BLOCKED`.
- **OD-5 — DECISION is scarce.** Use it only when owner judgment is actually required. Routine implementation choices, test failures, and reviewer corrections stay inside the agent loop.
- **OD-6 — BLOCKED is scarcer still.** Use it only when implementation/review cannot responsibly continue without owner input or an external dependency/action outside the agents' authority.
- **OD-7 — Closed verification loop.** After implementation, an independent reviewer verifies actual code against approved intent. Valid findings return directly to the implementation agent on the same PR; the owner does not manually shuttle messages between agents.
- **OD-8 — SHIP must be evidence-backed.** `SHIP` means approved intent is satisfied, required validation is green, independent review clears the current head, material deviations are disclosed, and the merge gate is otherwise satisfied.
- **OD-9 — Mobile-first brevity is normative.** If the owner must read a long technical report to know the next action, the owner interface has failed. Detailed evidence lives behind the summary, not inside it.
- **OD-10 — Existing rigor stays internal.** Build OS does not remove durable specs, workstreams, review evidence, decisions, or project memory. It changes what the owner must consume.

## Build Card

### After this change, the system should...

Let an owner initiate software work from any supported AI surface, approve only a concise behavior-level plan when approval is needed, allow implementation and independent verification to proceed without owner message-shuttling, and return a mobile-friendly **SHIP / DECISION / BLOCKED** result backed by the existing durable Build OS evidence.

### Owner experience

1. **INTENT** — owner describes the desired outcome in natural language from ChatGPT, Claude, or another entry surface.
2. **PLAN** — when the change is significant or ambiguous, Build OS presents a short approval card focused on outcome, scope, notable risk, and unresolved owner choices. Simple changes may proceed under proportionality without a ceremonial plan approval.
3. **BUILD + VERIFY** — implementation agent works the PR; CI/validation runs; independent reviewer checks code against approved intent; valid findings loop back to implementation until clear or escalation is genuinely required.
4. **RESULT** — owner sees exactly one primary state:
   - **SHIP** — safe/recommended to merge; summarize what changed, what was verified, any meaningful residual risk, and the PR.
   - **DECISION** — one or more owner choices are required; present concise options and a recommendation where appropriate.
   - **BLOCKED** — work cannot responsibly continue; state the blocker, why agents cannot resolve it, and the smallest owner/external action needed.

### Definition of done

- The protocol explicitly supports intent originating from ChatGPT, Claude, or another capable agent without changing the lifecycle semantics.
- A normative owner-facing Plan Card exists and is materially shorter/less technical than the Build Spec.
- A normative Owner Result exists with `SHIP`, `DECISION`, and `BLOCKED` states.
- Implementation handoff remains detailed for reviewers/agents but no longer acts as the default owner report.
- Review protocol defines the closed correction loop and when owner escalation is allowed.
- Proportionality distinguishes trivial/simple work from significant work without weakening the merge gate for significant changes.
- Templates and examples make the mobile-first path the path of least resistance.
- README/adoption guidance tells projects to keep final chat responses terse and point owners to the result summary, not the technical handoff.
- No mandatory runtime service, proprietary chat integration, or product-specific dependency is introduced.

### Non-goals

- Building a new mobile app or web UI in this workstream.
- Replacing GitHub as durable state.
- Removing Build Specs, project memory, workstreams, or independent review.
- Making Claude, ChatGPT, or any single vendor mandatory.
- Automatically merging significant PRs without owner authorization.

## Risks / open design constraints

- Compression must not hide a real deviation or unresolved risk. A short summary may omit detail, but not material truth.
- `SHIP` should remain a recommendation/gate state, not an agent silently exercising merge authority.
- The protocol should avoid duplicating the same facts across Plan Card, PR handoff, review summary, and Owner Result; each surface needs a clear audience.
- Closed-loop reviewer/implementer exchange may be automated differently by each project. The protocol should specify the contract and state transitions without requiring a specific GitHub bot or CI product.

## Review State

| PR | Verdict | Reviewed head | Accepted head | Finalization |
|---|---|---|---|---|
| #13 | Changes required | `e215865b92af850504b70b454bb5e0a4cab217c7` | — | — |
| #14 | Not started | — | — | — |
| #15 | Not started | — | — | — |
| #16 | Not started | — | — | pushed |

**Three of these four PRs merged with no verdict at all**, and the table says so rather than
tidying it away. #13's row carries a verdict because it was reviewed retrospectively, after the
merge; #14 and #15 were never reviewed by anyone, and `Not started` is the accurate record.

**No acceptance is retrofitted onto them.** Under v0.8 this repository operates in `solo` mode
and the owner accepts significant work at merge — but that mode did not exist when #13, #14 and
#15 landed, and writing `Owner-accepted` onto them now would record a decision nobody made at
the time. The `MERGED_WITHOUT_APPROVAL` reports against those three are accurate and stay.

**#16 was finalized with `Owner-accepted` pre-written, and no acceptance was ever recorded.**
Corrected here to `Not started`, which is what is true. The row claimed a verdict the
finalization commit had no standing to write — the owner records acceptance at merge, after the
commit exists — and `DEC-023` now states that rule explicitly, for the same reason a finalization
commit cannot name its own SHA.

#16 was to have been the first PR here recorded under `solo` mode. It is still available to be:
the owner can record `Owner-accepted` against `d4477174fcfa51a0e09ab07b44091e780d40d6d8` at any
time and this row becomes true. What could not happen was the record asserting it in advance.

Worth noting it would not have been the first to clear the gate at all — #10 did that under
`DEC-015`, with a comment verdict — which is precisely why v0.8 was needed: the form worked once,
and then three consecutive releases went through with nothing, because a form cannot supply a
second reader.


### #13 — retrospective review, `Changes required`

Reviewed retrospectively, after the merge. **One finding, and it is the reason PR #15 exists.**

> `SHIP` is described as a terminal owner state, but v0.6 allowed it to be emitted before the
> merge-finalization commit and before the reviewer had verified the final head. The owner could
> therefore receive `SHIP` while the implementation agent and the reviewer both still had work
> to do.

Severity: **Blocking** — it is the defining property of the release's central state, and v0.6
contradicted itself about it: the README called `SHIP` "done and verified" while the operative
rules in `OWNER_INTERFACE.md` permitted it twice before that was true.

Corrected in **PR #15**, which releases **v0.7**: `SHIP` for significant work now requires all
six of green validation, no unresolved `Blocking`/`Should fix`, independent approval,
finalization pushed, final head verified, and no undisclosed deviation. The two earlier moments
become no-result states. `DECISION` and `BLOCKED` are unnarrowed. See `DEC-020`.

The rest of the v0.6 design was approved: entry-point neutrality, Intent Intake, the Owner Plan,
proportionality, the closed reviewer→implementer loop, and the untouched v0.5 merge mechanics
all stand.

### #13 — how it merged

**PR #13 merged without an independent approved verdict, and without a merge-finalization
commit.** No reviewer held it and none was recorded — `MERGED_WITHOUT_APPROVAL` in the terms of
`framework/BUILD_OS_PARSE_CONTRACT.md`, on a workstream that declares `Build OS: v0.5` and is
therefore gated. Nothing was recorded against it at merge time; an earlier commit on the PR said
`In review`, which overstated what had happened, and #14 corrected that to `Not started`. The
table now reads `Changes required`, which is the retrospective review's actual verdict — the
review happened after the merge rather than before it, and that is what the rest of this section
records.

This record is the recovery in `framework/REVIEW_PROTOCOL.md` → *Recovery: merged before
review*, at its first step. The merged code is not being treated as settled because it is on
`main`, and the review that did not happen is not being written up as though it did. The head
to review is `e215865b92af850504b70b454bb5e0a4cab217c7` — the merge commit's parent on the
branch, and the last head the implementation actually produced.

**Retrospective approval is worth having and is not the same thing as a gate that was
honoured.** The record should not blur them, so this note stays in the file after the review
lands, and the verdict that follows will say it was retrospective.

The recovery is closed. Recovery step 5 forbade completion while a correction was outstanding;
the correction was #15, and #16 resolves the condition that made three merges ungatable in the
first place. Completion's memory obligations are met by `DECISIONS.md` (DEC-016 through DEC-021)
and by `README.md`, which is this repository's architecture document — Build OS has no
`PROJECT_MODEL.md` because the framework is the system it describes.

## Outcome

The owner interface shipped, and then had to survive its own protocol twice:

- **v0.6** — the owner layer: Intent Intake, entry-point neutrality, the Owner Plan,
  `SHIP | DECISION | BLOCKED`, proportionality, the closed reviewer→implementer loop.
- **v0.7** — `SHIP` narrowed to the single point where only the owner's merge remains, after a
  retrospective review found it could be emitted while agents still had work to do.
- **v0.8** — operating modes, because three consecutive releases proved this repository could
  not satisfy the gate it was asserting.

The third of those was not in the Build Card and is the most useful thing the workstream
produced. The owner interface was built to stop the framework wasting the owner's attention;
what it exposed on the way is that the framework had also been asserting a check it never
performed. Both are the same failure — a record describing something other than what happens —
and Build OS's own premise is that such records are worse than none.

Four implementation decisions are the ones most worth a reviewer's attention, because each
resolved a gap or a tension in the issued spec rather than merely expanding it:

- **The three states cover simple work too.** OD-4 scoped `SHIP | DECISION | BLOCKED` to
  significant work while spec §11 ended a simple change in an unnamed "concise completion
  result", which contradicts AC-5. Resolved by having simple work also return `SHIP`, with its
  `Verification` naming the classification. No fourth state was invented.
- **`SHIP` is defined against the real v0.5 gate.** Spec §4.2's "all prerequisites except the
  owner's merge action" is not checkable, because finalization moves the head after approval and
  the final head is verified by the reviewer on the PR. `Next action` now carries the three
  points at which the gate terminates, which is what makes AC-6 enforceable.
- **A pre-terminal state was needed and is not a fourth state.** A PR awaiting review has
  reached no result; it says so and carries no marker.
- **Proportionality genuinely loosened.** v0.5 excluded all owner-visible change from the simple
  class; the spec's own examples (copy changes, visual tweaks) are owner-visible. Reconciled on
  the principle underneath — no owner trade-off chosen on the owner's behalf — and disclosed as
  a real, one-directional change rather than papered over. See `DEC-018`.

`AC-14` is satisfied narrowly and deliberately: the only machine-readable addition is the
`owner_result` enum in `contracts/agent-session-checkpoint.v1.schema.json`, validated against
the schema and against fixtures during implementation. Build OS ships no test harness and
`VERSION.md` excludes one on purpose, so no harness was added to satisfy the criterion.
