import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTenantContext, withTenantIsolation } from '@/lib/tenant-context'
import { ServiceForm } from '@/components/services/ServiceForm'
import { ProviderAssignment } from '@/components/services/ProviderAssignment'

interface EditServicePageProps {
  params: Promise<{ id: string }> // Changed: params is now a Promise
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const { id } = await params // Added: await params
  const { companyId } = await getTenantContext()

  const service = await prisma.service.findUnique({
    where: { id }, // Changed: use awaited id
    include: {
      providers: {
        select: {
          providerId: true,
        },
      },
    },
  })

  if (!service) {
    notFound()
  }

  withTenantIsolation(service, companyId)

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground">
          Update service details and assign providers
        </p>
      </div>

      <ServiceForm
        initialData={{
          name: service.name,
          description: service.description || undefined,
          duration: service.duration,
          price: Number(service.price),
          isPublic: service.isPublic,
          sortOrder: service.sortOrder,
        }}
        serviceId={service.id}
      />

      <ProviderAssignment
        serviceId={service.id}
        currentProviderIds={service.providers.map((sp) => sp.providerId)}
      />
    </div>
  )
}
