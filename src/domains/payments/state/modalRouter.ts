import { create } from "zustand";

/** عدّل الأنواع بحسب حاجتك */
export type ModalKey =
  | "academyPurchase"
  | "usdtMethod"
  | "exchangePayment"
  | "paymentSuccess"
  | "paymentExchangeSuccess";

/** Payloads لكل مودال */
export type ModalPayloads = {
  academyPurchase: { kind: "course" | "bundle"; id: string };
  usdtMethod: { planName: string; productId: number; amountUsdt: number };
  exchangePayment: {
    depositAddress: string;
    amount: string;
    network: string;
    paymentToken: string;
    planName?: string;
  };
  paymentSuccess: null;
  paymentExchangeSuccess: { planName?: string };
};

type StackItem<K extends ModalKey = ModalKey> = {
  key: K;
  payload?: ModalPayloads[K];
};

interface ModalRouterState {
  stack: StackItem[];
  /** افتح مودال جديد (يغطي اللي قبله تلقائياً) */
  open: <K extends ModalKey>(key: K, payload?: ModalPayloads[K]) => void;
  /** استبدل المودال الحالي (بدون حفظ رجوع) */
  replace: <K extends ModalKey>(key: K, payload?: ModalPayloads[K]) => void;
  /** رجوع لمودال السابق */
  back: () => void;
  /** اقفل الكل */
  closeAll: () => void;
  /** افتح مودال كأول عنصر (يفرغ الستاك) */
  resetAndOpen: <K extends ModalKey>(
    key: K,
    payload?: ModalPayloads[K],
  ) => void;
  /** هل المودال الحالي هو key ؟ */
  isOpen: (key: ModalKey) => boolean;
  /** Payload للمودال الحالي إذا كان هو المفتوح */
  getActive: () => StackItem | null;
}

export const useModalRouter = create<ModalRouterState>((set, get) => ({
  stack: [],
  open: (key, payload) =>
    set((s) => ({ stack: [...s.stack, { key, payload }] })),
  replace: (key, payload) =>
    set((s) => {
      const next = [...s.stack];
      if (next.length) next.pop();
      next.push({ key, payload });
      return { stack: next };
    }),
  back: () =>
    set((s) => {
      const next = [...s.stack];
      next.pop();
      return { stack: next };
    }),
  closeAll: () => set({ stack: [] }),
  resetAndOpen: (key, payload) => set({ stack: [{ key, payload }] }),
  isOpen: (key) => get().stack.at(-1)?.key === key,
  getActive: () => get().stack.at(-1) ?? null,
}));

/** هيلبرز مريحة */
export const useIsAnyModalOpen = () =>
  useModalRouter((s) => s.stack.length > 0);
export const useIsOpen = (key: ModalKey) =>
  useModalRouter((s) => s.stack.at(-1)?.key === key);

export function useModalPayload<K extends ModalKey>(
  key: K,
): ModalPayloads[K] | undefined {
  return useModalRouter((s) => {
    const top = s.stack.at(-1);
    return top?.key === key ? (top.payload as ModalPayloads[K]) : undefined;
  });
}
