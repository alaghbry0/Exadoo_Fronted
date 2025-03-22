// components/InviteAlert.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiX, FiArrowRight } from 'react-icons/fi';
import { sanitizeHtml } from '../utils/safeHtml';

declare global {
  interface Window {
    addEventListener(
      type: 'subscription_update',
      listener: (event: CustomEvent) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
  }
}

const InviteAlert: React.FC = () => {
  const [subscriptionData, setSubscriptionData] = useState<{
    invite_link: string;
    formatted_message: string;
    timestamp: number;
  } | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null); // تم التعديل هنا

  useEffect(() => {
    const handleStorageUpdate = (event: CustomEvent) => {
      setSubscriptionData(event.detail);
      setVisible(true);

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, 30000);
    };

    const eventListener = (event: Event) => {
      handleStorageUpdate(event as CustomEvent<{
        invite_link: string;
        formatted_message: string;
        timestamp: number;
      }>);
    };

    window.addEventListener('subscription_update', eventListener);

    return () => {
      window.removeEventListener('subscription_update', eventListener);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && subscriptionData && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-2">
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-xl p-4 relative"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="w-2 bg-green-500 rounded-full h-full absolute right-0 top-0" />
              <FiCheckCircle className="text-green-600 text-2xl flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div
                  className="text-green-800 font-semibold text-lg mb-2 leading-tight"
                  dangerouslySetInnerHTML={sanitizeHtml(subscriptionData.formatted_message)}
                />
                <button
                  onClick={() => {
                    window.open(subscriptionData.invite_link, '_blank');
                    setVisible(false);
                  }}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200"
                  aria-label="الانضمام إلى القناة"
                >
                  <span>انتقل إلى القناة الآن</span>
                  <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="text-green-700 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors"
                aria-label="إغلاق الإشعار"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 30, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-green-200 rounded-full"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InviteAlert;