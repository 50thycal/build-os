# Build OS Version

**Build OS v0.10**

| Field | Value |
|---|---|
| Version | 0.10 |
| Status | Draft |
| Scope | Documentation, protocol, reusable templates, contracts, agent skills |
| Contains code | No |
| Operating mode | `solo` — see `DEC-021` |

This file is canonical. An adopted repository's framework compatibility check reads the
version above and the migration notes below. See `framework/FRAMEWORK_SYNC.md`.

**This repository operates in `solo` mode**, declared under `DEC-021` and recorded here because
Build OS has no separate agent-instructions file to carry a framework block. One person, one
GitHub identity, one agent: there is no independent actor available, and v0.6, its recovery PR,
and v0.7 all merged unreviewed for that reason. Significant work here is accepted by the owner
at merge, recorded as `Owner-accepted`, and never described as reviewed. Adopting projects
should assume `reviewed` — the default — unless they are genuinely in the same position.

**"Contains code: No" is true again as of 2026-08-24.** It briefly was not: the Project
Intelligence Companion was staged here as a self-contained `companion/` package under `DEC-008`,
and while it sat in the tree this line was stale — exactly the kind of durable record v0.5 exists
to catch. The application has since moved to `50thycal/build-os-companion` (`DEC-011`), and what
remains is Markdown plus the JSON schemas in `contracts/`. Adopting Build OS requires no
dependency, no build step, and no runtime, and nothing in the protocol depends on the Companion
existing.

---

## Version semantics

- **Patch (0.x.y)** — wording, clarifications, template polish. No protocol behavior change.
  An adopting project usually needs no changes; acknowledge and record the check.
- **Minor (0.x)** — new artifacts, stages, requirements, or agent behavior. An adopting agent
  must inspect the migration notes and update project protocol artifacts as applicable.
- **Major (x.0)** — lifecycle, role, or responsibility changes. Treat as an explicit protocol
  migration, performed before substantial project work continues.

Downstream projects **pin** a version. Pinning is deliberate: it keeps work reproducible and
stops a framework change from silently redefining an in-flight effort. The compatibility
check exists so that a pin is a decision rather than an accident.

---

## Migration notes

Each entry says what changed and what an adopting project must do to move to it. An agent
performing a compatibility check reads every entry between the project's adopted version and
the version above.

### v0.9 → v0.10 — A finalization commit never writes a verdict it does not have

**Type:** Minor. **Date:** 2026-08-31.

**What changed**

Two related holes, both found by this repository walking into them.

**1. A finalization commit was pre-writing verdicts.** v0.5 established that such a commit
cannot contain its own SHA — the SHA is stale before it is pushed — and left the matching rule
about the *verdict* unstated. It is the same problem and it is easier to break, because a
pre-written verdict looks like ordinary bookkeeping while a self-referential SHA looks obviously
wrong.

The verdict is never the finalization commit's to write. In `reviewed` mode the reviewer records
it after the commit exists; in `solo` mode the owner records it at merge — also after. So the
commit sets phase, status, implementation state, related PRs, next step and `Finalization:
pushed`, and **leaves the verdict at whatever was true when it was written.**

This repository produced the demonstration twice in a day: WS-008 and WS-009 each landed on
`main` asserting `Owner-accepted` for a PR nobody had accepted. **A row briefly behind is a much
smaller problem than a row confidently wrong**, and only one of the two is detectable by reading
it. New warning `VERDICT_UNSUPPORTED` reports a file claiming a verdict nothing outside it
records.

**2. `Owner-accepted` had no comment form.** v0.8 defined the verdict for the workstream file and
never extended `DEC-015`'s PR-comment form to carry it, so a `solo` project had a verdict with no
specified way to record it on a pull request. Now specified, same shape as the approval form with
two differences that follow from the meaning:

```markdown
Build OS review verdict: Owner-accepted
Accepted head: <full 40-character SHA>
Review actor: <the owner>
Implementation actor reviewed: <the implementing actor>
```

`Accepted head:` never `Reviewed head:` — nothing was reviewed, and a consumer keys on the field
name to tell the two apart. `Review actor` is the owner, and the two actors must still differ,
which is the separation `solo` mode keeps when independence is unavailable. Everything else is
unchanged: full SHA, marker at line start, quoting and fencing rules, and an edited comment never
clearing the gate.

One correction alongside: `WORKSTREAM_PR_STATE_MISMATCH` no longer fires on finalization
preceding a verdict in `solo` mode, where acceptance happens at merge and that ordering is
correct.

**What an adopting project must do**

1. **Read this entry and update the framework block** to adopted v0.10, last-checked v0.10 with
   today's date.
2. **Stop pre-writing verdicts in finalization commits**, if you were. Most projects were not —
   the rule was implicit and generally followed; it is now written down.
3. **If you run `solo` mode**, use the comment form above to record acceptances. Nothing changes
   for `reviewed` projects.
4. **Do not retrofit.** A workstream row that pre-claimed a verdict is corrected going forward,
   not rewritten to pretend the claim was never made.

No project architecture, product decision, completed workstream, or open review is rewritten by
this migration.

---

### v0.8 → v0.9 — `skills/`, an agent-facing surface

**Type:** Minor. **Date:** 2026-08-30.

**What changed**

A new top-level surface, `skills/`, holding **agent-invokable procedures**: a `SKILL.md` with
YAML frontmatter plus instructions, loaded by a coding agent when its description matches what
the user is doing. It arrived in #17 with the first one, `research-decision-brief`.

The line between the two surfaces, stated in `skills/README.md`: **if the owner needs to read it
to make a decision it is a `framework/` document; if an agent needs to act on it mid-task it is
a skill.** Where both are true the framework document is canonical and the skill points at it,
so the protocol never carries two competing statements of one rule.

That rule needed enforcing on arrival, which is the substance of this entry rather than the
directory itself. `research-decision-brief` restated the owner-facing decision contract —
options, costs, a recommendation — without referencing `framework/OWNER_INTERFACE.md`, which
already defines exactly one terminal result per piece of work in a fixed, machine-readable form.
Two statements of one rule, drifting from the day they were written. The skill now delivers a
`DECISION` or `BLOCKED` result in the protocol's form and treats the brief as the working
material behind it.

One genuinely new rule came back the other way, and is now part of the `DECISION` result rather
than living only in the skill: **where stopping is a real option, list it.** An owner who does
not see it listed infers the agents have assumed the work continues.

Supporting changes: `README.md` registers the surface and how to adopt one; `VERSION.md` scope
includes agent skills; `framework/BUILD_OS_PARSE_CONTRACT.md` states that skills are outside the
parse surface entirely.

**Skills are versionless and taken by copy.** This is the one part of Build OS with no
compatibility check: a project copies the skill it wants and is not obliged to track later
changes, because a skill that changed under a project mid-thread would be a worse problem than a
stale one.

**What an adopting project must do**

1. **Read this entry and update the framework block** to adopted v0.9, last-checked v0.9 with
   today's date.
2. **Nothing else, for most projects.** `skills/` is optional. A project that wants none takes
   none, and no protocol artifact changes.
3. **If you copy a skill**, put it where your agent tooling expects (commonly
   `.claude/skills/<name>/`) and treat the copy as yours. Do not wire it to track this
   repository.
4. **If you write your own skills**, apply the boundary above: a skill that restates a rule your
   `framework/` documents already carry will drift from them, and the framework document is the
   one that stays canonical.

No project architecture, product decision, completed workstream, or open review is rewritten by
this migration.

---

### v0.7 → v0.8 — Operating modes, and an honest path for solo projects

**Type:** Minor. **Date:** 2026-08-30.

**What changed**

Build OS asserted a merge gate its own repository had never once satisfied. Three releases —
v0.6, the recovery for it, and v0.7 — merged with no verdict of any kind, because there was
nobody to give one: one person, one GitHub account, one agent.

`DEC-015` had already met the shallow version of this. GitHub refuses a review on a
self-authored PR, so v0.5 added the comment verdict form. That made a verdict **possible**. It
did not make one **available**, and the distinction is the whole of this release: the missing
ingredient was never a place to write the verdict, it was a second party to hold it.

A gate that cannot be satisfied is not strict. It is inert, and it trains everyone to merge
past it — which is exactly and measurably what happened here, to the release that introduced it.

**A project now declares an operating mode** in its framework block:

```markdown
- Operating mode: reviewed
```

| Mode | Means | Acceptance comes from |
|---|---|---|
| `reviewed` | An independent actor is available. **The default, and what the rest of the protocol describes.** | An independent reviewer's verdict against the current head |
| `solo` | No independent actor exists | The **owner's own acceptance**, recorded, at merge |

**The mode is declared, never inferred.** No line means `reviewed`, and an absent reviewer there
is a missing review rather than a licence.

- **New verdict `Owner-accepted`**, with its head in a **separate `Accepted head` field**. It
  records that the owner accepted a change *no independent party reviewed* — true, and much
  weaker than `Approved`. The fields differ so the two can never be confused by anyone reading
  later, and a consumer must never let one satisfy a check written for the other.
- **`SHIP` in `solo` mode** drops conditions 3 and 5 of v0.7's six, because both name a reviewer
  who does not exist there. They are **absent, not waived**, and a seventh condition replaces
  them: `Verification` must state plainly that no independent review occurred. The finalization
  commit becomes the last agent step, which is what keeps `SHIP` honest rather than premature —
  v0.7's principle, *no terminal result while agents still have work to do*, is unchanged.
- **`MERGED_WITHOUT_APPROVAL`** is satisfied in a `solo` project by `Owner-accepted` at the
  merged head. Its **absence still reports**: declaring `solo` replaces the reviewer, not the
  record.
- **New warning `OWNER_ACCEPTED_IN_REVIEWED_MODE`** — the verdict on a project that declared a
  reviewer was available is a contradiction, and the PR is treated as unreviewed.

**What `solo` does not change, which matters more than what it does:**

- **An implementation agent still may not approve, accept, or merge its own work.** `solo` moves
  acceptance to the *owner*. An agent writing `Owner-accepted` would be approving its own PR
  through a differently-spelled field, and no mode makes that acceptable.
- Validation still required green. The handoff still complete, with *Spec Deviations*
  load-bearing — **more** so, since with no reviewer it is the only thing that can catch an
  undisclosed one.
- Durable memory, workstreams, finalization, the reviewed-head discipline, `Changes required`
  closing the gate from any source: all unchanged.
- **No history is upgraded.** A project moving `solo` → `reviewed` does not convert past
  acceptances into approvals.

**`solo` is a fallback, not a preference.** The moment a second actor exists — a colleague, a
second GitHub identity, a review agent under a separate account — the project moves to
`reviewed`. A project that stays `solo` for convenience has swapped a check it could run for a
note saying it did not.

**What an adopting project must do**

1. **Read this entry, then update the framework block** to adopted v0.8, last-checked v0.8 with
   today's date, and **add an `Operating mode:` line**.
2. **Choose the mode honestly.** `reviewed` if anyone other than the implementer can look at a
   significant change — that is most projects, and the answer does not change. `solo` only if
   nobody can. Record the choice in the project's `DECISIONS.md` with the reason.
3. **If `reviewed`: nothing else changes.** No workstream, verdict, review record, or open PR
   needs editing, and every rule that governed you yesterday governs you today.
4. **If `solo`: start recording `Owner-accepted` with an `Accepted head`** on significant PRs at
   merge, and have agents state the absence of independent review in the `SHIP` result. **Do not
   retrofit acceptances onto merged history** — an acceptance written after the fact records a
   decision nobody made at the time. Existing `MERGED_WITHOUT_APPROVAL` reports on that history
   are accurate and should stay.
5. **If the project consumes Build OS artifacts with tooling**, teach it the new verdict, the
   `Accepted head` field, the mode, and the two rules above — and never rank `Owner-accepted`
   with `Approved`.

No project architecture, product decision, completed workstream, or open review is rewritten by
this migration, and nothing here requires automation, CI, or any deployed service.

---

### v0.6 → v0.7 — `SHIP` means only the merge is left

**Type:** Minor. **Date:** 2026-08-29.

**What changed**

One rule, narrowed. v0.6 defined `SHIP` as a report of the merge gate but permitted it at three
points, two of which came *before* the gate had finished:

- approved at the current head, merge-finalization commit not yet pushed;
- finalization pushed, final head not yet verified by the reviewer;
- final head verified.

At the first two, work is still owed — a documentation-only commit by the implementation agent,
and a verification by the reviewer. v0.6 tried to hold this together by making `Next action`
carry the outstanding step ("Finalize and merge…", "Reviewer verifies the final head, then
merge…"), which meant the owner could be handed a terminal result that was really a request for
someone else to finish. **A result that hands work back to an agent is not terminal**, and the
owner has no way to check the difference.

**The design principle, stated once: no terminal result while agents still have work to do.**

So `SHIP` for significant work now requires **all six**:

1. required validation green, and actually run;
2. no unresolved `Blocking` or `Should fix` finding;
3. an independent verdict of `Approved` or `Approved with follow-ups`;
4. the **merge-finalization commit pushed**;
5. the **final head independently verified** by the reviewer, on the PR;
6. no undisclosed material deviation from approved behavior.

Conditions 4 and 5 are new. `Next action` on a significant-work `SHIP` is now **the merge and
nothing else**, naming the exact verified SHA where useful — that is the commit the reviewer
verified and the one the merge must target.

The two removed moments become **no-result** states, joining first push and the correction loop.
The absence-of-result form now covers the whole mid-flight span, and gained a second wording for
the later gap:

```markdown
Approved and finalized; awaiting the reviewer's verification of the final head. Nothing needed
from you yet.
```

`DECISION` and `BLOCKED` are **not** narrowed. They remain reachable at any point, because they
are exactly the cases where the owner does have something to do.

**Nothing else moved.** Entry-point neutrality, Intent Intake, the Owner Plan, proportionality
and its one-way promotion, the closed reviewer→implementer loop, the merge gate, independence,
staleness, reviewed-head and finalization mechanics are all as v0.6 left them. Simple-change
behavior is unchanged: simple work has no finalization or independent review to wait on, so
conditions 3–5 do not apply to it, and its `SHIP` still names the classification in
`Verification`.

**Why this is minor rather than a patch.** It removes behavior an agent was permitted, so an
adopting project must change what its agents do. That it also resolves an internal contradiction
in v0.6 — whose own headline called `SHIP` "done and verified" while the operative rules allowed
it earlier — makes it a correction, not an evolution, but the migration obligation is the same
either way and under-classifying it would hide that.

Files: `framework/OWNER_INTERFACE.md`, `framework/CLAUDE_HANDOFF.md`,
`framework/REVIEW_PROTOCOL.md`, `framework/BUILD_OS_PARSE_CONTRACT.md`, `README.md`,
`templates/OWNER_RESULT.template.md`, `templates/PR_HANDOFF.template.md`,
`templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md`,
`examples/FEATURE_LIFECYCLE.example.md`, and `DEC-020`.

**What an adopting project must do**

1. **Read this entry and update the Build OS block** to adopted v0.7, last-checked v0.7 with
   today's date.
2. **Stop emitting `SHIP` before finalization and final-head verification.** If the project's
   agent instructions or PR template carry v0.6's three-point `Next action` guidance, replace it:
   a significant-work `SHIP` names the merge, and the two earlier points are no-result states.
3. **Refresh local copies** of the PR handoff and Owner Result templates, and the Design Room /
   agent instruction text, where the project keeps copies.
4. **Nothing about the merge gate changes**, and no workstream, verdict, or review record needs
   editing. An open PR carrying a v0.6-style `SHIP` should have it replaced with the no-result
   form until the gate's tail is actually complete — that is the only in-flight correction this
   migration asks for.
5. **If the project consumes Build OS artifacts with tooling**, `OWNER_RESULT_CONTRADICTED` now
   also fires on a `SHIP` whose record does not declare `Finalization: pushed`, or whose final
   head is unverified.
6. **If the project cannot adopt now, record an explicit deferral** — a `DEC-n` naming the reason
   and what would trigger a revisit — keep the prior adopted version, and update last-checked to
   v0.7.

No project architecture, product decision, completed workstream, or open review is rewritten by
this migration, and nothing here requires automation, CI, or any deployed service.

---

### v0.5 → v0.6 — The owner interface

**Type:** Minor. **Date:** 2026-08-29.

**What changed**

Build OS gained a defined **owner layer**. Nothing was removed from the engineering layer, and
the v0.5 merge gate is not one comma weaker.

The problem it addresses is not a gap in the protocol but a cost of it: by v0.5 an owner had to
read a Build Card, a handoff, a review summary and a workstream to find out whether they could
merge. Rigor that only survives at a desk is rigor most projects abandon on the first busy week.

- **`framework/OWNER_INTERFACE.md`** (new) — the whole owner layer in one document: Intent
  Intake, proportionality, the Owner Plan, and the Owner Result. The loop it defines is
  `INTENT → [PLAN / APPROVE] → BUILD + VERIFY → SHIP | DECISION | BLOCKED`.
- **Entry-point neutrality.** Intent may originate with a design agent, an implementation
  agent, another capable agent, or a GitHub issue, and the lifecycle semantics are identical in
  all four cases. **Intent Intake** is the shared front door: establish the outcome, capture the
  constraints the owner actually stated, classify the work, and route genuine product choices to
  the owner rather than settling them quietly. No chat product, mobile app, bot, hosted service,
  or CI integration is mandatory anywhere.
- **The Owner Plan** (`templates/OWNER_PLAN.template.md`) — a ~100–200 word approval surface
  derived from the Build Card, carrying goal, scope, non-goals, risk, owner decisions, and a
  recommendation, and no implementation surface at all. **The owner approves this.** The card
  remains the durable behavior contract review measures against, which makes approval a chain:
  plan expands to card expands to spec, and an owner-visible choice appearing at any level that
  the plan did not carry goes back to the owner rather than into the spec.
- **The Owner Result** (`templates/OWNER_RESULT.template.md`) — exactly one of `SHIP`,
  `DECISION`, or `BLOCKED`, opened by a `Build OS owner result:` line and read under the same
  quoting rules as the comment verdict. It **replaces** the PR handoff's *Owner Summary*: one
  owner-facing surface per PR, because two drift within a week.
- **`SHIP` is a report of the merge gate, never a route through it.** It may not be written for
  significant work while validation is red, a `Blocking` or `Should fix` finding is unresolved,
  there is no independent approved verdict, that verdict is stale, or a material deviation is
  undisclosed. Writing one approves and merges nothing, and the agent that wrote the code still
  neither approves nor merges it. Its `Next action` carries the three points at which the gate
  terminates — approved, finalized-but-unverified, and final-head-verified — because a `SHIP`
  saying "merge" while the final head is unverified is a false report rather than a rounding
  error.
- **Most PRs have no owner result, and that is correct.** The three states are terminal, not a
  running status. A PR awaiting review says so and carries no marker; `SHIP` is written when
  review clears, not when coding stops.
- **The closed correction loop** (`framework/REVIEW_PROTOCOL.md`) — a reviewer's fixable
  `Blocking` and `Should fix` findings are addressed to the implementation agent and answered on
  the same PR. **The owner is not the message bus.** They are interrupted for three things only:
  a decision genuinely theirs, a genuine blocker, and the final ship or merge action. Reviewer
  escalation to `DECISION` or `BLOCKED` is defined and deliberately narrow.
- **Proportionality is a named classification** — simple, significant, escalated — defined once
  and used at intake, at implementation, and at review. **Promotion is one-way**: work becomes
  significant the moment it turns out to touch an owner decision, an invariant, or documented
  behavior, and is never demoted. When it is genuinely unclear, it is significant.

**One rule genuinely changed, and it loosened.** v0.5 let a change skip the ceremony only if
"it does not implement or alter owner-visible behavior." That excluded a copy fix the owner had
dictated word for word. v0.6 replaces the clause with what it was protecting — **no owner
trade-off is being chosen on the owner's behalf** — so behavior the owner supplied unambiguously
is simple, while behavior an agent selects for them is not, however small. Everything else about
the threshold is unchanged, and nothing that was significant under v0.5 becomes simple under
v0.6 except in that one case.

**The compression contract**, which is what makes the short surfaces trustworthy: a summary may
omit detail; it may never omit material truth. The owner layer is a projection of the durable
record, never a second copy of it, and where the two disagree the durable record wins and the
disagreement is reported.

Supporting changes: `README.md` leads with the owner loop; `framework/DESIGN_ROOM.md` gains
Intent Intake and proportional routing and produces the Owner Plan at stage D;
`framework/BUILD_SPEC.md` prohibits a spec introducing an owner-visible choice the approved plan
did not carry; `framework/CLAUDE_HANDOFF.md` gains an intake section for work arriving there
first and ends in the Owner Result; `framework/WORKSTREAMS.md` says how intent from any entry
surface creates or resumes a workstream, **adding no lifecycle phase**;
`framework/AGENT_SESSION_CHECKPOINT.md` and `contracts/agent-session-checkpoint.v1.schema.json`
gain an optional `owner_result` enum; `framework/BUILD_OS_PARSE_CONTRACT.md` gains the marker
form and the `OWNER_RESULT_CONTRADICTED` / `_AMBIGUOUS` / `_MALFORMED` warnings;
`templates/PR_HANDOFF.template.md` and `templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md`
follow; `examples/SIMPLE_CHANGE.example.md` is new and
`examples/FEATURE_LIFECYCLE.example.md` gains the plan and the result.

`examples/WORKSTREAM_SCENARIO.example.md` and `examples/MERGED_BEFORE_REVIEW.example.md` keep
their v0.5 stamps deliberately: they demonstrate protocol this release does not change, and
restamping them would claim they show v0.6 surfaces they do not contain.

**What an adopting project must do**

1. **Read this entry, then update the Build OS block** in the project's agent-instructions file
   to adopted v0.6 and last-checked v0.6 with today's date.
2. **Add the intake and result rules to the project's agent instructions** — the classification
   and the one-way promotion, that reviewer findings return to the implementation agent rather
   than to the owner, and that the handoff ends in an Owner Result rather than an Owner Summary.
   The README's adoption block carries current wording for both the implementation agent and the
   Design Room. Merge — do not replace a project's own instructions, and leave
   `Project-specific:` rules intact.
3. **Replace the Owner Summary section** in the project's PR handoff template with the Owner
   Result, and add the Owner Plan and Owner Result templates where the project keeps local
   copies. **Do not retrofit results onto open PRs** whose work predates this: an Owner Result
   written after the fact records a state nobody was in. New PRs get one.
4. **Nothing about the merge gate changes.** No workstream needs editing, no verdict is
   re-examined, no review record gains or loses a field, and no open PR changes what it needs
   before merge. A project that adopts v0.6 and changes only its instructions file has adopted
   it correctly.
5. **If the project consumes Build OS artifacts with tooling**, `owner_result` is optional and
   absent in every checkpoint written before now — absent metadata, never an error. A consumer
   must never infer a result, and must never let a `SHIP` stand in for a verdict.
6. **If the project cannot adopt now, record an explicit deferral** — a `DEC-n` naming the
   reason and what would trigger a revisit — keep the prior adopted version, and update
   last-checked to v0.6.

No project architecture, product decision, completed workstream, or open review is rewritten by
this migration. As with v0.5, nothing here requires automation, CI, branch protection, or any
deployed service: v0.6 is enforceable by people reading and writing Markdown.

---

### v0.4 → v0.5 — Closed-loop delivery

**Type:** Minor. **Date:** 2026-08-24.

**What changed**

Four demonstrated gaps between owner feedback and a merged change, closed as one protocol:

- **Capture Only** (`framework/DESIGN_ROOM.md`) — a named session mode for playtest notes,
  feedback dumps, and multi-message input. While active, the design agent records and does
  nothing else: no analysis, no recommendations, no decisions, no repository writes. Ending
  it requires a consolidation that keeps observations, interpretations, proposed rules, and
  approved decisions separate. Only approved decisions travel onward. It stores no
  transcripts and no recordings.
- **The Design Handoff PR** (`DESIGN_ROOM.md`, `WORKSTREAMS.md`, `CLAUDE_HANDOFF.md`) — a
  design agent with GitHub write access may open the implementation PR itself, as a draft,
  once the Build Card is approved and the spec issued. It is the single PR for that
  implementation; the implementation agent continues it rather than opening a second one.
  Opening it does not start `BUILDING`.
- **The reviewed-head merge gate** (`framework/REVIEW_PROTOCOL.md`) — a significant PR does
  not merge until an independent reviewer records `Approved` or `Approved with follow-ups`
  against the PR's **current head**, named as a full 40-character SHA. An approval that names
  no head does not count. The agent that wrote the code neither approves nor merges it. Any
  executable, test, dependency, migration, configuration, or behavior-documentation change
  after the reviewed head invalidates the approval.
- **Merge finalization** (`REVIEW_PROTOCOL.md`, `WORKSTREAMS.md`) — the last commit before
  merge is documentation-only, on the same PR, setting the workstream, `ACTIVE.md`, and
  `Review State` to what becomes true when the PR lands. It is what stops `main` from
  carrying workstreams that describe a state that ended at merge, without a second
  bookkeeping PR.

Two rules keep the review fields honest, and both matter to anyone writing them by hand:

- **A verdict belongs to one PR.** A workstream spanning several records one verdict per PR, in
  a `| PR | Verdict | Reviewed head | Finalization |` table. A record says nothing about a PR it
  does not name, so approving a new PR never re-opens the question of one that merged long ago.
- **A workstream declares which protocol it runs under.** A `**Build OS:** v0.5` header, or the
  project's adopted version, is what puts a workstream under the merge gate — never the presence
  of the review fields, or deleting a row would remove a significant PR from the gate. An
  inherited project pin covers **current work only**: adopting v0.5 does not reach back and gate
  a completed v0.4 workstream, a workstream untouched since before adoption, or a PR that was
  opened and merged before it. That boundary is the date on your `Last compatibility check` line,
  which is why step 1 below asks for today's date rather than a bare version.
- **A GitHub approval closes the gate readily and opens it narrowly.** Only a reviewer's current
  position counts, any outstanding `Changes required` keeps the gate shut, and a current-head
  approval verifies the finalization head only when the workstream's own record already approves.
  It never overrides a record that says `Changes required` — that is a contradiction to report.
- **A finalization commit cannot contain its own SHA.** `Reviewed head` names the last commit
  reviewed *in full*; `Finalization: pushed` says the PR head is legitimately ahead of it; and
  the head that commit produced is recorded by the reviewer **on the PR**, after it exists —
  a GitHub review carries the commit id it was submitted against. Merge targets that SHA.
- **A verdict may be a comment** (clarified 2026-08-25, DEC-015). GitHub refuses a review on a
  pull request the account authored, so a repository worked by one account cannot produce an
  approving review at all — the gate is not strict there, it is inoperable, and this repository
  proved it by merging v0.5 itself twice without one. A verdict may therefore be a PR comment
  carrying a `Build OS review verdict:` line, a `Reviewed head:` line with a full SHA, and a
  `Review actor:` line naming who issued it, and an `Implementation actor reviewed:` line naming
  who the reviewer understood they were reviewing — read only where it is stated and never where
  it is quoted, fenced, or commented out. **An edited comment never clears the gate**, and both
  actors travel inside the verdict, because a comment and a PR body can both be rewritten after
  a review while the commit named stays fixed. The actor matters because in such a repository the
  login is transport: several actors share it, and a record keyed on the login merges them.
  Positions are therefore keyed on the actor, and a comment verdict clears the
  independent-review gate only when **the two actors named inside it differ** — never by
  comparison against the PR body, which is editable and would let an old verdict change meaning.
  The body stays a cross-check: where it names a different implementation actor than the verdict
  captured, the gate fails closed and reports. It records that a verdict was given; it does not
  verify that whoever gave it was independent. Where that matters most, use a second identity.

Supporting changes: structured `Verdict`, `Reviewed head`, `Reviewed PR`, and `Finalization`
fields in `templates/WORKSTREAM.template.md` and `templates/REVIEW_SUMMARY.template.md`; a
`Review gate` section in `templates/PR_HANDOFF.template.md`; capture and review behavior in
`templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md`; parsing rules and integrity warnings in
`framework/BUILD_OS_PARSE_CONTRACT.md`; open-PR applicability in `framework/FRAMEWORK_SYNC.md`.

**What an adopting project must do**

1. **Read this entry, then update the Build OS block** in the project's agent-instructions
   file to adopted v0.5 and last-checked v0.5 with today's date. Read before recording — the
   check is the point, not the field.
2. **Merge the capture, review, and merge bullets into the project's agent instructions** and
   into its ChatGPT Project instructions: Capture Only entry and exit, the Design Handoff PR,
   the reviewed-head gate, no self-approval, and the merge-finalization commit. Merge — do not
   replace a project's own instructions, and leave `Project-specific:` rules intact.
3. **Refresh local copies of the Workstream, Review Summary, and PR Handoff templates**, where
   the project keeps copies rather than referencing the canonical ones.
4. **Add the review fields to active workstreams at their next review checkpoint** — with a
   `**Build OS:** v0.5` header on each one — not in a bulk edit, and never to completed
   historical workstream files. The header is worth writing even though the project pin would
   cover an active workstream anyway: it survives the workstream's completion, where an inherited
   pin deliberately does not. A file written before v0.5
   parses correctly with the fields absent; adding them retrospectively would record a review
   that never happened. A workstream with more than one PR uses the per-PR table from the start,
   so that a verdict on the current PR never makes a claim about an older merged one.
5. **Apply the merge gate to significant PRs that are still open**, including ones opened
   under v0.4. Merged history is not reopened and nothing already landed is retroactively
   invalidated.
6. **If the project cannot adopt now, record an explicit deferral** — a `DEC-n` naming the
   reason and what would trigger a revisit — keep the prior adopted version, and update
   last-checked to v0.5. A deferral on the record is a legitimate outcome; silent
   non-adoption is not.

No project architecture, product decision, or completed workstream is rewritten by this
migration. Nothing here requires automation, CI, branch protection, or a Companion
deployment: v0.5 is enforceable by people reading and writing Markdown, which is the only way
it can apply to every adopting project.

---

### v0.3 → v0.4 — Protocol contracts for machine consumers

**Type:** Minor. **Date:** 2026-08-23.

**What changed**

- `framework/AGENT_SESSION_CHECKPOINT.md` and
  `contracts/agent-session-checkpoint.v1.schema.json` — how an agent publishes the *state* of a
  working session, so tooling and owners can see what is live without anyone reading a chat
  window. The schema has no field capable of holding conversation text and forbids additional
  properties; `UNKNOWN` is excluded from its status enum, because silence is a conclusion a
  consumer draws, never a state an agent claims.
- `framework/BUILD_OS_PARSE_CONTRACT.md` — the subset of `ACTIVE.md`, workstream files, and
  `DECISIONS.md` that machine consumers may rely on, plus detection, path overrides, and the
  integrity warnings raised when artifacts disagree.

**What an adopting project must do**

**Nothing, for most projects.** Both documents describe surfaces that already exist; neither
changes how a project writes Build OS artifacts, and neither adds an obligation to a project
that has no tooling reading it.

Act only if one of these applies:

1. **Your agents will publish session checkpoints.** Have them POST against
   `contracts/agent-session-checkpoint.v1.schema.json`, at the moments listed in
   `framework/AGENT_SESSION_CHECKPOINT.md`. State only — never transcripts.
2. **You are building something that reads Build OS artifacts.** Follow
   `framework/BUILD_OS_PARSE_CONTRACT.md`: parse conservatively, surface disagreements rather
   than merging them, and keep workstream-to-PR relationships many-to-many.

No project memory, workstream, or decision content needs rewriting.

### v0.2 → v0.3 — Framework compatibility protocol

**Type:** Minor. **Date:** 2026-08-22.

**What changed**

- A standard **framework compatibility preflight**: compare the project's adopted version
  against this file before substantial design/build work, and act on the delta.
- A canonical **project framework block** recorded in the adopted repository's agent
  instructions file (`CLAUDE.md` or equivalent).
- A compact **Framework** field in the PR handoff.
- Rules for project-specific additions, and for surfacing conflicts between a project rule
  and a newer Build OS requirement.
- `framework/FRAMEWORK_SYNC.md`, and a worked upgrade scenario.

**What an adopting project must do**

1. Add the framework block to `CLAUDE.md`:
   ```markdown
   ## Build OS
   - Canonical framework: 50thycal/build-os
   - Adopted version: v0.3
   - Last compatibility check: v0.3 on YYYY-MM-DD
   ```
2. Mark any project-specific protocol additions as `Project-specific:` so they cannot be
   mistaken for Build OS itself.
3. Include the `Framework:` field in subsequent PR handoffs.

Nothing in v0.2 changed meaning. No project memory, workstream, or decision content needs
rewriting.

### v0.1 → v0.2 — Persistent design workstreams

**Type:** Minor. **Date:** 2026-08-22.

**What changed**

- The **workstream** concept: one meaningful design/build thread with a stable `WS-###` ID,
  spanning multiple conversations and potentially multiple PRs.
- A workstream lifecycle — `IDEA` → `EXPLORE` → `MODEL` → `DECIDE` → `BUILD_CARD` →
  `READY_TO_BUILD` → `BUILDING` → `REVIEW` → `COMPLETE`, plus `PAUSED`, `BLOCKED`,
  `ABANDONED` — mapped onto the existing Design Room stages.
- A third project-memory layer, `docs/workstreams/`, alongside `PROJECT_MODEL.md` and
  `DECISIONS.md`, with an `ACTIVE.md` control board.
- A checkpoint policy: persist at meaningful moments, not after every exchange.
- A ChatGPT Project operating model, session-start protocol, and reusable Project
  instructions.
- The GitHub capability boundary, and the rule that persistence is never claimed falsely.
- `framework/WORKSTREAMS.md`, three new templates, and a worked acceptance scenario.

**What an adopting project must do**

1. Create `docs/workstreams/` with an `ACTIVE.md` from `templates/ACTIVE_WORK.template.md`.
2. Add a workstream file for each effort already in flight, from
   `templates/WORKSTREAM.template.md`. Most projects have three or four.
3. Update `CLAUDE.md` to reference the workstream layer and the checkpoint duty.
4. Set up the ChatGPT Project instructions from
   `templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md`.

Nothing in v0.1 changed meaning. Existing `PROJECT_MODEL.md` and `DECISIONS.md` content
carries over untouched.

### v0.1 — Initial protocol

**Type:** Initial. **Date:** 2026-08-22.

- The lifecycle: Abstract Idea → Design Room → Mental Model → Decisions → Build Card → Build
  Spec → Claude Implementation → GitHub PR Handoff → Independent Review → Project Memory
  Update
- The five-stage Design Room process
- The Build Spec packet standard, including the owner-decision / implementation-discretion /
  escalation split
- The GitHub-as-handoff-surface protocol
- The two durable memory artifacts: `PROJECT_MODEL.md` and `DECISIONS.md`
- The independent review protocol
- Reusable templates for all of the above

---

## What Build OS deliberately does not include

- Automation, CI, scripts, or linting of framework artifacts
- Package dependencies or services
- Project-specific instructions

---

## Changing the version

Build OS evolves through versioned changes to this repository. Downstream projects reference
a version; they do not fork the protocol. See `README.md` → *Evolving Build OS*.

Every version bump adds a migration-notes entry above, whatever its size — a patch entry that
says "no project changes required" is what lets a downstream agent stop reading quickly.
Record the reasoning for consequential framework changes in this repository's own
`DECISIONS.md`, using the same ADR format Build OS prescribes for projects.
