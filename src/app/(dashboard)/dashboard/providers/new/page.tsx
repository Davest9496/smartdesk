import { ProviderForm } from '@/components/providers/ProviderForm'

export default function NewProviderPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Provider</h1>
        <p className="text-muted-foreground">
          Create a new team member who can provide services
        </p>
      </div>
      <ProviderForm />
    </div>
  )
}
