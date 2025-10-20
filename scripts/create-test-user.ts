import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function main() {
  console.log('🔄 Testing database connection...')

  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to smartdesk_dev\n')

    // Check if test user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'test@test.com' },
      include: { company: true },
    })

    if (existingUser) {
      console.log('⚠️  Test user already exists!\n')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email:    test@test.com')
      console.log('🔑 Password: Asdf1234@')
      console.log('🏢 Company: ', existingUser.company.name)
      console.log('👤 Role:     ADMIN')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      return
    }

    console.log('🏢 Creating test company...')
    const company = await prisma.company.create({
      data: {
        name: 'Test Company Ltd',
        email: 'company@test.com',
        isActive: true,
      },
    })
    console.log(`✅ Company created: ${company.id}`)

    console.log('⚙️  Creating company settings...')
    await prisma.companySettings.create({
      data: {
        companyId: company.id,
        timeZone: 'Europe/London',
        currency: 'GBP',
        dateFormat: 'dd/MM/yyyy',
        brandColour: '#000000',
        bufferTime: 0,
        minAdvance: 60,
        maxAdvance: 10080, // 1 week in minutes
      },
    })
    console.log('✅ Settings created')

    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('Asdf1234@', 12)
    await prisma.user.create({
      data: {
        companyId: company.id,
        email: 'test@test.com',
        password: hashedPassword,
        name: 'Test Admin',
        role: 'ADMIN',
        isActive: true,
      },
    })
    console.log('✅ Admin user created\n')

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    test@test.com')
    console.log('🔑 Password: Asdf1234@')
    console.log('🏢 Company:  Test Company Ltd')
    console.log('👤 Role:     ADMIN')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('✨ Test data created successfully!')
    console.log(
      '🚀 You can now sign in at: http://localhost:3000/auth/signin\n'
    )
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
