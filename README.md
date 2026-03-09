# 🌳 Treetag

A community-driven web app for the Charlton Kings Tree Guardian Project. Discover, tag, adopt, and care for local trees through an interactive map and mobile-friendly interface.

## Tech Stack

- **SvelteKit** (Svelte 5) — fullstack framework
- **MongoDB** + Mongoose — database & ODM
- **better-auth** — authentication
- **shadcn-svelte** + Tailwind CSS — UI components & styling
- **Leaflet** + OpenStreetMap — interactive mapping
- **Cloudflare R2** — image storage
- **Docker** — containerised deployment

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.2+)
- MongoDB instance (local or remote)
- Cloudflare R2 bucket (for image uploads)

### Setup

```bash
# Install dependencies
bun install

# Copy env file and fill in your values
cp .env.example .env

# Start dev server
bun dev
```

### Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Random secret for auth sessions |
| `APP_URL` | Application URL (e.g. `http://localhost:5173`) |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public URL for the R2 bucket |

## Scripts

```bash
bun dev        # Start development server
bun run build  # Build for production
bun run check  # Run svelte-check (TypeScript)
bun preview    # Preview production build
```

## Docker

```bash
docker compose up --build
```

## Project Structure

```
src/
├── lib/
│   ├── components/ui/   # shadcn-svelte components
│   ├── server/
│   │   ├── auth.ts      # better-auth config
│   │   ├── r2.ts        # Cloudflare R2 uploads
│   │   └── db/
│   │       ├── index.ts # Mongoose connection
│   │       └── models/  # Tree, Observation, Photo, FAQ
│   ├── auth-client.ts   # Client-side auth
│   └── utils.ts         # Shared utilities
├── routes/
│   ├── auth/            # Login & register
│   ├── trees/           # Browse, map, detail
│   ├── faq/             # FAQ pages
│   └── api/auth/        # better-auth API handler
└── app.css              # Tailwind + theme variables
```

## License

This project was built for the CT5038/DT5012 Agile Methods module at the University of Gloucestershire.
