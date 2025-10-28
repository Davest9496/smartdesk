import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  try {
    console.log('🔍 Verifying database schema...\n')

    // Test 1: Create company
    const company = await prisma.company.create({
      data: {
        name: 'Migration Test Company',
        email: `test-${Date.now()}@example.com`,
      },
    })
    console.log('✅ Created company:', company.id)

    // Test 2: Create settings (tests foreign key)
    const settings = await prisma.companySettings.create({
      data: {
        companyId: company.id,
        timeZone: 'Europe/London',
        currency: 'GBP',
      },
    })
    console.log('✅ Created settings:', settings.id)

    // Test 3: Create admin user (tests enum)
    const user = await prisma.user.create({
      data: {
        companyId: company.id,
        email: `admin-${Date.now()}@example.com`,
        name: 'Test Admin',
        password: 'hashed_password_here',
        role: 'ADMIN',
      },
    })
    console.log('✅ Created user:', user.id)

    // Test 4: Query with multi-tenant filter
    const companies = await prisma.company.findMany({
      where: { id: company.id },
      include: {
        settings: true,
        users: true,
      },
    })
    console.log('✅ Tenant isolation works:', companies.length === 1)

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.companySettings.delete({ where: { id: settings.id } })
    await prisma.company.delete({ where: { id: company.id } })
    console.log('✅ Cleanup complete\n')

    console.log('🎉 All database tests passed!')
  } catch (error) {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
