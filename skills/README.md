# Skills

Agent-invokable procedures. A skill is a `SKILL.md` with YAML frontmatter (`name`,
`description`) plus markdown instructions, loaded by a coding agent when the
description matches what the user is doing.

## Why they live here

Build OS is a protocol: documents, roles and artifacts that govern how work moves from
a vague idea to shipped code. Most of that protocol is written for a human to read and
follow — `framework/` holds those.

A skill is the same kind of knowledge aimed at a different reader. It encodes a
procedure an *agent* should follow, at the moment it applies, without the owner having
to remember the framework says so. That makes skills a natural second surface for
process that would otherwise depend on someone recalling a document.

The line between the two: **if the owner needs to read it to make a decision, it is a
`framework/` document. If an agent needs to act on it mid-task, it is a skill.** Where
both are true, the framework document is canonical and the skill points at it, so the
protocol never has two competing statements of the same rule.

## Adopting a skill in a project

Copy the skill directory into wherever that project keeps skills (commonly
`.claude/skills/<name>/`). Skills are versionless: a project takes the copy it wants and
is not obliged to track this repository's changes. That is deliberate — a skill that
silently changed under a project mid-thread would be a worse problem than a stale one.
