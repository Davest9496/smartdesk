# Phase 6: Availability Calculation Engine - Test Suite

## Overview

This document outlines comprehensive test cases for the availability calculation system. The availability engine is **critical** to the booking system - it must be 100% accurate to prevent double-bookings and ensure a reliable customer experience.

## Test Environment Setup

### Prerequisites

1. Database seeded with test data:
   - 2 test companies (Company A, Company B)
   - 2 providers per company
   - 3 services per company
   - Working hours configured for each provider
   - Company settings with different buffer times

2. Test script to create sample data:

```bash
# Run seed script
npm run db:seed:test
```

### Test Companies Configuration

**Company A:**

- Buffer time: 15 minutes
- Min advance: 60 minutes
- Max advance: 10080 minutes (1 week)
- Timezone: Europe/London
- Currency: GBP

**Company B:**

- Buffer time: 0 minutes
- Min advance: 120 minutes
- Max advance: 20160 minutes (2 weeks)
- Timezone: Europe/Paris
- Currency: EUR

---

## Core Functionality Tests

### Test 1: Basic Availability - No Existing Bookings

**Scenario:** Provider with no bookings on the selected date

**Setup:**

- Provider: John (Company A)
- Service: Haircut (30 minutes)
- Working Hours: Monday 09:00-17:00
- Date: Next Monday
- Existing Bookings: None

**Test:**

```bash
GET /api/availability?providerId={john_id}&serviceId={haircut_id}&date=2025-10-27&companyId={companyA_id}
```

**Expected Result:**

```json
{
  "success": true,
  "data": {
    "date": "2025-10-27",
    "providerId": "...",
    "serviceId": "...",
    "availableSlots": [
      {
        "startTime": "2025-10-27T09:00:00Z",
        "endTime": "2025-10-27T09:30:00Z"
      },
      {
        "startTime": "2025-10-27T09:15:00Z",
        "endTime": "2025-10-27T09:45:00Z"
      },
      {
        "startTime": "2025-10-27T09:30:00Z",
        "endTime": "2025-10-27T10:00:00Z"
      },
      // ... continues in 15-minute intervals
      { "startTime": "2025-10-27T16:30:00Z", "endTime": "2025-10-27T17:00:00Z" }
    ],
    "totalSlots": 33
  }
}
```

**Validation:**

- ✅ First slot starts at 09:00
- ✅ Last slot starts at 16:30 (last 30min slot that fits before 17:00)
- ✅ Slots are 15 minutes apart
- ✅ Total slots = (8 hours \* 4 slots per hour) + 1 = 33 slots

---

### Test 2: Availability with Single Existing Booking

**Scenario:** Provider has one booking in the middle of the day

**Setup:**

- Provider: John (Company A)
- Service: Haircut (30 minutes)
- Working Hours: Monday 09:00-17:00
- Existing Booking: Monday 12:00-12:30
- Company A Buffer: 15 minutes
- Date: Next Monday

**Test:**

```bash
GET /api/availability?providerId={john_id}&serviceId={haircut_id}&date=2025-10-27&companyId={companyA_id}
```

**Expected Result:**

- ✅ Slots available from 09:00-11:45
- ❌ NO slots from 12:00-12:45 (30min booking + 15min buffer)
- ✅ Slots resume from 12:45-16:30

**Validation:**

```javascript
// Gap should be: booking start (12:00) to booking end (12:30) + buffer (15min) = 12:45
const slotsBeforeBooking = slots.filter(
  (s) => s.startTime < '2025-10-27T12:00:00Z'
)
const blockedSlots = slots.filter(
  (s) =>
    s.startTime >= '2025-10-27T12:00:00Z' &&
    s.startTime < '2025-10-27T12:45:00Z'
)
const slotsAfterBooking = slots.filter(
  (s) => s.startTime >= '2025-10-27T12:45:00Z'
)

assert(slotsBeforeBooking.length > 0, 'Should have morning slots')
assert(blockedSlots.length === 0, 'No slots during booking + buffer')
assert(slotsAfterBooking.length > 0, 'Should have afternoon slots')
```

---

### Test 3: Multiple Bookings with Buffer Time

**Scenario:** Provider has multiple bookings throughout the day

**Setup:**

- Provider: Sarah (Company A)
- Service: Massage (60 minutes)
- Working Hours: Tuesday 10:00-18:00
- Existing Bookings:
  - 11:00-12:00
  - 14:00-15:00
  - 16:30-17:30
- Company A Buffer: 15 minutes

**Expected Gaps:**

- ❌ 11:00-12:15 (blocked)
- ❌ 14:00-15:15 (blocked)
- ❌ 16:30-17:45 (blocked)

**Test:**

```bash
GET /api/availability?providerId={sarah_id}&serviceId={massage_id}&date=2025-10-28&companyId={companyA_id}
```

**Validation:**

- ✅ Slots from 10:00-10:45 (morning window)
- ✅ Slots from 12:15-13:45 (lunch window)
- ✅ Slots from 15:15-16:15 (afternoon window)
- ❌ No slots after 17:00 (doesn't fit 60min service before 18:00 close)

---

### Test 4: No Buffer Time (Company B)

**Scenario:** Company with 0 buffer time between appointments

**Setup:**

- Provider: Marie (Company B)
- Service: Consultation (30 minutes)
- Working Hours: Wednesday 09:00-17:00
- Existing Booking: 10:00-10:30
- Company B Buffer: 0 minutes

**Test:**

```bash
GET /api/availability?providerId={marie_id}&serviceId={consultation_id}&date=2025-10-29&companyId={companyB_id}
```

**Expected Result:**

- ✅ Slots resume immediately after booking ends
- ✅ 10:30 slot should be available (no buffer)

**Validation:**

```javascript
const slotAt1030 = slots.find((s) => s.startTime === '2025-10-29T10:30:00Z')
assert(
  slotAt1030 !== undefined,
  'Slot at 10:30 should be available with no buffer'
)
```

---

### Test 5: Multiple Working Hour Blocks (Lunch Break)

**Scenario:** Provider has split shift with lunch break

**Setup:**

- Provider: David (Company A)
- Service: Tutorial (45 minutes)
- Working Hours:
  - Monday 09:00-13:00
  - Monday 14:00-18:00
- No existing bookings

**Test:**

```bash
GET /api/availability?providerId={david_id}&serviceId={tutorial_id}&date=2025-10-27&companyId={companyA_id}
```

**Expected Result:**

- ✅ Slots from 09:00-12:15 (last 45min slot before 13:00)
- ❌ NO slots from 13:00-14:00 (lunch break)
- ✅ Slots from 14:00-17:15 (last 45min slot before 18:00)

**Validation:**

```javascript
const morningSlots = slots.filter(
  (s) =>
    s.startTime >= '2025-10-27T09:00:00Z' &&
    s.startTime < '2025-10-27T13:00:00Z'
)

const lunchSlots = slots.filter(
  (s) =>
    s.startTime >= '2025-10-27T13:00:00Z' &&
    s.startTime < '2025-10-27T14:00:00Z'
)

const afternoonSlots = slots.filter(
  (s) =>
    s.startTime >= '2025-10-27T14:00:00Z' &&
    s.startTime < '2025-10-27T18:00:00Z'
)

assert(morningSlots.length > 0, 'Should have morning slots')
assert(lunchSlots.length === 0, 'No slots during lunch')
assert(afternoonSlots.length > 0, 'Should have afternoon slots')
```

---

## Edge Cases

### Test 6: Service Duration Doesn't Fit

**Scenario:** Service too long to fit in remaining working hours

**Setup:**

- Provider: Emma (Company A)
- Service: Deep Tissue Massage (120 minutes)
- Working Hours: Friday 09:00-11:00 (only 2 hours available)
- Date: Next Friday

**Test:**

```bash
GET /api/availability?providerId={emma_id}&serviceId={deep_massage_id}&date=2025-10-31&companyId={companyA_id}
```

**Expected Result:**

- ✅ Only ONE slot: 09:00-11:00
- ❌ No slot at 09:15 (would end at 11:15, past closing time)

**Validation:**

```javascript
assert(slots.length === 1, 'Only one slot should fit')
assert(
  slots[0].startTime === '2025-10-31T09:00:00Z',
  'Slot must start at opening'
)
assert(
  slots[0].endTime === '2025-10-31T11:00:00Z',
  'Slot must end exactly at closing'
)
```

---

### Test 7: Provider Doesn't Work on Selected Day

**Scenario:** Provider has no working hours for the selected day of week

**Setup:**

- Provider: Tom (Company A)
- Working Hours: Monday-Friday only (no weekend hours)
- Date: Saturday

**Test:**

```bash
GET /api/availability?providerId={tom_id}&serviceId={haircut_id}&date=2025-11-01&companyId={companyA_id}
```

**Expected Result:**

```json
{
  "success": true,
  "data": {
    "availableSlots": [],
    "totalSlots": 0
  }
}
```

---

### Test 8: Past Date/Time Filtering

**Scenario:** Query for today, but current time has already passed some slots

**Setup:**

- Provider: Lisa (Company A)
- Service: Checkup (30 minutes)
- Working Hours: Today 09:00-17:00
- Current Time: 14:30
- Date: Today

**Test:**

```bash
GET /api/availability?providerId={lisa_id}&serviceId={checkup_id}&date=2025-10-20&companyId={companyA_id}
```

**Expected Result:**

- ❌ NO slots before 14:30 (in the past)
- ✅ Slots from 14:30-16:30

**Validation:**

```javascript
const now = new Date()
const pastSlots = slots.filter((s) => new Date(s.startTime) < now)
assert(pastSlots.length === 0, 'No past slots should be returned')
```

---

### Test 9: Minimum Advance Time Enforcement

**Scenario:** Company requires 2 hours minimum advance booking

**Setup:**

- Provider: Alex (Company B)
- Service: Quick Cut (15 minutes)
- Company B Min Advance: 120 minutes
- Current Time: 14:00
- Query Date: Today

**Test:**

```bash
GET /api/availability?providerId={alex_id}&serviceId={quick_cut_id}&date=2025-10-20&companyId={companyB_id}
```

**Expected Result:**

- ❌ NO slots before 16:00 (current time + 2 hours)
- ✅ Slots from 16:00 onwards

**Validation:**

```javascript
const twoHoursFromNow = new Date()
twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2)

const earlySlots = slots.filter((s) => new Date(s.startTime) < twoHoursFromNow)
assert(earlySlots.length === 0, 'No slots within minimum advance period')
```

---

### Test 10: Maximum Advance Time Enforcement

**Scenario:** Company limits bookings to 1 week in advance

**Setup:**

- Provider: Rachel (Company A)
- Service: Styling (45 minutes)
- Company A Max Advance: 10080 minutes (1 week)
- Query Date: 2 weeks from today

**Test:**

```bash
GET /api/availability?providerId={rachel_id}&serviceId={styling_id}&date=2025-11-03&companyId={companyA_id}
```

**Expected Result:**

```json
{
  "success": true,
  "data": {
    "availableSlots": [],
    "totalSlots": 0,
    "message": "Date exceeds maximum advance booking window"
  }
}
```

---

## Multi-Tenancy Tests

### Test 11: Cross-Tenant Data Isolation

**Scenario:** Ensure Company A cannot see Company B's provider availability

**Setup:**

- Provider: John (Company A)
- Service: Haircut (Company A)
- Query with Company B's ID

**Test:**

```bash
GET /api/availability?providerId={john_companyA_id}&serviceId={haircut_companyA_id}&date=2025-10-27&companyId={companyB_id}
```

**Expected Result:**

```json
{
  "success": false,
  "error": "Service not found or inactive"
}
```

**Validation:**

- ✅ API rejects request due to companyId mismatch
- ✅ No data leakage about Company A's services/providers

---

### Test 12: Provider Not Assigned to Service

**Scenario:** Valid provider and service, but no assignment relationship

**Setup:**

- Provider: John (Company A)
- Service: Massage (Company A) - John is NOT assigned to this service
- Correct Company ID

**Test:**

```bash
GET /api/availability?providerId={john_id}&serviceId={massage_id}&date=2025-10-27&companyId={companyA_id}
```

**Expected Result:**

```json
{
  "success": false,
  "error": "Provider not assigned to this service"
}
```

---

## Concurrent Booking Tests

### Test 13: Race Condition Simulation

**Scenario:** Two clients try to book the same slot simultaneously

**Setup:**

- Provider: Sophie (Company A)
- Service: Consultation (30 minutes)
- Available slot: 10:00-10:30
- Two simultaneous booking requests

**Test Process:**

1. Client A queries availability → sees 10:00 slot
2. Client B queries availability → sees 10:00 slot
3. Client A creates booking for 10:00 ✅
4. Client B tries to create booking for 10:00 ❌

**Expected Behaviour:**

- Client A's booking succeeds
- Client B's booking fails with error: "Time slot no longer available"
- Client B should re-query availability and see updated slots

**Implementation Note:**

- Booking creation must use database transaction
- Validate availability again immediately before creating booking record

---

## Performance Tests

### Test 14: High Booking Density

**Scenario:** Provider with many bookings (stress test)

**Setup:**

- Provider: Busy Doctor (Company A)
- Service: Appointment (30 minutes)
- Working Hours: 08:00-20:00 (12 hours)
- Existing Bookings: 20 bookings throughout the day

**Test:**

```bash
GET /api/availability?providerId={busy_doctor_id}&serviceId={appointment_id}&date=2025-10-27&companyId={companyA_id}
```

**Performance Expectations:**

- ✅ Response time < 500ms
- ✅ Database queries optimized (use EXPLAIN ANALYZE)
- ✅ Correct gaps between bookings calculated

**Validation:**

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM bookings
WHERE provider_id = 'xxx'
  AND start_time >= '2025-10-27 00:00:00'
  AND start_time <= '2025-10-27 23:59:59'
  AND status IN ('PENDING', 'CONFIRMED');

-- Should use index: providerId_startTime
```

---

## Validation & Error Handling Tests

### Test 15: Invalid Input Parameters

**Test Cases:**

**a) Invalid Provider ID**

```bash
GET /api/availability?providerId=invalid&serviceId={valid}&date=2025-10-27&companyId={valid}
```

**Expected:** 400 Bad Request - "Invalid provider ID"

**b) Invalid Date Format**

```bash
GET /api/availability?providerId={valid}&serviceId={valid}&date=not-a-date&companyId={valid}
```

**Expected:** 400 Bad Request - "Invalid date format"

**c) Missing Required Parameter**

```bash
GET /api/availability?providerId={valid}&serviceId={valid}&companyId={valid}
# Missing date parameter
```

**Expected:** 400 Bad Request - "Validation failed: date is required"

**d) Service Inactive**

```bash
# Service with isActive = false
GET /api/availability?providerId={valid}&serviceId={inactive_service_id}&date=2025-10-27&companyId={valid}
```

**Expected:** 400 Bad Request - "Service not found or inactive"

---

## Integration Tests

### Test 16: End-to-End Booking Flow

**Full User Journey:**

1. **Query Services**

```bash
GET /api/services?companyId={companyA_id}&publicOnly=true
```

2. **Select Service, View Providers**

```bash
GET /api/services/{service_id}/providers
```

3. **Check Availability**

```bash
GET /api/availability?providerId={provider_id}&serviceId={service_id}&date=2025-10-27&companyId={companyA_id}
```

4. **Create Booking** (Phase 7)

```bash
POST /api/bookings
{
  "serviceId": "...",
  "providerId": "...",
  "startTime": "2025-10-27T10:00:00Z",
  "clientDetails": { ... }
}
```

5. **Verify Slot No Longer Available**

```bash
GET /api/availability?providerId={provider_id}&serviceId={service_id}&date=2025-10-27&companyId={companyA_id}
# Should NOT include 10:00 slot anymore
```

---

## Automated Test Script

### Setup Test Database

**`/scripts/seed-availability-tests.ts`**

```typescript
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/password'

const prisma = new PrismaClient()

async function seedTestData() {
  console.log('🌱 Seeding availability test data...')

  // Create Company A
  const companyA = await prisma.company.create({
    data: {
      name: 'Test Company A',
      email: 'companya@test.com',
      isActive: true,
      settings: {
        create: {
          timeZone: 'Europe/London',
          currency: 'GBP',
          bufferTime: 15,
          minAdvance: 60,
          maxAdvance: 10080,
        },
      },
    },
  })

  // Create Provider for Company A
  const providerJohn = await prisma.provider.create({
    data: {
      companyId: companyA.id,
      name: 'John Doe',
      email: 'john@companya.com',
      isActive: true,
      workingHours: {
        create: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
        ],
      },
    },
  })

  // Create Service for Company A
  const serviceHaircut = await prisma.service.create({
    data: {
      companyId: companyA.id,
      name: 'Haircut',
      duration: 30,
      price: 25.0,
      isActive: true,
      isPublic: true,
      providers: {
        create: {
          providerId: providerJohn.id,
        },
      },
    },
  })

  console.log('✅ Test data seeded successfully')
  console.log({
    companyId: companyA.id,
    providerId: providerJohn.id,
    serviceId: serviceHaircut.id,
  })
}

seedTestData()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
```

Run with:

```bash
npx tsx scripts/seed-availability-tests.ts
```

---

## Test Checklist

- [ ] **Test 1:** Basic availability (no bookings)
- [ ] **Test 2:** Availability with single booking
- [ ] **Test 3:** Multiple bookings with buffer
- [ ] **Test 4:** Zero buffer time
- [ ] **Test 5:** Split working hours (lunch break)
- [ ] **Test 6:** Service doesn't fit in remaining time
- [ ] **Test 7:** Provider doesn't work on day
- [ ] **Test 8:** Past time filtering
- [ ] **Test 9:** Min advance time enforcement
- [ ] **Test 10:** Max advance time enforcement
- [ ] **Test 11:** Cross-tenant isolation
- [ ] **Test 12:** Provider not assigned to service
- [ ] **Test 13:** Concurrent booking race condition
- [ ] **Test 14:** High booking density performance
- [ ] **Test 15:** Invalid input validation
- [ ] **Test 16:** End-to-end booking flow

---

## Success Criteria

✅ **All 16 tests pass**  
✅ **No cross-tenant data leakage**  
✅ **Response time < 500ms for typical queries**  
✅ **Race condition handling verified**  
✅ **Buffer time correctly enforced**  
✅ **Past/future time restrictions working**

---

## Known Limitations (MVP)

1. **No caching:** Every request queries the database (acceptable for MVP)
2. **Timezone handling:** Uses UTC internally, company timezone conversion needed in frontend
3. **No recurring availability:** Each day calculated independently
4. **15-minute granularity:** Fixed interval (not configurable per company)

---

## Next Phase

Once all tests pass, proceed to **Phase 7: Client Booking Flow** where we'll integrate this availability engine into the actual booking creation process.
