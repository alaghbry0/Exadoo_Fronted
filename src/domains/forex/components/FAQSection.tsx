/**
 * FAQSection Component
 * قسم الأسئلة الشائعة
 */

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

export const FAQSection: React.FC = () => {
  return (
    <section className="py-16 max-w-3xl mx-auto px-4">
      <div className="text-center mb-10">
        <HelpCircle 
          className="mx-auto w-10 h-10 mb-2"
          style={{ color: "var(--color-text-disabled)" }}
        />
        <h2 
          className="text-3xl font-extrabold font-display"
          style={{ color: "var(--color-text-primary)" }}
        >
          أسئلة شائعة
        </h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-3">
        <AccordionItem value="item-1">
          <AccordionTrigger>ما هي المنصات المدعومة؟</AccordionTrigger>
          <AccordionContent>
            اللوحات متوافقة بشكل كامل مع منصتي MetaTrader 4 (MT4) و MetaTrader 5 (MT5).
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger>كيف يتم تفعيل اللوحات بعد الاشتراك؟</AccordionTrigger>
          <AccordionContent>
            بعد الاشتراك، ستحصل على رابط لتحميل ملف اللوحة. كل ما عليك هو تثبيته على
            منصة التداول الخاصة بك وإدخال رقم حسابك الذي زودتنا به.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger>هل يمكنني استخدام اللوحة على أكثر من حساب؟</AccordionTrigger>
          <AccordionContent>
            كل اشتراك مخصص لعدد معين من حسابات التداول. يمكنك اختيار الخطة التي
            تناسب عدد الحسابات التي ترغب في استخدام اللوحة عليها.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};
