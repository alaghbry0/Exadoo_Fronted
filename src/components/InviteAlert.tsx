// components/InviteAlert.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiExternalLink, FiX } from 'react-icons/fi';
import { sanitizeHtml } from '../utils/safeHtml';

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
      // يبقى الإشعار مرئيًا حتى النقر على الرابط أو زر الإغلاق
    };

    window.addEventListener('subscription_update', handleStorageUpdate as EventListener);

    return () => {
      window.removeEventListener('subscription_update', handleStorageUpdate as EventListener);
    };
  }, []);

  if (!subscriptionData || !visible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <FiCheckCircle className="text-green-600 text-xl" />
          <div>
            <p
              className="text-green-800 font-medium"
              dangerouslySetInnerHTML={sanitizeHtml(subscriptionData.formatted_message)}
            />
            <button
              onClick={() => window.open(subscriptionData.invite_link, '_blank')}
              className="mt-2 inline-flex items-center gap-2 text-green-700 hover:text-green-900"
            >
              <FiExternalLink /> انقر للانضمام الآن
            </button>
          </div>
          <FiX
            onClick={() => setVisible(false)}
            className="cursor-pointer text-green-700 hover:text-green-900"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default InviteAlert;
