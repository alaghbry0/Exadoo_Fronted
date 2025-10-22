import React from 'react'
import { motion } from 'framer-motion'

export default function StatChip({ icon: Icon, label }: { icon: any; label: string | number }) {
  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -2 }}
      className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 backdrop-blur-xl px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/20"
    >
      <Icon className="h-4 w-4 opacity-90" />
      <span>{label}</span>
    </motion.span>
  )
}