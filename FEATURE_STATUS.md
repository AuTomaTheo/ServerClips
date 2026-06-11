# ServerClips — What Works / What Doesn't

Updated after full step-by-step QA follow-up (June 9, 2026).

---

## Works (Playwright-verified)

### Public / guest
- Homepage video feed, scroll, search overlay
- Explore servers, server/creator profiles, 404 pages
- Guest like → login prompt
- Mobile bottom nav + responsive feed

### Authentication
- Register, login, logout (navbar + **feed profile menu**)
- Invalid credentials, protected route redirects
- Admin vs user access control

### Logged-in engagement
- **Like** and **save** toggle on feed
- **Follow** creator from feed
- **Comment** post and **delete own** comment
- Profile, account edit, creator studio, upload page

### Server submission
- **Full submit with logo/banner file upload** → success page

### Admin
- Dashboard, servers/videos/reports lists
- Server review detail
- **Approve** and **reject** pending server (Nova School)

### Analytics
- **Search events** recorded when applying search to feed (`/api/search/track`)

### Form validation
- Login password required
- Register password mismatch
- Server name min length
- Video submit without title

### Build
- `npm run build` passes

---

## Doesn't work / not implemented

### Missing features
- Server **team** page (add/remove members, roles)
- **Server analytics** page (`canViewServerAnalytics` unused)
- **Per-video analytics** in studio
- **Profile visit** tracking
- Creator **video delete** button in studio UI
- **ANALYST** server role (not in schema)

### Not E2E tested (may work via API/UI manually)
- Video **file** upload end-to-end (validation only)
- Admin **video** approve/reject/suspend buttons
- Report resolve/dismiss
- Follow/unfollow **server** on server profile
- Saved videos tab
- Avatar upload on account edit
- Tablet-specific layout (768px)
- Full server role permission matrix

### UX / ops notes
- Run **build** only when dev server is stopped
- Admin moderation pages still use Metin2 gold theme internally
- Server submission E2E adds new pending servers to DB each run

---

## Test commands

```bash
npm run dev          # start app
npm run test:e2e     # 37 tests × desktop + mobile
npm run build        # production build (stop dev first)
```

---

## Seed data

| Resource | Value |
|----------|-------|
| Admin | `admin@serverclips.dev` |
| User | `user@serverclips.dev` |
| Creator | `creator@serverclips.dev` |
| Password | `password123` |
| Pending server | `nova-school` |
| Approved server | `eternal-kingdoms` |
