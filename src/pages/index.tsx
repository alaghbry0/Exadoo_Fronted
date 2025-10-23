'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TonConnectButton, TonConnectUIProvider } from '@tonconnect/ui-react'
import { Activity, BadgePercent, MessagesSquare, ArrowLeft, Target } from 'lucide-react'
import PageLayout from '@/shared/components/layout/PageLayout'
// استيراد المكونات الرئيسية من نظام التصميم الخاص بك
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card' // استيراد مكونات Card الفرعية للتنظيم


const Home: React.FC = () => {
  const featuresData = [
    {
      icon: <Activity className="w-8 h-8 text-white" />,
      title: "تحليلات مباشرة للأسواق",
      description: "تحليلات يومية وأسبوعية لأهم العملات الرقمية وأزواج سوق الفوركس."
    },
    {
      icon: <BadgePercent className="w-8 h-8 text-white" />,
      title: "توصيات تداول رابحة",
      description: "توصيات مدروسة المخاطرة وذات نسب نجاح عالية تضمن لك أرباحاً في نهاية كل شهر."
    },
    {
      icon: <MessagesSquare className="w-8 h-8 text-white" />,
      title: "خدمة عملاء 24/7",
      description: "دعم فوري وسريع للرد على أي استفسار أو لحل أي مشكلة على مدار اليوم."
    }
  ]

  return (
    // تحسين: تم تغيير تصميم زر الاتصال ليصبح أكثر بروزًا واحترافية
    <TonConnectUIProvider manifestUrl="https://exadooo-plum.vercel.app/tonconnect-manifest.json">
      <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 font-arabic">
        <PageLayout maxWidth="2xl">
          {/* Hero Section */}
          <section aria-label="القسم الرئيسي" className="relative pt-20 pb-24 text-center">
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary-50/50 to-transparent rounded-3xl mx-4"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 flex justify-center">
                 <TonConnectButton className="!px-6 !py-2 !text-sm !rounded-xl" />
              </motion.div>


              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              >
                <span className="block text-primary-600">تداول بذكاء</span>
                مع توصيات خبرائنا في إكسادوا
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto"
              >
                احصل على وصول فوري إلى تحليلات مباشرة وتوصيات تداول بنسب نجاح عالية!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {/* تم التعديل: استخدام مكون Button مع asChild للحفاظ على وظيفة Link */}
                <Button asChild size="lg" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1">
                  <Link href="/shop">
                    اشترك معنا الآن
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-6">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">كل ما تحتاجه للربح بثقة</h2>
              <p className="text-gray-600 text-lg">نقدم لك الأدوات والتحليلات اللازمة لاتخاذ قرارات تداول مدروسة.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuresData.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * (index + 1) }}
                >
                  {/* تم التعديل: استخدام مكون Card لتغليف المحتوى بشكل متسق */}
                  <Card className="h-full border-gray-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-white/70 backdrop-blur-sm rounded-2xl text-center">
                    <CardHeader className="flex flex-col items-center pt-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16">
            <div className="relative container mx-auto">
              <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.07%22%3E%3Cpath%20d%3D%22m36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                <div className="relative z-10">
                  <Target className="w-16 h-16 mx-auto mb-6 text-white/80" />
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    انضم إلينا اليوم وحقق دخل إضافي من التداول!
                  </h2>
                  <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
                    ابدأ رحلتك نحو دخل إضافي من التداول مع خطط اشتراك مرنة ومناسبة للجميع.
                  </p>
                  {/* تم التعديل: استخدام مكون Button مرة أخرى */}
                  <Button asChild size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <Link href="/shop">
                      استعراض خطط الاشتراك
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </PageLayout>
      </div>

      {/* تحسين: استخدام CSS global لضمان استدارة زر المحفظة بشكل مثالي */}
      <style jsx global>{`
        .ton-connect-button {
          background: rgba(0, 132, 255, 0.1) !important;
          color: #0084ff !important;
          border: 1px solid rgba(0, 132, 255, 0.3) !important;
          border-radius: 0.75rem !important;
          padding: 0.5rem 1.25rem !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        .ton-connect-button:hover {
          background: rgba(0, 132, 255, 0.15) !important;
          border-color: #0084ff !important;
        }
      `}</style>
    </TonConnectUIProvider>
  )
}
export default Home

