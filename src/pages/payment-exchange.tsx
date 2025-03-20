'use client';
import React from 'react';
import { useRouter } from 'next/router';
import PaymentExchangePage from '@/components/PaymentExchangePage';

const PaymentExchange = () => {
  const router = useRouter();
  const { recipientAddress, amount, network, orderId } = router.query;

  // تأكد من وجود كل المعلمات قبل العرض
  if (!recipientAddress || !amount || !network || !orderId) {
    return <div>تحميل...</div>;
  }

  return (
    <PaymentExchangePage
      recipientAddress={recipientAddress as string}
      amount={amount as string}
      network={network as string}
      orderId={orderId as string}
    />
  );
};

export default PaymentExchange;
