# Architecture Decisions

## Multi-Tenancy

- **Decision**: Column-based multi-tenancy with companyId on all tables
- **Rationale**: Simpler than schema-per-tenant, adequate isolation for MVP
- **Rule**: EVERY query MUST filter by companyId

## Authentication

- **Stack**: NextAuth v5 + JWT + bcrypt
- **Sessions**: JWT-based (30-day expiry)
- **Roles**: ADMIN (full access) and PROVIDER (limited access)

## API Standards

- **Format**: JSON
- **Responses**: Use successResponse() and errorResponse()
- **Validation**: Zod for runtime validation
- **Errors**: Standard HTTP status codes

## Type Safety

- **Strictness**: TypeScript strict mode enabled
- **Rule**: No 'any' types allowed
- **Inference**: Leverage Prisma's generated types

## Database

- **ORM**: Prisma
- **Migrations**: Always create migrations, never push directly
- **Indexes**: Critical for companyId + frequently queried fields

## File Organization

/src/app/(auth) - Public auth pages
/src/app/(dashboard) - Protected admin pages
/src/app/(public) - Public booking pages
/src/app/api - API routes
/src/lib - Shared utilities
/src/components - React components
