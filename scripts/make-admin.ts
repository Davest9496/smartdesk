import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/make-admin.ts <user-email>')
    console.log('\nExample: npx tsx scripts/make-admin.ts user@example.com')
    process.exit(1)
  }

  // Find user by email
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
    include: { company: true },
  })

  if (!user) {
    console.error(`❌ User not found: ${email}`)
    console.log('\n💡 Run this to see all users:')
    console.log('   npx tsx scripts/list-companies.ts')
    process.exit(1)
  }

  // Update to ADMIN
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  })

  console.log('✅ User updated to ADMIN:')
  console.log(`   Name: ${updated.name}`)
  console.log(`   Email: ${updated.email}`)
  console.log(`   Role: ${updated.role}`)
  console.log(`   Company: ${user.company.name}`)
  console.log(
    `\n🔐 You can now sign in as admin at: http://localhost:3000/auth/signin`
  )
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
