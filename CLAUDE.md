# SocietySocials

Anonymous, privacy-first social platform for apartment/residential society residents. Users communicate via auto-generated pseudonymous personas instead of real identities.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Tailwind CSS v3, Radix UI, Framer Motion v12 |
| Backend | FastAPI, Motor (async MongoDB driver), Pydantic v2 |
| Database | MongoDB |
| Auth | Phone-based login (number hashed with SHA256), JWT, bcrypt |
| Build | Craco, Yarn v1.22 |
| Other | AWS S3 (boto3), Axios, React Hook Form + Zod, Sonner (toasts) |

## Project Structure

```
SocietySocials/
├── backend/
│   ├── server.py              # Entire FastAPI app (~1200 lines, all routes here)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── screens/           # Page components (7 screens)
│   │   ├── components/        # Shared components + ui/ (Radix, 48 files)
│   │   ├── context/
│   │   │   └── UserContext.js # Global user/society state (React Context)
│   │   ├── lib/utils.js
│   │   ├── App.js             # Routing
│   │   └── index.js
│   ├── craco.config.js        # Webpack alias '@' → 'src'
│   ├── tailwind.config.js     # Forced dark mode, custom palette
│   └── jsconfig.json          # Path alias '@'
├── design_guidelines.json     # Full design system spec
├── backend_test.py
└── new_features_test.py
```

## Screens (frontend/src/screens/)

- `SplashScreen.js` — Landing page
- `PhoneEntryScreen.js` — Phone number login
- `SocietySelectScreen.js` — Search/select society, request new ones
- `PersonaRevealScreen.js` — Display and customize persona
- `FeedScreen.js` — Main feed (sort/filter, create post FAB, demo toggle)
- `PostDetailScreen.js` — Full post view with comments, reactions, poll
- `ProfileScreen.js` — User profile with persona editing

## Key Components (frontend/src/components/)

- `PostCard.js` — Post summary with reactions/comment count
- `CreatePostSheet.js` — Modal for creating discussion/question/poll
- `ReactionButtons.js` — agree / interesting / me_too
- `PollOptions.js` — Poll rendering and voting
- `ReportSheet.js` — Content reporting form
- `BottomNav.js` — Mobile navigation bar
- `Avatar.js` — Color-coded persona avatar

## API Endpoints (all in backend/server.py)

| Prefix | Key Routes |
|---|---|
| `/api/auth` | `POST /login`, `POST /demo` |
| `/api/users` | `GET /{id}`, `PUT /{id}/society`, `PUT /{id}/persona`, `GET /{id}/posts` |
| `/api/persona` | `GET /check/{name}`, `GET /suggestions` |
| `/api/societies` | `GET /`, `GET /{id}`, `POST /request`, `GET /demo/info` |
| `/api/posts` | `POST /`, `GET /`, `GET /{id}`, reactions, votes, comments, reports |

## Database Collections (MongoDB)

`users`, `societies`, `posts`, `comments`, `reactions`, `votes`, `reports`, `society_requests`

### Key Schema Notes
- Users: `mobile_hash` (SHA256, salt: `societysocials_salt_2024`), `persona_name`, `persona_color` (MD5 of name), `society_id`
- Posts: `post_type` = `discussion | question | poll`, `reactions` map, `poll_options[]`
- One reaction and one vote per user per post enforced at API level

## Environment Variables

**Backend** (`.env`):
- `MONGO_URL` — MongoDB connection string
- `DB_NAME` — Database name
- `CORS_ORIGINS` — Allowed origins (default: `*`)

**Frontend**:
- `REACT_APP_BACKEND_URL` — Backend API base URL

## Key Conventions

- **Dark mode only** — forced in Tailwind config, no toggle
- **Mobile-first** — bottom nav on mobile/tablet
- **Glassmorphism** — `backdrop-blur-xl bg-slate-900/70 border border-white/10`
- **Typography** — Outfit (headings), Plus Jakarta Sans (body), JetBrains Mono (mono)
- **State** — React Context for global user state; no Redux
- **IDs** — Python `uuid` for all resource IDs
- **Async** — Full async/await with Motor throughout backend
- **Testing** — All interactive elements have `data-testid` attributes
- **Personas** — Format: `AdjectiveNounNumber` (e.g., `SwiftEagle42`)

## Seed Data

- 15 real Indian societies (Bengaluru focus) + 1 test + 1 demo society
- Demo society has 18 sample post templates auto-seeded on startup
- Auto-seed runs in FastAPI startup event handler
