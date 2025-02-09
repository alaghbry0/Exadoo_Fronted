// src/telegram-web-app.d.ts
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initDataUnsafe?: {
                    user?: { // ✅ تعريف نوع المستخدم
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                    };
                };
                showAlert?: (message: string, callback?: (() => void) | undefined) => void; // ✅ showAlert
                ready: () => void; // ✅ ready()
                expand: () => void; // ✅ expand()
                onEvent?: (eventType: 'invoiceClosed' | 'themeChanged', callback: () => void) => void; // ✅ onEvent()
                offEvent?: (eventType: 'invoiceClosed' | 'themeChanged', callback: () => void) => void; // ✅ offEvent()
                openInvoice?: (url: string, callback: (status: string) => void) => void; // ✅ openInvoice()
                // ... (يمكن إضافة خصائص أخرى لـ WebApp إذا كانت معروفة - يمكن إضافتها لاحقًا إذا لزم الأمر)
            };
        };
    }
}

export {};