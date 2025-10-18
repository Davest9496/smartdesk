import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const companies = await prisma.company.findMany({
    include: {
      users: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
      _count: {
        select: {
          providers: true,
          services: true,
          bookings: true,
        },
      },
    },
  })

  if (companies.length === 0) {
    console.log('❌ No companies found in database')
    console.log(
      '💡 You need to sign up first at: http://localhost:3000/auth/signup'
    )
    return
  }

  console.log('📋 Companies in database:\n')

  companies.forEach((company, index) => {
    console.log(`${index + 1}. ${company.name}`)
    console.log(`   ID: ${company.id}`)
    console.log(`   Email: ${company.email}`)
    console.log(`   Created: ${company.createdAt.toLocaleDateString()}`)
    console.log(`   Users: ${company.users.length}`)
    console.log(`   Providers: ${company._count.providers}`)
    console.log(`   Services: ${company._count.services}`)

    if (company.users.length > 0) {
      console.log(`   \n   👥 Users:`)
      company.users.forEach((user) => {
        console.log(`      - ${user.name} (${user.email}) - ${user.role}`)
      })
    }
    console.log('')
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
