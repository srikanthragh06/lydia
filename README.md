# lydia

Live: [https://lydia.1k5.in](https://lydia.1k5.in)

A ChatGPT-style chat app (UI-based, not CLI) that answers using **self-consistency** across
multiple LLMs instead of relying on a single model's response.

## Models / providers

Via the [Vercel AI SDK](https://ai-sdk.dev) (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`):

- **Claude Haiku 4.5** (Anthropic) — one of the 3 fan-out models, also the synthesizer
- **GPT-5.4 mini** (OpenAI) — one of the 3 fan-out models
- **Gemini 3.1 Flash Lite** (Google) — one of the 3 fan-out models, also the defensive guard classifier

## How the self-consistency flow works

1. The user's prompt first goes through a **defensive guard model** (Gemini Flash Lite), which
   classifies it as a genuine request or a prompt-injection/jailbreak attempt. If flagged, the
   guard writes its own user-facing decline and the fan-out below is skipped entirely.
2. If safe, the prompt (plus up to the last 30 messages of conversation history) is sent
   **concurrently** to all 3 fan-out models, each answering independently with no visibility into
   the others.
3. A **synthesizer** call (Claude Haiku) is given the original question along with all the
   fan-out models' raw answers, and produces one refined final answer — integrating the best of
   each rather than picking one. The user is never shown that multiple models were consulted.
4. That final answer is **streamed** to the client chunk by chunk over SSE as it's generated.
5. The final answer and each model's raw response are persisted to Postgres (the raw answers are
   kept for debugging only, never surfaced in the UI).

A single model failing (rate limit, timeout, etc.) doesn't take down the request — the synthesis
just proceeds with whichever models actually responded.

## Tech stack

- **Monorepo** (pnpm workspaces): `server` (Hono + Kysely + Postgres), `web` (React + Vite +
  Tailwind), `shared` (Zod schemas/types used by both)
- **Auth**: Google OAuth, session stored as a JWT in an httpOnly cookie
- Per-user rate limiting and the defensive guard layer described above protect the fan-out from
  abuse

## Running locally

Prereqs: Node >= 20, [pnpm](https://pnpm.io), Docker (for Postgres).

```bash
git clone <repo-url>
cd lydia
pnpm install
docker compose up -d   # starts Postgres
```

Create `server/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=lydia
DB_PASSWORD=lydia
DB_NAME=lydia

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=

CLIENT_URL=http://localhost:5173
RATE_LIMIT_ENABLED=true

ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

Create `web/.env`:

```
VITE_GOOGLE_CLIENT_ID=
VITE_SERVER_URL=http://localhost:3000
```

Then:

```bash
pnpm --filter shared build   # server/web both depend on this
pnpm --filter server dev     # runs migrations automatically on startup
pnpm --filter web dev
```

Open [http://localhost:5173](http://localhost:5173).
