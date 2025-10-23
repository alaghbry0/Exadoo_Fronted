import React from 'react';

/**
 * مكون Skip to Content - يسمح لمستخدمي الكيبورد بتخطي التنقل والذهاب مباشرة للمحتوى
 * يظهر فقط عند التركيز بالكيبورد (Tab)
 */
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="skip-to-content sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:font-semibold"
    >
      تخطي إلى المحتوى الرئيسي
    </a>
  );
};

export default SkipToContent;
