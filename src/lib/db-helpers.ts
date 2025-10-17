/**
 * Adds companyId filter to Prisma where clause
 * Prevents accidental cross-tenant queries
 */
export function withTenantFilter<T extends { companyId?: string }>(
  where: T,
  companyId: string
): T & { companyId: string } {
  return {
    ...where,
    companyId,
  }
}

/**
 * Validates that a resource belongs to the correct tenant
 */
export function validateTenantAccess(
  resourceCompanyId: string,
  requestCompanyId: string
): void {
  if (resourceCompanyId !== requestCompanyId) {
    throw new Error('Forbidden: Cross-tenant access denied')
  }
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export function getPaginationSkipTake(params: PaginationParams) {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    page,
    pageSize,
  }
}

export function formatPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  }
}
