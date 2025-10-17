import { auth } from '@/lib/auth'

/**
 * Get authenticated user's tenant context
 * Use this in API routes and server components to ensure multi-tenancy
 *
 * @throws Error if no session or companyId
 * @returns Tenant context with userId, companyId, and role
 */
export async function getTenantContext() {
  const session = await auth()

  if (!session || !session.user || !session.user.companyId) {
    throw new Error('Unauthorised: No tenant context')
  }

  return {
    userId: session.user.id,
    companyId: session.user.companyId,
    role: session.user.role,
    email: session.user.email,
    name: session.user.name,
  }
}

/**
 * Verify that data belongs to the current tenant
 * Use this to prevent cross-tenant data access
 *
 * @param data - Data object with companyId
 * @param tenantCompanyId - Expected companyId from tenant context
 * @throws Error if companyIds don't match
 * @returns Original data if validation passes
 */
export function withTenantIsolation<T extends { companyId: string }>(
  data: T,
  tenantCompanyId: string
): T {
  if (data.companyId !== tenantCompanyId) {
    throw new Error('Forbidden: Cross-tenant access denied')
  }
  return data
}

/**
 * Verify that multiple records belong to the current tenant
 *
 * @param dataArray - Array of data objects with companyId
 * @param tenantCompanyId - Expected companyId from tenant context
 * @throws Error if any record doesn't match
 * @returns Original array if validation passes
 */
export function withTenantIsolationMany<T extends { companyId: string }>(
  dataArray: T[],
  tenantCompanyId: string
): T[] {
  const invalidRecord = dataArray.find(
    (item) => item.companyId !== tenantCompanyId
  )
  if (invalidRecord) {
    throw new Error('Forbidden: Cross-tenant access denied')
  }
  return dataArray
}
