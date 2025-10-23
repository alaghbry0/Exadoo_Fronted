import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200/80 mt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-500 font-arabic">
          © {currentYear} Exado. جميع الحقوق محفوظة.
        </p>
        <div className="mt-4 flex justify-center space-x-6">
          <a
            href="#"
            className="text-gray-400 hover:text-primary-600 transition-colors"
          >
            شروط الخدمة
          </a>
          <a
            href="#"
            className="text-gray-400 hover:text-primary-600 transition-colors"
          >
            سياسة الخصوصية
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
