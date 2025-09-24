'use client'

import Link from 'next/link'
import { GraduationCap, TrendingUp, Waves, Star, ArrowLeftCircle, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const highlights = [
  {
    title: 'Exaado Forex',
    description: 'Trade crypto with precision insights and expert-backed strategies.',
    icon: TrendingUp,
    accent: 'from-sky-400/30 to-sky-600/40',
    textColor: 'text-sky-900',
  },
  {
    title: 'Exaado Signals',
    description: 'Get real-time crypto signals to boost your trading performance.',
    icon: Waves,
    accent: 'from-rose-400/30 to-rose-600/40',
    textColor: 'text-rose-900',
    href: '/shop/signals',
  },
  {
    title: 'Exaado Buy Indicators',
    description: "Power your crypto trading with advanced Gann-based indicator tools.",
    icon: Star,
    accent: 'from-amber-300/30 to-amber-500/40',
    textColor: 'text-amber-900',
  },
]

const subscriptionInfo = {
  plan: "You're subscribed to:",
  name: 'Lifetime Subscription',
  price: '$200',
  oldPrice: '$350',
}

const ShopLanding = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f3f7ff] text-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <section className="pt-20 pb-8">
          <Card className="relative overflow-hidden border-none shadow-none bg-gradient-to-br from-[#fef4ff] via-white to-[#f1f5ff]">
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-primary/10" />
            <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-primary/5" />
            <CardContent className="relative z-10 p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Exaado Academy</h1>
                  <p className="text-sm text-gray-600">Unlock Pro Trading Skills with Exaado Academy</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <Badge className="bg-primary/10 text-primary border-none px-3 py-1">Exaado Academy</Badge>
                <Badge variant="secondary" className="flex items-center gap-1 bg-emerald-100 text-emerald-700 border-none px-3 py-1">
                  <Shield className="h-3.5 w-3.5" />
                  Trusted Experts
                </Badge>
              </div>
              <div className="text-sm leading-relaxed text-gray-700 max-w-xl">
                استكشف مسارات تعليمية متكاملة تبدأ من الأساسيات وحتى استراتيجيات التداول الاحترافية، مع دعم مباشر من مدربي إكسادو.
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90">
                  إبدأ رحلتك الآن
                  <ArrowLeftCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  اكتشف البرامج التعليمية
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          {highlights.map((highlight) => {
            const content = (
              <Card
                key={highlight.title}
                className={`group relative overflow-hidden border-none bg-white shadow hover:shadow-lg transition-shadow duration-300`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${highlight.accent}`} />
                <CardContent className="relative z-10 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ${highlight.textColor}`}>
                      <highlight.icon className="h-7 w-7" />
                    </div>
                    {highlight.href && (
                      <Badge className="bg-rose-100 text-rose-700 border-none px-3 py-1">Tap to explore</Badge>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{highlight.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {highlight.description}
                  </p>
                </CardContent>
              </Card>
            )

            return highlight.href ? (
              <Link key={highlight.title} href={highlight.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl">
                {content}
              </Link>
            ) : (
              content
            )
          })}
        </section>

        <section className="mt-6">
          <Card className="border-none bg-white shadow-sm">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-gray-500">{subscriptionInfo.plan}</p>
                <p className="text-lg font-semibold text-gray-900">{subscriptionInfo.name}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-primary">{subscriptionInfo.price}</div>
                <div className="text-sm text-gray-400 line-through">{subscriptionInfo.oldPrice}</div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default ShopLanding
