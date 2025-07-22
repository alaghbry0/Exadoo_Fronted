// components/details/SubscriptionDetailsCard.tsx (النسخة النهائية والمحدثة)

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Gift, Hash } from 'lucide-react';
import DetailRow from './DetailRow'; // استيراد المكون المحسن

interface SubscriptionDetailsCardProps {
  extraData: {
    history_id?: number;
    payment_token?: string;
    main_invite_link?: string;
    // يمكنك إضافة المزيد من الحقول هنا إذا أرسلها الخادم
  };
}

const SubscriptionDetailsCard: React.FC<SubscriptionDetailsCardProps> = ({ extraData }) => {
  // لا تعرض البطاقة إذا لم يكن هناك بيانات مفيدة لعرضها
  if (!extraData.main_invite_link && !extraData.history_id && !extraData.payment_token) {
    return null;
  }

  const handleJoinClick = () => {
    if (extraData.main_invite_link) {
      window.open(extraData.main_invite_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="mb-6 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-800">
          <Gift className="w-5 h-5" />
          تفاصيل الاشتراك
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">

          {extraData.payment_token && (
            <DetailRow
              icon={<Hash size={16} />}
              label="معرف الدفعة (Token)"
              value={extraData.payment_token}
              isCopyable={true} // ✨ تم تطبيق التعديل هنا
              valueClass="bg-gray-100 p-1 rounded-md text-gray-700"
            />
          )}
        </div>

        {extraData.main_invite_link && (
          <Button onClick={handleJoinClick} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-white">
            <ExternalLink className="w-5 h-5 ml-2" />
            الانضمام إلى القناة
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionDetailsCard;