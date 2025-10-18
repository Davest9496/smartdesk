import { Service } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, Edit, Trash2 } from '@/components/ui/icons'

interface ServiceCardProps {
  service: Service & {
    providers: Array<{
      provider: { id: string; name: string }
    }>
    _count: { bookings: number }
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  currency?: string
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  currency = 'GBP',
}: ServiceCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(Number(price))
  }

  return (
    <Card className={!service.isActive ? 'opacity-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {service.name}
              {!service.isActive && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Inactive
                </span>
              )}
              {!service.isPublic && (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Private
                </span>
              )}
            </CardTitle>
            <p className="text-lg font-semibold text-blue-600 mt-1">
              {formatPrice(Number(service.price))}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(service.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(service.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {service.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {service.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {service.duration} mins
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {service.providers.length} provider
            {service.providers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Providers */}
        {service.providers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {service.providers.map((sp) => (
              <span
                key={sp.provider.id}
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
              >
                {sp.provider.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No providers assigned</p>
        )}

        {/* Stats */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Total bookings:{' '}
            <span className="font-semibold">{service._count.bookings}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
