// components/details/DetailRow.tsx (النسخة النهائية مع ميزة النسخ)

import React from 'react';
import { useClipboard } from '@/hooks/useClipboard'; // استيراد الـ hook الجديد
import { Check, Copy } from 'lucide-react';

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  valueClass?: string;
  isCopyable?: boolean; // خاصية جديدة لتحديد إذا كان النص قابلاً للنسخ
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, valueClass, isCopyable = false }) => {
  const { copy, isCopied } = useClipboard();
  const textValue = typeof value === 'string' ? value : '';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // منع أي أحداث أخرى
    if (textValue) {
      copy(textValue);
    }
  };

  return (
    <div className="flex justify-between items-center gap-4 py-3 border-b border-gray-200 last:border-b-0">
      {/* الجزء الأيسر: الأيقونة والعنوان */}
      <div className="flex items-center gap-3 text-gray-600 flex-shrink-0">
        {icon}
        <span className="text-sm">{label}</span>
      </div>

      {/* ✨ الجزء الأيمن: القيمة (تمت إعادة هيكلته) */}
      <div
        className="flex items-center gap-2 font-mono text-sm font-medium text-right min-w-0" // min-w-0 مهمة جدًا لـ flexbox
      >
        {/* حاوية القيمة لتطبيق truncate بشكل صحيح */}
        <span className={`truncate ${valueClass || 'text-gray-800'}`}>
          {value}
        </span>

        {/* زر النسخ (يظهر فقط إذا كانت الخاصية isCopyable صحيحة) */}
        {isCopyable && (
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 flex-shrink-0 transition-transform duration-200 active:scale-95"
            aria-label="Copy to clipboard"
          >
            {isCopied ? (
              <span className="inline-flex animate-scale-in">
                <Check className="w-4 h-4 text-emerald-500" />
              </span>
            ) : (
              <span className="inline-flex animate-scale-in">
                <Copy className="w-4 h-4" />
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DetailRow;