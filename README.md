# SkillManager

> SaaS platform that distributes AI agents (subagents, skills, rules) and injects them into coding tools (Claude Code, Codex, Cursor, Gemini CLI) with a single command.

## Architecture

```
skillmanager/
├── shared/          # @skillmanager/shared — types, schemas, adapters, watermark
├── api/             # @skillmanager/api — NestJS + Prisma + PostgreSQL
├── cli/             # @skillmanager/cli — Commander + Clack prompts
├── web/             # (à venir)
├── content/agents/  # Example .md agents (source of truth)
└── scripts/         # Utility scripts (publish-agents)
```

## Prerequisites

- **Node.js** >= 20
- **Bun** >= 1.0
- **Docker** (for PostgreSQL)

## Local Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your Clerk, Stripe keys, and admin API key
```

### 4. Run database migrations

```bash
cd api && bunx prisma migrate dev --name init
```

### 5. Generate Prisma client

```bash
cd api && bunx prisma generate
```

### 6. Seed the database

```bash
cd api && bun run db:seed
```

### 7. Build shared package

```bash
cd shared && bun run build
```

### 8. Start the API

```bash
cd api && bun run start:dev
```

### 9. Publish example agents

```bash
ADMIN_API_KEY=<your-key> bun run publish-agents
```

### 10. Use the CLI

```bash
# Build the CLI
cd cli && bun run build

# Login (opens browser for device flow)
node cli/dist/index.js login

# Install agents (dry run)
node cli/dist/index.js install --dry-run

# Check identity
node cli/dist/index.js whoami
```

## Auth Flow

```
┌─────────┐     start      ┌──────────┐     open browser     ┌──────────┐
│   CLI   │ ──────────────► │   API    │ ◄─────────────────── │  Web UI  │
│         │                 │          │      approve          │ (Clerk)  │
│         │  poll (loop)    │          │                       │          │
│         │ ──────────────► │          │                       │          │
│         │ ◄────────────── │          │                       │          │
│         │  token (once)   │          │                       │          │
└─────────┘                 └──────────┘                       └──────────┘
```

1. CLI calls `POST /v1/cli/auth/start` → gets `userCode` + `deviceCode`
2. CLI opens browser to `WEB_URL/cli?code=<userCode>`
3. User logs in via Clerk and approves the code
4. CLI polls `POST /v1/cli/auth/poll` with `deviceCode` → receives `sm_*` token
5. Token is stored in `~/.config/skillmanager/token` (permissions 600)

## Commands

| Command | Description |
|---------|-------------|
| `sm login` | Login via device flow |
| `sm logout` | Remove saved token |
| `sm whoami` | Show email, plan, status |
| `sm install` | Install agents into project |
| `sm update` | Update agents to latest versions |
| `sm list` | List installed & available agents |
| `sm remove <slug>` | Remove an installed agent |

### Install Options

```bash
sm install --tools claude,codex    # Specific tools only
sm install --global                 # Install globally (~/)
sm install --dry-run                # Preview without writing
sm install --yes                    # Skip prompts
sm install --force                  # Overwrite local changes
```

## Supported Tools

| Tool | Agent Path | Skill Path | Rule Path | Mode |
|------|-----------|------------|-----------|------|
| Claude Code | `.claude/agents/<name>.md` | `.claude/skills/<name>/SKILL.md` | `.claude/rules/<name>.md` | write |
| Codex | `AGENTS.md` (section) | `AGENTS.md` (section) | `AGENTS.md` (section) | inject |
| Cursor | `.cursor/rules/<name>.mdc` | `.cursor/rules/<name>.mdc` | `.cursor/rules/<name>.mdc` | write |
| Gemini CLI | `GEMINI.md` (section) | `GEMINI.md` (section) | `GEMINI.md` (section) | inject |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/cli/auth/start` | — | Start device flow |
| POST | `/v1/cli/auth/poll` | — | Poll device flow |
| POST | `/v1/cli/auth/approve` | Clerk JWT | Approve device |
| POST | `/v1/cli/auth/deny` | Clerk JWT | Deny device |
| GET | `/v1/me` | CLI Token | User info |
| GET | `/v1/bundle` | CLI Token | Download agents |
| GET | `/v1/me/devices` | Clerk JWT | List devices |
| DELETE | `/v1/me/devices/:id` | Clerk JWT | Revoke device |
| POST | `/v1/admin/agents/publish` | Admin Key | Publish agent |
| POST | `/v1/webhooks/clerk` | Svix sig | Clerk events |
| POST | `/v1/webhooks/stripe` | Stripe sig | Stripe events |
| GET | `/health` | — | Health check |

## Running Tests

```bash
# All tests
bun run test

# Per package
cd shared && bun run test
cd api && bun run test
cd cli && bun run test
```

## What's Left (TODO)

- [ ] `web/` — Frontend dashboard with Clerk auth
- [ ] npm/bun publish for `@skillmanager/cli`
- [ ] Deployment (Docker, Fly.io, Railway, etc.)
- [ ] Stripe checkout endpoint
- [ ] User dashboard (manage devices, view plan)
- [ ] Agent marketplace / browse UI
- [ ] CI/CD pipeline
- [ ] Rate limiting fine-tuning
- [ ] Monitoring / observability (Sentry, etc.)

## License

Proprietary. All rights reserved.
