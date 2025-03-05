// components/InviteAlert.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Alert } from 'flowbite-react';

const InviteAlert: React.FC = () => {
  const [subscriptionData, setSubscriptionData] = useState<{
    invite_link: string;
    message: string;
    timestamp: number;
  } | null>(null);

  const [visible, setVisible] = useState<boolean>(false);

  // عند تحميل المكون، اقرأ البيانات من Local Storage
  useEffect(() => {
    const stored = localStorage.getItem('subscriptionData');
    if (stored) {
      const parsed = JSON.parse(stored);
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // أسبوع واحد
      const now = new Date().getTime();
      if (now - parsed.timestamp < oneWeek) {
        setSubscriptionData(parsed);
        setVisible(true);
      } else {
        localStorage.removeItem('subscriptionData');
      }
    }
  }, []);

  if (!subscriptionData || !visible) return null;

  return (
    <Alert color="success" onDismiss={() => setVisible(false)} className="fixed top-16 right-4 z-50">
      <span>
        <span className="font-medium">تمت معالجة الدفع بنجاح!</span> {subscriptionData.message}{" "}
        <a
          href={subscriptionData.invite_link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          انقر هنا للانضمام إلى القناة
        </a>
      </span>
    </Alert>
  );
};

export default InviteAlert;
