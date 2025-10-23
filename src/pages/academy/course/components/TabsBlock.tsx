// src/features/academy/course/components/TabsBlock.tsx
import React from "react";
import { BookOpen, FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabId } from "@/types/academy";

const tabsDef: { id: TabId; label: string; icon: any }[] = [
  { id: "curriculum", label: "المنهج الدراسي", icon: BookOpen },
  { id: "overview", label: "الوصف", icon: FileText },
  { id: "outcomes", label: "النتائج", icon: Target },
];

export default function TabsBlock({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;
}) {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6">
      <nav
        className="-mb-px flex space-x-6 rtl:space-x-reverse"
        aria-label="Tabs"
      >
        {tabsDef.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none",
                active
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:hover:text-neutral-200 dark:hover:border-neutral-600",
              )}
            >
              <span className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
