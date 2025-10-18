import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]
  const companyId = process.argv[4]

  if (!email || !password || !companyId) {
    console.error(
      'Usage: tsx scripts/create-admin.ts <email> <password> <companyId>'
    )
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      companyId,
      isActive: true,
    },
  })

  console.log('✅ Admin user created:', {
    id: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
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
