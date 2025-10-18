# Phase 5: Provider & Service Management Testing

## Multi-Tenancy Tests

### Setup

1. Create two test companies (Company A and Company B)
2. Create providers and services for both companies

### Test Cases

**Test 1: Data Isolation - Providers**

1. Sign in as Company A admin
2. Navigate to `/dashboard/providers`
3. Verify you only see Company A's providers
4. Sign out and sign in as Company B admin
5. Verify you only see Company B's providers

**Test 2: Data Isolation - Services**

1. Repeat above for `/dashboard/services`
2. Confirm complete isolation

**Test 3: Cross-Tenant API Access (Expected: Forbidden)**

1. Sign in as Company A admin
2. Get a provider ID from Company B (via database)
3. Try to access: `GET /api/providers/{companyB_provider_id}`
4. Expected: 403 Forbidden error

**Test 4: Email Uniqueness Per Company**

1. Company A creates provider with email `john@example.com`
2. Company B creates provider with email `john@example.com`
3. Both should succeed (email unique per company, not globally)

## Functional Tests

**Test 5: Provider CRUD**

1. Create new provider
2. Verify appears in list
3. Edit provider details
4. Verify changes saved
5. Deactivate provider (soft delete)
6. Verify marked as inactive but still visible in database

**Test 6: Working Hours**

1. Edit provider
2. Add working hours: Monday 9:00-17:00
3. Add lunch break: Monday 13:00-14:00 (separate entry)
4. Verify both entries saved
5. Update working hours (replace all)
6. Verify old entries deleted, new entries created

**Test 7: Service CRUD**

1. Create service: "Haircut", 30 mins, £25
2. Verify appears in list
3. Edit price to £30
4. Verify update reflected
5. Deactivate service
6. Verify marked as inactive

**Test 8: Provider Assignment**

1. Create service
2. Assign 2 providers
3. Verify junction table entries created
4. Remove 1 provider
5. Verify junction entry deleted
6. Verify service still linked to remaining provider

**Test 9: Validation**

- Try creating provider with invalid email → Should fail
- Try service with duration 0 → Should fail
- Try service with negative price → Should fail
- Try working hours with endTime < startTime → Should fail

## Performance Tests

**Test 10: Query Efficiency**

1. Create 50 providers with 10 services each
2. Navigate to `/dashboard/providers`
3. Check database query count (should use `include` for N+1 prevention)
4. Verify page loads in < 1 second

## Edge Cases

**Test 11: Provider with No Services**

- Create provider
- Don't assign any services
- Verify displays "No services assigned"

**Test 12: Service with No Providers**

- Create service
- Don't assign providers
- Should be allowed (can assign later)

**Test 13: Inactive Provider with Active Services**

- Assign provider to service
- Deactivate provider
- Service should still show provider (historical data)
- But provider shouldn't appear in active provider lists
