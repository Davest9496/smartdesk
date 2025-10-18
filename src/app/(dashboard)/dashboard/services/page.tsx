import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantContext } from '@/lib/tenant-context'
import { Button } from '@/components/ui/button'
import { Plus, Edit } from '@/components/ui/icons'

export default async function ServicesPage() {
  const { companyId } = await getTenantContext()

  const [services, settings] = await Promise.all([
    prisma.service.findMany({
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
    }),
    prisma.companySettings.findUnique({
      where: { companyId },
      select: { currency: true },
    }),
  ])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: settings?.currency || 'GBP',
    }).format(price)
  }

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
            <div key={service.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.description}
                    </p>
                  )}
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {formatPrice(Number(service.price))}
                  </p>
                </div>
                <Link href={`/dashboard/services/${service.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>

              <div className="mt-4 flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>{' '}
                  <span className="font-semibold">{service.duration} mins</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Providers:</span>{' '}
                  <span className="font-semibold">
                    {service.providers.length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bookings:</span>{' '}
                  <span className="font-semibold">
                    {service._count.bookings}
                  </span>
                </div>
                <div>
                  <span
                    className={
                      service.isPublic ? 'text-green-600' : 'text-gray-400'
                    }
                  >
                    {service.isPublic ? '✓ Public' : '✗ Private'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
