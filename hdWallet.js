require('dotenv').config();
const { ethers } = require('ethers');

// الحصول على عبارة الاسترداد من متغير البيئة
const mnemonic = process.env.NEXT_PUBLIC_MASTER_MNEMONIC;
if (!mnemonic) {
  throw new Error("NEXT_PUBLIC_MASTER_MNEMONIC غير موجود في متغيرات البيئة. يرجى إضافته في ملف .env.local");
}

// توليد الـ HD Node من العبارة
const masterNode = ethers.utils.HDNode.fromMnemonic(mnemonic);

// اختيار مسار اشتقاق قياسي لمعاملات Ethereum/BSC
const derivationPath = "m/44'/60'/0'/0/";
console.log("مسار الاشتقاق المستخدم:", derivationPath);

// استخراج عنوان فرعي باستخدام index 0
const childNode = masterNode.derivePath(derivationPath + "0");
console.log("عنوان المحفظة الرئيسية:", masterNode.address);
console.log("عنوان الفرعي (index 0):", childNode.address);
