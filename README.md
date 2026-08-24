# Build OS

**Build OS v0.5** — a reusable development framework for building software with a human
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
Build Card  ◄── the owner reads this (30–60 seconds)
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
| **Design agent** (e.g. ChatGPT) | Exploration, the mental model, surfacing decisions, the Build Card, faithful translation into the Build Spec, checkpointing workstream state | Choosing product behavior on the owner's behalf |
| **Implementation agent** (e.g. Claude) | Code, tests, validation, the PR handoff, memory updates, the merge-finalization commit | Changing owner-approved behavior; approving or merging its own significant PR |
| **Reviewer** (human or a separate agent) | Verifying code against intent, the owner-facing review summary, recording the verdict and the reviewed head | Rewriting the feature; merging |
| **GitHub** | The durable record | Nothing else — it is a filing cabinet, not a participant |

---

## The documents

| File | Purpose |
|---|---|
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
| `templates/` | Fill-in templates for each artifact — Build Card, Build Spec, PR handoff, review summary, project model, decisions, workstream, active work, ChatGPT Project instructions |
| `examples/FEATURE_LIFECYCLE.example.md` | One worked example, start to finish |
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

Add to the project's `CLAUDE.md` (or equivalent agent instructions file):

```markdown
## Build OS

- Canonical framework: 50thycal/build-os
- Adopted version: v0.5
- Last compatibility check: v0.5 on YYYY-MM-DD

Before substantial design or architectural work, compare the adopted version against
`VERSION.md` in the canonical repository and act on the delta — see
`framework/FRAMEWORK_SYNC.md`. Mark any project-specific protocol additions as
`Project-specific:` so they are never mistaken for Build OS itself.

## Development protocol

- Project memory lives in `docs/`: `PROJECT_MODEL.md` (how the system works today),
  `DECISIONS.md` (why), and `workstreams/` (what is being designed and built now).
- Features arrive as a Build Card plus a Build Spec, belonging to a workstream. Implement
  to the spec.
- Owner decisions in the spec may not be silently changed. Implementation discretion is yours.
- Finish by pushing a branch, opening a PR, and writing the Implementation Handoff into
  the PR body per `framework/CLAUDE_HANDOFF.md`. The PR is the handoff; chat is not. Where a
  draft design handoff PR already exists for the work, continue that one — one build, one PR.
- A significant PR merges only after an independent reviewer records `Approved` or
  `Approved with follow-ups` naming its current head as a full 40-character SHA. Do not
  approve or merge your own significant PR.
- Before merge, push the documentation-only merge-finalization commit to the same PR, setting
  the workstream, `ACTIVE.md`, and `Review State` to what becomes true when it lands.
- Update `docs/PROJECT_MODEL.md` when architecture, flows, invariants, or responsibilities
  materially change. Add a `docs/DECISIONS.md` entry for consequential choices. Update the
  workstream file and `docs/workstreams/ACTIVE.md` with phase, PR, and next step.
- Apply any repository-update block the design agent supplied with the spec.
- Include the `Framework:` field in handoffs for significant PRs.
- Keep the final chat response minimal — one or two lines and the PR reference.
```

The three framework fields are the whole mechanism: where canonical lives, which version this
project follows, and which version was last compared against. No extra config file, no
tooling.

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

Copy `templates/BUILD_CARD.template.md`, `templates/PR_HANDOFF.template.md`,
`templates/REVIEW_SUMMARY.template.md`, and `templates/WORKSTREAM.template.md` into the project (commonly `.github/` or
`docs/templates/`). Wiring `PR_HANDOFF.template.md` up as
`.github/pull_request_template.md` is a good default — it makes the handoff structure the
path of least resistance.

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

**Current version: Build OS v0.5** — see `VERSION.md`.
