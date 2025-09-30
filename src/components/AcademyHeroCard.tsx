// src/components/AcademyHeroCard.tsx
'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Props = {
  courses?: number
  tracks?: number
  freeCount?: number
}

export default function AcademyHeroCard({ courses = 24, tracks = 6, freeCount = 3 }: Props) {
  return (
    <div className="group relative">
      <Card className="relative overflow-hidden rounded-3xl border-0 shadow-subtle transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        {/* خلفيات */}
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.12] dark:opacity-[0.08]" />
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        <span className="card-shine" aria-hidden />

        <CardContent className="relative p-6 md:p-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Exaado Academy
                </h1>
                <Badge className="bg-white/20 text-white border-none">مُحدّث</Badge>
              </div>

              <p className="mt-2 text-white/90 max-w-2xl">
                برامج عملية، مسارات واضحة، وشهادات مشاركة—طريقك للاحتراف يبدأ من هنا.
              </p>
            </div>

            {/* --- UPDATED: CTA Button --- */}
            <div className="mt-6 md:mt-0 md:mr-6 shrink-0">
              <Button
                size="lg"
                className="w-full md:w-auto bg-white text-primary-700 hover:bg-white/90 rounded-xl font-bold shadow-lg transition-transform duration-200 group-hover:scale-105"
                asChild
              >
                <Link href="/academy">
                  استكشف الأكاديمية
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}