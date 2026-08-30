# Worked Example — a feature through the full lifecycle

**Build OS v0.9**

**Significant work, originating with a design agent.** The intent arrives in a Design Room
conversation, runs all five stages, and goes through the full merge gate. For the other entry
path — one sentence typed at an implementation agent, classified and built without any of this
— see `SIMPLE_CHANGE.example.md`, which also shows the case where that classification turns out
to be wrong.

A fictional product, taken end to end. The product is **Harbour**, an invoicing tool for
freelancers. Harbour sends invoices, tracks whether they are paid, and chases overdue ones
with automatic reminder emails.

Nothing here is real. It exists to show the shape of each artifact and how one feeds the
next. The example is deliberately imperfect in one place — the review finds a real defect
and an undisclosed deviation, because that is what review is for. It also shows the ordinary
`REVIEW → BUILDING → REVIEW` loop that follows, and the merge-finalization commit that makes
`main` true before the PR lands.

In workstream terms this is **WS-011 — Client payment claims**, taken from `IDEA` to
`COMPLETE` in a single pass. For several workstreams running in parallel at different
phases, see `WORKSTREAM_SCENARIO.example.md`.

Contents:

1. [The abstract idea](#1-the-abstract-idea)
2. [Design Room — Explore](#2-design-room--explore)
3. [Design Room — Model](#3-design-room--model)
4. [Design Room — Decide](#4-design-room--decide)
5. [Build Card, and the Owner Plan](#5-build-card)
6. [Build Spec (selected portions)](#6-build-spec-selected-portions)
7. [PR Handoff](#7-pr-handoff)
8. [PROJECT_MODEL update](#8-project_model-update)
9. [DECISIONS entry](#9-decisions-entry)
10. [Review, and the road to merge](#10-review)

---

## 1. The abstract idea

What the owner actually said, in chat, on a Tuesday:

> Clients keep complaining that we nag them after they've already paid. Bank transfers
> take days to show up and meanwhile they're getting reminder after reminder. Can we let
> them just tell us they paid? Something in the email. But I don't want people using it to
> stall forever.

Incomplete, contains a real tension ("let them tell us" vs. "don't let them stall"), and
proposes a mechanism ("something in the email") without stating the outcome.

### The owner was not finished talking

The next message was:

> Hold on, let me get through the whole list first, don't start solving yet.

That is Capture Only. The design agent replied `Noted — capturing.` and recorded the rest as
it arrived, without analysis:

> Two clients said the reminder tone is aggressive.
> One asked why we don't just read their bank feed.
> Actually scratch the tone one, that was the old copy, we fixed it.
> And someone paid twice last month because of this.

When the owner said "ok, that's everything", the agent consolidated:

```markdown
## Capture consolidation — invoice reminders, 2026-02-01

### Observations
1. Clients receive reminders for invoices they have already paid; bank transfers take days
   to appear.
2. A client asked why the system does not read their bank feed directly.
3. A client paid twice last month, apparently because of continued reminders.
4. ~~Two clients found the reminder tone aggressive~~ — withdrawn by the owner: that was the
   old copy, since fixed.

### Interpretations
- (1) and (3) look like the same failure: the system has no way to know a payment is in
  flight, so it keeps chasing, and a client eventually pays again to make it stop.

### Proposed rules
- P1. Let the client say "I've paid this" from the reminder email, suppressing reminders
  for a bounded period.
- P2. Bank feed integration.

### Approved decisions
- None.

### Still open
- How long should suppression last, and what happens when it expires?
- Is a double payment a real risk or a one-off?
```

Note what the consolidation does and does not do. The withdrawn observation is kept, struck
through, rather than deleted — the owner corrected it, and the correction is information.
P2 is recorded as a proposal and goes no further; nobody approved a bank integration. And
`Approved decisions: none` is the honest state after a capture session, which is the usual
state.

The room then opens at `EXPLORE` on the problem the observations describe.

---

## 2. Design Room — Explore

The design agent does not write a spec. It asks.

**Desired outcome.** Clients stop receiving reminders for invoices they have already paid,
without the freelancer losing the ability to chase invoices that are actually unpaid.

**Current behavior.** An invoice becomes `overdue` the day after its due date. A daily job
emails the client a reminder on days 1, 3, 7, 14, and then every 14 days. Reminders stop
only when the freelancer marks the invoice paid in the Harbour web app. Harbour has no
bank connection, so it cannot see a transfer land — the freelancer sees it in their bank
and marks it manually, typically two to five days late.

**User experience being sought.** Two users, and they want different things. The *client*
wants a way to say "this is handled, please stop" without logging into a tool they do not
have an account for. The *freelancer* wants to not look like they are hounding a client who
paid — and does not want to lose the chasing mechanism to a client who says "paid" and
means "eventually."

**System being changed.** Invoice state machine, the reminder scheduling job, and the
outbound email templates. Per `PROJECT_MODEL.md`, invoice state is authoritative in
Harbour and the reminder job is a stateless daily sweep.

**Assumptions surfaced.**
- Clients do not have Harbour accounts and will not create one for this. (Confirmed.)
- The claim is unverifiable — Harbour cannot check whether money moved. (Confirmed; this
  is the crux.)
- Most claims are honest and the pause is short. (Owner's belief, not data. Recorded as an
  assumption, and it drives the design toward "cheap to be wrong.")

**Unresolved questions.** Does a claim mark the invoice paid, or only pause reminders?
What happens if the freelancer never responds? Can a client claim twice?

**Second-order effects.**
- A new invoice state that every invoice list, filter, and export must handle.
- The freelancer needs a prompt to confirm or reject, which means a notification path.
- A one-click action in an email is a public, unauthenticated endpoint — an abuse surface.
- Support burden shifts: "why am I still getting reminders after I said I paid?"

**Alternative considered and rejected.** *Just let the client snooze reminders for 7 days,
with no claim and no freelancer involvement.* Simpler, no new state, no confirmation flow.
Rejected because the freelancer never learns that the client believes they paid — which is
the most useful signal in the whole interaction. Recorded so it is not re-proposed.

---

## 3. Design Room — Model

```text
Invoice lifecycle — after the change (new elements marked ▲)

   draft ──send──► sent ──due date passes──► overdue ──┐
                    │                          │       │
                    │                          │       ▲ client clicks "I've paid"
                    │                          │       │
                    │                          ▼       ▼
                    │                       payment-claimed ▲
                    │                          │  │  │
                    │       freelancer confirms │  │  │ freelancer rejects
                    │                          │  │  │
                    │        7 days pass, no   │  │  └──────────► overdue
                    │        freelancer answer │  │                (reminders resume)
                    │                          │  └──────────────► overdue
                    ▼                          ▼                    (reminders resume) ▲
                  paid ◄──── freelancer marks paid ────────────────────────────────────┘
```

```text
Reminder flow — before and after

Before:  daily sweep → invoice overdue? → is today a reminder day? → send reminder

After:   daily sweep → invoice overdue? → send reminder
                     → invoice payment-claimed? → send nothing
                                                → claim older than 7 days? → back to overdue
```

```text
The claim interaction

  reminder email ──"I've already paid this"──► one-click confirmation page
         │                                              │
         │                                              ▼
         │                                    invoice → payment-claimed
         │                                              │
         └──────────────────────────────────────────────┼──► freelancer notified:
                                                        │    "Acme says they paid #1043.
                                                        │     Confirm or keep chasing?"
                                                        ▼
                                              reminders paused, max 7 days
```

Note what the model makes obvious: `payment-claimed` is not a payment state at all. It is a
*reminder suppression* state with a deadline. That framing settles most of the decisions
below, and it came from drawing the picture rather than from writing a spec.

---

## 4. Design Room — Decide

Four decisions went to the owner. Storage shape, email templating, job scheduling, and
endpoint naming did not — they are invisible in behavior.

**D1. Does a client's claim mark the invoice paid, or only pause reminders?**

- **A — mark paid.** Fewest steps for everyone. But Harbour's paid figure becomes a claim
  rather than a fact, and the freelancer's revenue numbers stop being trustworthy.
- **B — pause reminders, freelancer confirms.** Keeps `paid` meaning *money arrived*. Costs
  the freelancer one action per claim.

*Recommendation: B.* Harbour's core promise is that the freelancer knows what they are
owed. A `paid` state that can be set by the debtor breaks it.

> **Owner: B.** "Paid means paid. I'll click the button."

**D2. What happens if the freelancer never responds to a claim?**

- **A — reminders stay paused indefinitely.** A silent freelancer means a client is never
  chased again. Silence is common.
- **B — reminders resume after a fixed window.** Bounded worst case. A client who genuinely
  paid may get one more reminder if the freelancer is slow.

*Recommendation: B, with a 7-day window.* Roughly covers the bank-transfer clearing delay
the whole feature exists for.

> **Owner: B, 7 days.** "One extra reminder is survivable. Never chasing again isn't."

**D3. Can a client claim payment more than once on the same invoice?**

- **A — unlimited claims.** Each claim pauses for another 7 days, so a client can stall
  indefinitely by clicking a link every week.
- **B — one claim per invoice.** After the window expires or the freelancer rejects, the
  link stops pausing anything; the client sees a page telling them to contact the
  freelancer directly.

*Recommendation: B.* Directly answers the owner's original worry about stalling.

> **Owner: B.**

**D4. Should the claim link require the client to log in or verify identity?**

- **A — signed, invoice-scoped link, no login.** Anyone with the reminder email can claim.
  Worst case, given D3: one 7-day pause on one invoice, and the freelancer is notified
  immediately.
- **B — email verification before the claim registers.** Closes that gap, adds a step to a
  flow whose entire value is being one click.

*Recommendation: A.* The blast radius is one pause on one invoice, and the freelancer is
told about it as it happens.

> **Owner: A.**

---

## 5. Build Card

```markdown
# Build Card — Client payment claims

**Workstream:** WS-011 · **Status:** Approved · **Date:** 2026-02-04 · **Build Spec:** docs/specs/2026-02-payment-claims.md

## Goal
Stop chasing clients who have already paid, without giving up the ability to chase clients
who haven't.

## Current behavior
An overdue invoice sends reminder emails on days 1, 3, 7, 14 and every 14 days after.
Reminders stop only when the freelancer marks the invoice paid. Bank transfers take days
to appear, so clients routinely get reminders for invoices they already paid.

## New behavior
Every reminder email includes "I've already paid this." Clicking it pauses reminders for
that invoice and notifies the freelancer, who confirms the payment or rejects the claim.
If the freelancer does nothing for 7 days, reminders resume automatically. Each invoice
can be claimed once.

## Mental model / flow
    overdue ──client clicks "I've paid"──► payment-claimed (reminders paused)
                                                │
              freelancer confirms ──────────────┼──► paid
              freelancer rejects ───────────────┼──► overdue (reminders resume)
              7 days pass, no answer ───────────┴──► overdue (reminders resume)

## Important rules
- A claim never marks an invoice paid. Only the freelancer can do that.
- A claim pauses reminders for at most 7 days.
- An invoice can be claimed once. A second attempt shows a page directing the client to
  contact the freelancer.
- The freelancer is notified as soon as a claim is made.
- The claim link works without a login and is scoped to a single invoice.

## Decisions made
- **Claim marks paid, or pauses reminders?** → Pauses only. `Paid` must keep meaning money
  arrived.
- **Freelancer never responds?** → Reminders resume after 7 days. Never chasing again is
  worse than one extra reminder.
- **Repeat claims?** → One per invoice, so the link can't be used to stall.
- **Login required?** → No. Worst case is a single 7-day pause the freelancer is told about.

## Non-goals
- No payment processing or bank integration. Harbour still can't see money move.
- No partial payments or payment plans.
- No client accounts or client-facing portal.
- No change to the reminder schedule itself.

## Definition of done
- [ ] Reminder emails contain a working "I've already paid this" link.
- [ ] Clicking it pauses reminders and notifies the freelancer within minutes.
- [ ] The freelancer can confirm (invoice becomes paid) or reject (reminders resume).
- [ ] An unanswered claim resumes reminders after 7 days.
- [ ] A second claim on the same invoice pauses nothing and shows the contact page.
- [ ] Invoice lists and exports display the new state sensibly.

**After this change, the system should** stop sending reminders for up to seven days when a
client says they have paid, and tell the freelancer so they can confirm or keep chasing.
```

### What the owner actually approved

The card above is the durable behavior contract — it is what review measures the code against
in section 10, and what the spec expands. It is also a two-minute read on a laptop, and the
owner approved this on a Sunday evening on a phone.

So what went in front of them was the **Owner Plan** derived from it:

```markdown
## Owner Plan

**Goal:** Stop chasing clients who have already paid, without losing the ability to chase
clients who haven't.

**Scope:**
- Every reminder email gets an "I've already paid this" link.
- Clicking it pauses that invoice's reminders and tells you straight away.
- You confirm the payment, or reject it and reminders resume.
- No answer from you for 7 days: reminders resume on their own.
- One claim per invoice — a second attempt just points them at your contact details.

**Not changing:** Nothing marks an invoice paid except you. No bank connection, no partial
payments, no client logins, and the reminder schedule itself is untouched.

**Risk:** Low — a client acting in bad faith buys at most one 7-day pause, and you are told
about it immediately.

**Owner decisions needed:** None. The four questions from Thursday are settled and written
into the card.

**Recommendation:** Proceed.
```

Roughly 170 words, and it contains no state machine, no file, and no `OD-n`. The owner replied
"go" from a train.

That approval authorizes the Build Spec below **only for as long as the spec faithfully expands
it**. Nothing owner-visible may appear downstream that this plan did not carry — and in section
10 the review finds something that did, which is the point of checking.

---

## 6. Build Spec (selected portions)

The full spec runs to about nine pages. Four portions are reproduced here to show the parts
that matter most.

### The three-way split

```markdown
### Owner decisions — may not be silently changed

- **OD-1.** A claim never transitions an invoice to `paid`. Only a freelancer action does.
- **OD-2.** A claim suppresses reminders for a maximum of 7 days from the claim timestamp,
  after which the invoice returns to `overdue` and the normal reminder schedule resumes.
- **OD-3.** An invoice accepts at most one claim in its lifetime. Subsequent visits to the
  claim link render the "contact your freelancer" page and change no state.
- **OD-4.** The claim link is unauthenticated, signed, and scoped to a single invoice.
- **OD-5.** The freelancer is notified on claim creation.

### Implementation discretion

Yours: whether claim state is columns on `invoices` or a separate `payment_claims` table;
token signing scheme within the existing `signing` module; how the expiry sweep is
scheduled; notification delivery mechanics within the existing notification service;
naming; test layout; any behavior-preserving refactor of the reminder job.

### Stop / escalation conditions

Stop and raise it if: the reminder job cannot suppress per-invoice without changing the
schedule for other invoices (OD-2 vs. the non-goals); the notification service cannot
deliver within minutes (OD-5, definition of done); or the existing invoice state enum is
persisted in a way that makes adding a member a breaking change for the mobile client
(§13).
```

### §5 Implementation requirements (extract)

```markdown
- **R-1.** Add invoice state `payment_claimed`. Legal transitions: `overdue → payment_claimed`
  only. From `payment_claimed`: → `paid` (freelancer confirms), → `overdue` (freelancer
  rejects, or expiry).
- **R-2.** `POST /claims/{signed_token}` transitions `overdue → payment_claimed`, records
  `claimed_at`, and enqueues a freelancer notification. (OD-1, OD-5)
- **R-3.** The endpoint is idempotent per invoice: a claim on an invoice whose
  `claim_count >= 1` changes no state and returns the contact page. `claim_count` increments
  only on a successful first claim. (OD-3)
- **R-4.** The daily reminder sweep skips invoices in `payment_claimed`. (OD-2)
- **R-5.** The daily sweep transitions any `payment_claimed` invoice with
  `claimed_at <= now - 7d` back to `overdue` before reminder selection runs, so an expiring
  invoice is eligible for a reminder in the same sweep. (OD-2)
- **R-6.** `POST /invoices/{id}/claims/{claim_id}/reject` transitions `payment_claimed →
  overdue`. Requires freelancer authentication. (OD-1)
- **R-9.** Reminder email templates gain a claim link built from the signed token. The link
  is regenerated per email; tokens do not expire independently of the invoice.
```

### §15 Edge cases (extract)

```markdown
| Case | Expected behavior |
|---|---|
| Freelancer marks invoice paid while a claim is open | Invoice → `paid`. Open claim is resolved as confirmed. No error. |
| Client claims on an invoice already `paid` | No state change. Page reads "this invoice is already marked paid." |
| Two claim requests arrive simultaneously for one invoice | Exactly one succeeds. The other renders the contact page. `claim_count` ends at 1. |
| Claim expires on the same sweep that would send a reminder | Invoice returns to `overdue` first, then the reminder is sent per R-5. |
| Invoice deleted while a claim is open | Claim link renders a generic "invoice not available" page; no state change, no error surfaced to the client. |
| Signed token tampered with | 404 contact page. No indication of whether the invoice exists. |
| Client claims within an hour of the invoice going overdue | Allowed. No minimum age. |
```

### §17 Acceptance criteria (extract)

```markdown
- [ ] **AC-1.** A claim on an overdue invoice suppresses every reminder for 7 days.
- [ ] **AC-2.** The freelancer receives a notification within 5 minutes of a claim.
- [ ] **AC-3.** An unanswered claim resumes reminders on day 7, and the day-7 reminder is
      sent by the same sweep that expires it.
- [ ] **AC-4.** A second claim on the same invoice changes nothing and shows the contact page.
- [ ] **AC-5.** No code path transitions an invoice to `paid` without freelancer action.
- [ ] **AC-7.** Invoice list, filters, and CSV export render `payment_claimed` as
      "Payment claimed".
```

---

## 7. PR Handoff

Posted as the body of PR #341. Abridged here; the real one carries the same sections in
full.

```markdown
# Implementation Handoff

**Workstream:** WS-011 · **Build Card:** docs/cards/2026-02-payment-claims.md ·
**Build Spec:** docs/specs/2026-02-payment-claims.md · **Build OS v0.5**

## Goal
> After this change, the system should stop sending reminders for up to seven days when a
> client says they have paid, and tell the freelancer so they can confirm or keep chasing.

## Implemented
Reminder emails now carry an "I've already paid this" link. Clicking it moves the invoice
to `payment_claimed`, suppresses reminders, and notifies the freelancer immediately. The
freelancer confirms (invoice → `paid`) or rejects (→ `overdue`). Unanswered claims expire
after 7 days and reminders resume in the same daily sweep that expires them. Each invoice
accepts one claim; later visits render the contact page without changing state.

## Architecture / Flow
    reminder email → GET/POST /claims/{token}
       → verify signature, load invoice
       → invoice.state == overdue AND claim_count == 0 ?
            yes → transaction: state → payment_claimed, claim_count += 1,
                  claimed_at = now, insert payment_claims row
                → enqueue FreelancerClaimNotification
            no  → render contact page, no writes

    daily sweep (03:00 UTC)
       → expire_stale_claims()   # payment_claimed AND claimed_at <= now-7d → overdue
       → select_reminders()      # skips payment_claimed
       → send

Expiry runs before selection so a claim expiring today gets its reminder today (R-5).

## Major Areas Changed
- `invoices/state.py` — new `PAYMENT_CLAIMED` member; transition table updated
- `invoices/claims.py` — new: claim creation, confirm, reject, expiry sweep
- `jobs/reminders.py` — expiry pass added ahead of selection; `payment_claimed` excluded
- `email/templates/reminder_*.html` — claim link in all five reminder templates
- `web/claims_view.py` — public claim page and contact page
- ~15 call sites updated for the new enum member (lists, filters, CSV export, mobile serializer)

## Design Decisions
- **Separate `payment_claims` table rather than columns on `invoices`.** Claims carry their
  own lifecycle and we want the history after resolution. `invoices.claim_count` is
  denormalized so R-3's guard is a single-row read on the hot path.
- **Row-level lock on the invoice in the claim transaction.** Simplest correct answer to
  the simultaneous-claims edge case.
- **Expiry as part of the existing sweep rather than a new scheduled job.** R-5 requires
  ordering between expiry and selection; one job makes that ordering explicit rather than
  a scheduling coincidence.
- **Tokens signed with the existing `signing` module, keyed on invoice id + freelancer
  secret.** No new crypto, no token table.

## Spec Deviations
None

## Tests / Validation
- `pytest tests/invoices tests/jobs tests/web` — 212 passed, 0 failed
- `pytest` (full suite) — 1,847 passed, 0 failed
- `ruff check .` · `mypy harbour/` — clean
- New: 34 tests covering the transition table, claim idempotency, the expiry-before-selection
  ordering, all seven spec edge cases, and template rendering
- Manual: claim flow end to end against a local invoice, including tampered token

## Known Risks / Limitations
- `expire_stale_claims()` scans all `payment_claimed` invoices each sweep. Fine at current
  volume (low thousands); wants an index on `(state, claimed_at)` around 100k.
- The 7-day boundary is evaluated once daily at 03:00 UTC, so the effective window is 7 to
  8 days depending on claim time of day.
- Claim tokens do not expire independently of the invoice. Given one-claim-per-invoice
  (OD-3), an old leaked reminder email can at most render the contact page.

## Recommended Review Focus
- `invoices/claims.py::create_claim` — the locking and the R-3 guard
- Ordering in `jobs/reminders.py::run` — AC-3 depends on it
- The freelancer-confirms-while-claim-open path in `invoices/state.py`

## Framework
Framework:
- Project adopted: v0.3
- Canonical checked: v0.3
- Compatibility: current

## Review Gate
Review gate: Pending independent review

## Workstream
WS-011 — Client payment claims. BUILDING → REVIEW. Completes the workstream if review passes.

## Follow-up Work
- Index on `(state, claimed_at)` before volume grows (deferred: not needed yet)
- Freelancer-facing claim history UI (deferred: not in the Build Card)

## Owner Result
Awaiting independent review. Nothing needed from you yet.
```

**No `SHIP` here, and no marker.** The code is written and the tests are green, which feels
like finished — but nothing has been verified by anyone other than the agent that wrote it, and
`SHIP` may not be written without an independent verdict. A result appears when review clears,
in section 10. Until then the owner has nothing to do, and the honest way to say that is to say
it.

Claude's entire chat response:

```text
PR #341 opened, awaiting review. 1,847 tests passed. Handoff is in GitHub.
```

---

## 8. PROJECT_MODEL update

Committed in the same PR. Only the changed sections are shown.

```diff
 ## Major state machines / workflows

 ### Invoice lifecycle

-    draft ──send──► sent ──due date──► overdue ──freelancer marks paid──► paid
+    draft ──send──► sent ──due date──► overdue ──freelancer marks paid──► paid
+                                          │  ▲                              ▲
+                          client claims   │  │  reject / 7-day expiry       │
+                                          ▼  │                              │
+                                    payment_claimed ──freelancer confirms───┘

+`payment_claimed` is a reminder-suppression state, not a payment state. It records that
+the client asserts payment; it makes no claim about money having moved. Harbour has no
+bank visibility, so `paid` is only ever set by a freelancer action (DEC-007).

 ## Important invariants

 - An invoice has exactly one active reminder schedule.
+- Only a freelancer action transitions an invoice to `paid`. No client-triggered path
+  reaches `paid` (DEC-007).
+- An invoice accepts at most one payment claim in its lifetime.
+- Reminder suppression is always bounded: no state suppresses reminders indefinitely.

 ## System boundaries

-Harbour is authoritative for invoice state. It has no payment-processor or bank
-integration and cannot observe payments directly.
+Harbour is authoritative for invoice state. It has no payment-processor or bank
+integration and cannot observe payments directly. Client-supplied signals — currently only
+payment claims — are treated as unverified input: they may suppress outbound behavior for
+a bounded period, but never determine financial state.
```

That last edit is the valuable one. It is not a description of the feature; it is a rule
the next feature will need, extracted from this one.

---

## 9. DECISIONS entry

```markdown
### DEC-007 — Client payment claims suppress reminders but never set invoice state to paid

**Date:** 2026-02-04
**Status:** Accepted

**Context**
Harbour has no bank or payment-processor integration and cannot observe that a payment
occurred. Bank transfers clear in two to five days, during which the reminder job keeps
emailing clients who have already paid. We wanted to let clients signal payment from the
reminder email itself. That signal is unverifiable by construction.

**Decision**
A client payment claim suppresses reminders for that invoice for at most 7 days and
notifies the freelancer. It never transitions the invoice to `paid`. Only a freelancer
action does. Each invoice accepts one claim in its lifetime.

**Rationale**
Harbour's core promise is that a freelancer knows what they are owed. If a debtor can set
`paid`, every revenue figure in the product becomes a claim rather than a fact, and the
damage is invisible until reconciliation. Bounding suppression at 7 days keeps the worst
case — a freelancer who never responds — at one delayed reminder rather than a client who
is never chased again. One claim per invoice removes the link's value as a stalling tool.

**Alternatives considered**
- **Claim marks the invoice paid.** Fewest steps, and matches what clients expect the
  button to mean. Rejected: it makes `paid` unreliable, which is the one thing the product
  cannot afford.
- **Indefinite suppression until the freelancer responds.** Rejected: freelancer silence is
  common, and it converts a bounded delay into a permanently unchased invoice.
- **A plain 7-day snooze with no claim and no notification.** Simpler and needs no new
  state. Rejected: it discards the most useful part of the interaction, which is telling
  the freelancer that the client believes they paid.

**Consequences**
- Establishes a general rule: client-supplied signals may suppress outbound behavior for a
  bounded period but never determine financial state. Recorded in `PROJECT_MODEL.md` under
  system boundaries; future client-facing signals should follow it.
- Freelancers gain a recurring small obligation — confirm or reject each claim.
- `payment_claimed` must be handled by every invoice list, filter, export, and client
  integration.
- If Harbour ever adds bank integration, this decision should be revisited: verified
  payment could legitimately set `paid`, which would supersede this entry rather than
  amend it.
```

---

## 10. Review

Performed by a reviewer who did not write the code, working from the Build Card down to the
tests.

### What the reviewer did

Read the Build Card first and wrote down the five owner decisions before opening the diff.
Traced each `OD-n` to code. Ran the test suite. Then read the parts of the diff that were
not the feature — the ~15 mechanical call-site updates — because that is where changes
nobody planned tend to live.

Two findings came out of the code that the handoff did not contain.

### Owner-facing review summary

```markdown
# Review Summary — Client payment claims

**PR:** #341 · **Build Card:** docs/cards/2026-02-payment-claims.md ·
**Reviewer:** R. Okonjo · **Date:** 2026-02-09

## Verdict
**Verdict:** Changes required
**Reviewed head:** 5c1f0be9a4d7233810cbb6e2f0a91d4477e35b0c
**Head current at publication:** yes

One item to fix before this can be approved; everything else matches.

## What actually changed
Clients can now say "I've already paid this" from a reminder email. That stops reminders
for that invoice, and you get told immediately so you can confirm the payment or say you're
still waiting. If you don't answer, reminders start again about a week later. An invoice
can only be claimed once. Nothing except your own action ever marks an invoice paid.

## Match to intended design
Matches the Build Card on all five decisions. Payment claims never set an invoice to paid,
suppression is bounded, repeat claims do nothing, the link needs no login, and you're
notified as soon as a claim is made. I verified each of these against the code rather than
the description, including trying to find any path from a client action to "paid" —
there isn't one.

Two gaps between the code and what was reported:

- **The CSV export shows a blank status for claimed invoices.** The web list and filters
  handle the new state correctly, but the export was missed. The Build Card asked for all
  three. This is the one item to fix before merge.
- **The "seven day" window is really seven to eight days.** The handoff does mention this
  under risks, which is good, but it's a difference from what you approved rather than a
  risk, and it wasn't listed as one. In practice it means a client can get up to one extra
  day of quiet. I don't think it's worth changing — making it exact would mean running the
  check hourly for very little gain.

## Issues found
| Severity | Issue | Consequence |
|---|---|---|
| Should fix | CSV export renders claimed invoices with an empty status | Anyone reconciling from an export sees a blank where "Payment claimed" belongs, and may read it as unpaid-and-unchased |
| Consider | The 7-day window resolves once daily, giving a 7–8 day range | One extra quiet day in the worst case; reported as a risk rather than as a difference from the approved behavior |
| Note | The two-claims-at-once case, the claim-expires-on-a-reminder-day case, and freelancer-confirms-while-a-claim-is-open are all handled correctly and covered by tests | These were the three places this feature was most likely to be subtly wrong |

## Architecture implications
Good outcome here. The team wrote down a rule that outlives this feature: signals from
clients can quiet the system for a while, but never decide financial facts. That's recorded
in the project model and in decision DEC-007, and it will save an argument the next time we
build something client-facing.

One thing to watch: the expiry check scans every claimed invoice daily. Fine now, needs an
index well before we're at scale. It's on the follow-up list.

## Decisions requiring owner attention
None. The 7–8 day window is worth knowing about but I don't recommend changing it — see
above.

## Recommended next action
Fix the CSV export on this PR and send it back for re-review. File the database index as a
follow-up. Nothing here needs your decision.
```

### The review loop

`Changes required` returned WS-011 from `REVIEW` to `BUILDING`. The correction stayed on the
same PR — no second PR, no new branch:

```diff
-**Phase:** REVIEW · **Status:** Active
+**Phase:** BUILDING · **Status:** Active

 ## Review State
-**Verdict:** In review
-**Reviewed head:** —
+**Verdict:** Changes required
+**Reviewed head:** 5c1f0be9a4d7233810cbb6e2f0a91d4477e35b0c
+
+CSV export renders claimed invoices with an empty status (should fix). Fixing on this PR.
```

The export fix pushed a new head, `a09d4c17…`, and the workstream went back to `REVIEW` with
verdict `In review`. The reviewer read the new commit — not the whole PR again, but not
nothing either: the fix, and whether it broke anything around it — and approved:

```markdown
**Verdict:** Approved with follow-ups
**Reviewed head:** a09d4c1732b8e5460f92cc1de8b7a03f9145d6ee
**Head current at publication:** yes
```

Note that the approval names `a09d4c17…`, not `5c1f0be9…`. The earlier verdict was against a
commit that no longer existed at the tip; it did not carry forward, and nothing about the
second review was ceremonial.

### Merge finalization

Then the last commit on PR #341, before the merge button, containing no code at all:

```diff
-**Phase:** REVIEW · **Status:** Active
-**Updated:** 2026-02-07
+**Phase:** COMPLETE · **Status:** Complete
+**Updated:** 2026-02-10

 ## Implementation State
-PR #341 open, awaiting review.
+Merged in #341.

 ## Review State
-**Verdict:** In review
-**Reviewed head:** —
+**Verdict:** Approved with follow-ups
+**Reviewed head:** a09d4c1732b8e5460f92cc1de8b7a03f9145d6ee
+**Finalization:** pushed
+
+Reviewed 2026-02-09. One should-fix (CSV export status) corrected on this PR before merge.
+One difference from approved behavior noted and accepted: the 7-day window resolves once
+daily, giving an effective 7–8 days. Follow-up: index on `(state, claimed_at)`.

 ## Related Decisions
-None yet.
+DEC-007

 ## Next Step
-Await review.
+None.
```

The same commit removed the WS-011 row from `ACTIVE.md` and carried the `PROJECT_MODEL.md`
and `DECISIONS.md` updates from sections 8 and 9.

Look at what `Reviewed head` says there: still `a09d4c17…`, the last commit reviewed in full —
**not** the finalization commit. It could not be. Writing the finalization commit's own SHA
into the finalization commit changes that commit, and the SHA is wrong before it is pushed. So
the file names the head that already exists and adds `Finalization: pushed` to say the PR is
legitimately ahead of it.

The head that commit produced, `f4b7c2e0…`, was recorded where a record can be made after the
fact: the reviewer read the diff since `a09d4c17…`, confirmed it touched only the workstream
file, `ACTIVE.md`, `PROJECT_MODEL.md`, and `DECISIONS.md`, and approved on PR #341. GitHub
stamped that review with `f4b7c2e0…`. Then the merge targeted that exact SHA.

Two heads, two places, two parties — and neither is a commit vouching for itself.

So `main` never contained a version of WS-011 claiming to be in review of a PR that had
already merged. There was no cleanup PR, because there was nothing left to clean up.

`ACTIVE.md` lost its WS-011 row. `PROJECT_MODEL.md` and `DECISIONS.md` were updated in the
same PR — sections 8 and 9 above. The workstream file stayed where it was, as the record of
how the design was arrived at.

Note what did *not* happen: the workstream's mental model was not copied into
`PROJECT_MODEL.md`. The model file got the rule that outlives the feature — client signals
never determine financial state — while the workstream kept its design-time picture. Three
files, three jobs.

### The owner result

Only now — approved at a named head, finalization pushed and verified, nothing outstanding —
does the owner hear about it again:

```markdown
Build OS owner result: SHIP

**What changed:** Clients can tell you they've paid, straight from a reminder email. That
pauses reminders for that invoice and notifies you immediately, so you can confirm it or keep
chasing. No answer for a week and reminders resume. One claim per invoice.
**Intent:** All six done-conditions from the card are met.
**Verification:** 1,865 tests green. Independently reviewed; one should-fix (a blank status in
the CSV export) found and corrected on this PR, then re-reviewed and approved with follow-ups.
Bookkeeping commit pushed and its head verified by the reviewer.
**Deviations:** The 7-day pause is checked once daily, so it runs 7–8 days in practice. I
reported this as a risk when it was a difference from what you approved; the reviewer caught
that. Accepted as-is.
**Residual risk:** The daily expiry check scans every claimed invoice. Fine now; needs an index
well before volume grows, and that is filed.
**Next action:** Merge PR #341 at f4b7c2e0…
```

138 words. The owner reads that and merges, and every claim in it is one some artifact above
already carries.

Three things about it are worth pointing at.

**It was not written until the last agent-and-reviewer step was done.** Section 7 said
"awaiting independent review" and left the owner alone. So did the correction round. So did the
gap after `Approved with follow-ups`, while the finalization commit was still owed — and so did
the gap after that commit was pushed, while the reviewer had yet to verify `f4b7c2e0…`. Four
moments where the work *felt* finished, and the owner heard nothing at any of them, because at
each one somebody other than the owner still had something to do.

**It discloses the deviation the handoff missed** — and says the reviewer is why. Compression
took this from four sections of review summary to two sentences; it did not take out the part
the owner would have wanted. That is the whole compression contract in one field: brevity is a
constraint on the writing, never a licence about the content.

**`Next action` is the merge, and it names the verified head.** Not "merge PR #341" — the
finalization commit moved the head past the fully-reviewed one, and only the reviewer's
approval on the PR establishes which SHA is safe to merge. And not "reviewer verifies the final
head, then merge", because a result that hands work back to an agent is not a result at all.
That is the whole point of the state: when the owner sees `SHIP`, the next thing that happens
is their merge.

In chat, in full:

```text
SHIP — PR #341. Payment claims work as approved, reviewer verified the final head. Ready to
merge. Result is in the PR.
```

### What this demonstrates

The handoff said `Spec Deviations: None`. It was wrong twice — a missed acceptance criterion
(AC-7, the export) and an approved behavior reported as a risk instead of a deviation.
Neither was dishonest; both are exactly what an implementation agent misses about its own
work, and both were found by reading code and tests rather than the handoff.

That is the entire argument for item 8 of the review protocol.

It also shows the shape end to end: the owner's raw input captured before anything was
done with it; one PR from spec to merge; a verdict tied to a specific commit, invalidated
when that commit was superseded; and the durable record made true on the PR rather than
promised for later — with the final head recorded by the reviewer on the PR, because the
commit that produces it cannot name it.

And it shows what the owner actually did across three weeks of this: answered four questions on
a Thursday, approved a 170-word plan from a train, and merged on the strength of a 138-word
result. They never read the Build Spec, the handoff, or the review summary. All three exist,
all three are durable, and all three were read — by the people they were written for.
