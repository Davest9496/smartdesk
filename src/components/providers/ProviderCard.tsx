import { Provider } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Clock, Edit, Trash2 } from '@/components/ui/icons'

interface ProviderCardProps {
  provider: Provider & {
    services: Array<{
      service: { id: string; name: string }
    }>
    workingHours: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
    }>
    _count: { bookings: number }
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ProviderCard({
  provider,
  onEdit,
  onDelete,
}: ProviderCardProps) {
  // Group working hours by day
  const workingDays = provider.workingHours.reduce(
    (acc, wh) => {
      if (!acc[wh.dayOfWeek]) {
        acc[wh.dayOfWeek] = []
      }
      acc[wh.dayOfWeek].push(`${wh.startTime}-${wh.endTime}`)
      return acc
    },
    {} as Record<number, string[]>
  )

  return (
    <Card className={!provider.isActive ? 'opacity-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {provider.name}
              {!provider.isActive && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Inactive
                </span>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Mail className="h-3 w-3" />
              {provider.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(provider.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(provider.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {provider.bio && (
          <p className="text-sm text-muted-foreground mb-4">{provider.bio}</p>
        )}

        {/* Services */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Services</h4>
          {provider.services.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {provider.services.map((sp) => (
                <span
                  key={sp.service.id}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {sp.service.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No services assigned
            </p>
          )}
        </div>

        {/* Working Hours */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Working Hours
          </h4>
          {Object.keys(workingDays).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(workingDays)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, hours]) => (
                  <div key={day} className="text-xs">
                    <span className="font-medium">{DAYS[Number(day)]}:</span>{' '}
                    {hours.join(', ')}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No working hours set
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Total bookings:{' '}
            <span className="font-semibold">{provider._count.bookings}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
