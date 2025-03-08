// components/InviteAlert.tsx
'use client';
import { sanitizeHtml } from '../utils/safeHtml';
import React, { useEffect, useState } from 'react';
import { Alert } from 'flowbite-react';

const InviteAlert: React.FC = () => {
  const [subscriptionData, setSubscriptionData] = useState<{
    invite_link: string;
    formatted_message: string;
    timestamp: number;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      setSubscriptionData(event.detail);
      setVisible(true);
      setTimeout(() => setVisible(false), 10000); // إخفاء بعد 10 ثواني
    };

    // استمع للحدث المخصص مع بيانات التفاصيل
    window.addEventListener('subscription_update', handleStorageUpdate as EventListener);

    return () => {
      window.removeEventListener('subscription_update', handleStorageUpdate as EventListener);
    };
  }, []);

  if (!subscriptionData || !visible) return null;

  return (

  <Alert
    color="success"
    onDismiss={() => setVisible(false)}
    className="fixed top-16 right-4 z-50 animate-fade-in"
  >
    <div className="flex items-center flex-col gap-2">
      {/* عرض الرسالة الأصلية */}
      <span dangerouslySetInnerHTML={sanitizeHtml(subscriptionData.formatted_message)} />

      {/* زر فتح القناة بدون عرض الرابط */}
      <button
        onClick={() => window.open(subscriptionData.invite_link, '_blank')}
        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow hover:bg-blue-800 transition"
      >
        ⏩ انقر هنا للانضمام إلى القناة
      </button>
    </div>
  </Alert>
);

};

export default InviteAlert;