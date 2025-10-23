import type { FC } from "react";

import type { SearchStats } from "./useDebounce";

type SearchStatsDisplayProps = SearchStats;

export const SearchStatsDisplay: FC<SearchStatsDisplayProps> = ({
  totalResults,
  searchTime,
  isSearching,
}) => {
  if (isSearching) {
    return (
      <div className="text-xs text-gray-500 dark:text-neutral-400 animate-pulse">
        جارٍ البحث...
      </div>
    );
  }

  return (
    <div className="text-xs text-gray-500 dark:text-neutral-400">
      {totalResults === 0 ? (
        "لا توجد نتائج"
      ) : totalResults === 1 ? (
        "نتيجة واحدة"
      ) : (
        <>
          {totalResults} نتيجة
          {searchTime > 0 && (
            <span className="mr-2">({searchTime.toFixed(0)} ms)</span>
          )}
        </>
      )}
    </div>
  );
};
