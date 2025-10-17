import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { signupSchema } from '@/lib/validations/auth'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = signupSchema.parse(body)
    const { companyName, companyEmail, adminName, adminEmail, password } =
      validatedData

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail },
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this email already exists' },
        { status: 400 }
      )
    }

    // Check if admin email already exists in this company
    const existingUser = await prisma.user.findFirst({
      where: { email: adminEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create company, admin user, and settings in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          isActive: true,
        },
      })

      // 2. Create admin user
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      })

      // 3. Create company settings with defaults
      const settings = await tx.companySettings.create({
        data: {
          companyId: company.id,
          timeZone: 'Europe/London',
          currency: 'GBP',
          dateFormat: 'dd/MM/yyyy',
          brandColour: '#000000',
          bufferTime: 0,
          minAdvance: 60,
          maxAdvance: 10080, // 1 week
        },
      })

      return { company, user, settings }
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          companyId: result.company.id,
          message: 'Company created successfully. Please sign in.',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
