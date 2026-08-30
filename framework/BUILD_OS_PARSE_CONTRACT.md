# Build OS Parse Contract

**Build OS v0.7 — protocol contract**

Build OS artifacts are written for humans and agents to read. This document defines the narrow
subset that **machine consumers may rely on**, so tooling can extract project state without
guessing — and so a project can reformat its prose without silently breaking someone's parser.

The Project Intelligence Companion is the first consumer. The contract is not specific to it.

---

## Principles

**Conservative parsing.** A field that cannot be read confidently is *absent*, never guessed. An
absent phase is a parser saying "I don't know", which a consumer can show honestly. A guessed
phase is a lie with a confident face.

**Prose is not a schema.** Only the markers below are stable. Everything else in a Build OS
document may be rewritten at any time.

**Reading only.** A consumer parses Build OS artifacts. It does not write them. Agents write
durable state; tools read it.

---

## Detection

A consumer should decide whether a repository uses Build OS by, in order:

1. A framework block in the repository's agent-instructions file (`CLAUDE.md` or equivalent),
   naming the canonical framework and the adopted version.
2. The conventional paths:
   - `docs/PROJECT_MODEL.md`
   - `docs/DECISIONS.md`
   - `docs/workstreams/ACTIVE.md`
3. Per-repository path overrides configured by the owner.

Build OS explicitly permits repository-specific documentation conventions, so **a consumer must
not require the conventional paths**. Absence of them means "look at the overrides", not "this
project does not use Build OS".

---

## `ACTIVE.md` — the board

Stable surface: a Markdown table whose header row contains the columns

```text
| ID | Workstream | Phase | Status | Current Next Step | Related PR |
```

Consumers should match column headers case-insensitively and by substring (`Next Step` matches
`Current Next Step`), and should tolerate extra columns and reordering.

Per row, the reliable fields are:

| Field | Rule |
|---|---|
| ID | Matches `WS-\d{3,}`. A row whose ID does not match is skipped, not repaired. |
| Workstream | Free text title. |
| Phase | One of the lifecycle phases below, case-insensitive. Unrecognized → absent. |
| Status | `Active` · `Paused` · `Blocked` · `Abandoned`, case-insensitive. Unrecognized → absent. |
| Current Next Step | Free text. `—`, `-`, and empty mean absent. |
| Related PR | Zero or more `#\d+`, possibly comma-separated. `—` means none. |

Lifecycle phases:

```text
IDEA · EXPLORE · MODEL · DECIDE · BUILD_CARD · READY_TO_BUILD · BUILDING · REVIEW · COMPLETE
```

A `## Recently completed` table may follow. It is informational; consumers should not treat its
rows as active work.

---

## Workstream files — the detail

Path shape: `WS-###-<slug>.md` alongside `ACTIVE.md`. The ID in the **filename** and the ID in
the **heading** must agree; a disagreement is an integrity warning, and the filename wins for
addressing while the heading is reported as suspect.

Stable surface:

- A level-1 heading matching `# WS-### — <title>`. The separator may be an em dash or a hyphen.
- Header fields near the top, one per line, as `**Field:** value` or `Field: value`:
  `Phase`, `Status`, `Created`, `Updated`.
- Level-2 section headings, matched case-insensitively:

```text
## Goal
## Context
## Current Mental Model
## Decisions Made
## Open Decisions
## Assumptions
## Non-Goals
## Build Card
## Implementation State
## Review State
## Related Decisions
## Related PRs
## Next Step
```

Rules consumers may rely on:

| Section | Rule |
|---|---|
| Goal, Context, Next Step | Free prose. Take the section body. |
| Open Decisions | List items; `None`, `None yet`, or empty means no open decisions. |
| Decisions Made | List items; may be empty. |
| Build Card | The literal `Not ready` means not ready. Anything else is a link or inline card. |
| Implementation State | Free text; `None` means none. PR references extracted as `#\d+`. |
| Review State | Structured fields below, then free prose. `Not started` means not started. |
| Related PRs | Zero or more `#\d+`; `None yet` / `—` means none. |
| Related Decisions | Zero or more `DEC-\d{3,}`. |

**Blocker.** Build OS records a blocker as `Status: Blocked` plus the reason in `Next Step`.
Consumers should read it from there rather than expecting a dedicated section.

### `Review State` — the review gate

From v0.5, `## Review State` opens with two stable fields, each on its own line, before any
prose:

```markdown
## Review State

**Verdict:** Approved
**Reviewed head:** 0123456789abcdef0123456789abcdef01234567

<optional findings and follow-up prose>
```

| Field | Rule |
|---|---|
| Verdict | One of `Not started`, `In review`, `Changes required`, `Approved`, `Approved with follow-ups`. Case-insensitive. Unrecognized → absent, plus a `REVIEW_VERDICT_MALFORMED` warning. |
| Reviewed head | A full 40-character hexadecimal commit SHA, or `—` for none. An abbreviated SHA is **not** accepted — a 7-character prefix cannot prove which commit was reviewed. Malformed → absent, plus `REVIEWED_HEAD_MALFORMED`. |
| Reviewed PR | Optional. `#84`. Which PR this verdict is about. |
| Finalization | Optional. `pushed` when the documentation-only merge-finalization commit is on the PR; `—`, `not pushed`, or absent otherwise. |

All four are optional in the file format sense: a workstream written under v0.4 has none of
them, and that is **absent metadata, never an error**. Consumers report what is missing where it
matters (see the integrity table) rather than refusing to parse.

### A verdict belongs to one pull request

A workstream may span several PRs, and each is reviewed on its own. **A review record applies
only to its PR.** A consumer must not compare one workstream-level reviewed head against every
linked PR — doing so reports an older merged PR as unapproved the moment a newer one is
approved.

A record that names no PR binds to the workstream's **most recent linked PR** — the highest
number, which is the one under review in practice. A workstream with more than one live PR
should name them explicitly, using the per-PR table:

```markdown
## Review State

| PR | Verdict | Reviewed head | Finalization |
|---|---|---|---|
| #84 | Approved | 0123456789abcdef0123456789abcdef01234567 | pushed |
| #91 | In review | — | — |

<optional findings and follow-up prose>
```

Either form may be used; the table wins if both are present. **A linked PR with no record is a
PR this workstream makes no claim about** — which is what keeps a workstream's older,
already-merged PRs quiet. Whether that silence is legitimate depends on the next rule.

### Participation is declared, never inferred

Two rules have to hold at once, and they pull in opposite directions:

- **Current significant work cannot leave the gate by deleting its evidence.** If a missing review
  record were what made a workstream look legacy, the gate would be opt-out by omission.
- **Adoption never reaches backwards.** A project that upgrades to v0.5 has not thereby claimed
  that its finished v0.4 work was done under v0.5. Completed workstreams are not rewritten and
  merged PRs are not retroactively invalidated — the migration rules say so plainly.

They are reconciled by distinguishing a **declaration** from an **inherited pin**, and by
honouring the project's **adoption boundary**.

A workstream may declare its own version in its header:

```markdown
**Phase:** REVIEW · **Status:** Active · **Build OS:** v0.5
```

That is a statement about *this workstream*, and it is honoured in both directions: `v0.5` brings
it under the gate even once complete, `v0.4` keeps it out even under a v0.5 project.

Absent a header, the project's adopted version applies — but as the weaker evidence it is. An
**inherited** pin covers current work only. It does not cover:

- a workstream that is `COMPLETE` or `ABANDONED`;
- a workstream last `Updated` before the project's adoption date;
- a PR that was opened before that date and has already merged or closed.

The adoption date comes from the line `framework/FRAMEWORK_SYNC.md` already requires:

```markdown
- Adopted version: v0.5
- Last compatibility check: v0.5 on 2026-08-24
```

A check line naming some other version is ignored — it says nothing about when the current one
arrived. **Where a project records no adoption date, a consumer stays silent about anything
already settled**, because it has no way to tell a pre-adoption merge from a post-adoption one and
a false accusation about merged work is the worse error.

Within the gate, a linked PR with no record is reported: `REVIEW_RECORD_MISSING` while it is open,
`MERGED_WITHOUT_APPROVAL` once it has merged. One further limit keeps that from becoming noise —
it applies only to workstreams that have reached an approved Build Card, Build OS's own threshold
for significant work. A workstream still in `EXPLORE` raises nothing.

### The final head is verified on the PR, not in the file

A merge-finalization commit cannot contain its own SHA: adding the SHA changes the commit. So
`Reviewed head` is **the last head reviewed in full** — always a commit that already exists when
the field is written — and `Finalization: pushed` declares that the PR head is legitimately
ahead of it.

The head that finalization produced is verified through a record created *after* it exists:
GitHub stamps an approving review with the commit id it was submitted against.

Where GitHub will not produce that review — it refuses one on a PR the account authored, so a
single-account repository can never obtain one — the equivalent record is a **comment verdict**,
which a consumer reads only in this exact form:

```markdown
Build OS review verdict: Approved
Reviewed head: <full 40-character SHA>
Review actor: <stable actor identifier>
Implementation actor reviewed: <the actor this verdict understood it was reviewing>
```

**A consumer recognises a verdict on the marker plus a full-length `Reviewed head:`** — an
abbreviated SHA is refused here exactly as it is in the file, and a verdict naming no head is
not a verdict. **All four lines are required for that verdict to be gate-clearing.** A verdict
with fewer is still a position: it displaces an earlier one by the same actor, and a
`Changes required` still closes the gate. It never opens one. Each marker must **begin its line**, so a table cell or a
sentence containing the words is not a verdict. Quoted (`>`), fenced and HTML-commented text is
stripped before reading, so discussing a verdict never issues one. Fields bind to the marker
above them, so two verdict blocks in one comment cannot cross-wire. It is not the `Commented`
review state, which withholds a verdict deliberately.

**Positions are keyed on the actor, not on the GitHub login.** This is the rule the form exists
for: in a single-account repository the login is transport, and several actors share it. A
consumer that keys on the login merges them, so one actor's later verdict silently replaces
another's — which is the specific failure this form is meant to prevent, reintroduced at the
parser. A GitHub review carries no actor field and needs none: GitHub authenticated it, so its
login is its actor.

**Independence is decided by the pair inside the verdict**, compared case-insensitively — never
against the pull request body's current declaration. The body is editable and its head does not
move when it changes, so a body-based comparison lets a non-clearing self-review become clearing
after the fact: edit the body to name a different implementer and the old comment silently starts
opening the gate. A verdict missing either actor never clears; matching actors are self-review.

**A consumer must read each comment's last-edited time and refuse an edited comment as
gate-clearing evidence.** A comment is mutable in place, so a `Changes required` can become an
`Approved` — and the head or actor can be swapped — while the commit named stays fixed. Where a
source carries no edit timestamp at all, treat the comment as unedited: that is the conservative
reading for an observation captured before the field was available, since the alternative
retroactively voids evidence. An edited comment still *closes* the gate when it objects.

A consumer still reads **`Implementation actor:`** from the pull request body — the same line
rules apply — but only as a cross-check. Where it disagrees with what a verdict recorded as the
implementation actor, something changed after the review; the consumer must **fail closed and
report** rather than choosing a side.

A non-clearing position is still a position. It displaces an earlier position by the same actor,
and a `Changes required` closes the gate whoever raised it.

None of this verifies the claim. An actor identifier is an assertion, and a consumer must not
report it as proof of independence — only that the record states it, which is what makes it
checkable at all.

**That evidence closes the gate readily and opens it narrowly.** A consumer may treat a GitHub
approval as verifying a finalization head only when all of these hold:

- the approval is the reviewer's **current position** — the latest non-dismissed review by that
  reviewer, not any approval they have ever left;
- **no reviewer** has an outstanding `Changes required`; one reviewer's approval never cancels
  another's objection;
- the workstream's own record **for that PR** is itself approving and declares finalization.

Outside that case, GitHub evidence never overrides the file. An approving GitHub review on a
workstream that records `Changes required` or `In review` is a contradiction to report, not a
shortcut through the gate — the same rule as everywhere else here.

A consumer must never infer the final head, and must never treat a self-referential SHA claim
as verification.

The verdict and head fields also appear in a review summary, and may appear in a PR review or
top-level PR comment. Wherever they appear, they mean the same thing: *this verdict was reached
against exactly this commit* — which is why the comment form above names the head rather than
relying on the PR's head at the time of reading. A verdict that names no commit verifies nothing
and a consumer must discard it.

**Missing sections are normal.** A workstream in `IDEA` legitimately has almost nothing. Absence
is not an error.

---

## The Owner Result — the owner's next action

From v0.6 a piece of work ends in exactly one of three owner-facing states. A consumer answering
*what does the owner need to do?* reads it from one marker, in this form and no other:

```markdown
Build OS owner result: SHIP
```

| Field | Rule |
|---|---|
| State | Exactly one of `SHIP`, `DECISION`, `BLOCKED`, case-insensitive. Unrecognized → absent, plus `OWNER_RESULT_MALFORMED`. |
| Where | A pull request body or a top-level pull request comment. |
| Binding | To the PR it appears on. |

The reading rules are the ones the comment verdict already uses, for the same reasons:

- The marker must **begin its line**. A sentence or a table cell containing the words is not a
  result.
- It is read only where it is **stated**, never where it is discussed. Quoted (`>`), fenced and
  HTML-commented text is stripped first — otherwise this document, the templates, and every
  worked example would issue owner results by describing them.
- **The latest one on a PR wins.** A result is a current position, not a history: work that was
  `DECISION` on Tuesday and `SHIP` on Thursday is `SHIP`. Where two markers appear in the *same*
  body or comment, neither is read and `OWNER_RESULT_AMBIGUOUS` is reported — a result that is
  two states is a writing error, and guessing which was meant is exactly the repair this
  contract forbids. The common cause is benign and the handling is deliberate: the PR handoff
  template ships all three blocks for the author to delete down to one, so an unfilled template
  reads as *no result declared* rather than as whichever state happens to appear first.

Everything below the marker — `What changed`, `Next action`, `Options`, `Blocker` — is prose for
the owner. A consumer may display it. It should not parse fields out of it.

### A result is a report, never evidence

**`SHIP` is not an approval, does not clear the merge gate, and must never be treated as
either.** It is the implementation agent's account of a gate that some *other* record either
satisfies or does not. The verdict, the reviewed head, the finalization state and the
independence rules are unchanged by anything here, and a consumer that let a `SHIP` stand in
for a verdict would have handed the implementing party the approval the whole gate exists to
withhold.

So the precedence is the ordinary one, and it runs against the result:

```text
workstream record + PR review evidence   >   Owner Result
```

Where they disagree, the durable record wins and the disagreement is **reported**. It is not
repaired, and the result is not upgraded, downgraded, or quietly ignored.

**`SHIP` asserts that only the owner's merge remains**, so a consumer checks the whole of the
gate's tail, not just its verdict. A `SHIP` is contradicted when, for its own PR:

- the review record's verdict is not `Approved` or `Approved with follow-ups`; or
- the record is approving but **stale** — its reviewed head is not the PR's current head and
  `Finalization: pushed` is not declared; or
- any reviewer has an outstanding `Changes required`; or
- the record does **not** declare `Finalization: pushed` — the documentation-only commit is
  still owed, by an agent; or
- finalization is declared but the final head is **unverified** — no approving review or
  comment verdict names the PR's current head. This is the `FINAL_HEAD_UNVERIFIED` condition
  below, and a `SHIP` sitting on top of it is the specific error this rule exists to catch:
  the reviewer's last step has not happened, so the package is not the owner's to merge yet.

Report `OWNER_RESULT_CONTRADICTED` in each case. The gate stays exactly as shut as it was.

**A missing result is not a warning, and it is the normal case.** Most PRs at most moments have
no owner result: awaiting review, in the correction loop, approved with finalization unpushed,
finalized with the final head unverified. Every one of those still owes work by an agent or a
reviewer, and none of them is terminal. `SHIP` is never the default for silence, and a consumer
that inferred one from an approving verdict would be reintroducing exactly the claim this
narrowing removed. Absence is absence.

The same three states appear as `owner_result` in
[`contracts/agent-session-checkpoint.v1.schema.json`](../contracts/agent-session-checkpoint.v1.schema.json),
where the enum is enforced by the schema rather than by this document. A checkpoint is the
weaker source: `framework/AGENT_SESSION_CHECKPOINT.md` puts it below GitHub state, and a
checkpoint claiming `SHIP` against a PR whose record disagrees is the same contradiction,
reported the same way.

---

## `DECISIONS.md` — the rationale log

Stable surface: level-3 headings matching `### DEC-### — <title>`, each followed by:

```text
**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Superseded by DEC-0NN | Deprecated
```

on one or two lines, then `**Context**`, `**Decision**`, `**Rationale**`,
`**Alternatives considered**`, `**Consequences**` blocks.

Consumers may rely on the ID, title, date, and status. The bodies are prose and should be
treated as such.

**Decision IDs are stable and never renumbered**, so a consumer may safely use `DEC-###` as a
durable key. A newly *accepted* decision is a meaningful event; a status change from `Accepted`
to `Superseded by …` is also meaningful. Editing prose in an existing entry is not.

---

## `PROJECT_MODEL.md` — current architecture

Deliberately unstructured. It is a human/agent mental model, not a schema, and a consumer should
not attempt to extract fields from it.

A consumer may note that it changed. It should **not** emit an event for every text edit —
a whitespace fix is not an architectural change. Prefer emitting nothing until a semantic
threshold exists.

---

## Integrity warnings

When artifacts disagree, a consumer **surfaces the disagreement** and does not silently pick a
winner. Cases worth reporting:

| Case | Handling |
|---|---|
| `ACTIVE.md` row and workstream file disagree on phase or status | Prefer the workstream file for detail; report the mismatch. |
| A workstream file exists with no `ACTIVE.md` row, and is not `COMPLETE`/`ABANDONED` | Report: work that is invisible on the board. |
| An `ACTIVE.md` row with no workstream file | Report: a board entry with no detail behind it. |
| Filename ID and heading ID differ | Report; address by filename. |
| A workstream marked `COMPLETE` still on the active board | Report: completion is supposed to remove the row. |
| Duplicate `WS-###` across files | Report; do not merge. |
| `Verdict: Approved`* with no reviewed head | Report `APPROVED_WITHOUT_REVIEWED_HEAD`: an approval that names no commit proves nothing. Treat the record as unreviewed. |
| A record's reviewed head differs from **its own** PR's current head, finalization not declared | Report `REVIEW_STALE`: the approval is against an older commit. |
| A record declares `Finalization: pushed` and no approving GitHub review names the PR's current head | Report `FINAL_HEAD_UNVERIFIED`: the divergence is expected, the verification is not there. |
| A PR merged at a head its own record never approved, or with a non-approving verdict | Report `MERGED_WITHOUT_APPROVAL`. |
| A **gated** workstream links a PR with no review record | Report `REVIEW_RECORD_MISSING` while open, `MERGED_WITHOUT_APPROVAL` once merged. Exempt: no v0.5-or-later version, no Build Card yet, or pre-adoption work under an inherited pin (above). |
| A record declares finalization while its verdict is not approving | Report `WORKSTREAM_PR_STATE_MISMATCH`: finalization comes after approval, not before. |
| A record is approving while a reviewer has an outstanding `Changes required` on GitHub | Report `WORKSTREAM_PR_STATE_MISMATCH`. The gate stays closed. |
| Workstream text says draft/in-review while the PR is merged or closed, or vice versa | Report `WORKSTREAM_PR_STATE_MISMATCH`. |
| Verdict or reviewed head present but malformed | Report `REVIEW_VERDICT_MALFORMED` / `REVIEWED_HEAD_MALFORMED`; the field is absent, the rest parses. |
| A comment verdict was edited after posting, or the PR body now names a different implementation actor than the verdict recorded | Report `REVIEW_EVIDENCE_MUTATED` and refuse it as gate-clearing. Evidence that moved after it was given is not evidence; an objection still closes the gate. |
| An owner result says `SHIP` while its PR's record is non-approving, stale, carries an outstanding `Changes required`, does not declare `Finalization: pushed`, or has an unverified final head | Report `OWNER_RESULT_CONTRADICTED`. `SHIP` asserts that only the owner's merge remains; the result is a report of the gate, never a way through it. |
| Two owner-result markers in one body or comment | Report `OWNER_RESULT_AMBIGUOUS`; read neither. A result that is two states is a writing error, not a state to guess at. |
| An owner-result state that is not one of the three | Report `OWNER_RESULT_MALFORMED`; the field is absent, the rest parses. |

\* `Approved with follow-ups` is treated identically to `Approved` by every rule here.

These are warnings about the *project's* records, addressed to its owner. They are not parser
errors, and they must not stop the rest of the parse. In particular, a consumer **never repairs**
a review field it finds contradictory — an approval it cannot verify is reported, not upgraded.

Equally, a consumer **never widens a record beyond its PR**. Silence about a PR nobody recorded
is correct output, not a gap to fill by borrowing another PR's verdict.

---

## Relationships that must not be flattened

- **One workstream may span several PRs.** This is normal Build OS behavior, not an anomaly.
- **One PR may serve several workstreams.**

A consumer's storage must model this as many-to-many, even where its UI shows a single primary
workstream per PR.

---

## Versioning

This contract versions with Build OS. A consumer should read the project's adopted Build OS
version where available and parse accordingly; where the version is unknown, it should parse
conservatively and report what it could not read.

Changes to this document are protocol changes and follow the normal versioning rules in
`VERSION.md`.
