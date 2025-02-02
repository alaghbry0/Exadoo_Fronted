'use client';
import { createContext, useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ✅ تحميل `@tonconnect/ui-react` فقط على المتصفح لمنع `ReactCurrentDispatcher` Error
const TonConnectUIProvider = dynamic(
  () => import("@tonconnect/ui-react").then((mod) => mod.TonConnectUIProvider),
  { ssr: false }
);

const TonConnectUI = dynamic(
  () => import("@tonconnect/ui-react").then((mod) => mod.TonConnectUI),
  { ssr: false }
);

// ✅ تحديد نوع بيانات `Context`
interface TonWalletContextType {
  walletAddress: string | null;
  tonConnectUI: any | null;
}

// ✅ إنشاء `Context`
const TonWalletContext = createContext<TonWalletContextType>({
  walletAddress: null,
  tonConnectUI: null,
});

export const TonWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tonConnectUI, setTonConnectUI] = useState<any | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // ✅ تأكيد تشغيل الكود في المتصفح فقط

    if (typeof window !== "undefined") {
      import("@tonconnect/ui-react").then((mod) => {
        const tonConnectInstance = new mod.TonConnectUI({
          manifestUrl:
            "https://exadooo-git-main-mohammeds-projects-3d2877c6.vercel.app/tonconnect-manifest.json",
        });

        setTonConnectUI(tonConnectInstance);

        // ✅ التحقق من المحفظة المتصلة عند التحميل
        tonConnectInstance.onStatusChange((wallet: any) => {
          setWalletAddress(wallet?.account?.address || null);
        });
      });
    }
  }, []);

  return (
    <TonWalletContext.Provider value={{ walletAddress, tonConnectUI }}>
      {isClient && TonConnectUIProvider ? (
        <TonConnectUIProvider
          manifestUrl="https://exadooo-git-main-mohammeds-projects-3d2877c6.vercel.app/tonconnect-manifest.json"
        >
          {children}
        </TonConnectUIProvider>
      ) : (
        children
      )}
    </TonWalletContext.Provider>
  );
};

// ✅ دالة `useTonWallet` للوصول إلى بيانات المحفظة بسهولة
export const useTonWallet = () => useContext(TonWalletContext);
