# Agent Session Checkpoint

**Build OS v0.5 — protocol contract**

A **session** is one agent working context: a Claude implementation run, a ChatGPT design
conversation, a review pass, an investigation. A **session checkpoint** is a small, structured
description of that session's *state*, published so tooling — and the owner — can see what is
live without anyone reading a chat window.

Contract: [`contracts/agent-session-checkpoint.v1.schema.json`](../contracts/agent-session-checkpoint.v1.schema.json)

This document specifies the protocol. The Project Intelligence Companion is its first consumer;
the contract is not specific to it.

---

## The one rule

**A checkpoint describes state. It never contains a transcript.**

The schema has no field that could hold conversation text, and it sets
`additionalProperties: false` so one cannot be added by accident. This is deliberate: the moment
transcripts become the integration, chat becomes the source of truth, and every guarantee Build
OS makes about durable memory is gone.

Transcript scraping is not a fallback, not a degraded mode, and not an optimization. It is out
of the protocol.

---

## Where checkpoints belong

In order of preference:

1. **Committed to GitHub** — as a workstream file update, when the checkpoint materially changes
   durable state. This is a Build OS checkpoint in the normal sense (`framework/WORKSTREAMS.md`)
   and it is authoritative.
2. **Posted to a consuming service** — for live visibility *between* durable checkpoints. This is
   ephemeral and must be displayed as derived, never as canonical.
3. **Nowhere else.** No transcript store, no inference from commit patterns.

The second exists because durable checkpoints happen at meaningful moments, which leaves gaps of
hours where nobody can see whether a session is running, stuck, or dead. Filling that gap is
worth a small ephemeral channel. Replacing durable state with it is not.

---

## Precedence

When sources disagree:

```text
canonical Build OS artifact in GitHub
    > GitHub PR / review / CI state
    > explicit agent session checkpoint
    > AI-derived inference
```

A consumer must **surface** a disagreement rather than silently merging it. If a checkpoint says
`COMPLETED` and the PR is open with failing CI, both facts are shown, and GitHub is the one that
counts.

---

## Lifecycle

```text
SESSION_STARTED ──► ACTIVE ──► WAITING ──► BLOCKED ──► COMPLETED
                       │                                  ▲
                       └──────────────────────────────────┘
                       │
              no checkpoint for threshold
                       ▼
                    UNKNOWN   (assigned by the consumer, never claimed by the agent)
```

`UNKNOWN` is deliberately absent from the schema's `status` enum. It is what a consumer concludes
about a session that has gone quiet — and quiet is the ambiguous case, which is exactly why an
agent may not claim it.

**Silence is never success.** A session that stops checkpointing becomes `UNKNOWN`. It never
becomes `COMPLETED` without a checkpoint that says so, or durable GitHub state that proves it.

Consumers should treat a session as stale after a threshold appropriate to the session kind —
an implementation run reporting nothing for hours means something different from a design
conversation doing the same.

---

## When to checkpoint

The same moments that warrant a Build OS checkpoint (`framework/WORKSTREAMS.md` → *Checkpoint
policy*), plus session start and session end:

1. session start,
2. a materially clearer mental model,
3. an owner decision made,
4. Build Card ready,
5. Build Spec issued,
6. implementation started, or a PR created,
7. review findings, or approval,
8. completion, pause, block, or abandonment,
9. session end — including an abandoned one.

**Not after every exchange.** A checkpoint per message is overhead that gets switched off within
a week, and a stream of no-op checkpoints hides the ones that matter.

---

## Fields that are commonly done badly

- **`blockers[].needs_owner`** — true *only* when the owner personally must act. An agent waiting
  on CI is blocked; it does not need the owner. Getting this wrong is how a `Needs Me` list fills
  with noise and stops being read.
- **`completed` / `in_progress`** — short factual statements, not narration. "Region schema", not
  "I went ahead and implemented the region schema which took a while because…".
- **`session_id`** — stable across a session's whole life. Reusing an id means "same session";
  a new id means "new session". Regenerating it per checkpoint produces a fleet of one-checkpoint
  ghosts.
- **`updated_at`** — the real time this checkpoint was produced. Consumers compute staleness from
  it, so a stamped-forward value silently disables the one safety property this contract has.

---

## Example

```json
{
  "schema_version": "1",
  "repository": "50thycal/cargo-ship",
  "workstream_id": "WS-004",
  "session_id": "claude-2026-08-23-a1b2c3",
  "agent": "claude",
  "session_kind": "IMPLEMENTATION",
  "objective": "Add region-aware simulation",
  "status": "ACTIVE",
  "phase": "BUILDING",
  "completed": ["Region schema", "Existing 100-round simulation preserved"],
  "in_progress": ["Baltic region configuration"],
  "blockers": [],
  "next_step": "Run balancing simulation",
  "related_pr": 84,
  "updated_at": "2026-08-23T18:00:00Z"
}
```

A consumer renders that as session state — beside, and subordinate to, whatever GitHub says
about PR #84.

---

## What a consumer must not do

- Treat a checkpoint as canonical when a durable Build OS artifact disagrees.
- Infer `COMPLETED` from silence.
- Merge a contradiction instead of showing it.
- Accept a checkpoint whose `schema_version` it does not understand.
- Store, request, or reconstruct transcript content by any route.
