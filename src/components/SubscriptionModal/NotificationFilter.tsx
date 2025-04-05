// components/NotificationFilter.tsx
'use client'
import { Button } from 'flowbite-react'
import { useRouter, useSearchParams } from 'next/navigation'

type FilterType = 'all' | 'unread'

const NotificationFilter = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = (searchParams.get('filter') || 'all') as FilterType

  const handleFilterChange = (filter: FilterType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', filter)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 mb-4">
      <Button
        color={currentFilter === 'all' ? 'blue' : 'gray'}
        onClick={() => handleFilterChange('all')}
        size="sm"
      >
        الكل
      </Button>
      <Button
        color={currentFilter === 'unread' ? 'blue' : 'gray'}
        onClick={() => handleFilterChange('unread')}
        size="sm"
      >
        غير المقروءة
      </Button>
    </div>
  )
}

export default NotificationFilter