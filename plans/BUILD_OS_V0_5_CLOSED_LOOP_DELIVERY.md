# Build Spec — Build OS v0.5 Closed-loop Delivery

**Status:** Approved 2026-08-24; implemented on PR #7, pending independent review
**Workstream:** WS-007 · **Build Card:** [`docs/workstreams/WS-007-closed-loop-delivery.md`](../docs/workstreams/WS-007-closed-loop-delivery.md#build-card) · **Written under Build OS v0.4**

Canonical `VERSION.md` was v0.4 when this spec was written on 2026-08-24. Implementation proceeded on an owner instruction to build what PR #7 published, given in the implementation session and **not recorded in this repository** — quoted, with its limits, in [WS-007's Decisions Made](../docs/workstreams/WS-007-closed-loop-delivery.md#decisions-made). Durable owner confirmation of D1–D5 is outstanding. This spec is the v0.5 minor protocol release, implemented on the same branch and PR the design handoff opened.

---

## The three-way split

### Owner decisions — built 2026-08-24, owner confirmation outstanding

Built on the owner's instruction to proceed with what PR #7 published. That instruction is a session message, not a project record, and it does not by itself constitute an itemized ruling on D1–D5 — a recommendation in this spec is not an approval. See WS-007's Decisions Made for the quote, its limits, and the one-line confirmation that would settle it.

- **OD-1.** Build OS adds a named **Capture Only** mode for live playtests, brainstorming dumps, and multi-message owner feedback. While active, the design agent records observations but does not analyze, recommend, decide, create/update repository artifacts, or trigger implementation unless the owner explicitly ends or overrides capture mode.
- **OD-2.** Ending Capture Only requires a consolidation pass that separates `Observation`, `Interpretation`, `Proposed rule`, and `Approved decision`. Only approved decisions enter the Build Card's `Decisions made` or the Build Spec's owner decisions.
- **OD-3.** A design agent with GitHub write access may create a single draft **Design Handoff PR** when an approved Build Card and Build Spec are issued. The implementation agent continues the same branch and PR. Without write access, the existing precise repository-update-block path remains authoritative.
- **OD-4.** A significant implementation PR may not merge until an independent reviewer records `Approved` or `Approved with follow-ups` for the current reviewed head. The implementation agent may not approve or merge its own significant PR.
- **OD-5.** `Changes required` returns the workstream from `REVIEW` to `BUILDING`. If the implementation PR is open, corrections remain on it; if it was already merged, a linked corrective PR is required and the workstream remains active until the correction passes review.
- **OD-6.** After approval and before merge, a documentation-only **merge-finalization commit** updates the workstream and active board to the state that becomes true when that PR lands. The reviewer verifies the final head; merge uses that exact head. Executable changes after approval invalidate the verdict and require re-review.
- **OD-7.** Workstream review state gains stable `Verdict` and `Reviewed head` fields. Machine consumers may surface `missing review`, `stale review`, `merged without approval`, and `workstream/PR state mismatch` warnings but do not silently repair them.
- **OD-8.** The package releases as Build OS v0.5 with complete migration notes. Downstream projects adopt or explicitly defer through the existing compatibility preflight; no project silently tracks canonical `main`.

### Implementation discretion

Choose exact prose organization, whether the new transition table lives in `REVIEW_PROTOCOL.md` or `WORKSTREAMS.md` with cross-links, fixture names, parser type names, and how Companion represents integrity-warning codes internally. Preserve the current Markdown-first protocol, dependency boundaries, conservative parsing, and existing lifecycle phases.

### Stop / escalation conditions

Stop and return to the owner if:

- The package would require a new lifecycle phase rather than orthogonal review metadata.
- A truthful same-PR finalization cannot be reconciled with Build OS's rule that canonical main-branch memory must describe current reality.
- Enforcing the reviewed-head gate requires mandatory GitHub automation or a service dependency.
- The migration would rewrite project architecture, product decisions, or completed historical workstreams.
- The Companion extraction boundary in DEC-008 would be violated.
- Any requirement would make capture mode store chat transcripts or raw playtest recordings.

Otherwise use editorial and implementation judgment and disclose any deviation in the PR handoff.

---

## 1. Objective

Ship Build OS v0.5 as a coherent feedback-to-merge closure protocol derived from Party Games WS-002. The release must preserve the parts that worked—owner-focused decisions, one durable handoff surface, independent code review, and pinned-version adoption—while closing four demonstrated gaps: unnamed capture-only sessions, improvised design-stage PR ownership, merge before independent review, and stale durable workstream state after delivery transitions.

## 2. Owner-approved behavior

> After this change, the system should preserve owner feedback faithfully, route implementation through one durable PR, and prevent significant work from merging until independent review and project memory agree on the current code.

OD-1 through OD-8 are the complete owner-visible protocol contract. No automation is required to satisfy them; tooling support is detection and visibility, not the source of authority.

## 3. Repository context

- `framework/DESIGN_ROOM.md` owns feedback collection and the transition into decisions.
- `framework/WORKSTREAMS.md` owns lifecycle, checkpoints, and durable state.
- `framework/BUILD_SPEC.md` owns the implementation packet and stop conditions.
- `framework/CLAUDE_HANDOFF.md` owns implementation PR responsibility and handoff quality.
- `framework/REVIEW_PROTOCOL.md` owns independent review, severity, verdict, and next action.
- `framework/FRAMEWORK_SYNC.md` and `VERSION.md` own downstream adoption.
- `framework/BUILD_OS_PARSE_CONTRACT.md` owns stable machine-readable Markdown fields and integrity warnings.
- `templates/` must make the new behavior the path of least resistance.
- `examples/FEATURE_LIFECYCLE.example.md` and a new or extended recovery example demonstrate end-to-end use.
- `companion/` currently parses Build OS artifacts but must remain self-contained per DEC-008.

## 4. Architecture constraints

- Build OS remains documentation, protocol, templates, and contracts; it does not gain a required runtime, CI job, GitHub App, or package dependency.
- GitHub remains authoritative; chat remains transport.
- Existing lifecycle phases remain unchanged. Capture Only is a session mode, review verdict is review metadata, and finalization is a checkpoint—not new phases.
- Parsing stays conservative. Missing or malformed review fields are absent plus a warning, never guessed.
- A workstream and PR remain many-to-many.
- Version pins remain deliberate; v0.5 propagates only through compatibility checks and migration notes.

## 5. Implementation requirements

- **R-1 (OD-1, OD-2).** Add a Capture Only subsection to `DESIGN_ROOM.md` covering entry phrase/intent, prohibited actions, lightweight acknowledgement, accumulation across messages, explicit exit, and the mandatory four-way consolidation. State that capture mode can be overridden by a direct owner instruction.
- **R-2 (OD-1).** Update the ChatGPT Project instructions template so “do not act yet,” “keep track,” “playtest notes,” and equivalent intent enter Capture Only without repeatedly asking for confirmation.
- **R-3 (OD-2).** Provide a compact consolidation format that preserves raw observations separately from proposed fixes and records which items remain questions.
- **R-4 (OD-3).** Define the Design Handoff PR in `DESIGN_ROOM.md`, `WORKSTREAMS.md`, and `CLAUDE_HANDOFF.md`: created only after Build Card approval/spec issuance; draft; may initially contain only checkpoint/spec changes; named as the future implementation PR; implementation agent continues it; never open a second PR for the same implementation unless the first merged/closed or an escalation requires it.
- **R-5 (OD-3).** Clarify phase transitions: spec issued and draft PR opened may move `READY_TO_BUILD → BUILDING` only when implementation actually begins; a parked design-handoff PR may remain `READY_TO_BUILD` with Implementation State `spec issued; draft handoff open`.
- **R-6 (OD-4).** Add a normative merge gate to `REVIEW_PROTOCOL.md`: significant PRs require an independent verdict on the current head, green project-required validation, no unresolved Blocking/Should fix finding, and a truthful merge-finalization checkpoint.
- **R-7 (OD-4).** State role authority explicitly: implementation agents prepare and respond; independent reviewer approves/requests changes; owner or authorized merger merges. An implementation agent may merge only after explicit owner direction and an independent approved verdict exists.
- **R-8 (OD-4, OD-7).** Require review summaries/checkpoints to record `Verdict` and full 40-character `Reviewed head` SHA. Allowed verdicts: `Not started`, `In review`, `Changes required`, `Approved`, `Approved with follow-ups`.
- **R-9 (OD-4).** Define staleness: any executable, test, dependency, migration, configuration, or behavior-documentation change after `Reviewed head` invalidates approval. A change limited to designated finalization surfaces may receive a lightweight final-head verification rather than a full repeat review, but the reviewer must still record the final head.
- **R-10 (OD-5).** Add a review transition table covering approval, follow-ups, changes required on an open PR, accidental/pre-protocol merge, corrective PR, abandoned finding, and owner decision escalation.
- **R-11 (OD-5).** Recovery after merge must be explicit: publish the finding on the merged PR, create/link a focused corrective PR, checkpoint the workstream, run independent re-review, and do not call the workstream complete while the correction is outstanding.
- **R-12 (OD-6).** Define merge finalization as the last same-PR documentation checkpoint after approval. It updates phase/status, Implementation State, Review State, Related PRs, Next Step, and `ACTIVE.md` to what will be true when the PR merges. If the workstream completes, it also updates `PROJECT_MODEL.md`/`DECISIONS.md` and removes the active row per existing completion rules.
- **R-13 (OD-6).** The finalization commit may touch only named documentation/protocol-memory surfaces and PR metadata. Any executable or behavioral change reopens full review. Merge must target the verified final head SHA.
- **R-14 (OD-7).** Update `WORKSTREAM.template.md` so `Review State` begins with stable fields:
  - `**Verdict:** <allowed value>`
  - `**Reviewed head:** <40-char SHA or —>`
  - optional prose below.
- **R-15 (OD-7).** Update `REVIEW_SUMMARY.template.md` with the same verdict/head fields plus whether the head is current at publication.
- **R-16 (OD-7).** Update `PR_HANDOFF.template.md` with `Review gate: Pending independent review` and finalization instructions, without letting the implementation agent claim approval.
- **R-17 (OD-7).** Extend `BUILD_OS_PARSE_CONTRACT.md` to parse verdict/reviewed head conservatively and define integrity warnings for malformed fields, approved-without-head, reviewed-head differing from current PR head, merged significant PR without approved verdict, and merged/closed PR language inconsistent with durable workstream state.
- **R-18 (OD-7).** Update Companion parser domain/fixtures/tests only as needed to support the new stable fields and warnings. Keep `companion/` self-contained and do not add runtime infrastructure.
- **R-19 (OD-8).** Bump every framework/template version reference from v0.4 to v0.5 where the document participates in this protocol. Do not blindly replace historical references or migration history.
- **R-20 (OD-8).** Add `v0.4 → v0.5` migration notes to `VERSION.md` with exact adopting-project steps:
  1. update the Build OS block to adopted/checked v0.5 after reading the delta;
  2. merge the capture/review/merge bullets into the project agent instructions and ChatGPT Project instructions;
  3. refresh local Workstream, Review Summary, and PR Handoff templates where copied;
  4. add verdict/reviewed-head fields to active workstreams at their next review checkpoint, not to completed historical files;
  5. apply the merge gate to significant PRs that are still open, with no retroactive rewrite of merged history;
  6. record an explicit deferral decision if an in-flight project cannot adopt immediately.
- **R-21 (OD-8).** Update `FRAMEWORK_SYNC.md` to call out that a minor upgrade may impose a gate on still-open PRs and that adopted repositories never rewrite product architecture/decisions during migration.
- **R-22.** Add a worked normal-path example from capture through same-PR merge and a recovery example modeled on “implementation merged before review; correction PR follows.” Use generic names, not Subway-specific code.
- **R-23.** Add one or two Build OS decision entries: reviewed-head merge closure and truthful same-PR finalization are consequential; Capture Only receives a separate entry if it remains independently meaningful.
- **R-24.** Update README lifecycle/roles/documents/adoption sections so the public overview agrees with the detailed protocol.
- **R-25.** Preserve existing small-fix proportionality: a trivial documentation or bug fix outside a significant workstream does not require a ceremonial Build Card or full review artifact, but any PR claiming to complete a significant workstream does.

## 6. State transitions

| From | To | Trigger | Guard | Required checkpoint |
|---|---|---|---|---|
| Any design phase | Same phase | Owner enters Capture Only | Explicit or clear capture intent | No repository write solely because of captured observations |
| Capture Only | EXPLORE/MODEL/DECIDE | Owner ends capture | Consolidation produced | Observations/proposals/decisions separated |
| READY_TO_BUILD | READY_TO_BUILD | Design Handoff PR opened | Approved card + spec; implementation not started | Implementation State names draft PR |
| READY_TO_BUILD | BUILDING | Implementation begins | Same PR/branch or documented fallback | Active board updated |
| BUILDING | REVIEW | Implementation complete | Validation reported; PR ready | Verdict `In review`; reviewed head `—` |
| REVIEW | BUILDING | Reviewer records Changes required | At least one unresolved Blocking/Should fix item | Findings and next action persisted |
| BUILDING | REVIEW | Correction complete | Focused validation; handoff current | New current head awaiting review |
| REVIEW | REVIEW | Reviewer approves | Current head reviewed; required checks green | Approved verdict + reviewed head |
| REVIEW | Merge-ready | Finalization commit | Only permitted finalization surfaces change | Reviewer records final head |
| Merge-ready | REVIEW or COMPLETE | Exact reviewed head merges | Merge succeeds | Main contains truthful next state |

`Merge-ready` above is a descriptive gate state, not a new workstream phase.

## 7. Interfaces

No network API is required. Stable Markdown interfaces added:

```markdown
## Review State

**Verdict:** Approved
**Reviewed head:** 0123456789abcdef0123456789abcdef01234567

<optional findings/follow-up prose>
```

PR review or top-level comment should carry the same verdict and head. Project-specific GitHub review mechanisms may add stronger enforcement.

## 8. Persistence changes

Markdown only. New stable fields live in active workstream files and review summaries. Companion domain state may gain optional `reviewVerdict`, `reviewedHead`, and integrity-warning codes. No database or external service is introduced here.

## 9. Migration requirements

This is a v0.5 minor migration. Implement the exact `VERSION.md` steps in R-20. The migration is forward-only at the protocol level but non-destructive: project-specific instructions are merged, historical decisions/workstreams are retained, and projects may explicitly defer.

The spec PR itself is authored under v0.4. The implementation PR becomes the v0.5 release only after approval, protocol changes, tests, and review.

## 10. Failure behavior

| Failure | Expected behavior |
|---|---|
| Owner never ends Capture Only | Continue acknowledging/recording observations in-session; do not synthesize or write; state remains unsynchronized if session ends |
| Design agent cannot write GitHub | Use existing repository-update block; do not claim a Design Handoff PR exists |
| Implementation PR merged before review | Publish finding on merged PR, create corrective PR if needed, keep workstream active, record recovery |
| Approval lacks reviewed head | Treat as `In review`/invalid approval; do not merge |
| PR head changes after approval | Mark review stale; re-review current head |
| Finalization commit contains executable change | Full approval invalidated; return to review |
| Framework canonical cannot be read | Continue under pinned version and record unchecked, per existing protocol |
| Downstream project defers v0.5 | Keep prior adopted version, update last-checked to v0.5, add a decision with reason/revisit trigger |

## 11. Concurrency / idempotency

- Review approval is keyed to repository + PR + full head SHA; repeated publication of the same verdict/head is idempotent.
- Two reviewers may disagree; any current-head `Changes required` blocks until explicitly resolved or superseded by a later current-head verdict according to project rules.
- Merge uses the expected reviewed head so a push between final verification and merge fails rather than silently bypassing review.
- Re-running downstream migration must not duplicate instruction blocks, workstream fields, or decision entries.

## 12. Observability

The protocol exposes enough state for humans and Companion:

- capture mode active/ended remains session state, never inferred from silence;
- workstream phase/status/next step;
- review verdict and reviewed head;
- PR current head, state, and merge state from GitHub;
- explicit integrity warnings for missing/stale/contradictory facts.

No telemetry service is required.

## 13. Backwards compatibility

- v0.4 projects remain valid under their pin until they check/adopt v0.5.
- Old workstream files without structured review fields parse with absent review metadata, not errors.
- Completed historical workstreams need no rewrite.
- Existing PRs already merged are not retroactively invalidated.
- Existing repository-update-block behavior remains unchanged.

## 14. Security / privacy constraints

- Capture Only stores no transcripts or raw recordings.
- Review metadata contains no credentials or sensitive payloads.
- GitHub permissions/branch protection remain project-owned.
- Do not expose private repository content through examples or fixtures.

## 15. Edge cases

| Case | Expected behavior |
|---|---|
| Owner mixes a direct question into Capture Only | Answer only if clearly asked; remain in capture mode for the rest unless owner ends it |
| Owner changes an earlier observation before consolidation | Latest owner statement wins; preserve the correction explicitly |
| Build Card changes after Design Handoff PR opens | Return to design phase, update card/spec/PR, remain draft |
| Implementation discovers a stop condition | Keep PR draft, checkpoint blocker, request owner decision |
| Reviewer finds only documentation drift | Use proportional review; fix before merge when durable state would otherwise be false |
| Approved PR receives test-only change | Review is stale because tests are part of evidence; reviewer verifies the new head |
| Approved PR receives finalization-only change | Lightweight final-head verification allowed; record final SHA |
| PR is merged while corrective PR is open | Workstream stays active and links both PRs |
| One PR serves several workstreams | Each workstream records its own verdict/next state; merge gate requires no blocking workstream finding |
| Workstream spans several PRs | A PR may be approved and merged without completing the workstream; finalization records the actual next phase |

## 16. Tests

- Markdown parser tests for all verdict values, full SHA, missing/malformed fields, and legacy absence.
- Reconciliation tests for active-board/workstream disagreement.
- Integrity tests for approved-without-head, stale head, merged-without-approved-verdict, and inconsistent PR language.
- Template snapshot or fixture tests proving new fields remain parseable.
- Existing Companion suite remains green.
- Manual walkthroughs of the normal and accidental-merge recovery examples.

## 17. Acceptance criteria

- [ ] **AC-1.** Capture Only behavior prevents premature analysis/action and produces a separated consolidation when ended.
- [ ] **AC-2.** A draft Design Handoff PR is a documented supported path and remains the single implementation PR.
- [ ] **AC-3.** Significant PR merge is prohibited until an independent approved verdict names the current head.
- [ ] **AC-4.** Changes required and accidental-merge recovery have unambiguous workstream/PR transitions.
- [ ] **AC-5.** Merge-finalization makes main-branch workstream memory truthful without a routine second cleanup PR.
- [ ] **AC-6.** Any executable/test change after approval invalidates review; finalization-only changes receive final-head verification.
- [ ] **AC-7.** Review verdict/head parse conservatively and integrity warnings surface contradictions.
- [ ] **AC-8.** v0.5 migration notes provide exact, bounded adoption steps for every downstream project.
- [ ] **AC-9.** Adoption never rewrites project architecture, accepted decisions, or completed historical workstreams.
- [ ] **AC-10.** README, framework files, templates, examples, decisions, parse contract, and Companion tests agree on the same lifecycle.
- [ ] **AC-11.** Build OS remains usable without automation or a Companion deployment.
- [ ] **AC-12.** Party Games can discover v0.5 at its next substantial session and either adopt it or record an explicit deferral.

## 18. Non-goals

- Mandatory branch-protection configuration or GitHub Actions.
- Automatic rollout to repositories outside their compatibility preflight.
- General issue/ticket workflow redesign.
- Session transcript ingestion.
- Replacing owner approval of Build Cards.
- Resolving Party Games balance questions.

## 19. Required documentation updates

- [x] `VERSION.md` — v0.5 identifier and v0.4→v0.5 migration notes.
- [x] `README.md` — lifecycle, roles, documents, adoption, and evolution wording.
- [x] `framework/DESIGN_ROOM.md` — Capture Only and Design Handoff PR.
- [x] `framework/WORKSTREAMS.md` — handoff, review loop, finalization, completion.
- [x] `framework/CLAUDE_HANDOFF.md` — single PR ownership and no self-merge before independent approval.
- [x] `framework/REVIEW_PROTOCOL.md` — verdict/head gate, staleness, correction/recovery, finalization.
- [x] `framework/FRAMEWORK_SYNC.md` — v0.5 adoption and open-PR applicability.
- [x] `framework/BUILD_OS_PARSE_CONTRACT.md` — stable fields and integrity warnings.
- [x] `templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md` — capture and review/merge behavior.
- [x] `templates/WORKSTREAM.template.md` — structured Review State.
- [x] `templates/REVIEW_SUMMARY.template.md` — verdict/head/currentness.
- [x] `templates/PR_HANDOFF.template.md` — pending review gate/finalization guidance.
- [x] `examples/FEATURE_LIFECYCLE.example.md` — normal same-PR flow.
- [x] New or extended example — merged-before-review recovery.
- [x] `DECISIONS.md` — consequential accepted protocol choices after approval.
- [x] WS-007 and `ACTIVE.md` — true phase, implementation, review, PR, and next step.

## 20. Handoff requirements

- Continue implementation on the same WS-007 design PR and branch; do not open a second implementation PR.
- Replace every `[PENDING OWNER APPROVAL]`/proposed marker with the approved truth or record the owner's changes.
- Run the Companion test suite and any repository validation named in README/package metadata.
- The implementation handoff must map OD-1…OD-8 and AC-1…AC-12 to the actual protocol/templates/tests.
- Recommended review focus must include: truthfulness of same-PR finalization, reviewed-head invalidation rules, v0.5 migration completeness, legacy parser compatibility, and the boundary between protocol and automation.
- Do not merge before independent review under the very gate this release introduces.
