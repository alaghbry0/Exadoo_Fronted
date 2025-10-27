import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export interface SearchStats {
  totalResults: number;
  searchTime: number;
  isSearching: boolean;
}

export interface UseSearchWithStatsResult<T> {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  filteredItems: T[];
  stats: SearchStats;
  isSearching: boolean;
}

export const useSearchWithStats = <T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  delay: number = 300,
): UseSearchWithStatsResult<T> => {
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState<SearchStats>({
    totalResults: items.length,
    searchTime: 0,
    isSearching: false,
  });
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFilteredItems(items);
      setStats({
        totalResults: items.length,
        searchTime: 0,
        isSearching: false,
      });
      return;
    }

    let cancelled = false;
    setStats((prev) => ({ ...prev, isSearching: true }));

    const startTime = performance.now();
    const results = items.filter((item) => searchFn(item, debouncedQuery));
    const endTime = performance.now();

    if (cancelled) {
      return;
    }

    setFilteredItems(results);
    setStats({
      totalResults: results.length,
      searchTime: endTime - startTime,
      isSearching: false,
    });

    return () => {
      cancelled = true;
    };
  }, [items, debouncedQuery, searchFn]);

  return {
    query,
    setQuery,
    filteredItems,
    stats,
    isSearching: query !== debouncedQuery,
  };
};
