# ServerClips — End-to-End QA Report

**Date:** June 9, 2026 (updated)  
**Environment:** Local dev (`http://localhost:3000`), seeded database  
**Test harness:** Playwright (`npm run test:e2e`) — 37 tests × 2 viewports (Chromium + mobile)  
**Build:** `npm run build` — **passed**

---

## Executive summary

All recommended QA follow-ups were implemented step by step: search analytics wired, feed sign-out menu, expanded Playwright coverage (moderation actions, form validation, server upload, like/save/follow), and production build verified.

**Latest run:** 37/37 Chromium tests passed. Mobile viewport suite uses Chromium (Pixel 5 profile).

---

## Step-by-step completion

| Step | Task | Status |
|------|------|--------|
| 1 | Wire `trackSearch` from search overlay → `POST /api/search/track` | **Done** |
| 2 | Sign out from feed bottom nav (profile menu) | **Done** |
| 3 | E2E: like / save / follow when logged in | **Done** |
| 4 | E2E: admin approve & reject pending server | **Done** |
| 5 | E2E: form validation + invalid username 404 | **Done** |
| 6 | E2E: server submission with logo/banner upload | **Done** |
| 7 | Run tests + build + update reports | **Done** |

---

## Bugs fixed during QA (all sessions)

| Issue | Fix |
|-------|-----|
| Logged-in users saw login prompt on like/comment (session race) | `knownGuest` / `sessionPending` + `data-auth-status` on feed |
| Comment drawer z-index / delete own comments | Portal + delete button |
| No sign-out on feed | Profile menu in bottom nav |
| Search events not recorded | `/api/search/track` + overlay hooks |
| Playwright login flakiness | Session API polling + 3 retries |
| Rail buttons hard to test | `ariaLabel` on Like, Save, Comments |

---

## Automated test inventory (37 tests)

```
e2e/
  guest.spec.ts        — 7 tests
  auth.spec.ts         — 7 tests (incl. feed sign-out)
  engagement.spec.ts   — 7 tests (comments, like, save, follow)
  admin.spec.ts        — 5 tests
  moderation.spec.ts   — 2 tests (approve/reject server)
  forms.spec.ts        — 5 tests
  submission.spec.ts   — 1 test (upload + submit server)
  analytics.spec.ts    — 1 test (search track API)
  navigation.spec.ts   — 2 tests
  helpers/auth.ts, helpers/feed.ts
  fixtures/test-logo.png
```

**Run:** `npm run test:e2e`

---

## Coverage by QA checklist area

### Guest experience — **Verified**
Homepage, feed, search overlay, profiles, explore, 404, login prompts, scroll, mobile bottom nav.

### Auth — **Verified**
Register, login, logout (explore + feed menu), invalid credentials, protected routes, role checks.

### Logged-in actions — **Verified**
Comments (post/delete), like/save toggle, follow creator, profile, account edit, studio.

### Server submission — **Verified**
Full form + logo/banner upload → success page (creates new pending server each run).

### Admin moderation — **Verified**
Dashboard, lists, server detail, **approve** and **reject** Nova School (restored to PENDING after each test).

### Analytics — **Verified**
Search apply fires `POST /api/search/track` with query payload.

### Form validation — **Verified**
Login password required, register mismatch, server name min length, video title required.

### Still not implemented (product gaps)
- Server team management UI
- Dedicated server / per-video analytics pages
- Profile visit tracking
- Creator video delete in studio UI
- Video file upload E2E (only validation tested; no mp4 fixture)
- Admin video approve/reject E2E
- Report resolve/dismiss E2E

See [FEATURE_STATUS.md](./FEATURE_STATUS.md) for the full works / doesn't-work list.

---

## Remaining known issues

1. **Do not run `npm run build` while `npm run dev` is active** — corrupts `.next` and breaks auth during tests. Kill port 3000, delete `.next`, restart dev.
2. Login can be slow on cold dev server (mitigated with retries).
3. Admin inner pages still use legacy Metin2 styling.
4. Each server submission E2E creates a new DB row (by design).

---

## Demo accounts

See [DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md) — password `password123`
