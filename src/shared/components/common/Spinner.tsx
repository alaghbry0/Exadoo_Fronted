import { motion } from "framer-motion";

export const Spinner = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <motion.svg
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
      className="h-8 w-8 text-blue-500"
      viewBox="0 0 50 50"
    >
      <circle
        className="opacity-25"
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M25 5C13.507 5 5 13.507 5 25h5c0-10.493 8.507-19 19-19V5z"
      />
    </motion.svg>
  </div>
);
