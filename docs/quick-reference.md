# Quick Reference

## Starting New Feature

1. Update Prisma schema if needed
2. Create migration: `npx prisma migrate dev`
3. Create API route with tenant context
4. Create validation schema
5. Create UI components
6. Test multi-tenancy isolation

## API Route Checklist

- [ ] Import getTenantContext()
- [ ] Call getTenantContext() at start
- [ ] Filter all queries by companyId
- [ ] Use Zod validation
- [ ] Use successResponse/errorResponse
- [ ] Handle errors properly
- [ ] Test with different tenants

## Security Checklist

- [ ] All database queries filter by companyId
- [ ] Admin-only routes check role === 'ADMIN'
- [ ] Input validation with Zod
- [ ] Proper error messages (don't leak data)
- [ ] Test cross-tenant access attempts
