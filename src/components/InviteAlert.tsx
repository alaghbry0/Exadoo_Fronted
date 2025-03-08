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
      // إزالة الإخفاء التلقائي؛ يبقى الإشعار حتى النقر على الرابط أو زر الإغلاق
    };

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
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in w-11/12 max-w-md"
    >
      <div className="flex items-center flex-col gap-2">
        <span dangerouslySetInnerHTML={sanitizeHtml(subscriptionData.formatted_message)} />
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
