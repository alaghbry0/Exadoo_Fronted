// src/shared/components/common/Breadcrumbs.tsx
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-neutral-100 font-medium">
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <ChevronLeft className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )
      })}
    </nav>
  )
}
