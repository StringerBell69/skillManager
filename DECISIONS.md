# Decisions Log

## 2026-09-28

### Package manager: Bun
Instructions mentioned pnpm but user chose **Bun** for all package management, script running, and workspace orchestration.

### Separate git repos per package
Each folder (api/, cli/, shared/, web/) has its own `package.json` and its own `.git` repository. The root also has its own git repo for workspace-level config.

### No Redis / no queue / no microservices
Keeping everything simple and monolithic per the instructions. No caching layer.

### Watermark strategy
HTML comments + zero-width character variations derived from user seed via deterministic SHA-256 hash. Lightweight, non-destructive, stable across renders.

### Token format
CLI tokens use prefix `sm_` + 32 random hex bytes (64 chars). Only the SHA-256 hash is stored in the database.

### Device code format
`ABCD-1234` style: 4 alpha (no O/I/L) + dash + 4 numeric (no 0). Displayed to user. The `deviceCode` is a long random secret, never displayed, stored hashed.
