# Treetag — Implementation Plan & Roadmap

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | SvelteKit |
| **Database** | MongoDB (via Mongoose ODM) |
| **Authentication** | better-auth |
| **UI Library** | shadcn-svelte |
| **Styling** | Tailwind CSS |
| **Maps** | Leaflet + OpenStreetMap tiles |
| **Image Storage** | Cloudflare R2 |
| **QR Codes** | `qrcode` npm package (client-side generation) |
| **Deployment** | Docker + docker-compose on dedicated server |

---

## Data Models

### User

```
User (managed by better-auth + extended profile)
├── _id
├── name
├── email
├── emailVerified
├── image
├── role: "user" | "guardian" | "admin"
├── points: Number (loyalty scheme)
├── adoptedTrees: [ObjectId → Tree]
├── createdAt
└── updatedAt
```

### Tree

```
Tree
├── _id
├── name: String (e.g. "The Old Oak on Cirencester Road")
├── species: String (e.g. "English Oak")
├── estimatedAge: Number (years)
├── plantedDate: Date (if known)
├── plantedBy: String (if known)
├── height: Number (metres)
├── trunkDiameter: Number (cm)
├── location
│   ├── type: "Point"
│   ├── coordinates: [lng, lat]
│   └── address: String
├── qrCodeId: String (unique slug for QR URL)
├── photos: [ObjectId → Photo]
├── adoptedBy: ObjectId → User (nullable)
├── adoptedAt: Date
├── tags: [String] (e.g. "healthy", "diseased", "heritage")
├── iNaturalistId: String (if imported)
├── createdBy: ObjectId → User
├── createdAt
└── updatedAt
```

### Observation

```
Observation (sightings, health checks, wildlife reports)
├── _id
├── tree: ObjectId → Tree
├── user: ObjectId → User
├── type: "tag" | "health_check" | "wildlife" | "disease" | "photo" | "note"
├── content: String (text note)
├── photos: [ObjectId → Photo]
├── wildlife
│   ├── species: String
│   └── category: "bird" | "insect" | "mammal" | "other"
├── healthStatus: "healthy" | "concern" | "diseased" | "dead"
├── pointsAwarded: Number
├── createdAt
└── updatedAt
```

### Photo

```
Photo
├── _id
├── url: String
├── thumbnail: String
├── caption: String
├── uploadedBy: ObjectId → User
├── tree: ObjectId → Tree
├── observation: ObjectId → Observation (nullable)
├── createdAt
└── updatedAt
```

### FAQ

```
FAQ
├── _id
├── question: String
├── answer: String (markdown)
├── category: String (e.g. "tree-care", "diseases", "general")
├── order: Number
├── createdAt
└── updatedAt
```

---

## User Stories (Product Backlog) — Prioritised by Business Value

### P0 — Must Have (Sprint 1–2)

| ID | User Story | Notes |
|---|---|---|
| US-01 | As a visitor, I can register an account and log in | better-auth setup |
| US-02 | As an admin, I can add a new tree to the database with all its details | Core CRUD |
| US-03 | As a user, I can view a list of all trees | Browse/search |
| US-04 | As a user, I can view a tree's full detail page | Single tree view |
| US-05 | As a user, I can see trees displayed on a map | Leaflet integration |
| US-06 | As a user, I can upload photos to a tree's profile | Photo upload |
| US-07 | As a user, I can "tag" a tree (record that I found it) | e.g. "Josh found this tree on 09.03.26" |
| US-08 | As a user, I can add an observation (health, wildlife, disease, note) | Observation system |
| US-09 | As a user, I can scan a QR code to open a tree's page | QR generation + routing |

### P1 — Should Have (Sprint 3)

| ID | User Story | Notes |
|---|---|---|
| US-10 | As a user, I can adopt a tree | Adoption system |
| US-11 | As a user, I can view my profile with my adopted trees, tags, and observations | Profile page |
| US-12 | As an admin, I can edit and delete trees | Admin management |
| US-13 | As a user, I can search/filter trees by species, location, health status | Search & filter |
| US-14 | As a visitor, I can browse the FAQ section for tree care info | FAQ pages |

### P2 — Could Have (Sprint 4)

| ID | User Story | Notes |
|---|---|---|
| US-15 | As a user, I earn loyalty points for observations and check-ins | Points system |
| US-16 | As a user, I can view a leaderboard of top Tree Guardians | Gamification |
| US-17 | As an admin, I can import trees from iNaturalist CSV data | Data import |
| US-18 | As a user, I get helpful tree care tips based on the season and tree species | Contextual info |

### P3 — Won't Have This Time (Backlog)

| ID | User Story | Notes |
|---|---|---|
| US-19 | As an admin, I can manage FAQ content from an admin panel | Admin CMS |
| US-20 | As a user, I receive push notifications about my adopted tree | Notifications |
| US-21 | Integration with Gloucestershire Wildlife Trust resources | External links |

---

## Application Pages & Routes

```
/                           → Landing page (map overview + recent activity)
/auth/login                 → Login page
/auth/register              → Register page

/trees                      → Browse all trees (list + map toggle)
/trees/[id]                 → Tree detail page (info, photos, observations, QR)
/trees/new                  → Add new tree form (admin/guardian)
/trees/[id]/edit            → Edit tree (admin/guardian)
/trees/[id]/observe         → Add observation to a tree

/t/[qrCodeId]              → QR code redirect → /trees/[id]

/profile                    → Current user's profile (adopted trees, activity)
/profile/settings           → Account settings

/leaderboard                → Loyalty points leaderboard
/faq                        → FAQ / tree care info

/admin                      → Admin dashboard
/admin/trees                → Manage trees
/admin/users                → Manage users
/admin/faq                  → Manage FAQ entries
/admin/import               → iNaturalist data import
```

---

## Project Structure

```
treetag/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable Svelte components
│   │   │   ├── ui/              # shadcn-svelte components
│   │   │   ├── TreeCard.svelte
│   │   │   ├── TreeMap.svelte
│   │   │   ├── ObservationForm.svelte
│   │   │   ├── PhotoUpload.svelte
│   │   │   └── QRCode.svelte
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   ├── index.ts         # Mongoose connection
│   │   │   │   └── models/
│   │   │   │       ├── tree.ts
│   │   │   │       ├── observation.ts
│   │   │   │       ├── photo.ts
│   │   │   │       └── faq.ts
│   │   │   └── auth.ts             # better-auth server config
│   │   ├── auth-client.ts           # better-auth client
│   │   └── utils.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +layout.server.ts
│   │   ├── +page.svelte             # Landing / home
│   │   ├── auth/
│   │   ├── trees/
│   │   ├── t/[qrCodeId]/            # QR redirect
│   │   ├── profile/
│   │   ├── leaderboard/
│   │   ├── faq/
│   │   ├── admin/
│   │   └── api/
│   │       └── auth/[...all]/       # better-auth API routes
│   ├── app.html
│   ├── app.css                      # Tailwind base
│   └── hooks.server.ts
├── static/
│   └── uploads/                     # Local photo uploads (dev)
├── docs/
├── svelte.config.js
├── tailwind.config.js
├── vite.config.ts
├── package.json
├── tsconfig.json
└── .env
```

---

## Sprint Roadmap

### Sprint 1 — Foundation & Core Tree CRUD (Week 1–2)

**Goal:** Project scaffolding, auth, and basic tree management.

- [ ] Initialise SvelteKit project with TypeScript
- [ ] Install & configure Tailwind CSS + shadcn-svelte
- [ ] Set up MongoDB connection with Mongoose
- [ ] Configure better-auth (registration, login, sessions)
- [ ] Create Tree model & seed sample data
- [ ] Build tree list page (`/trees`)
- [ ] Build tree detail page (`/trees/[id]`)
- [ ] Build add tree form (`/trees/new`) — admin only
- [ ] Build basic layout with navigation (navbar, mobile-friendly)
- [ ] Set up role-based access (user / guardian / admin)

**Demo:** Register, log in, add a tree, view tree list and detail pages.

---

### Sprint 2 — Map, Photos, Observations & QR (Week 3–4)

**Goal:** Interactive map, photo uploads, observation system, QR codes.

- [ ] Integrate Leaflet map on landing page and `/trees`
- [ ] Tree markers on map with popups linking to detail pages
- [ ] Photo upload functionality (tree photos)
- [ ] Observation system (tag, health check, wildlife, disease, note)
- [ ] Observation form on tree detail/observe page
- [ ] Display observations on tree detail page
- [ ] QR code generation per tree
- [ ] QR redirect route (`/t/[qrCodeId]` → `/trees/[id]`)
- [ ] Mobile-responsive refinements

**Demo:** View trees on map, scan QR to open tree page, add observations with photos.

---

### Sprint 3 — Adoption, Profiles, Search & FAQ (Week 5–6)

**Goal:** Tree adoption, user profiles, search/filter, FAQ.

- [ ] Tree adoption (adopt / unadopt)
- [ ] User profile page (my adopted trees, my observations, my tags)
- [ ] Search and filter trees (by species, location, health, etc.)
- [ ] FAQ page with categorised questions
- [ ] Admin: edit/delete trees
- [ ] Admin: manage FAQ entries
- [ ] UI polish and accessibility improvements

**Demo:** Adopt a tree, view profile, search trees, browse FAQ.

---

### Sprint 4 — Gamification, Import & Polish (Week 7–8)

**Goal:** Loyalty points, leaderboard, iNaturalist import, final polish.

- [ ] Points system (earn points for observations, health checks, tagging)
- [ ] Leaderboard page
- [ ] iNaturalist CSV import tool (admin)
- [ ] Admin dashboard with overview stats
- [ ] Comprehensive testing
- [ ] Performance & accessibility audit
- [ ] Final UI polish across all pages
- [ ] Documentation updates

**Demo:** Full application walkthrough with all features.

---

## Environment Variables

```env
DATABASE_URL=mongodb://localhost:27017/treetag
BETTER_AUTH_SECRET=<random-secret>
BETTER_AUTH_URL=http://localhost:5173

# Cloudflare R2
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key>
R2_SECRET_ACCESS_KEY=<secret-key>
R2_BUCKET_NAME=treetag
R2_PUBLIC_URL=<public-bucket-url>
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "better-auth": "^1.x",
    "mongoose": "^8.x",
    "leaflet": "^1.x",
    "qrcode": "^1.x"
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.x",
    "svelte": "^5.x",
    "tailwindcss": "^4.x",
    "bits-ui": "latest",
    "typescript": "^5.x"
  }
}
```

> Note: shadcn-svelte components are added via the CLI (`npx shadcn-svelte@latest add <component>`) and live in source, not as a dependency.

---

## UI / Wireframe Notes

Based on early team wireframes:

### Landing Page — Split Panel Layout

- **Left panel:** Tree Information sidebar — most recent photo, guardian name, date registered, location, species, age, features, description
- **Right panel:** Full interactive map with tree markers
- Clicking a tree marker shows a popup with summary + "See More Info" link to the detail page
- Clicking a tree in the sidebar updates the panel with that tree's info

### Navigation Bar

`Logo | Home | Register a Tree | Map View | Tree Lookup | FAQ | [Log-In] [Sign-Up]`

- Auth buttons swap to user avatar/menu when logged in
- Mobile: hamburger menu

### Tree Detail View

- Hero: most recent photo
- Info card: species, age, location, features, description, guardian name, date registered
- Action buttons: **"Share This Tree (QR Code)"** and **"Tag Tree"**
- Observations timeline below

### Tree Tagging Popup (Modal)

When a user tags a tree, a modal offers:

1. **Upload Image** (optional)
2. **Update Tree Details / Add New Features** (optional — e.g. reporting wildlife, health)
3. **Modify Description** (optional text note)
4. Two submit options:
   - **"Tag with Changes"** — records the tag + saves any updates
   - **"Tag without Changes"** — records just the visit/tag
5. **Cancel**

This "tag with or without changes" pattern is a key UX concept — tagging is low-friction by default but allows contributing data in the same flow.

---

## Decisions Made

| Decision | Choice | Notes |
|---|---|---|
| **Image storage** | Cloudflare R2 | S3-compatible, generous free tier |
| **Deployment** | Docker + docker-compose on dedicated server | Node adapter for SvelteKit; MongoDB already running on dedi |
| **Map tiles** | OpenStreetMap | Free, no API key needed |
| **QR code physical printing** | TBD | Could generate printable QR sheets for events |
