# Build OS

**Build OS v0.9** — a reusable development framework for building software with a human
owner, a design agent, an implementation agent, and GitHub.

Build OS is not an application. It is a protocol: a set of documents, roles, and
artifacts that govern how work moves from a vague idea to reviewed, shipped code —
and how the understanding behind that code survives after the chat window closes.

---

## The problem it solves

Working with agents tends to fail in a specific way. The idea is discussed in a chat.
The agent writes a large specification. The human skims it, because it is written for a
machine. Code appears. It mostly works. Three weeks later nobody — human or agent —
can say why the system behaves the way it does, what was decided deliberately, or what
was quietly improvised.

Chat is a good place to think and a terrible place to remember.

It fails a second way once a project has more than one thing going on. Design happens across
many conversations, in more than one tool, over weeks. Four efforts are live at once, each in
a different state, and the only thing holding their state together is the owner's memory of
which chat said what.

And it fails a third way, once the first two are fixed. The framework works, the artifacts are
written, everything is durable — and the owner is now reading four documents written for
somebody else to find out whether they can merge. Rigor that only survives at a desk is rigor
most projects will abandon on the first busy week.

---

## The owner loop

This is the whole of what an owner has to know. Everything else in Build OS runs underneath it.

```text
INTENT  →  [ PLAN / APPROVE, when needed ]  →  BUILD + VERIFY  →  SHIP | DECISION | BLOCKED
```

**Intent.** You say what you want, in your own words, wherever you happen to be — ChatGPT,
Claude, another capable agent, or a GitHub issue. No product is privileged and none is
required.

**Plan.** For anything significant or ambiguous, you get a short approval card — goal, scope,
what is *not* changing, risk, any decisions that are actually yours, and a recommendation.
Roughly 100–200 words. You approve that, not a specification.

**Simple work skips the plan.** An obvious bug fix or a copy change goes straight to
implementation, because a one-line fix waiting on a design ceremony is how people stop using a
framework. What it never skips is the truth-telling at the end.

**Build and verify.** An implementation agent builds it; the project's own tests run; an
independent reviewer checks the actual code against what you approved. When the reviewer finds
something fixable, it goes straight back to the implementation agent on the same pull request.
**You are not the message bus** — you do not relay findings between two agents.

**Result.** You get exactly one of three:

| | Means | You |
|---|---|---|
| **SHIP** | Done and verified. Every agent and reviewer step is finished; the only thing left is your merge | Merge, or authorize a merge |
| **DECISION** | Something genuinely needs your judgment | Choose — options and a recommendation are given |
| **BLOCKED** | Work cannot responsibly continue | Unblock it, or accept that it stops |

`DECISION` is scarce and `BLOCKED` is scarcer. A failing test, a merge conflict, a reviewer's
finding, a naming choice — none of those are yours, and none of them reach you.

**The one rule that makes the short version trustworthy:** a summary may leave out detail, but
never material truth. `SHIP` cannot be written over red tests, a stale approval, an unresolved
blocking finding, or an undisclosed deviation from what you approved. It is a *report* of the
merge gate, never a way around it — and the agent that wrote the code still neither approves
nor merges it.

**And no terminal result arrives while agents still have work to do.** `SHIP` is not "the code
is written" or even "review passed" — both of those still leave a bookkeeping commit and a
final verification owed by an agent and a reviewer. Until those are done the work is
mid-flight, and mid-flight says *nothing needed from you yet* rather than handing you a package
that is not finished. `DECISION` and `BLOCKED` are the exceptions, because those are the cases
where you genuinely do have something to do.

Full rules: `framework/OWNER_INTERFACE.md`.

---

## Philosophy

**GitHub is durable shared memory.**
Branches, pull requests, and committed documents are the record. If a decision, a
deviation, or an architectural change exists only in a chat transcript, it does not exist.

**Chat interfaces are temporary transport.**
Design Room conversations and implementation sessions are how work moves, not where it
lives. Every session should end with the durable artifact updated in the repository.

**Humans should understand behavior without reading agent-oriented specifications.**
The Build Card is the owner's contract with the system: what it will do, in plain
language, in under a minute. The Build Spec is exhaustive and written for the
implementation agent. The owner is not expected to read it line by line, and the
framework is designed so they do not have to.

**Intent may begin anywhere; the lifecycle does not change because of it.**
A design agent, an implementation agent, another capable agent, or a GitHub issue — all of them
perform the same intake, and the durable artifacts they converge on are the same. ChatGPT is
the common Design Room and Claude the common implementation agent because that is what most
projects have, not because the protocol requires either. No chat product, mobile app, bot,
hosted service, or CI integration is mandatory anywhere in Build OS.

**Ceremony is proportional to consequence.**
A change that trades off product behavior earns a design conversation, an approved plan, a
spec, and independent review. A copy fix earns none of those and never did. What proportionality
never buys is a quieter ending: small work reports its result as honestly as large work, and
says which of the two it was — because that classification is itself a claim the owner is
entitled to check. Work is promoted from simple to significant the moment it turns out to touch
an owner decision, and is never demoted.

**A short summary may omit detail. It may not omit material truth.**
The owner's default reading path is deliberately compressed, and compression is a constraint on
the writing rather than a licence about the content. A deviation, a red check, a stale approval,
or an unresolved blocking finding is material by definition. The owner-facing layer is a
projection of the durable record underneath it, never a second version of it — and where the
two disagree, the durable record wins and the disagreement is reported.

**Product decisions and implementation decisions are separated.**
Whether a paused subscription keeps its seats is a product decision. Whether that state
lives in an enum column or a join table is not. Conflating the two either drowns the
owner in detail or lets an agent silently redesign the product.

**Actual code must be independently checked against design intent.**
An implementation agent's own account of its work is a claim, not evidence. Review reads
the Build Card, the Build Spec, the handoff, and then the code and tests — in that order,
and it trusts the last two most.

**Architecture and decisions must survive individual chat sessions and agents.**
`PROJECT_MODEL.md` answers *how does this system work today?* `DECISIONS.md` answers
*why does it work this way?* Any agent, on any day, should be able to read those two
files and be useful.

**A pinned framework version must be a decision, not an accident.**
Projects pin a Build OS version so work stays reproducible. Pinning without checking becomes
drift — a project running v0.1 while the framework is on v0.3, with every session working
under a process that no longer exists. Agents run a compatibility check before substantial
work, inspect what actually changed, and upgrade the project's protocol when it matters.
Neither the pin nor `main` is automatically right.

**Owner input is captured before it is processed.**
When the owner is producing raw material — playtest notes, a list of grievances, a stream of
half-formed ideas — the design agent records and does nothing else. Analysis at item three
anchors items four through twenty, and an owner who has to argue with each observation stops
reporting them. Capture Only is a named mode with an explicit exit, and the exit separates
what the owner observed from what the agent inferred from what the owner actually approved.

**Nothing significant merges on the author's own word.**
A significant PR needs an independent reviewer's verdict naming the exact commit it was
reached against — a full SHA, because an approval that names no commit proves nothing about
the code. The agent that wrote the change neither approves nor merges it. When the branch
moves, the approval does not move with it.

**Durable memory is made true before the merge, not after it.**
The last commit on a PR is documentation only: it sets the workstream and the board to what
becomes true when the PR lands. Bookkeeping deferred to a follow-up PR is bookkeeping that
does not happen, and `main` fills with workstreams describing a state that ended weeks ago.

**Parallel design threads need durable state, not chat history.**
A project runs several efforts at once. Each is a **workstream** with a stable ID, a phase,
and a file in the repository recording what has been settled and what has not.
`workstreams/` answers *what are we currently designing and building, and what remains?* A
new conversation reads it and resumes; it never asks the owner to paste in old transcripts.
Conclusions, models, decisions, and open questions are persisted — never whole transcripts.

---

## The lifecycle

```text
Abstract Idea
      │
      ▼
Design Room ──────────────► Mental Model ──────► Decisions
(explore, question,          (compact,            (only what needs
 challenge, alternatives)     diagrammable)        owner judgment)
      │
      ▼
Owner Plan  ◄── the owner approves this (~100–200 words, on a phone)
      │
      ▼
Build Card  ◄── the durable behavior contract review measures against
      │
      ▼
Build Spec  ◄── the implementation agent reads this (exhaustive)
      │
      ▼
Claude Implementation  ◄── continues the design handoff PR; one build, one PR
      │
      ▼
GitHub PR Handoff  ◄── authoritative record of what was actually built
      │
      ▼
Independent Review  ◄── code and tests checked against intent
      │            └──── changes required ──► back to implementation, same PR
      ▼
Merge Gate  ◄── approved verdict naming the current head; author neither approves nor merges
      │
      ▼
Merge Finalization  ◄── last commit, documentation only: memory made true before the merge
      │
      ▼
Project Memory Update  (PROJECT_MODEL.md, DECISIONS.md)
```

The owner's view of that column is three of its rows — the plan they approve, and the
`SHIP | DECISION | BLOCKED` result it ends in. Everything between is the engineering layer,
which is durable, inspectable, and not the owner's default reading path.

Approval attaches at the top and flows down only through faithful expansion: the plan expands
into the card, the card into the spec. An owner-visible choice appearing at any level that the
plan did not carry is not an expansion — it goes back to the owner.

Each arrow is a handoff, and each handoff has a defined artifact. Work does not move
forward on the strength of "we discussed it."

Design input can enter at any stage in **Capture Only** — the owner dumping observations,
the agent recording them and nothing more, until the owner ends the mode and the material is
consolidated into observations, interpretations, proposals, and approved decisions.

That lifecycle is one **workstream**. Several run at once, each in its own phase, each with
durable state in the repository:

```text
IDEA → EXPLORE → MODEL → DECIDE → BUILD_CARD → READY_TO_BUILD → BUILDING → REVIEW → COMPLETE
                                                        ( PAUSED · BLOCKED · ABANDONED )
```

The two views are the same process: the stages above are what happens, the phases here are
where each effort currently is. See `framework/WORKSTREAMS.md`.

---

## Roles

| Role | Owns | Does not own |
|---|---|---|
| **Owner** (human) | Product intent, decisions surfaced in Design Room, approval of the Build Card, merging (or authorizing a merger) | Reviewing the Build Spec line by line |
| **Design agent** (e.g. ChatGPT) | Exploration, the mental model, surfacing decisions, the Owner Plan and Build Card, faithful translation into the Build Spec, checkpointing workstream state | Choosing product behavior on the owner's behalf |
| **Implementation agent** (e.g. Claude) | Intake for work that arrives here first, code, tests, validation, the PR handoff, the Owner Result, memory updates, the merge-finalization commit | Changing owner-approved behavior; approving or merging its own significant PR |
| **Reviewer** (human or a separate agent) | Verifying code against intent, the owner-facing review summary, recording the verdict and the reviewed head | Rewriting the feature; merging |
| **GitHub** | The durable record | Nothing else — it is a filing cabinet, not a participant |

The parenthesised products are the common case, not a requirement. Any capable agent can hold
any of the agent roles, and one agent may hold two of them in sequence — but never *reviewer*
and *implementer* on the same change, which is the one separation the protocol will not bend.

---

## The documents

| File | Purpose |
|---|---|
| `framework/OWNER_INTERFACE.md` | The owner layer: intent intake, proportionality, the Owner Plan, and the `SHIP` / `DECISION` / `BLOCKED` result |
| `framework/DESIGN_ROOM.md` | The five-stage design process: Explore → Model → Decide → Build Card → Build Spec |
| `framework/BUILD_SPEC.md` | The standard implementation packet, and the owner-decision / discretion / escalation split |
| `framework/CLAUDE_HANDOFF.md` | What the implementation agent must do, and what the PR handoff must contain |
| `framework/PROJECT_MEMORY.md` | The three durable memory layers and the rules for maintaining them |
| `framework/WORKSTREAMS.md` | Parallel design threads: lifecycle, workstream files, the active-work board, checkpointing, and the GitHub capability boundary |
| `framework/FRAMEWORK_SYNC.md` | The framework compatibility check: keeping an adopted project's Build OS version honest without blindly tracking `main` |
| `framework/REVIEW_PROTOCOL.md` | Independent review after implementation: what review must answer, the merge gate, verdicts and reviewed heads, staleness, recovery, and merge finalization |
| `framework/AGENT_SESSION_CHECKPOINT.md` | Protocol contract: how agents publish session state — never transcripts |
| `framework/BUILD_OS_PARSE_CONTRACT.md` | Protocol contract: the subset of Build OS artifacts machine consumers may rely on |
| `contracts/` | Machine-readable schemas for the contracts above |
| `skills/` | Agent-invokable procedures — the same protocol aimed at an agent mid-task rather than an owner reading a document |
| `templates/` | Fill-in templates for each artifact — Owner Plan, Owner Result, Build Card, Build Spec, PR handoff, review summary, project model, decisions, workstream, active work, ChatGPT Project instructions |
| `examples/FEATURE_LIFECYCLE.example.md` | One worked example, start to finish: significant work, design-agent origin |
| `examples/SIMPLE_CHANGE.example.md` | A one-line intent handed straight to an implementation agent — and the one that turns out not to be simple |
| `examples/WORKSTREAM_SCENARIO.example.md` | Five parallel workstreams, and a new conversation resuming from repository memory alone |
| `examples/FRAMEWORK_UPGRADE.example.md` | A project one minor version behind, detected and migrated at session start |
| `examples/MERGED_BEFORE_REVIEW.example.md` | A PR merged before independent review, and the recovery that follows |
| `VERSION.md` | The canonical version identifier and what each version level means |
| `DECISIONS.md` | Build OS's own decision log — the framework dogfoods its protocol |

---

## Adopting Build OS in another repository

Build OS is referenced, not forked. Adopting it in a project takes five steps.

**1. Create the project's memory files.**

```bash
mkdir -p docs/workstreams
BASE=https://raw.githubusercontent.com/50thycal/build-os/main/templates
curl -sL $BASE/PROJECT_MODEL.template.md -o docs/PROJECT_MODEL.md
curl -sL $BASE/DECISIONS.template.md     -o docs/DECISIONS.md
curl -sL $BASE/ACTIVE_WORK.template.md   -o docs/workstreams/ACTIVE.md
```

Or copy them by hand:

```text
docs/
├── PROJECT_MODEL.md     how the system works today
├── DECISIONS.md         why it works this way
└── workstreams/
    ├── ACTIVE.md        what is in flight right now
    └── WS-###-<slug>.md one file per design/build thread
```

Fill in `PROJECT_MODEL.md` with how the system works *today*, even if the description is
rough — a rough true model beats an empty file. Leave `DECISIONS.md` empty except for the
header until there is a real decision to record. Then add a workstream file for each effort
already in flight; an existing project usually has three or four, and writing them down is
the first time anyone sees the whole board.

A repository with a strong existing documentation convention can put these elsewhere —
preserve the three-layer structure, and name the location in `CLAUDE.md`.

**2. Point the project at Build OS.**

Add to the project's `CLAUDE.md` (or equivalent agent instructions file). "Claude" here is
whichever implementation agent the project uses; nothing below is specific to one:

```markdown
## Build OS

- Canonical framework: 50thycal/build-os
- Adopted version: v0.9
- Last compatibility check: v0.9 on YYYY-MM-DD
- Operating mode: reviewed

Before substantial design or architectural work, compare the adopted version against
`VERSION.md` in the canonical repository and act on the delta — see
`framework/FRAMEWORK_SYNC.md`. Mark any project-specific protocol additions as
`Project-specific:` so they are never mistaken for Build OS itself.

## Development protocol

- Project memory lives in `docs/`: `PROJECT_MODEL.md` (how the system works today),
  `DECISIONS.md` (why), and `workstreams/` (what is being designed and built now).
- **Intent may arrive here directly.** Before writing code, establish the outcome in one
  sentence, capture the constraints I actually stated, and classify the work as simple or
  significant — see `framework/OWNER_INTERFACE.md`. Simple: unambiguous, no trade-off being
  chosen for me, nothing consequential to architecture, data, or security, and not part of or
  completing a significant workstream. Anything else is significant and needs an approved plan
  before implementation. Promote to significant the moment it turns out to touch an owner
  decision; never demote. When it is genuinely unclear, it is significant.
- Features arrive as a Build Card plus a Build Spec, belonging to a workstream. Implement
  to the spec.
- Owner decisions in the spec may not be silently changed. Implementation discretion is yours.
- Finish by pushing a branch, opening a PR, and writing the Implementation Handoff into
  the PR body per `framework/CLAUDE_HANDOFF.md`. The PR is the handoff; chat is not. Where a
  draft design handoff PR already exists for the work, continue that one — one build, one PR.
- A significant PR merges only after an independent reviewer records `Approved` or
  `Approved with follow-ups` naming its current head as a full 40-character SHA. Do not
  approve or merge your own significant PR. In a `solo` project I accept instead, recorded as
  `Owner-accepted` against the head I merge — that still is not you, and you still never
  approve, accept, or merge your own work.
- Before merge, push the documentation-only merge-finalization commit to the same PR, setting
  the workstream, `ACTIVE.md`, and `Review State` to what becomes true when it lands.
- Reviewer findings come to you, not to me. Fix fixable `Blocking` and `Should fix` findings
  on the same PR, re-validate, and request re-review without asking me to relay anything.
- Update `docs/PROJECT_MODEL.md` when architecture, flows, invariants, or responsibilities
  materially change. Add a `docs/DECISIONS.md` entry for consequential choices. Update the
  workstream file and `docs/workstreams/ACTIVE.md` with phase, PR, and next step.
- Apply any repository-update block the design agent supplied with the spec.
- Include the `Framework:` field in handoffs for significant PRs.
- End the PR handoff with an **Owner Result** — exactly one of `SHIP`, `DECISION`, or
  `BLOCKED`, opened by a `Build OS owner result:` line. It is the only owner-facing section;
  do not also write an Owner Summary. `SHIP` reports the merge gate and never substitutes for
  it: not while validation is red, a `Blocking` or `Should fix` finding is unresolved, there is
  no independent approved verdict, that verdict is stale, or a material deviation is
  undisclosed. An unresolved decision of mine is a `DECISION`, not a caveat inside a `SHIP`.
- Keep the final chat response to one or two lines: the result state, the PR reference, the
  headline validation result, and a pointer. The Owner Result carries the rest — restating it
  in chat is the failure the protocol exists to prevent, not thoroughness.
```

The four framework fields are the whole mechanism: where canonical lives, which version this
project follows, which version was last compared against, and whether an independent reviewer
is available. No extra config file, no tooling.

**On `Operating mode`:** `reviewed` is the default and means an independent actor exists to
review significant work. Set it to `solo` only when one genuinely does not — one person, one
identity, one agent — in which case the owner accepts changes at merge, recorded as such, and
the protocol stops asserting a review nobody can perform. `solo` relaxes who accepts and nothing
else: validation, disclosure, durable memory, and the rule that an agent never approves or
merges its own work all stand. Declaring it is a decision and belongs in the project's
`DECISIONS.md`. See `framework/REVIEW_PROTOCOL.md` → *Operating modes*.

**3. Set up the Design Room.**

Create one ChatGPT Project for this repository and paste
`templates/CHATGPT_PROJECT_INSTRUCTIONS.template.md` into its custom instructions, replacing
the placeholder:

```text
Canonical repository: <OWNER/REPOSITORY>
```

Every design conversation for the project happens in chats inside that Project. Each chat
starts a workstream, resumes one, reviews an implementation, or investigates a question —
and none of them is the record.

**4. Add the templates the team will actually use.**

Copy `templates/BUILD_CARD.template.md`, `templates/OWNER_PLAN.template.md`,
`templates/OWNER_RESULT.template.md`, `templates/PR_HANDOFF.template.md`,
`templates/REVIEW_SUMMARY.template.md`, and `templates/WORKSTREAM.template.md` into the project (commonly `.github/` or
`docs/templates/`). Wiring `PR_HANDOFF.template.md` up as
`.github/pull_request_template.md` is a good default — it makes the handoff structure the
path of least resistance, and it carries the Owner Result the owner will actually read.

**Skills are optional and taken by copy.** If any of `skills/` is useful, copy the directory
into wherever the project keeps them — commonly `.claude/skills/<name>/`. Unlike the protocol,
skills are **not versioned and not tracked**: a project takes the copy it wants and is not
obliged to follow this repository's later changes to it. That is deliberate, and it is the one
place Build OS does not ask for a compatibility check — a skill that changed under a project
mid-thread would be a worse problem than a stale one.

**5. Record the adoption.**

Add the first entry to the project's `DECISIONS.md`:

```markdown
### DEC-001 — Adopt Build OS for development workflow
**Date:** YYYY-MM-DD · **Status:** Accepted
...
```

That is the whole adoption. No dependencies, no tooling, no build step.

---

## Evolving Build OS

Build OS improves through **versioned changes to this repository**, not by copying
divergent instructions into every project.

When a project discovers that the protocol is wrong, incomplete, or awkward:

1. Fix it here, in this repository, as a normal PR.
2. Bump the version in `VERSION.md` according to the rules there.
3. Record consequential protocol changes in this repository's own `DECISIONS.md`.
4. Add a migration-notes entry to `VERSION.md` saying what an adopting project must do —
   including "nothing" when that is the answer.
5. Projects pick the change up at their next compatibility check, inspect the delta, and
   upgrade their protocol artifacts if it affects them.

The failure mode this prevents is a fleet of projects each running a slightly different,
slowly rotting variant of the same process, with no way to tell which one is current. Version
pinning alone does not prevent it — pinning plus the compatibility check does.
If a project genuinely needs different behavior, that is either a project-specific
addendum clearly marked as such, or evidence that Build OS itself should change.

**Current version: Build OS v0.9** — see `VERSION.md`.
