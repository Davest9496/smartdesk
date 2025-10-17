import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext } from '@/lib/tenant-context'
import { successResponse, errorResponse } from '@/lib/api-response'
import { companyProfileUpdateSchema } from '@/lib/validations/company'

/**
 * GET /api/company/profile
 * Retrieve company profile information
 */
export async function GET() {
  try {
    const { companyId } = await getTenantContext()

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        subdomain: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!company) {
      return errorResponse('Company not found', 404)
    }

    return successResponse(company)
  } catch (error) {
    console.error('Error fetching company profile:', error)

    if (error instanceof Error && error.message.includes('Unauthorised')) {
      return errorResponse('Unauthorised', 401)
    }

    return errorResponse('Failed to fetch company profile', 500)
  }
}

/**
 * PATCH /api/company/profile
 * Update company profile (Admin only)
 */
export async function PATCH(request: Request) {
  try {
    const { companyId, role } = await getTenantContext()

    if (role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin access required', 403)
    }

    const body = await request.json()
    const validatedData = companyProfileUpdateSchema.parse(body)

    // Check if email is already taken by another company
    if (validatedData.email) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          email: validatedData.email,
          id: { not: companyId },
        },
      })

      if (existingCompany) {
        return errorResponse('Email already in use by another company', 400)
      }
    }

    // Check if subdomain is already taken
    if (validatedData.subdomain) {
      const existingSubdomain = await prisma.company.findFirst({
        where: {
          subdomain: validatedData.subdomain,
          id: { not: companyId },
        },
      })

      if (existingSubdomain) {
        return errorResponse('Subdomain already in use', 400)
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        subdomain: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return successResponse(updatedCompany)
  } catch (error) {
    console.error('Error updating company profile:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorised')) {
        return errorResponse('Unauthorised', 401)
      }
      if (error.message.includes('Forbidden')) {
        return errorResponse('Forbidden', 403)
      }
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return errorResponse('Failed to update company profile', 500)
  }
}
