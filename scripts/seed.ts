import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

async function seed() {
  try {
    console.log('🌱 Seeding database...\n')

    // Create Company 1
    const company1 = await prisma.company.create({
      data: {
        name: 'Acme Salon',
        email: 'admin@acmesalon.com',
        settings: {
          create: {
            timeZone: 'Europe/London',
            currency: 'GBP',
            brandColour: '#3B82F6',
          },
        },
      },
    })
    console.log('✅ Created company:', company1.name)

    // Create Admin User for Company 1
    const admin1 = await prisma.user.create({
      data: {
        companyId: company1.id,
        email: 'admin@acmesalon.com',
        name: 'Alice Admin',
        password: await hashPassword('Admin123!'),
        role: 'ADMIN',
      },
    })
    console.log('✅ Created admin:', admin1.email)

    // Create Provider for Company 1
    const provider1 = await prisma.provider.create({
      data: {
        companyId: company1.id,
        name: 'Bob Barber',
        email: 'bob@acmesalon.com',
        bio: 'Expert stylist with 10 years experience',
      },
    })
    console.log('✅ Created provider:', provider1.name)

    // Create Service for Company 1
    const service1 = await prisma.service.create({
      data: {
        companyId: company1.id,
        name: 'Haircut',
        description: 'Professional haircut and styling',
        duration: 30,
        price: 25.0,
        isPublic: true,
      },
    })
    console.log('✅ Created service:', service1.name)

    // Assign Provider to Service
    await prisma.serviceProvider.create({
      data: {
        serviceId: service1.id,
        providerId: provider1.id,
      },
    })
    console.log('✅ Assigned provider to service')

    // Create Working Hours
    await prisma.workingHours.createMany({
      data: [
        {
          providerId: provider1.id,
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
        },
        {
          providerId: provider1.id,
          dayOfWeek: 2, // Tuesday
          startTime: '09:00',
          endTime: '17:00',
        },
        {
          providerId: provider1.id,
          dayOfWeek: 3, // Wednesday
          startTime: '09:00',
          endTime: '17:00',
        },
      ],
    })
    console.log('✅ Created working hours')

    // Create Company 2 (for multi-tenancy testing)
    const company2 = await prisma.company.create({
      data: {
        name: 'Beauty Studio',
        email: 'admin@beautystudio.com',
        settings: {
          create: {
            timeZone: 'Europe/London',
            currency: 'GBP',
            brandColour: '#EC4899',
          },
        },
      },
    })
    console.log('✅ Created company:', company2.name)

    // Create Admin for Company 2
    const admin2 = await prisma.user.create({
      data: {
        companyId: company2.id,
        email: 'admin@beautystudio.com',
        name: 'Carol Manager',
        password: await hashPassword('Admin123!'),
        role: 'ADMIN',
      },
    })
    console.log('✅ Created admin:', admin2.email)

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📝 Test Credentials:')
    console.log('Company 1: admin@acmesalon.com / Admin123!')
    console.log('Company 2: admin@beautystudio.com / Admin123!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
