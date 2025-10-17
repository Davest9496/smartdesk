export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: Array<{
    field: string
    message: string
  }>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface TenantContext {
  userId: string
  companyId: string
  role: 'ADMIN' | 'PROVIDER'
  email: string
  name: string
}
