'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GraduationCap, ArrowLeft } from 'lucide-react'

type Props = {
  courses?: number
  tracks?: number
  freeCount?: number
}

export default function AcademyHeroCard({
  courses = 24,
  tracks = 6,
  freeCount = 3,
}: Props) {
  return (
    <Link href="/academy" className="group relative block" aria-label="الدخول إلى Exaado Academy">
      <Card className="relative overflow-hidden rounded-3xl border-0 shadow-subtle transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
        {/* خلفيات */}
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.12] dark:opacity-[0.08]" />
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        <span className="card-shine" aria-hidden />

        <CardContent className="relative p-6 md:p-8">
          <div className="flex items-start gap-4">
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

              {/* CTA */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                
                <span className="text-white/90">
                  
                  <span className="underline underline-offset-4 hover:text-white">
                    استعراض جميع الدورات
                  </span>
                </span>
              </div>
            </div>

            {/* أيقونة داخل Orb زجاجي */}
            <motion.div
              initial={{ y: 8, rotate: -2 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="hidden sm:flex items-center justify-center"
            >
              <div className="relative">
                <div className="relative grid place-items-center h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white/20 backdrop-blur-md ring-2 ring-white/30">
                  <GraduationCap className="h-8 w-8 md:h-9 md:w-9 text-white" />
                  <div className="absolute -inset-1 rounded-2xl animate-pulse-slow ring-1 ring-white/10" />
                </div>
                <div className="absolute -right-2 -bottom-2 text-[10px] md:text-xs bg-white/30 text-white/95 px-2 py-0.5 rounded-full">
                  ACADEMY
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
