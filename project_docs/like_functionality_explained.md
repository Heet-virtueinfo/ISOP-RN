# 👍 Like Functionality — How It Works (ISOP-RN)

A complete, step-by-step breakdown of how the Like feature works across the entire stack.

---

## Overview

The Like system has **3 layers** working together:

```
User Tap  →  Local UI Update (Optimistic)  →  API Call  →  Pusher Real-Time Sync
```

This gives a **fast, responsive feel** (like LinkedIn/Twitter) while keeping all devices in sync.

---

## Layer 1 — The UI (`FeedsScreen.tsx` → `PostCard`)

### Where the button lives

The Like button is inside the `PostCard` component, rendered for each post in the `FlatList`.

```tsx
// FeedsScreen.tsx → PostCard component
<TouchableOpacity
  style={[styles.actionBtn, post.liked && styles.actionBtnActive]}
  onPress={handleLike}
  disabled={liking}
>
  <ThumbsUp
    size={16}
    color={post.liked ? colors.brand.primary : colors.text.tertiary}
    fill={post.liked ? colors.brand.primary : 'transparent'}
  />
  <Text style={[styles.actionLabel, post.liked && styles.actionLabelActive]}>
    Like
  </Text>
</TouchableOpacity>
```

> [!NOTE]
> Notice how `post.liked` and `post.likeCount` come **directly from props** (the parent `posts` state).
> There is NO local state inside `PostCard` for likes. This was intentional to prevent double-counting.

---

## Layer 2 — The Logic (`handleLike` function)

When the user taps the button, this function runs:

```tsx
const handleLike = async () => {
  if (liking) return; // ← prevents double-tapping

  // STEP 1: Optimistic Update
  // Update the parent state IMMEDIATELY so UI feels instant
  const newLiked = !post.liked;
  onLikeToggle(post.id, newLiked);   // no count passed → uses +1/-1 logic

  setLiking(true);
  try {
    // STEP 2: Call the API
    const result = await togglePostLike(post.id);

    // STEP 3: Sync with Server's EXACT value
    // Pass result.likeCount explicitly → overrides the optimistic count
    onLikeToggle(post.id, result.liked, result.likeCount);

  } catch (err) {
    // STEP 4: Rollback on failure
    onLikeToggle(post.id, !newLiked); // ← undo the optimistic update
    console.error('[PostCard] Like error:', err);

  } finally {
    setLiking(false); // ← re-enables the button
  }
};
```

### Why 3 Steps?

| Step | What Happens | Why |
|------|-------------|-----|
| **Step 1** | UI updates to `liked=true`, count `+1` immediately | Feels fast, no waiting for network |
| **Step 2** | API call goes to `POST /api/posts/:id/like` | Server records the like |
| **Step 3** | UI syncs to server's exact count | Corrects any discrepancy from Step 1 |
| **Step 4** | If API fails, reverses Step 1 | Keeps UI honest |

---

## Layer 3 — The Parent State (`handleLikeToggle` in `FeedsScreen`)

The `PostCard` doesn't manage state itself. It calls `onLikeToggle`, which updates the **master `posts` array** in `FeedsScreen`:

```tsx
const handleLikeToggle = useCallback(
  (postId: string, liked: boolean, count?: number) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              liked,
              likeCount:
                count !== undefined   // ← Was a count provided?
                  ? count             // YES → use exact server value
                  : liked
                  ? p.likeCount + 1   // NO → optimistic increment
                  : p.likeCount - 1,  // NO → optimistic decrement
            }
          : p,
      ),
    );
  },
  [],
);
```

### The `count` Parameter is the Key

```
onLikeToggle(post.id, newLiked)              → count = undefined → uses +1/-1
onLikeToggle(post.id, result.liked, result.likeCount) → count = 1 → sets exact value
```

This prevents the **double-count bug** where calling `+1` twice would show `2` instead of `1`.

---

## Layer 4 — The API (`feedService.ts`)

```tsx
// feedService.ts
export const togglePostLike = async (
  postId: string,
): Promise<{ liked: boolean; likeCount: number }> => {
  try {
    const response = await apiClient.post(`/api/posts/${postId}/like`);
    const data = response.data;
    return {
      liked: data.liked ?? data.is_liked ?? false,
      likeCount: data.likes_count ?? data.like_count ?? 0,
    };
  } catch (error) {
    console.error(`[feedService] togglePostLike(${postId}) failed:`, error);
    throw error;
  }
};
```

The API response from the backend (Laravel) looks like:
```json
{
  "liked": true,
  "likes_count": 1
}
```

The service normalizes it and returns `{ liked, likeCount }` for TypeScript safety.

---

## Layer 5 — Real-Time Sync (`echoService.ts` + Pusher)

When **any user** on **any device** likes a post, the **backend broadcasts** a `PostUpdated` event to all connected devices via Pusher.

```
Device A likes → API → Backend broadcasts "PostUpdated" → Device B receives it instantly
```

This is handled in `FeedsScreen.tsx`:

```tsx
useEffect(() => {
  let isActive = true;
  const channelName = 'social-feed';
  const eventName = 'PostUpdated';

  const setupPusher = async () => {
    const pusher = getEcho(); // ← reuses existing echoService connection
    if (!pusher) return;

    await pusher.subscribe({
      channelName,
      onEvent: (event: any) => {
        if (!isActive) return;
        if (event.eventName === eventName) {
          const data = JSON.parse(event.data);

          // Update only the affected post in the list
          setPosts(currentPosts =>
            currentPosts.map(p => {
              if (p.id === String(data.post_id)) {
                return {
                  ...p,
                  likeCount: data.likes_count ?? p.likeCount,
                  commentCount: data.comments_count ?? p.commentCount,
                };
              }
              return p;
            }),
          );
        }
      },
    });
  };

  setupPusher();

  return () => {
    isActive = false;
    const pusher = getEcho();
    if (pusher) pusher.unsubscribe({ channelName });
  };
}, []);
```

> [!IMPORTANT]
> The Pusher event always **sets the exact value** from the server (`data.likes_count`).
> It never does `+1/-1`. This ensures all devices always show the correct number.

---

## Complete Flow Diagram

```
User Taps Like
      │
      ▼
handleLike() runs
      │
      ├──► Step 1: onLikeToggle(id, true)
      │         └──► setPosts → post.liked = true, likeCount = +1  [Instant UI ✅]
      │
      ├──► Step 2: togglePostLike(id) → POST /api/posts/5/like
      │         └──► Server saves like, returns { liked: true, likeCount: 1 }
      │
      ├──► Step 3: onLikeToggle(id, true, 1)
      │         └──► setPosts → post.likeCount = 1 (server's exact value)  [Corrected ✅]
      │
      └──► Backend broadcasts "PostUpdated" via Pusher
                └──► ALL other devices receive event
                          └──► setPosts → post.likeCount = 1 (exact value)  [Synced ✅]
```

---

## Why Not Use Local State in `PostCard`?

We originally had this (and it caused bugs):

```tsx
// ❌ OLD - Caused double-count bug
const [liked, setLiked] = useState(post.liked);
const [likeCount, setLikeCount] = useState(post.likeCount);

// Problem:
// 1. User clicks → setLikeCount(1) [Local]
// 2. API returns → setLikeCount(1) [Local again]
// 3. Pusher arrives → parent updates → useEffect fires → setLikeCount(1) again
// Result: Race condition, sometimes shows wrong count
```

The fix was to **remove local state** and use the parent `posts` array as the single source of truth:

```tsx
// ✅ NEW - Single source of truth
// PostCard reads directly from props:
{post.likeCount}  // always accurate
{post.liked}      // always accurate
```

---

## Summary

| Component | Responsibility |
|-----------|---------------|
| `PostCard` | Shows the Like button and current count from props |
| `handleLike` | Optimistic update → API call → Sync with server result → Rollback on error |
| `handleLikeToggle` | Updates the master `posts` array in `FeedsScreen` |
| `togglePostLike` | Makes the `POST /api/posts/:id/like` API call |
| `echoService` + Pusher | Receives real-time `PostUpdated` events and syncs all devices |
