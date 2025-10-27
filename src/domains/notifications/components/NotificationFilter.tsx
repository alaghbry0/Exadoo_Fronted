import React from "react";
import { useRouter } from "next/router";

import clsx from "clsx";
import { Bell, CheckCircle } from "lucide-react";

type FilterType = "all" | "unread";

interface NotificationFilterProps {
  currentFilter: FilterType;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

const NotificationFilter = ({
  currentFilter,
  unreadCount,
  onMarkAllAsRead,
}: NotificationFilterProps) => {
  const router = useRouter();
  const searchParams = new URLSearchParams(router.asPath.split("?")[1] || "");

  const handleFilterChange = (filter: FilterType) => {
    if (filter === currentFilter) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filter);
    router.push(`/notifications?${params.toString()}`);
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (unreadCount === 0) return;
    onMarkAllAsRead();
  };

  return (
    <div className="mb-5 rounded-xl bg-white p-3 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-gray-800">
          تصفية الإشعارات
        </h2>

        {unreadCount > 0 && (
          <button
            className="animate-scale-in text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 transition-transform duration-200 active:scale-95"
            onClick={handleMarkAllAsRead}
          >
            <CheckCircle size={14} />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleFilterChange("all")}
          className={clsx(
            "relative flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors duration-200 flex justify-center items-center gap-2 transition-transform active:scale-95",
            currentFilter === "all"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-600 hover:bg-gray-200",
          )}
        >
          <Bell size={16} />
          <span>جميع الإشعارات</span>

          {currentFilter === "all" && (
            <span className="absolute inset-0 -z-10 rounded-md bg-white transition-opacity duration-300" />
          )}
        </button>

        <button
          onClick={() => handleFilterChange("unread")}
          className={clsx(
            "relative flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors duration-200 transition-transform active:scale-95",
            currentFilter === "unread"
              ? "bg-white text-blue-700 shadow-sm flex items-center justify-center gap-2"
              : "text-gray-600 hover:bg-gray-200 flex items-center justify-center gap-2",
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Bell size={16} />
            <span>غير المقروءة</span>
            {unreadCount > 0 && (
              <span className="inline-flex animate-scale-in items-center justify-center bg-blue-600 text-white rounded-full w-5 h-5 text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          {currentFilter === "unread" && (
            <span className="absolute inset-0 -z-10 rounded-md bg-white transition-opacity duration-300" />
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationFilter;
