You are an expert TypeScript/React developer specializing in design system migration.

Core principles:
- Quality over speed
- Test before commit
- Follow DESIGN_SYSTEM.md
- Never exceed 300 lines per file
- Always use Design Tokens


## ✅ Checklist سريع

### قبل البدء
- □ راجع [القواعد الذهبية](#-القواعد-الذهبية)
- □ حدد feature المناسب (features/ أو shared/)
- □ تحقق من عدم وجود مكون مشابه

### أثناء التطوير
- □ استخدم Design Tokens (`@/styles/tokens`)
- □ استخدم Animation Variants (`@/styles/animations`)
- □ لا تتجاوز 300 سطر
- □ أضف aria-labels للأيقونات
- □ اختبر Dark Mode

### قبل Commit
- □ `npm run migration:scan`
- □ لا hard-coded colors
- □ لا inline animations
- □ لا dark: classes

### Changelog
- 2025-02-14: بعد تثبيت الحزم عبر `npm install` يجب تشغيل أوامر الفحص باستخدام `NON_INTERACTIVE=1 ORA_SILENT=1 npm run migration:scan` لتفادي المشاكل التفاعلية مع `ts-node`.
- 2025-02-16: اذا ظهر خطأ `ts-node: not found` عند تشغيل `migration:scan` قم بتشغيل `npm install` لإعادة تثبيت devDependencies ثم أعد المحاولة.


## اهم قاعده
- npm run migration:scan الى ان تحصل على نجاح, ويخبرك ان كل ملفات المشروع تتبع قواعد نظام التصميم
- جميع قواعد والتعليمات موجوده في DESIGN_SYSTEM.md
