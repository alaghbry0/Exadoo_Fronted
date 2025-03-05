// components/Navbar.tsx
'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar as FlowbiteNavbar, Button } from 'flowbite-react'
import PaymentSuccessModal from '../components/PaymentSuccessModal';

const Navbar: React.FC = () => {
  const [storedSubscription, setStoredSubscription] = useState<{ invite_link: string; message: string; timestamp: number } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // قراءة بيانات الاشتراك من Local Storage عند تحميل المكون
  useEffect(() => {
    const data = localStorage.getItem('subscriptionData');
    if (data) {
      const parsed = JSON.parse(data);
      // تحقق من صلاحية البيانات (مثلاً إذا لم تمر أكثر من 3 أيام)
      const now = new Date().getTime();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (now - parsed.timestamp < threeDays) {
        setStoredSubscription(parsed);
      } else {
        localStorage.removeItem('subscriptionData');
      }
    }
  }, []);

  return (
    <FlowbiteNavbar className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-1.5">
            <Image
              src="/logo.png"
              alt="Exaado Logo"
              width={48}
              height={48}
              className="p-1.5"
            />
            <span className="text-xl font-bold text-gray-900">Exaado</span>
          </Link>
          {/* زر الدعوة: يظهر إذا كانت هناك بيانات اشتراك محفوظة */}
          {storedSubscription && (
            <Button color="primary" onClick={() => setShowModal(true)}>
              عرض الدعوة
            </Button>
          )}
        </div>
      </div>
      {/* عرض النافذة المنبثقة عند النقر */}
      {showModal && storedSubscription && (
        <PaymentSuccessModal
          inviteLink={storedSubscription.invite_link}
          message={storedSubscription.message}
          onClose={() => setShowModal(false)}
        />
      )}
    </FlowbiteNavbar>
  )
}

export default Navbar;
