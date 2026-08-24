# Worked Example — merged before review, and the recovery

**Build OS v0.5**

Fictional. The project is **Harbour**, the invoicing tool from
`FEATURE_LIFECYCLE.example.md`; this is a later, smaller effort that went wrong in the most
ordinary way available.

The point of this example is that the recovery is *defined*. A PR that merged without
independent review is not a scandal and not a thing to quietly absorb — it is a known state
with a known sequence out of it. What makes it expensive is improvising, and improvising is
what happens when nobody wrote the sequence down.

---

## 1. What happened

**WS-014 — Reminder scheduling window** let a freelancer choose which days of the week
reminder emails may be sent. Small change, clear Build Card, spec issued, implemented on
PR #368 in an afternoon.

Then, on a Friday:

> Owner: tests are green, just get it in, I want to try it over the weekend.

The implementation agent merged its own PR. No independent review, no verdict, no reviewed
head. Everyone got what they asked for.

On Monday a reviewer picked up the workstream — it was still on `ACTIVE.md` — and read the
merged diff.

**Note what the owner's instruction did and did not authorize.** Owner direction can replace
the *merger*: the owner may say "merge it" instead of pressing the button themselves. It
cannot replace the *reviewer*. The implementation agent had no independent approved verdict,
so under v0.5 it should have said so and asked for review rather than merging. That is the
protocol failure here, and it belongs in the record.

---

## 2. What review found

Two things, from the code:

- **Blocking.** The day-of-week filter is applied when a reminder is *scheduled*, not when it
  is *sent*. A reminder scheduled on an allowed day and delayed by a retry goes out on a day
  the freelancer excluded. The Build Card said "reminders are never sent on excluded days."
- **Should fix.** Timezone comes from the account's stored offset rather than its timezone,
  so a freelancer in a DST-observing region gets a one-hour boundary error twice a year — a
  reminder on an excluded day, an hour into it.

Neither is catastrophic. Both are the built behavior differing from the approved behavior,
which is a finding regardless of severity.

---

## 3. The recovery, in order

### Step 1 — Publish the finding on the merged PR

Not in chat, not only in the workstream file: on PR #368, where anyone tracing this change
will look.

```markdown
# Retrospective Review — PR #368

**Verdict:** Changes required
**Reviewed head:** 7d2e1a90c4b53f8801ea6b2d90c7431f5ae08b62 (merged head)
**Head current at publication:** yes — this PR is merged

This PR merged without an independent approved verdict. Recording that plainly: the merge
gate was not honoured, and this review is retrospective. Nothing about the merge is being
reversed.

Two findings, corrective PR to follow as #371:

| Severity | Issue | Consequence |
|---|---|---|
| Blocking | Day-of-week filter applies at scheduling time, not send time | A retried reminder can send on a day the freelancer excluded — the one thing the Build Card said would not happen |
| Should fix | Account offset used instead of timezone | Twice a year, a one-hour window on an excluded day |

WS-014 returns to BUILDING and is not complete until #371 passes independent review.
```

### Step 2 — Open a focused corrective PR

PR #371 fixes those two findings and nothing else. It is not a second implementation and not
an opportunity to revisit the design: the Build Card has not changed, and the correction is
measured against the same card.

It links the merged PR, and the merged PR links it. A reader arriving at either one can see
the whole story.

### Step 3 — Checkpoint the workstream

```diff
-**Phase:** COMPLETE · **Status:** Complete
-**Updated:** 2026-03-06
+**Phase:** BUILDING · **Status:** Active
+**Updated:** 2026-03-09

 ## Implementation State
-Merged in #368.
+Merged in #368; corrective work on #371. The merge happened without independent review.

 ## Review State
-Not started.
+**Verdict:** Changes required
+**Reviewed head:** 7d2e1a90c4b53f8801ea6b2d90c7431f5ae08b62
+
+Retrospective review of the merged head, 2026-03-09. One blocking finding (day filter
+applied at scheduling rather than send time), one should-fix (account offset instead of
+timezone). Both corrected on #371.

 ## Related PRs
-#368
+#368 (merged), #371 (correction)

 ## Next Step
-None.
+Land #371 under independent review; WS-014 is not complete until it does.
```

The row returns to `ACTIVE.md`. A workstream that was marked complete and is not complete is
worse than one that was never marked at all, because the board is what an arriving agent
trusts.

### Step 4 — Re-review independently, under the full gate

PR #371 goes through the ordinary v0.5 path: the implementation agent does not approve it,
the reviewer records `Approved` against #371's current head, the merge-finalization commit
sets WS-014 to `COMPLETE`, and the merge targets the verified head.

### Step 5 — Do not call it complete early

The temptation, at step 3, is to leave WS-014 `COMPLETE` because the feature is on `main` and
mostly works. That is precisely the state the durable layer exists to prevent: a `COMPLETE`
workstream is a claim that `PROJECT_MODEL.md` and `DECISIONS.md` are true again, and while a
blocking finding is outstanding they are not.

---

## 4. What is *not* done

- **The merge is not reverted.** Reverting a merged change to satisfy process is a second
  outage risk in service of bookkeeping. The correction goes forward.
- **History is not rewritten.** #368 stays as it is, with the retrospective review attached.
- **The reviewer does not redesign.** The findings are measured against the approved Build
  Card, not against how the reviewer would have built it.
- **Nobody is asked to sign a retrospective approval as though the gate held.** The record
  says the gate was not honoured. A retrospective approval is worth having; blurring it into
  an ordinary one is not.

---

## 5. The variant that needs no correction

Sometimes the retrospective review is clean: the PR merged without review, and the code turns
out to be right. The recovery is shorter but not empty.

```markdown
**Verdict:** Approved
**Reviewed head:** 7d2e1a90c4b53f8801ea6b2d90c7431f5ae08b62 (merged head)

Retrospective — this PR merged before independent review. Reviewed after the fact against
the Build Card; no findings. Recording the process gap, not a defect.
```

The workstream can complete. What must not happen is the record reading as though a gate was
honoured that was not — the next person deciding whether the process holds will read exactly
this line.

---

## 6. Adopting v0.5 with PRs already open

A project upgrading to v0.5 with three significant PRs open does not merge them under the old
rules because they were opened under the old rules. They come under the gate — an
independent verdict naming each PR's current head — and the migration notes in `VERSION.md`
say so.

What does not happen: no already-merged PR is reopened, no completed workstream gains review
fields it never had, and no project architecture or decision is rewritten because the
framework version changed.

---

## What this demonstrates

The failure was cheap and the recovery was cheaper, because every step was already written
down. What makes an unreviewed merge expensive is the argument about what to do next — held
in chat, resolved differently every time, and remembered by nobody.

Compare `FEATURE_LIFECYCLE.example.md`, where the same protocol runs without incident. It is
the same sequence; this one just enters it late.
