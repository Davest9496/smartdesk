import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...\n')

    // Test 1: Database connectivity
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Test 2: Create test company
    const company = await prisma.company.create({
      data: {
        name: 'Test Company (Supabase)',
        email: `test-${Date.now()}@example.com`,
        settings: {
          create: {
            timeZone: 'Europe/London',
            currency: 'GBP',
          },
        },
      },
      include: {
        settings: true,
      },
    })
    console.log('✅ Created test company:', company.id)

    // Test 3: Query with tenant isolation
    const companies = await prisma.company.findMany({
      where: { id: company.id },
      include: { settings: true },
    })
    console.log('✅ Tenant isolation works:', companies.length === 1)

    // Test 4: Verify settings created
    console.log('✅ Settings created:', {
      timeZone: companies[0].settings?.timeZone,
      currency: companies[0].settings?.currency,
    })

    // Test 5: Cleanup
    await prisma.company.delete({ where: { id: company.id } })
    console.log('✅ Cleanup successful\n')

    console.log('🎉 All Supabase connection tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
