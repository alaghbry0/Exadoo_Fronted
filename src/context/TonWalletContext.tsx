'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { TonConnectUI, TonConnectUIProvider } from "@tonconnect/ui-react";

// ✅ إنشاء `Context` لإدارة بيانات المحفظة
const TonWalletContext = createContext<{
  walletAddress: string | null;
  tonConnectUI: TonConnectUI | null;
}>({ walletAddress: null, tonConnectUI: null });

export const TonWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tonConnectUI, setTonConnectUI] = useState<TonConnectUI | null>(null);

  useEffect(() => {
    const tonConnect = new TonConnectUI({
      manifestUrl: "https://your-domain.com/tonconnect-manifest.json", // ✅ قم بتحديث هذا الرابط لاحقًا
    });

    setTonConnectUI(tonConnect);

    // التحقق من المحفظة المتصلة عند التحميل
    tonConnect.onStatusChange((wallet) => {
      if (wallet?.account?.address) {
        setWalletAddress(wallet.account.address);
      } else {
        setWalletAddress(null);
      }
    });
  }, []);

  return (
    <TonWalletContext.Provider value={{ walletAddress, tonConnectUI }}>
      <TonConnectUIProvider value={tonConnectUI}>
        {children}
      </TonConnectUIProvider>
    </TonWalletContext.Provider>
  );
};

// ✅ دالة `useTonWallet` للوصول إلى بيانات المحفظة بسهولة في أي مكون
export const useTonWallet = () => useContext(TonWalletContext);
