import { ServiceForm } from '@/components/services/ServiceForm'

export default function NewServicePage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Service</h1>
        <p className="text-muted-foreground">
          Add a service that customers can book
        </p>
      </div>
      <ServiceForm />
    </div>
  )
}
