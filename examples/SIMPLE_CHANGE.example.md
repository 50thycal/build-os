# Worked Example — intent straight to the implementation agent

**Build OS v0.7**

Fictional. The project is **Harbour**, the invoicing tool from
`FEATURE_LIFECYCLE.example.md`. That example shows a significant change originating in a
Design Room and running the full five stages. This one shows the other entry path — the owner
typing a sentence at an implementation agent — and it shows both outcomes, because the
interesting half is the second one.

Two changes, requested a week apart. The first is simple and stays simple. The second looks
identical and is not.

Contents:

1. [A change that is simple](#1-a-change-that-is-simple)
2. [A change that looks simple](#2-a-change-that-looks-simple)
3. [What separated them](#3-what-separated-them)

---

## 1. A change that is simple

The owner, in Claude, on a Monday. No Design Room, no workstream, no ceremony:

> The first reminder goes out the day after the due date and the subject line says "Overdue
> invoice — action required". Day one is not "action required". Make it "Invoice reminder —
> {invoice_number}" for the first one and leave the later ones as they are.

### Intake

The implementation agent does not start typing. It does the four lines of **Intent Intake**
first — outcome, constraints, classification, routing — and it does them in its head, not in a
document:

- **Outcome.** The first reminder stops sounding like a final notice.
- **Constraints the owner actually stated.** First reminder only; later reminders unchanged;
  the exact replacement string, including the invoice number.
- **Classification.** Simple. The intended behavior is unambiguous — the owner supplied the
  literal subject line. No trade-off is being chosen on their behalf. No architecture, data, or
  security implication. Not part of any open workstream.
- **Routing.** Nothing here is a product choice the owner has not already made.

Note what makes this simple, because it is easy to get wrong. It **does** change owner-visible
behavior — a subject line is about as owner-visible as Harbour gets. Under v0.5's wording that
alone would have made it significant. Under v0.6 what matters is that the *owner* chose the
behavior, not the agent. Had the request been "make the first reminder sound friendlier", the
agent would be picking the words, and that is a decision it does not own.

### Implementation

One template file, one conditional on reminder index, and a test that the day-1 email carries
the new subject and the day-3 email does not.

### Result

```markdown
Build OS owner result: SHIP

**What changed:** The first reminder now uses "Invoice reminder — INV-1042" as its subject.
Reminders on day 3 and later are unchanged.
**Intent:** As requested, including the invoice number and leaving later reminders alone.
**Verification:** Simple change — email suite green, 2 new tests covering the day-1 and day-3
subjects. No independent review required under proportionality.
**Deviations:** None.
**Residual risk:** None.
**Next action:** Merge PR #352.
```

And in chat, in full:

```text
SHIP — PR #352. First-reminder subject changed as asked, tests green. Result is in the PR.
```

That is the entire protocol for a change like this. No Build Card, no Build Spec, no
workstream, no independent review, no review summary. What it does have is a result that says
**which gate it went through** — "simple change… no independent review required under
proportionality" — so that if the owner disagrees with the classification, they can see it and
say so. A misclassification the owner cannot see is the failure mode this whole class is
exposed to, and one sentence is the price of closing it.

---

## 2. A change that looks simple

The following Monday, same shape, same length:

> The reminder emails should stop once someone's actually paid. If the invoice is paid we
> shouldn't be emailing them.

### Intake, again

- **Outcome.** Paid invoices stop generating reminders.
- **Constraints stated.** None beyond the sentence.
- **Classification.** The agent starts to write "simple" and stops.

Harbour already stops reminders when an invoice is marked paid — that has been true since
before any of this. So the request only makes sense if the owner means something Harbour does
*not* currently do, and there are at least three candidates:

- stop reminders when a client has **claimed** payment (which `WS-011` deliberately decided
  should suppress for seven days and never mark the invoice paid — `DEC-007`);
- stop reminders when a payment has been **partially** received;
- stop reminders when the invoice was paid *and later* refunded or reversed, which currently
  resumes them.

Each is a different feature. Two of them touch a recorded decision, and one of them —
suppressing reminders on a payment claim indefinitely — would **reverse** `DEC-007`, which the
owner made deliberately three months ago after a client paid twice.

So: **not simple.** The agent does not pick the most likely reading, implement it, and mention
the ambiguity under *Design Decisions*. That is the exact failure the classification exists to
catch, and it is more tempting here than usual because one of the three readings really is the
most likely.

### What it returns instead

```markdown
Build OS owner result: DECISION

**Decision:** Which invoices should stop generating reminders — the sentence has three
possible meanings and one of them reverses a decision you made in February.
**Why now:** Harbour already stops reminders on paid invoices, so the request must mean a case
it doesn't cover. Picking one would change behavior you settled deliberately, and I'd be
choosing on your behalf.
**Options:**
- **A — Claimed payments suppress indefinitely.** Reverses DEC-007, which caps suppression at
  seven days because a client once paid twice while reminders kept arriving.
- **B — Partially paid invoices stop.** New behavior, no conflict with anything recorded.
- **C — Reversed or refunded payments stay quiet.** Currently reminders resume; arguably a bug.
**Recommendation:** C first — it looks like the case that actually bit you, it contradicts
nothing, and it's small. B is a real feature and wants its own plan. A I'd push back on.
**Impact:** C is a day's work. B or A open a workstream and get a plan before anything is built.
```

In chat:

```text
DECISION — "stop reminders once paid" could mean three different things and one reverses
DEC-007. Options and a recommendation are in the PR comment.
```

No code was written. No PR was opened for the change itself. Nothing was guessed.

### The owner answers

> C, and yeah that's the one that bit me. B later maybe.

Now it is simple again — C alone is an unambiguous bug fix touching no recorded decision. It is
implemented, validated, and returned as a `SHIP` whose `Verification` names the classification,
exactly like §1. **B is not silently dropped**: it goes on the board as a new workstream at
`IDEA`, because "later maybe" is a real state and the alternative is that it exists only in
this conversation.

Had the answer been B, the work would have been promoted then and there — a workstream, an
Owner Plan, a Build Spec, independent review, the full gate. The promotion costs an exchange.
Discovering after the merge that reminders now stop on partial payment, which nobody agreed to,
costs considerably more.

---

## 3. What separated them

Both requests were one sentence from the owner, typed at an implementation agent, with no
design conversation behind either.

| | Monday one | Monday two |
|---|---|---|
| Owner-visible behavior changes | Yes | Yes |
| Owner supplied the behavior | Yes — the literal subject line | No — three readings, and the agent would pick |
| Touches a recorded decision | No | Yes, on one reading |
| Classification | Simple | Significant, and escalated to `DECISION` |
| What it produced | A PR and a `SHIP` | A question, and no code |

**Size did not separate them. Neither did owner-visibility.** The only thing that did is
whether the owner had already made the decision the change embodies.

That is the whole of proportionality, and it is worth stating as the question an agent should
ask before reaching for the word "simple":

> Am I about to choose something on the owner's behalf?

If yes, it is significant, however small the diff. If no, build it — and say in the result that
that is the judgment you made, so the owner can disagree with it while it is still cheap.
