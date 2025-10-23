import { create } from "zustand";

// تعريف حالة الدفع
type PaymentStatus = "idle" | "pending" | "success" | "failed";

interface ExchangeState {
  paymentStatus: PaymentStatus;
  paymentToken?: string;
}

// الواجهة الكاملة للمخزن
interface TariffState {
  tariffId: string | null;
  setTariffId: (tariffId: string | null) => void;

  walletAddress: string | null;
  setWalletAddress: (walletAddress: string | null) => void;

  exchangeDetails: ExchangeState;
  setExchangeDetails: (details: ExchangeState) => void;
}

export const useTariffStore = create<TariffState>((set) => ({
  tariffId: null,
  setTariffId: (tariffId) => set({ tariffId }),

  walletAddress: null,
  setWalletAddress: (walletAddress) => set({ walletAddress }),

  exchangeDetails: { paymentStatus: "idle" },
  setExchangeDetails: (details) => set({ exchangeDetails: details }),
}));
