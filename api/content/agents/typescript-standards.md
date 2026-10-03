---
name: typescript-standards
description: Enforces TypeScript coding standards and best practices
kind: rule
tags:
  - typescript
  - standards
  - code-quality
planRequired: FREE
---

## TypeScript Standards

These rules must be followed in all TypeScript code in this project.

### Type Safety
- Always use `interface` over `type` for object shapes (unless unions/intersections are needed)
- Use `unknown` instead of `any` wherever possible
- Always provide explicit return types for exported/public functions
- Use `const` assertions for literal types: `as const`
- Enable and respect `"strict": true` in tsconfig.json
- Use template literal types for string patterns

### Naming Conventions
- **Interfaces**: PascalCase, no `I` prefix (e.g., `UserService`, not `IUserService`)
- **Types**: PascalCase (e.g., `ApiResponse`)
- **Enums**: PascalCase for name, PascalCase for members
- **Functions/methods**: camelCase
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for derived values
- **Files**: kebab-case (e.g., `user-service.ts`)

### Error Handling
- Never use `try/catch` with empty catch blocks
- Always type errors as `unknown` and narrow with type guards
- Use custom error classes that extend `Error`
- Include meaningful error messages with context

### Imports
- Use named imports over default imports
- Group imports: Node builtins → external deps → internal modules
- Use `.js` extension for relative imports (ESM compatibility)
- Never use `require()` in ESM modules

### Functions
- Prefer `function` declarations over arrow functions for top-level exports
- Use arrow functions for callbacks and inline functions
- Keep functions under 30 lines; extract logic into helper functions
- Use early returns to reduce nesting

### Testing
- Every exported function must have at least one test
- Use descriptive test names: `should <expected behavior> when <condition>`
- Prefer `toEqual` for object comparisons, `toBe` for primitives
- Mock external dependencies, not internal modules
