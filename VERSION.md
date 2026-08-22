# Build OS Version

**Build OS v0.1**

| Field | Value |
|---|---|
| Version | 0.1 |
| Status | Draft — protocol and templates only |
| Scope | Documentation, protocol, reusable templates |
| Contains code | No |

## What v0.1 establishes

- The lifecycle: Abstract Idea → Design Room → Mental Model → Decisions → Build Card → Build Spec → Claude Implementation → GitHub PR Handoff → Independent Review → Project Memory Update
- The five-stage Design Room process
- The Build Spec packet standard, including the owner-decision / implementation-discretion / escalation split
- The GitHub-as-handoff-surface protocol
- The two durable memory artifacts: `PROJECT_MODEL.md` and `DECISIONS.md`
- The independent review protocol
- Reusable templates for all of the above

## What v0.1 deliberately does not include

- Automation, CI, scripts, or linting of framework artifacts
- Package dependencies or services
- Project-specific instructions

## Changing the version

Build OS evolves through versioned changes to this repository. Downstream projects
reference a version; they do not fork the protocol. See `README.md` → *Evolving Build OS*.

When a change lands:

- **Patch (0.1.x)** — wording, clarifications, template polish. No behavior change for adopters.
- **Minor (0.x)** — new stages, new required sections, new artifacts. Adopters can upgrade incrementally.
- **Major (x.0)** — a change to the lifecycle itself, or to what each role is responsible for.

Record the reasoning for consequential framework changes in this repository's own
`DECISIONS.md`, using the same ADR format Build OS prescribes for projects.
