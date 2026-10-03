---
name: db-migration-planner
description: Plans safe, zero-downtime schema migrations with an explicit rollback path
kind: skill
tags:
  - database
  - migrations
  - devops
  - reliability
planRequired: PRO
---

# Database Migration Planner

Plan schema and data changes that will not take production down.

## When to use

- Adding, changing, or removing columns/tables/indexes
- Backfilling data
- Coordinating app deploy with a migration
- Choosing expand/contract vs a one-shot change

## Process

1. Classify the change: additive, destructive, or data transform.
2. For breaking changes, use **expand → dual-write → backfill → cutover → contract**.
3. Estimate locks and runtime on the target database (table size, engine, concurrent indexes).
4. Always produce a rollback path, or document why the migration is irreversible.
5. Backfill in idempotent, resumable batches — never one giant transaction on hot tables.
6. Check compatibility with both old and new app versions across the rollout.
7. Review indexes and query impact: missing indexes, redundant indexes, new N+1 risks.

## Output

- Numbered step plan
- Up / down scripts (or framework migration files)
- Deploy sequence
- Validation checkpoints after each step
