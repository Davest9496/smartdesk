import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTenantContext } from '@/lib/tenant-context'
import { successResponse, errorResponse } from '@/lib/api-response'
import { companySettingsUpdateSchema } from '@/lib/validations/company'

/**
 * GET /api/company/settings
 * Retrieve company settings for authenticated tenant
 */
export async function GET() {
  try {
    const { companyId } = await getTenantContext()

    const settings = await prisma.companySettings.findUnique({
      where: { companyId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            subdomain: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    })

    if (!settings) {
      return errorResponse('Company settings not found', 404)
    }

    return successResponse(settings)
  } catch (error) {
    console.error('Error fetching company settings:', error)

    if (error instanceof Error && error.message.includes('Unauthorised')) {
      return errorResponse('Unauthorised', 401)
    }

    return errorResponse('Failed to fetch company settings', 500)
  }
}

/**
 * PATCH /api/company/settings
 * Update company settings (Admin only)
 */
export async function PATCH(request: Request) {
  try {
    const { companyId, role } = await getTenantContext()

    // Only admins can update company settings
    if (role !== 'ADMIN') {
      return errorResponse('Forbidden: Admin access required', 403)
    }

    const body = await request.json()
    const validatedData = companySettingsUpdateSchema.parse(body)

    // Update settings
    const updatedSettings = await prisma.companySettings.update({
      where: { companyId },
      data: validatedData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return successResponse(updatedSettings)
  } catch (error) {
    console.error('Error updating company settings:', error)

    if (error instanceof Error) {
      if (error.message.includes('Unauthorised')) {
        return errorResponse('Unauthorised', 401)
      }
      if (error.message.includes('Forbidden')) {
        return errorResponse('Forbidden', 403)
      }
    }

    // Zod validation errors
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

    return errorResponse('Failed to update company settings', 500)
  }
}
