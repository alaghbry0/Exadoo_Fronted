// Script لإنشاء re-exports للملفات المنقولة
const fs = require('fs');

const reexports = [
  // Subscriptions
  { old: 'src/components/SubscriptionModal.tsx', new: '@/features/subscriptions/components/SubscriptionModal' },
  { old: 'src/components/SubscriptionPlanCard.tsx', new: '@/features/subscriptions/components/SubscriptionPlanCard' },
  { old: 'src/components/SubscribeFab.tsx', new: '@/features/subscriptions/components/SubscribeFab' },
  { old: 'src/components/SubscriptionStatusListener.tsx', new: '@/features/subscriptions/components/SubscriptionStatusListener' },
  { old: 'src/components/TieredDiscountInfo.tsx', new: '@/features/subscriptions/components/TieredDiscountInfo' },
  
  // Academy
  { old: 'src/components/AcademyHeroCard.tsx', new: '@/features/academy/components/AcademyHeroCard' },
  { old: 'src/components/AcademyPurchaseModal.tsx', new: '@/features/academy/components/AcademyPurchaseModal' },
  
  // Payments
  { old: 'src/components/PaymentExchange.tsx', new: '@/features/payments/components/PaymentExchange' },
  { old: 'src/components/PaymentExchangePage.tsx', new: '@/features/payments/components/PaymentExchangePage' },
  { old: 'src/components/PaymentExchangeSuccess.tsx', new: '@/features/payments/components/PaymentExchangeSuccess' },
  { old: 'src/components/PaymentSuccessModal.tsx', new: '@/features/payments/components/PaymentSuccessModal' },
  { old: 'src/components/ExchangePaymentModal.tsx', new: '@/features/payments/components/ExchangePaymentModal' },
  { old: 'src/components/Bep20PaymentModal.tsx', new: '@/features/payments/components/Bep20PaymentModal' },
  { old: 'src/components/UsdtPaymentModal.tsx', new: '@/features/payments/components/UsdtPaymentModal' },
  { old: 'src/components/UsdtPaymentMethodModal.tsx', new: '@/features/payments/components/UsdtPaymentMethodModal' },
  { old: 'src/components/IndicatorsPurchaseModal.tsx', new: '@/features/payments/components/IndicatorsPurchaseModal' },
  { old: 'src/components/TradingPanelPurchaseModal.tsx', new: '@/features/payments/components/TradingPanelPurchaseModal' },
  { old: 'src/components/PaymentHistoryItem.tsx', new: '@/features/payments/components/PaymentHistoryItem' },
  
  // Notifications
  { old: 'src/components/NotificationItem.tsx', new: '@/features/notifications/components/NotificationItem' },
  { old: 'src/components/NotificationToast.tsx', new: '@/features/notifications/components/NotificationToast' },
  { old: 'src/components/NotificationFilter.tsx', new: '@/features/notifications/components/NotificationFilter' },
  
  // Profile
  { old: 'src/components/Profile/ProfileHeader.tsx', new: '@/features/profile/components/ProfileHeader' },
  { old: 'src/components/Profile/SubscriptionsSection.tsx', new: '@/features/profile/components/SubscriptionsSection' },
  
  // Layout
  { old: 'src/components/Navbar.tsx', new: '@/shared/components/layout/Navbar' },
  { old: 'src/components/FooterNav.tsx', new: '@/shared/components/layout/FooterNav' },
  { old: 'src/components/BackHeader.tsx', new: '@/shared/components/layout/BackHeader' },
  { old: 'src/components/Footer.tsx', new: '@/shared/components/layout/Footer' },
  
  // Common
  { old: 'src/components/Loader.tsx', new: '@/shared/components/common/Loader' },
  { old: 'src/components/SkeletonLoader.tsx', new: '@/shared/components/common/SkeletonLoader' },
  { old: 'src/components/SmartImage.tsx', new: '@/shared/components/common/SmartImage' },
  { old: 'src/components/Spinner.tsx', new: '@/shared/components/common/Spinner' },
  { old: 'src/components/Spinner1.tsx', new: '@/shared/components/common/Spinner1' },
  { old: 'src/components/CustomSpinner.tsx', new: '@/shared/components/common/CustomSpinner' },
  { old: 'src/components/SplashScreen.tsx', new: '@/shared/components/common/SplashScreen' },
  { old: 'src/components/InviteAlert.tsx', new: '@/shared/components/common/InviteAlert' },
  { old: 'src/components/ThemeToggle.tsx', new: '@/shared/components/common/ThemeToggle' },
];

reexports.forEach(({ old, new: newPath }) => {
  const content = `// Re-export for backward compatibility
// TODO: Update imports to use ${newPath}
export { default } from '${newPath}';
export * from '${newPath}';
`;
  
  try {
    fs.writeFileSync(old, content, 'utf8');
    console.log(`✅ Created re-export: ${old}`);
  } catch (err) {
    console.error(`❌ Failed to create re-export for ${old}:`, err.message);
  }
});

console.log('\n🎉 Re-exports created successfully!');
