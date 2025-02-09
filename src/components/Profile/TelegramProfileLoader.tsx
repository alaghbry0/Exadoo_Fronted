// components/Profile/TelegramProfileLoader.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { UserProfile } from '@/types';

const DEFAULT_PROFILE = '/default-profile.png';

const TelegramProfileLoader = () => {
    const { /*telegramId,*/ setTelegramId } = useTelegram(); // ✅ Remove unused telegramId
    const [userDataFromWebApp, setUserDataFromWebApp] = useState<UserProfile | null>(null);
    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const TelegramWebApp = window.Telegram.WebApp; // No need for 'as unknown' now
            if (TelegramWebApp) {
                const user = TelegramWebApp.initDataUnsafe?.user; // Access directly, no 'as any' needed
                if (user) {
                    setUserDataFromWebApp({
                        telegram_id: user.id,
                        full_name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
                        username: user.username || '',
                        profile_photo: DEFAULT_PROFILE,
                        subscriptions: [],
                    });
                    setTelegramId(String(user.id));
                    console.log("✅ تم استخراج بيانات المستخدم من Telegram WebApp:", user);
                } else {
                    console.warn("⚠️ لم يتم العثور على بيانات المستخدم في Telegram WebApp.");
                }
            } else {
                console.warn("⚠️ TelegramWebApp غير معرف.");
            }
        } else {
            console.log("ℹ️ ليس في بيئة Telegram WebApp.");
        }
    }, [setTelegramId]);

    return userDataFromWebApp ? (
        <div>
            {/* Render Profile content here, or pass userData to Profile component */}
            <p>Telegram User ID: {userDataFromWebApp.telegram_id}</p>
            <p>Full Name: {userDataFromWebApp.full_name}</p>
            {/* ... باقي محتوى صفحة الملف الشخصي ... */}
        </div>
    ) : (
        <p>Loading Telegram User Data...</p>
    );
};

export default TelegramProfileLoader;