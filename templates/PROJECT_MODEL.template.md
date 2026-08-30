# Project Model — <project name>

<!-- How does this system work TODAY? Present tense. Not a roadmap, not a history.
     A mental model, not generated API documentation. -->

**Last updated:** YYYY-MM-DD · **Build OS v0.7**

---

## Purpose

<What this system is for, and for whom. A few sentences.>

## Major components

| Component | Responsibility |
|---|---|
|  |  |

<Brief prose on how they relate.>

## System boundaries

<Where this system ends. What it owns and is authoritative for, what it mirrors from
elsewhere, what it merely calls.>

## Important data flows

### <Flow name>

```text

```

<What moves, where it comes from, where it ends up, what can go wrong.>

## Major state machines / workflows

### <Entity> lifecycle

```text
state ──trigger──► state
```

| From | To | Trigger | Notes |
|---|---|---|---|
|  |  |  |  |

## External integrations

| System | Used for | Behavior when unavailable |
|---|---|---|
|  |  |  |

## Important invariants

<!-- Things that must always be true. These tell a reader which parts are load-bearing. -->

-
-

## Important persistence / data structures

<Core entities and their relationships. Not the full schema.>

## <Domain> lifecycle

<!-- If the system has a central domain object everything orbits — an experiment, a game,
     a campaign, an order — document its full lifecycle here. Delete this section if not
     applicable. -->

## Current major architectural constraints

<!-- What cannot easily change, and why. Performance budgets, compliance, compatibility
     obligations, deliberate limitations. Cite DEC-nnn where a constraint has a recorded
     reason. -->

-
-

---

<!-- Update this file in the same PR as any change that materially alters architecture,
     important flows, invariants, or system responsibilities. -->
