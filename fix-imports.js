const fs = require('fs');
const path = require('path');

// قائمة بالمسارات القديمة والجديدة
const importReplacements = [
  // Context
  { from: "from '../context/TelegramContext'", to: "from '@/context/TelegramContext'" },
  { from: 'from "../context/TelegramContext"', to: 'from "@/context/TelegramContext"' },
  { from: "from '../../context/TelegramContext'", to: "from '@/context/TelegramContext'" },
  
  // Components - General patterns
  { from: "from '../components/", to: "from '@/components/" },
  { from: 'from "../components/', to: 'from "@/components/' },
  { from: "from '../../components/", to: "from '@/components/" },
  { from: 'from "../../components/', to: 'from "@/components/' },
  
  // Specific updates for features
  { from: '@/components/Spinner', to: '@/shared/components/common/Spinner' },
  { from: '@/components/Loader', to: '@/shared/components/common/Loader' },
  { from: '@/components/SmartImage', to: '@/shared/components/common/SmartImage' },
  { from: '@/components/SplashScreen', to: '@/shared/components/common/SplashScreen' },
  { from: '@/components/Navbar', to: '@/shared/components/layout/Navbar' },
  { from: '@/components/FooterNav', to: '@/shared/components/layout/FooterNav' },
  { from: '@/components/BackHeader', to: '@/shared/components/layout/BackHeader' },
  
  // Subscription components
  { from: '@/components/SubscriptionModal/useSubscriptionPayment', to: '@/features/subscriptions/components/useSubscriptionPayment' },
  { from: '@/components/SubscriptionModal/PaymentButtons', to: '@/features/subscriptions/components/PaymentButtons' },
  { from: '@/components/SubscriptionModal/PlanFeaturesList', to: '@/features/subscriptions/components/PlanFeaturesList' },
  
  // Payment components
  { from: '@/components/UsdtPaymentMethodModal', to: '@/features/payments/components/UsdtPaymentMethodModal' },
  { from: '@/components/ExchangePaymentModal', to: '@/features/payments/components/ExchangePaymentModal' },
  { from: '@/components/PaymentSuccessModal', to: '@/features/payments/components/PaymentSuccessModal' },
  { from: '@/components/PaymentExchangeSuccess', to: '@/features/payments/components/PaymentExchangeSuccess' },
  { from: '@/components/Bep20PaymentModal', to: '@/features/payments/components/Bep20PaymentModal' },
  
  // Notification components
  { from: '@/components/NotificationToast', to: '@/features/notifications/components/NotificationToast' },
];

function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    importReplacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`❌ Error updating ${filePath}:`, err.message);
    return false;
  }
}

function processDirectory(dir) {
  let count = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      if (updateImports(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

console.log('🔄 Starting import fixes...\n');

const directories = [
  'src/features',
  'src/shared/components'
];

let totalUpdated = 0;
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Processing ${dir}...`);
    const updated = processDirectory(dir);
    totalUpdated += updated;
    console.log(`✅ Updated ${updated} files in ${dir}`);
  }
});

console.log(`\n🎉 Total files updated: ${totalUpdated}`);
