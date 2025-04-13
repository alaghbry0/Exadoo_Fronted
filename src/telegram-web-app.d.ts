// src/telegram-web-app.d.ts
declare global {

    interface User {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        allows_write_to_pm?: boolean;
        photo_url?: string;
    }

    interface InitDataUnsafe {
        user?: User;
        query_id?: string;
        auth_date?: number;
        hash?: string;
    }

    interface TelegramWebApp {
        initDataUnsafe?: InitDataUnsafe;
        showAlert?: (message: string, callback?: (() => void) | undefined) => void;
        ready: () => void;
        expand: () => void;
        version: string;
        openInvoice?: (url: string, callback: (status: string) => void) => void; // ✅ Explicitly added openInvoice
        // ... other methods and properties can be added later as needed
    }


    interface Telegram {
        WebApp: TelegramWebApp;
    }

    interface Window {
        Telegram?: Telegram;
    }
}

export {};