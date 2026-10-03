---
name: git-pr-workflow
description: Turns work in progress into clean commits and a review-ready pull request
kind: skill
tags:
  - git
  - pull-request
  - workflow
  - collaboration
planRequired: PRO
---

# Git & PR Workflow

Turn messy local work into atomic commits and a PR reviewers can trust.

## When to use

- Preparing a pull request
- Splitting a large diff into reviewable commits
- Writing conventional commit messages and PR descriptions
- Recovering from messy local history *before* it is shared

## Steps

1. Inspect real repo state: branch, diff, unpushed commits.
2. Split changes into thematic, buildable commits.
3. Write Conventional Commits; body explains *why*, not *what*.
4. Draft the PR: context, approach, scope, test plan, risks, review focus.
5. Pre-PR checklist: tests, lint, no secrets, no debug leftovers, migrations noted.
6. Handle rebase/conflicts with an explanation of each resolution.
7. Suggest labels, reviewers, or splitting into multiple PRs when the diff is too large.

## Hard rules

- Never `push --force`, `reset --hard`, or delete a remote branch without explicit confirmation.
- Never rewrite history that is already shared without agreement.
