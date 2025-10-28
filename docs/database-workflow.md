# Database Workflow Guide

## Local Development

1. **Make schema changes:**

```bash
   # Edit prisma/schema.prisma
```

2. **Create migration:**

```bash
   npx prisma migrate dev --name descriptive_name
```

3. **Review migration SQL:**

```bash
   # Check prisma/migrations/[timestamp]_descriptive_name/migration.sql
```

## Staging/Production Deployment

1. **Apply migrations:**

```bash
   npx prisma migrate deploy
```

**NEVER use `prisma db push` in production!**

## Emergency Rollback

If migration fails:

```bash
# Mark last migration as rolled back
npx prisma migrate resolve --rolled-back migration_name
```
