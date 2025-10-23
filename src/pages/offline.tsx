import { cn } from "@/lib/utils";
import { componentVariants, mergeVariants } from "@/components/ui/variants";
/**
 * Offline Page - PWA Support
 * تظهر عندما يكون المستخدم غير متصل بالإنترنت
 */

import Head from "next/head";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <>
      <Head>
        <title>غير متصل - Exaado</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-950 px-4">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-gray-600 dark:text-neutral-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            غير متصل بالإنترنت
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-neutral-400 mb-8 leading-relaxed">
            يبدو أنك غير متصل بالإنترنت حالياً. يرجى التحقق من اتصالك والمحاولة
            مرة أخرى.
          </p>

          {/* Action Button */}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            إعادة المحاولة
          </button>

          {/* Additional Info */}
          <div
            className={cn(
              componentVariants.card.base,
              "mt-12 p-4 rounded-xl dark:",
            )}
          >
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              💡 نصيحة: بعض المحتوى قد يكون متاحاً في وضع عدم الاتصال
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
