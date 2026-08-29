# Owner Result

<!-- The owner's default reading path. Exactly ONE of the three states below — delete the
     other two. A result that is really two states is a DECISION or a BLOCKED with finished
     work described inside it, never a SHIP with a question attached.

     Generated from current durable state at the moment it is written. Every claim here is
     one some durable artifact already supports.

     There is often no result at all, and that is correct. The three states are terminal, not
     a running status: work awaiting review has reached none of them. Say so plainly and carry
     no marker —

         Awaiting independent review. Nothing needed from you yet.

     A short summary may omit detail. It may not omit material truth. -->

**Workstream:** WS-### · **PR:** #<n> · **Date:** YYYY-MM-DD · **Build OS v0.6**

---

## SHIP

Build OS owner result: SHIP

**What changed:** <1–3 plain-language sentences>
**Intent:** <requirements satisfied, or an equivalent concise statement>
**Verification:** <validation + independent review status, in plain language>
**Deviations:** None | <material deviations only>
**Residual risk:** None | <material remaining risk only>
**Next action:** Merge PR #<n> | <the exact next action>

<!-- ~150 words maximum.

     SHIP reports the merge gate. It does not replace it, and writing one approves and
     merges nothing: the agent that wrote the code neither approves nor merges it.

     For SIGNIFICANT work, SHIP may not be written while any of these is true:
       - required validation is red, or was not run
       - a Blocking or Should fix finding is unresolved
       - there is no independent verdict of Approved / Approved with follow-ups
       - that verdict is stale — the PR moved since the reviewed head, other than by the
         merge-finalization commit
       - a material deviation from approved behavior is undisclosed

     Next action is load-bearing, because the gate terminates in three steps:
       - approved at current head, finalization not pushed  → "Finalize and merge PR #<n>"
       - finalization pushed, final head not yet verified   → "Reviewer verifies the final
                                                               head on PR #<n>, then merge
                                                               that SHA"
       - final head verified on the PR                      → "Merge PR #<n> at <SHA>"

     For SIMPLE work, Verification names the classification as well as the validation:
       "Simple change — full test suite green. No independent review required under
        proportionality."
     That sentence is what makes a misclassification visible to the owner. -->

---

## DECISION

Build OS owner result: DECISION

**Decision:** <one sentence>
**Why now:** <why implementation or review cannot settle this>
**Options:**
- **<Option A>** — <consequence>
- **<Option B>** — <consequence>
**Recommendation:** <preferred option and why, where appropriate>
**Impact:** <what changes once chosen>

<!-- Scarce. For a choice that changes what someone using the system experiences, what the
     business commits to, what data is kept or lost, or what becomes hard to reverse.

     NOT a DECISION: a failing test, a merge conflict, a reviewer finding the implementation
     agent can fix, naming, schema shape, library choice, an ordinary engineering trade-off.
     Those stay inside the agent loop.

     Do not bundle unrelated choices into one DECISION unless they are genuinely coupled. -->

---

## BLOCKED

Build OS owner result: BLOCKED

**Blocker:** <one sentence>
**Why agents cannot resolve it:** <plain language>
**Smallest action needed:** <specific owner or external action>
**Work preserved:** <what remains safely completed>

<!-- Scarcer than DECISION. A missing credential or authority, an unavailable external
     dependency, an action outside the agents' permission, or a conflict that cannot honestly
     be reduced to a choice the owner could just make.

     Difficulty is not a blocker. An agent reaching for BLOCKED because the work got hard has
     mislabelled its own problem as the owner's.

     Work preserved is not optional: without it the owner assumes the worst and the next
     session redoes what was already finished. -->

---

<!-- The final chat response is one or two lines plus a pointer to this result. Never a
     second copy of it. -->
