import React from "react";
import { ExchangePaymentModal } from "./ExchangePaymentModal";
import { useToast } from "@/hooks/use-toast";

interface PaymentExchangeProps {
  depositAddress: string;
  amount: string;
  network?: string;
  paymentToken: string;
  planName?: string;
  onClose?: () => void;
}

const PaymentExchange: React.FC<PaymentExchangeProps> = ({
  depositAddress,
  amount,
  network = "TON",
  paymentToken,
  planName,
  onClose,
}) => {
  const { toast } = useToast();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Fallback if no onClose provided
      window.history.back();
    }
  };

  const handleSuccess = () => {
    toast({
      title: "تم الدفع بنجاح!",
      description: "تم تفعيل اشتراكك بنجاح",
    });

    // Navigate back or close after success
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 2000);
  };

  // Check if we have the required details
  if (!depositAddress || !amount || !paymentToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            خطأ في تحميل البيانات
          </h1>
          <p className="text-gray-600">يرجى التأكد من صحة رابط الدفع</p>
        </div>
      </div>
    );
  }

  return (
    <ExchangePaymentModal
      details={{
        depositAddress,
        amount,
        network,
        paymentToken,
        planName,
      }}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default PaymentExchange;
