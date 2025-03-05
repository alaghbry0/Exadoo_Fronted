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
      <div className="flex items-center">
        <span dangerouslySetInnerHTML={sanitizeHtml(subscriptionData.formatted_message)} />
      </div>
    </Alert>
  );
};

export default InviteAlert;