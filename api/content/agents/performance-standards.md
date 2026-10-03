---
name: performance-standards
description: Ongoing performance rules for frontend rendering and data access
kind: rule
tags:
  - performance
  - frontend
  - database
planRequired: PRO
---

## Performance Standards

Apply these rules to application code. Skip one-off scripts and tests unless they ship to production.

### Budgets

- Keep the initial JS bundle lean; justify large new dependencies.
- Track Core Web Vitals (LCP, INP, CLS) on key routes.
- API and server handlers: watch p95 latency on hot paths.

### Data access

- No queries in loops (N+1). Batch, join, or preload.
- Paginate collections; never return unbounded lists from production endpoints.
- Select only the columns you need.

### Frontend rendering

- Virtualize long lists past a sensible threshold.
- Memoize only when measurement shows a real cost.
- No heavy work in render paths; move it out of the critical path.

### Loading

- Code-split by route; dynamic-import heavy optional deps.
- Size images; prefer modern formats.

### Network

- Explicit cache and invalidation strategy.
- Deduplicate identical in-flight requests.
- Avoid avoidable sequential round-trips; parallelize when safe.

### Golden rule

Measure before optimizing. Attach a before/after number to every performance change.
