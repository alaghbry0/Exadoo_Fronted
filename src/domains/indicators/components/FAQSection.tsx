/**
 * FAQSection Component
 * قسم الأسئلة الشائعة
 */

import { HelpCircle } from "lucide-react";
import { colors } from "@/styles/tokens";
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
            style={{ color: colors.text.disabled }}
          />
          <h2
            className="text-3xl font-extrabold font-display"
            style={{ color: colors.text.primary }}
          >
          أسئلة شائعة
        </h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full space-y-3">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            كيف يتم تفعيل المؤشرات بعد الاشتراك؟
          </AccordionTrigger>
          <AccordionContent>
            يتم التفعيل تلقائيًا. بعد إتمام الاشتراك، سيتم منح حسابك في
            TradingView (الذي قمت بتزويدنا به) صلاحية الوصول للمؤشرات. ستجدها
            في قسم "Invite-only scripts".
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger>
            هل تعمل المؤشرات على الخطة المجانية لـ TradingView؟
          </AccordionTrigger>
          <AccordionContent>
            نعم، تعمل المؤشرات على جميع خطط TradingView بما في ذلك الخطة المجانية.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger>
            هل المؤشرات تعيد رسم نفسها (Repaint)؟
          </AccordionTrigger>
          <AccordionContent>
            لا، جميع مؤشراتنا مصممة لتكون Non-Repainting، مما يعني أن الإشارات
            التي تظهر على الشارت ثابتة ولا تتغير، مما يضمن موثوقية عالية عند
            اختبار الاستراتيجيات.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};
