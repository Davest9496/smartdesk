import { prisma } from '../src/lib/prisma'

/**
 * Generate booking link for a company
 *
 * Usage: npx tsx scripts/get-booking-link.ts
 */
async function generateBookingLink() {
  try {
    // Get the first active company
    const company = await prisma.company.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!company) {
      console.log('❌ No active companies found')
      console.log('💡 Create a company first by signing up at /auth/signup')
      return
    }

    const bookingUrl = `http://localhost:3000/book?companyId=${company.id}`

    console.log('\n✅ Booking Link Generated!\n')
    console.log('Company:', company.name)
    console.log('Email:', company.email)
    console.log('\n🔗 Public Booking URL:')
    console.log(bookingUrl)
    console.log('\n📋 Share this link with your clients to accept bookings\n')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateBookingLink()
