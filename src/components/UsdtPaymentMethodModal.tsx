'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowRightLeft, X, Loader2 } from 'lucide-react'

interface UsdtPaymentMethodModal {
  loading: boolean;
  onClose: () => void;
  onWalletSelect: () => void;
  onExchangeSelect: () => void;
}

export const UsdtPaymentMethodModal = ({
  loading,
  onClose,
  onWalletSelect,
  onExchangeSelect,
}: UsdtPaymentMethodModal) => {
  // أعلن فتح/إغلاق المودال (ليختفي/يعود SubscribeFab)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('modal:open', { detail: { name: 'usdtMethod' } }))
    return () => {
      window.dispatchEvent(new CustomEvent('modal:close', { detail: { name: 'usdtMethod' } }))
    }
  }, [])

  return (
    <motion.div
      dir="rtl"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[99]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-50 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-200/50"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">إتمام الدفع بـ USDT</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-full disabled:opacity-50"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <motion.button
            className="relative w-full p-3 bg-gradient-to-br from-primary-500 to-primary-600 hover:shadow-primary-500/40 text-white transition-all duration-300 rounded-xl flex items-center gap-4 text-right disabled:opacity-70 disabled:cursor-wait shadow-lg"
            onClick={onWalletSelect}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.03, y: loading ? 0 : -3 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <div className="w-12 h-12 bg-white/20 flex-shrink-0 rounded-lg flex items-center justify-center border border-white/30">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Wallet className="w-7 h-7 text-white" />}
            </div>
            <div>
              <p className="font-semibold">محفظة ويب 3</p>
              <p className="text-sm text-primary-100">مثل Tonkeeper, MyTonWallet</p>
            </div>
          </motion.button>

          <motion.button
            className="w-full p-3 bg-white hover:bg-gray-100 border border-gray-300 transition-all duration-300 rounded-xl flex items-center gap-4 text-right disabled:opacity-60 disabled:cursor-wait"
            onClick={onExchangeSelect}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.03, y: loading ? 0 : -3 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <div className="w-12 h-12 bg-gray-100 flex-shrink-0 rounded-lg flex items-center justify-center border">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-500" /> : <ArrowRightLeft className="w-6 h-6 text-gray-600" />}
            </div>
            <div>
              <p className="font-semibold text-gray-800">منصة تداول</p>
              <p className="text-sm text-gray-500">مثل Binance, OKX, Bybit</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
