// src/telegram-web-app.d.ts
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData?: { // ✅ إضافة تعريف initData (من التعريف السابق في TelegramContext.tsx)
                    user?: { id?: number }
                }
                initDataUnsafe?: {
                    user?: { // ✅ تعريف نوع المستخدم (كما كان من قبل)
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                    };
                }
                ready: () => void; // ✅ إضافة ready() هنا
                expand: () => void; // ✅ إضافة expand() هنا
                onEvent?: (eventType: 'invoiceClosed' | 'themeChanged', callback: () => void) => void; // ✅ إضافة onEvent() هنا
                offEvent?: (eventType: 'invoiceClosed' | 'themeChanged', callback: () => void) => void; // ✅ إضافة offEvent() هنا
                openInvoice?: (url: string, callback: (status: string) => void) => void; // ✅ إضافة openInvoice() هنا
                showAlert?: (message: string, callback?: (() => void) | undefined) => void; // ✅ إضافة showAlert (كما كانت من قبل)
            };
        };
    }
}

export {};