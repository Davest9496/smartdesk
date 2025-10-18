import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantContext } from '@/lib/tenant-context'
import { Button } from '@/components/ui/button'
import { Plus } from '@/components/ui/icons'

export default async function ServicesPage() {
  const { companyId } = await getTenantContext()

  const services = await prisma.service.findMany({
    where: { companyId },
    include: {
      providers: {
        include: {
          provider: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage the services you offer to customers
          </p>
        </div>
        <Link href="/dashboard/services/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No services yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first service to start accepting bookings
          </p>
          <Link href="/dashboard/services/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Service
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-muted-foreground">
                {service.duration} mins | £{service.price.toString()}
              </p>
              <p className="text-xs mt-2">
                Providers: {service.providers.length} | Bookings:{' '}
                {service._count.bookings}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
