# 🔄 Event Edit Cascade — Detailed Explanation

> This document explains the problem we solved, why it existed, and exactly how the fix works — line by line.

---

## 📌 The Core Concept: Denormalization

In your app, you use **Firestore** (a NoSQL database). Unlike SQL databases, Firestore doesn't have "JOINs" — you can't say _"give me enrollment data AND fetch the event title from the events table"_ in a single query.

So the app uses a pattern called **denormalization** — which means **copying** some data from one collection into another to avoid extra reads.

### Example: When a user enrolls in an event

```
Event Document (events/abc123)          Enrollment Document (enrollments/xyz789)
┌────────────────────────────┐          ┌─────────────────────────────────┐
│ id: "abc123"               │          │ id: "xyz789"                    │
│ title: "Tech Summit 2026"  │  COPIED  │ eventId: "abc123"               │
│ date: April 15, 2026       │ ───────► │ eventTitle: "Tech Summit 2026"  │ ← Copy of title
│ location: "Mumbai"         │          │ eventDate: April 15, 2026       │ ← Copy of date
│ ...                        │          │ uid: "user001"                  │
└────────────────────────────┘          │ displayName: "Heet"             │
                                        └─────────────────────────────────┘
```

**Why copy?** Because when the app shows "My Events" screen, it reads from `enrollments` collection only. Without the copy, we'd need to make **2 reads** per enrollment (one for enrollment + one for event title). With the copy, we need **1 read** — saving both time and Firestore billing.

---

## ❌ The Problem: Stale Data

The downside of copying data is: **when the original changes, the copies become stale (outdated)**.

### What was happening:

```
1. Admin creates event: "Tech Summit 2026"
2. User A enrolls → enrollment doc stores eventTitle: "Tech Summit 2026" ✅
3. User B sends a chat request → chatRequest doc stores eventTitle: "Tech Summit 2026" ✅

4. ⚠️ Admin EDITS event title to "Innovation Summit 2026"
5. events collection → title: "Innovation Summit 2026" ✅ (updated)
6. enrollments collection → eventTitle: "Tech Summit 2026" ❌ (STALE! Old name!)
7. chatRequests collection → eventTitle: "Tech Summit 2026" ❌ (STALE! Old name!)
```

### Which screens showed wrong data:

| Screen | What was wrong |
|---|---|
| **My Events** (user side) | Showed the OLD event title & OLD date |
| **Members** (admin side) | Event filter chips & badges showed OLD title |
| **Chat Requests** | "Re: Tech Summit 2026" instead of "Re: Innovation Summit 2026" |
| **Participants** | Header title could show OLD name |

---

## ✅ The Fix: Cascade Updates

We modified **one file** — [eventService.ts](file:///Users/apple/Desktop/Heet/ISOP_RN/src/services/eventService.ts)

The idea is simple: **when the admin saves edits, update the event document AND all related documents that have copies of the changed data.**

### Collections that store event data (and what fields):

```
events (SOURCE OF TRUTH)
  ├── title ──────────► enrollments.eventTitle
  │                     chatRequests.eventTitle
  │
  ├── date ───────────► enrollments.eventDate
  │
  ├── description ────► (not copied anywhere — no cascade needed)
  ├── location ───────► (not copied anywhere — no cascade needed)
  ├── images ─────────► (not copied anywhere — no cascade needed)
  └── type ───────────► (not copied anywhere — no cascade needed)
```

> Only `title` and `date` are denormalized. So we only cascade those two fields.

---

## 🔍 Code Walkthrough

### Part 1: The `commitInChunks()` Helper

```typescript
const commitInChunks = async (
  docs: FirebaseFirestoreTypes.QueryDocumentSnapshot[],
  updater: (batch, doc) => void,
) => {
  const CHUNK_SIZE = 499;
  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    const batch = firebaseFirestore.batch();
    chunk.forEach(doc => updater(batch, doc));
    await batch.commit();
  }
};
```

**What it does:** Firestore has a limit — you can only do **500 operations** in a single batch. If an event has 1000 enrollments, we need to split into 2 batches. This helper does that automatically.

**Why 499 and not 500?** Safety margin. Some internal Firestore operations can count as extra, so we stay 1 under.

---

### Part 2: Updated `updateEvent()` Function

Here's the complete flow, step by step:

```
┌──────────────────────────────────────────────────────────┐
│                    updateEvent(id, updates)               │
│                                                          │
│  Step 1: Upload images to Cloudinary (if any new ones)   │
│           (This existed before — no change)               │
│                                                          │
│  Step 2: Update events/{id} document                     │
│           (This existed before — no change)               │
│                                                          │
│  Step 3: ⭐ NEW — Check if title or date changed         │
│           │                                              │
│           ├── title changed?                             │
│           │   ├── YES → Update ALL enrollments.eventTitle │
│           │   │         Update ALL chatRequests.eventTitle│
│           │   └── NO  → Skip                             │
│           │                                              │
│           └── date changed?                              │
│               ├── YES → Update ALL enrollments.eventDate  │
│               └── NO  → Skip                             │
│                                                          │
│  Return { success: true }                                │
└──────────────────────────────────────────────────────────┘
```

#### The cascade code explained:

```typescript
// Check which fields need syncing
const needsTitleSync = finalUpdates.title !== undefined;
const needsDateSync = finalUpdates.date !== undefined;
```
☝️ If admin only changed the description or images, both are `false` → no cascade happens (saves unnecessary Firestore reads).

```typescript
// Step 3a: Update all enrollments for this event
const enrollSnap = await firebaseFirestore
  .collection(COLLECTIONS.ENROLLMENTS)
  .where('eventId', '==', id)    // Find all enrollments for THIS event
  .get();
```
☝️ Query all enrollment documents that belong to this event.

```typescript
await commitInChunks(enrollSnap.docs, (batch, doc) => {
  const enrollUpdate = {};
  if (needsTitleSync) enrollUpdate.eventTitle = finalUpdates.title;
  if (needsDateSync)  enrollUpdate.eventDate = finalUpdates.date;
  batch.update(doc.ref, enrollUpdate);
});
```
☝️ For each enrollment, update only the fields that actually changed. Uses the chunking helper in case there are >499 enrollments.

```typescript
// Step 3b: Update all chatRequests for this event (title only)
const chatReqSnap = await firebaseFirestore
  .collection(COLLECTIONS.CHAT_REQUESTS)
  .where('eventId', '==', id)
  .get();

await commitInChunks(chatReqSnap.docs, (batch, doc) => {
  batch.update(doc.ref, { eventTitle: finalUpdates.title });
});
```
☝️ Same pattern, but chatRequests only store `eventTitle` (no date), so only title is synced.

#### Error Handling:

```typescript
} catch (cascadeErr) {
  console.warn('Enrollment cascade warning:', cascadeErr);
}
```
☝️ Cascade failures are **warnings, not errors**. If the cascade fails, the event itself was already updated successfully. We don't want to show "Save Failed" to admin when the main save actually worked — the cascade can be retried by editing again.

---

### Part 3: Updated `deleteEvent()` Function

**Before:** Delete event + delete enrollments.
**After:** Delete event + delete enrollments + **delete chatRequests**.

```
┌──────────────────────────────────────────────────────┐
│                deleteEvent(id)                        │
│                                                      │
│  Step 1: Delete events/{id} document                 │
│                                                      │
│  Step 2: Delete ALL enrollments WHERE eventId == id   │
│           (This existed before — now uses chunks)     │
│                                                      │
│  Step 3: ⭐ NEW — Delete ALL chatRequests             │
│           WHERE eventId == id                         │
│           (Prevents orphaned chat requests that       │
│            reference a deleted event)                 │
└──────────────────────────────────────────────────────┘
```

Without Step 3, if admin deletes an event, users would still see chat requests like _"Re: Tech Summit 2026"_ — for an event that no longer exists.

---

## 📊 Visual: Before vs After

### Before (❌ Broken):
```
Admin edits "Tech Summit" → "Innovation Summit"

events/abc123:              enrollments/xyz789:           chatRequests/req001:
┌──────────────────────┐    ┌──────────────────────┐     ┌──────────────────────┐
│ title: "Innovation   │    │ eventTitle: "Tech    │     │ eventTitle: "Tech    │
│         Summit"  ✅  │    │            Summit" ❌│     │            Summit" ❌│
└──────────────────────┘    └──────────────────────┘     └──────────────────────┘
       UPDATED                    NOT UPDATED                  NOT UPDATED
```

### After (✅ Fixed):
```
Admin edits "Tech Summit" → "Innovation Summit"

events/abc123:              enrollments/xyz789:           chatRequests/req001:
┌──────────────────────┐    ┌──────────────────────┐     ┌──────────────────────┐
│ title: "Innovation   │    │ eventTitle:           │     │ eventTitle:           │
│         Summit"  ✅  │    │  "Innovation Summit"✅│     │  "Innovation Summit"✅│
└──────────────────────┘    └──────────────────────┘     └──────────────────────┘
       UPDATED               CASCADED ✅                   CASCADED ✅
```

---

## ⚡ Performance Impact

| Scenario | Extra Firestore Operations |
|---|---|
| Admin edits only images/description/location | **0** (no cascade triggered) |
| Admin edits title (event has 10 enrollments, 5 chat requests) | **+2 reads + 15 writes** |
| Admin edits title AND date | **+2 reads + 15 writes** (same — combined into one batch) |
| Admin edits nothing denormalized | **0** |

The cascade is **smart** — it only runs when `title` or `date` actually changed, not on every save.

---

## 🗂️ Files Modified

| File | What Changed |
|---|---|
| [eventService.ts](file:///Users/apple/Desktop/Heet/ISOP_RN/src/services/eventService.ts) | Added `FirebaseFirestoreTypes` import, `commitInChunks()` helper, cascade logic in `updateEvent()`, chatRequests cleanup in `deleteEvent()` |

**No other files were modified.** The fix is entirely in the service layer. All screens that read from `enrollments` and `chatRequests` use real-time listeners (`onSnapshot`), so they automatically pick up the updated data without any code changes.
