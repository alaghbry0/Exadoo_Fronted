import { create } from 'zustand';

interface TariffState {
  tariffId: string | null; // ✅ هنا تعريف tariffId كخاصية في حالة المتجر
  setTariffId: (tariffId: string | null) => void;
}

export const useTariffStore = create<TariffState>((set) => ({
  tariffId: null, // ✅ القيمة الأولية لـ tariffId هي null
  setTariffId: (tariffId) => set({ tariffId }), // ✅ دالة لتحديث قيمة tariffId في المتجر
}));