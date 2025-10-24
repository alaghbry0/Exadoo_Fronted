import type { ChangeEvent, RefObject } from "react";
import { useId } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

import { animations } from "@/styles/animations";
import { semanticSpacing } from "@/styles/tokens";

import styles from "./ShopSearchBar.module.css";

interface ShopSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement>;
}

export function ShopSearchBar({ value, onChange, inputRef }: ShopSearchBarProps) {
  const inputId = useId();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <motion.div
      {...animations.slideUp}
      className={styles.wrapper}
      style={{ marginBottom: semanticSpacing.section.sm }}
    >
      <label htmlFor={inputId} className="sr-only">
        بحث موحّد في متجر إكسادو والأكاديمية
      </label>
      <div className={styles.field}>
        <Search aria-hidden="true" size={20} className={styles.icon} />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={value}
          onChange={handleChange}
          className={styles.input}
          placeholder="ابحث في الخدمات + الأكاديمية… (مثال: تحليل، مؤشرات، دورة)"
          aria-label="بحث موحّد في متجر إكسادو والأكاديمية"
        />
      </div>
    </motion.div>
  );
}
