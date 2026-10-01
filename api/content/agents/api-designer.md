---
name: api-designer
description: Helps design RESTful and GraphQL APIs following best practices
kind: skill
model: claude-sonnet-4
tags:
  - api
  - architecture
  - design
planRequired: PRO
---

# API Design Skill

Guide the user through designing robust, scalable APIs.

## When to Use

Trigger this skill when:
- Designing a new API from scratch
- Refactoring an existing API
- Planning API versioning strategy
- Designing authentication/authorization flows

## Design Process

### Step 1: Resource Modeling
- Identify core entities and their relationships
- Define resource naming conventions (plural nouns, kebab-case)
- Map entity relationships to URL hierarchy

### Step 2: Endpoint Design
- Use HTTP methods correctly (GET, POST, PUT, PATCH, DELETE)
- Design consistent URL patterns
- Plan pagination, filtering, and sorting
- Define query parameters vs. path parameters

### Step 3: Request/Response Schemas
- Use JSON:API or custom consistent format
- Define error response structure
- Plan envelope vs. flat responses
- Document nullable vs. optional fields

### Step 4: Authentication & Authorization
- Choose auth strategy (JWT, API keys, OAuth2)
- Design permission model (RBAC, ABAC)
- Plan rate limiting strategy
- Define public vs. authenticated endpoints

### Step 5: Documentation
- Generate OpenAPI/Swagger specification
- Document error codes and their meaning
- Provide example requests and responses
- Define versioning strategy (URL vs. header)

## Output Format

Provide a structured API specification with:
1. Resource diagram (entities & relationships)
2. Endpoint table (method, path, description, auth)
3. Request/response examples for each endpoint
4. Error code reference
