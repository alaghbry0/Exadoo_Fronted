'use client';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    Dispatch,
    SetStateAction,
    useRef,
} from "react";

interface TelegramContextType {
    telegramId: string | null;
    isTelegramReady: boolean;
    isLoading: boolean;
    isTelegramApp: boolean;
    setTelegramId: Dispatch<SetStateAction<string | null>>;
    webApp: TelegramWebApp | null;
}

const TelegramContext = createContext<TelegramContextType>({
    telegramId: null,
    isTelegramReady: false,
    isLoading: true,
    isTelegramApp: false,
    setTelegramId: () => { },
    webApp: null,
});


export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
    const [telegramId, setTelegramId] = useState<string | null>(null);
    const [isTelegramReady, setIsTelegramReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTelegramApp, setIsTelegramApp] = useState(false);
    const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
    const isTelegramAppRef = useRef(false);
    const retryTimeoutRef = useRef<number | null>(null); // useRef for timeout ID


    useEffect(() => {
        const isClientSideTelegramApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
        setIsTelegramApp(isClientSideTelegramApp);
        isTelegramAppRef.current = isClientSideTelegramApp;
        console.log("TelegramContext: useEffect 1 - isTelegramApp set to:", isClientSideTelegramApp); // ✅ Log
    }, []);


    const fetchTelegramUserData = useCallback(() => { // ✅ Removed dependency annotations here
        console.log("TelegramContext: fetchTelegramUserData called"); // ✅ Log
        if (!isTelegramAppRef.current) {
            console.log("TelegramContext: fetchTelegramUserData - Not in Telegram WebApp"); // ✅ Log
            setIsLoading(false);
            return;
        }

        const tg = window.Telegram?.WebApp;
        if (!tg) {
            console.warn("TelegramContext: fetchTelegramUserData - Telegram WebApp not available (tg is null)"); // ✅ Log
            setIsLoading(false);
            return;
        }
        setWebApp(tg);
        tg.ready();
        tg.expand();
        console.log("TelegramContext: fetchTelegramUserData - Telegram WebApp ready and expanded"); // ✅ Log


        if (tg.initDataUnsafe) {
            const userId = tg.initDataUnsafe.user?.id?.toString();
            if (userId) {
                console.log("TelegramContext: fetchTelegramUserData - Telegram User ID from initDataUnsafe:", userId); // ✅ Log
                setTelegramId(userId);
                sessionStorage.setItem("telegramId", userId);
                localStorage.setItem("telegramId", userId);
                setIsTelegramReady(true);
                setIsLoading(false);
                clearRetryTimeout(); // ✅ Clear retry timeout on success
                console.log("TelegramContext: fetchTelegramUserData - User ID set, isLoading false, retry timeout cleared"); // ✅ Log
                return; // ✅ Early return on success
            } else {
                console.warn("TelegramContext: fetchTelegramUserData - User ID not found in initDataUnsafe"); // ✅ Log
            }
        } else {
            console.warn("TelegramContext: fetchTelegramUserData - initDataUnsafe is undefined"); // ✅ Log
        }

        // If initDataUnsafe is not available or userId not found, retry after a delay
        retryInitDataFetch();
    }, []); // ✅ Removed clearRetryTimeout, retryInitDataFetch from dependencies


    // ✅ Retry mechanism with useCallback and useRef
    const retryInitDataFetch = useCallback(() => {
        console.log("TelegramContext: retryInitDataFetch - Attempting to fetch initDataUnsafe again in 1 seconds..."); // ✅ Log
        retryTimeoutRef.current = window.setTimeout(fetchTelegramUserData, 1000); // Retry after 1 second
    }, [fetchTelegramUserData]);


    // ✅ Clear retry timeout
    const clearRetryTimeout = useCallback(() => {
        if (retryTimeoutRef.current) {
            console.log("TelegramContext: clearRetryTimeout - Clearing retry timeout"); // ✅ Log
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);


    useEffect(() => {
        console.log("TelegramContext: useEffect 2 - Initializing Telegram data fetch"); // ✅ Log

        const storedTelegramId = sessionStorage.getItem("telegramId") || localStorage.getItem("telegramId");
        if (storedTelegramId) {
            setTelegramId(storedTelegramId);
            setIsTelegramReady(true);
            setIsLoading(false);
            console.log("TelegramContext: useEffect 2 - Telegram ID retrieved from storage:", storedTelegramId); // ✅ Log
            return;
        }


        fetchTelegramUserData(); // Initial fetch
        return clearRetryTimeout; // Cleanup function to clear timeout on unmount
    }, [fetchTelegramUserData, clearRetryTimeout]); // ✅ Dependencies include fetchTelegramUserData and clearRetryTimeout


    const value: TelegramContextType = {
        telegramId,
        isTelegramReady,
        isLoading,
        isTelegramApp,
        setTelegramId,
        webApp,
    };

    return (
        <TelegramContext.Provider value={value}>
            {children}
        </TelegramContext.Provider>
    );
};


export const useTelegram = () => {
    const context = useContext(TelegramContext);
    if (!context) {
        throw new Error("useTelegram must be used within a TelegramProvider");
    }
    return context;
};