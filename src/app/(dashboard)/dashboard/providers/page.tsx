import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getTenantContext } from '@/lib/tenant-context'
import { Button } from '@/components/ui/button'
import { Plus } from '@/components/ui/icons'

export default async function ProvidersPage() {
  const { companyId } = await getTenantContext()

  const providers = await prisma.provider.findMany({
    where: { companyId },
    include: {
      services: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      workingHours: {
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Providers</h1>
          <p className="text-muted-foreground">
            Manage your team members and their availability
          </p>
        </div>
        <Link href="/dashboard/providers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </Link>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No providers yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first team member
          </p>
          <Link href="/dashboard/providers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Provider
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => (
            <div key={provider.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{provider.name}</h3>
              <p className="text-sm text-muted-foreground">{provider.email}</p>
              <p className="text-xs mt-2">
                Services: {provider.services.length} | Bookings:{' '}
                {provider._count.bookings}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
