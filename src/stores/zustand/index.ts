import { create } from 'zustand';

interface TariffState {
  tariffId: string | null;
  setTariffId: (tariffId: string | null) => void;
  walletAddress: string | null; // إضافة خاصية walletAddress
  setWalletAddress: (walletAddress: string | null) => void; // دالة لتحديث العنوان
}

export const useTariffStore = create<TariffState>((set) => ({
  tariffId: null,
  setTariffId: (tariffId) => set({ tariffId }),
  walletAddress: null,
  setWalletAddress: (walletAddress) => set({ walletAddress }),
}));
