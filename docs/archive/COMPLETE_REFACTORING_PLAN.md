# 🏗️ خطة إعادة الهيكلة الشاملة للمشروع

## 📊 جرد كامل للملفات الحالية (64 ملف)

### 📁 الهيكل الحالي:
```
src/components/
├── Auth (3 ملفات) - ✅ تم نقلها
│   ├── AuthFab.tsx
│   ├── GlobalAuthSheet.tsx
│   └── UnlinkedStateBanner.tsx
│
├── Subscriptions (8 ملفات)
│   ├── SubscriptionModal.tsx
│   ├── SubscriptionPlanCard.tsx
│   ├── SubscribeFab.tsx
│   ├── SubscriptionStatusListener.tsx
│   ├── TieredDiscountInfo.tsx
│   ├── SubscriptionModal/
│   │   ├── PaymentButtons.tsx
│   │   ├── PlanFeaturesList.tsx
│   │   └── useSubscriptionPayment.tsx
│
├── Academy (2 ملفات)
│   ├── AcademyHeroCard.tsx
│   └── AcademyPurchaseModal.tsx
│
├── Payments (10 ملفات)
│   ├── PaymentExchange.tsx
│   ├── PaymentExchangePage.tsx
│   ├── PaymentExchangeSuccess.tsx
│   ├── PaymentSuccessModal.tsx
│   ├── ExchangePaymentModal.tsx
│   ├── Bep20PaymentModal.tsx
│   ├── UsdtPaymentModal.tsx
│   ├── UsdtPaymentMethodModal.tsx
│   ├── IndicatorsPurchaseModal.tsx
│   └── TradingPanelPurchaseModal.tsx
│
├── Notifications (3 ملفات)
│   ├── NotificationItem.tsx
│   ├── NotificationToast.tsx
│   └── NotificationFilter.tsx
│
├── Profile (3 ملفات)
│   ├── Profile/ProfileHeader.tsx
│   ├── Profile/SubscriptionsSection.tsx
│   └── Profile/TelegramProfileLoader.tsx
│
├── Payment History (2 ملفات)
│   ├── PaymentHistoryItem.tsx
│   └── details/
│       ├── DetailRow.tsx
│       ├── PaymentDetailsCard.tsx
│       └── SubscriptionDetailsCard.tsx
│
├── Layout (4 ملفات)
│   ├── Navbar.tsx
│   ├── FooterNav.tsx
│   ├── BackHeader.tsx
│   └── Footer.tsx
│
├── Common/UI (12 ملفات)
│   ├── Loader.tsx
│   ├── SkeletonLoader.tsx
│   ├── SmartImage.tsx
│   ├── Spinner.tsx
│   ├── Spinner1.tsx
│   ├── CustomSpinner.tsx
│   ├── SplashScreen.tsx
│   ├── InviteAlert.tsx
│   ├── ThemeToggle.tsx
│   └── shared/
│       ├── ConsultationsCard.tsx
│       ├── IndicatorsCard.tsx
│       ├── ServiceCardV2.tsx
│       └── SkeletonLoaders.tsx
│
└── Shop (3 ملفات فارغة)
    ├── shop/Header.tsx
    ├── shop/HeroSection.tsx
    └── shop/SubscriptionCard.tsx
```

---

## 🎯 الهيكل الجديد المستهدف

```
src/
├── features/
│   ├── auth/
│   │   └── components/
│   │       ├── AuthFab.tsx ✅
│   │       ├── GlobalAuthSheet.tsx ✅
│   │       └── UnlinkedStateBanner.tsx ✅
│   │
│   ├── subscriptions/
│   │   ├── components/
│   │   │   ├── SubscriptionModal.tsx
│   │   │   ├── SubscriptionPlanCard.tsx
│   │   │   ├── SubscribeFab.tsx
│   │   │   ├── SubscriptionStatusListener.tsx
│   │   │   ├── TieredDiscountInfo.tsx
│   │   │   ├── PaymentButtons.tsx
│   │   │   ├── PlanFeaturesList.tsx
│   │   │   └── useSubscriptionPayment.tsx
│   │   └── hooks/
│   │       └── useSubscriptionPayment.ts
│   │
│   ├── academy/
│   │   └── components/
│   │       ├── AcademyHeroCard.tsx
│   │       └── AcademyPurchaseModal.tsx
│   │
│   ├── payments/
│   │   └── components/
│   │       ├── PaymentExchange.tsx
│   │       ├── PaymentExchangePage.tsx
│   │       ├── PaymentExchangeSuccess.tsx
│   │       ├── PaymentSuccessModal.tsx
│   │       ├── ExchangePaymentModal.tsx
│   │       ├── Bep20PaymentModal.tsx
│   │       ├── UsdtPaymentModal.tsx
│   │       ├── UsdtPaymentMethodModal.tsx
│   │       ├── IndicatorsPurchaseModal.tsx
│   │       ├── TradingPanelPurchaseModal.tsx
│   │       ├── PaymentHistoryItem.tsx
│   │       ├── DetailRow.tsx
│   │       ├── PaymentDetailsCard.tsx
│   │       └── SubscriptionDetailsCard.tsx
│   │
│   ├── notifications/
│   │   └── components/
│   │       ├── NotificationItem.tsx
│   │       ├── NotificationToast.tsx
│   │       └── NotificationFilter.tsx
│   │
│   └── profile/
│       └── components/
│           ├── ProfileHeader.tsx
│           ├── SubscriptionsSection.tsx
│           └── TelegramProfileLoader.tsx
│
└── shared/
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   ├── FooterNav.tsx
    │   │   ├── BackHeader.tsx
    │   │   └── Footer.tsx
    │   │
    │   ├── common/
    │   │   ├── Loader.tsx
    │   │   ├── SkeletonLoader.tsx
    │   │   ├── SmartImage.tsx
    │   │   ├── Spinner.tsx
    │   │   ├── Spinner1.tsx
    │   │   ├── CustomSpinner.tsx
    │   │   ├── SplashScreen.tsx
    │   │   ├── InviteAlert.tsx
    │   │   ├── ThemeToggle.tsx
    │   │   ├── SkeletonLoaders.tsx
    │   │   ├── ConsultationsCard.tsx
    │   │   ├── IndicatorsCard.tsx
    │   │   └── ServiceCardV2.tsx
    │   │
    │   └── ErrorBoundary.tsx ✅
    │
    └── ui/ (shadcn components - لا تغيير)
```

---

## 📋 خطة التنفيذ التفصيلية

### المرحلة 1: نقل Subscriptions (8 ملفات)
- [ ] SubscriptionModal.tsx
- [ ] SubscriptionPlanCard.tsx
- [ ] SubscribeFab.tsx
- [ ] SubscriptionStatusListener.tsx
- [ ] TieredDiscountInfo.tsx
- [ ] PaymentButtons.tsx
- [ ] PlanFeaturesList.tsx
- [ ] useSubscriptionPayment.tsx

### المرحلة 2: نقل Academy (2 ملفات)
- [ ] AcademyHeroCard.tsx
- [ ] AcademyPurchaseModal.tsx

### المرحلة 3: نقل Payments (14 ملف)
- [ ] PaymentExchange.tsx
- [ ] PaymentExchangePage.tsx
- [ ] PaymentExchangeSuccess.tsx
- [ ] PaymentSuccessModal.tsx
- [ ] ExchangePaymentModal.tsx
- [ ] Bep20PaymentModal.tsx
- [ ] UsdtPaymentModal.tsx
- [ ] UsdtPaymentMethodModal.tsx
- [ ] IndicatorsPurchaseModal.tsx
- [ ] TradingPanelPurchaseModal.tsx
- [ ] PaymentHistoryItem.tsx
- [ ] DetailRow.tsx
- [ ] PaymentDetailsCard.tsx
- [ ] SubscriptionDetailsCard.tsx

### المرحلة 4: نقل Notifications (3 ملفات)
- [ ] NotificationItem.tsx
- [ ] NotificationToast.tsx
- [ ] NotificationFilter.tsx

### المرحلة 5: نقل Profile (3 ملفات)
- [ ] ProfileHeader.tsx
- [ ] SubscriptionsSection.tsx
- [ ] TelegramProfileLoader.tsx

### المرحلة 6: نقل Layout (4 ملفات)
- [ ] Navbar.tsx
- [ ] FooterNav.tsx
- [ ] BackHeader.tsx
- [ ] Footer.tsx

### المرحلة 7: نقل Common (13 ملف)
- [ ] Loader.tsx
- [ ] SkeletonLoader.tsx
- [ ] SmartImage.tsx
- [ ] Spinner.tsx
- [ ] Spinner1.tsx
- [ ] CustomSpinner.tsx
- [ ] SplashScreen.tsx
- [ ] InviteAlert.tsx
- [ ] ThemeToggle.tsx
- [ ] SkeletonLoaders.tsx
- [ ] ConsultationsCard.tsx
- [ ] IndicatorsCard.tsx
- [ ] ServiceCardV2.tsx

### المرحلة 8: تنظيف وإنهاء
- [ ] حذف المجلدات الفارغة
- [ ] تحديث جميع imports في pages/
- [ ] اختبار شامل
- [ ] Build نهائي

---

## 📊 الإحصائيات

| الفئة | عدد الملفات |
|-------|-------------|
| **تم (Auth)** | 3 ✅ |
| **Subscriptions** | 8 |
| **Academy** | 2 |
| **Payments** | 14 |
| **Notifications** | 3 |
| **Profile** | 3 |
| **Layout** | 4 |
| **Common** | 13 |
| **المجموع** | **50 ملف** |

---

## 🎯 الأولوية

1. **عالية:** Subscriptions, Payments (الأكثر استخداماً)
2. **متوسطة:** Academy, Profile, Notifications
3. **منخفضة:** Layout, Common

---

**الوقت المتوقع:** 2-3 ساعات للنقل الكامل
