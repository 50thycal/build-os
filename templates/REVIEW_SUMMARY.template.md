# Review Summary — <feature name>

<!-- Owner-facing. Must be understandable without reading the PR. No file names, no
     function names, no diffs. Findings from the code, not from the handoff. -->

**PR:** <link> · **Workstream:** WS-### · **Build Card:** <link> · **Reviewer:** <name> · **Date:** YYYY-MM-DD

## Verdict

**Verdict:** <Not started | In review | Changes required | Approved | Approved with follow-ups>
**Reviewed head:** <full 40-character commit SHA, or —>
**Head current at publication:** <yes | no — PR is now at abc1234...>

<!--
The reviewed head is the exact commit this verdict was reached against. A 40-character SHA,
never an abbreviation: a prefix cannot prove which commit was reviewed.

An approval with no reviewed head does not open the merge gate — treat it as `In review`.

If the PR has moved since, the approval is stale: say so above, and the new head needs
reviewing. A change limited to the finalization surfaces may be verified against the final
head instead of re-reviewed in full — record that final head here either way.

A finding only the owner can settle is `Changes required`, with the question under
*Decisions requiring owner attention* below.
-->

## What actually changed

<The reviewer's independent account, from the perspective of someone using the system.>

## Match to intended design

<Does the built behavior match the Build Card? Where it diverges, what and how much it
matters.>

## Issues found

<!-- Most severe first. Describe the consequence, not the mechanism.
     Severity: Blocking · Should fix · Consider · Note -->

| Severity | Issue | Consequence |
|---|---|---|
|  |  |  |

## Architecture implications

<What this means for the shape of the system going forward. Debt taken, flexibility gained
or lost, what will make the next change harder.>

## Decisions requiring owner attention

<!-- Each with options and a recommendation. `None` if there are none. -->

None

## Recommended next action

<One clear instruction. Where this belongs to a workstream, say what happens to it: does
this PR complete it, or does it return to BUILDING with the findings above?>

<!-- "Merge" is never the reviewer's own next action. The reviewer approves; the owner or an
     authorized merger merges, targeting the exact reviewed head, after the documentation-only
     merge-finalization commit. -->

---

<details>
<summary>Verification trace (for the implementation agent)</summary>

<!-- Optional. Where each owner decision and acceptance criterion was verified in code. -->

| Item | Verified at | Result |
|---|---|---|
| OD-1 |  |  |
| AC-1 |  |  |

</details>
