'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteServiceAction(serviceId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/services/${serviceId}`,
    {
      method: 'DELETE',
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete service')
  }

  revalidatePath('/dashboard/services')
  redirect('/dashboard/services')
}
