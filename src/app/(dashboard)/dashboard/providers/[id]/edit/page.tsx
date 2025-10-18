import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTenantContext, withTenantIsolation } from '@/lib/tenant-context'
import { ProviderForm } from '@/components/providers/ProviderForm'
import { WorkingHoursEditor } from '@/components/providers/WorkingHoursEditor'

interface EditProviderPageProps {
  params: { id: string }
}

export default async function EditProviderPage({
  params,
}: EditProviderPageProps) {
  const { companyId } = await getTenantContext()

  const provider = await prisma.provider.findUnique({
    where: { id: params.id },
    include: {
      workingHours: {
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
    },
  })

  if (!provider) {
    notFound()
  }

  // Verify tenant isolation
  withTenantIsolation(provider, companyId)

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Provider</h1>
        <p className="text-muted-foreground">
          Update provider information and working hours
        </p>
      </div>

      <ProviderForm
        initialData={{
          name: provider.name,
          email: provider.email,
          bio: provider.bio || undefined,
          imageUrl: provider.imageUrl || undefined,
        }}
        providerId={provider.id}
      />

      <WorkingHoursEditor
        providerId={provider.id}
        initialHours={provider.workingHours}
        onSave={() => {}}
      />
    </div>
  )
}
