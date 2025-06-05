# دليل إعداد منصة السلات المتروكة

## 📋 المتطلبات الأساسية

- Node.js 18+ 
- npm أو yarn أو pnpm
- حساب Supabase (مجاني)

## 🚀 خطوات التفعيل

### 1. تحضير المشروع

\`\`\`bash
# تثبيت المكتبات
npm install

# أو
yarn install

# أو
pnpm install
\`\`\`

### 2. إعداد قاعدة البيانات (Supabase)

#### أ. إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب جديد أو سجل دخولك
3. اضغط على "New Project"
4. اختر منظمة أو أنشئ واحدة جديدة
5. أدخل تفاصيل المشروع:
   - **Name**: WhatsApp Cart Recovery
   - **Database Password**: كلمة مرور قوية (احفظها!)
   - **Region**: اختر أقرب منطقة لك
6. اضغط "Create new project"
7. انتظر حتى يكتمل إنشاء المشروع (2-3 دقائق)

#### ب. الحصول على مفاتيح API

1. في لوحة تحكم Supabase، اذهب إلى **Settings** > **API**
2. ستجد:
   - **Project URL**: انسخه
   - **anon/public key**: انسخه

#### ج. تكوين متغيرات البيئة

1. انسخ ملف `.env.local.example` إلى `.env.local`:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

2. افتح `.env.local` وأدخل القيم:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 3. إنشاء جداول قاعدة البيانات

#### الطريقة الأولى: SQL Editor في Supabase

1. في لوحة تحكم Supabase، اذهب إلى **SQL Editor**
2. شغّل السكريبتات بالترتيب التالي:

**أولاً: إنشاء جداول المصادقة**
\`\`\`sql
-- انسخ محتوى scripts/01-create-auth-tables.sql والصقه هنا
\`\`\`

**ثانياً: إنشاء جداول الأعمال**
\`\`\`sql
-- انسخ محتوى scripts/02-create-business-tables.sql والصقه هنا
\`\`\`

**ثالثاً: إدراج البيانات الافتراضية**
\`\`\`sql
-- انسخ محتوى scripts/03-insert-default-data.sql والصقه هنا
\`\`\`

#### الطريقة الثانية: استخدام psql (للمطورين المتقدمين)

\`\`\`bash
# الاتصال بقاعدة البيانات
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# تشغيل السكريبتات
\i scripts/01-create-auth-tables.sql
\i scripts/02-create-business-tables.sql
\i scripts/03-insert-default-data.sql
\`\`\`

### 4. تشغيل التطبيق

\`\`\`bash
npm run dev
\`\`\`

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## ✅ التحقق من التفعيل

### علامات نجاح التفعيل:

1. **اختفاء شريط "وضع التطوير"** من أعلى الصفحة
2. **ظهور "متصل بقاعدة البيانات"** في الزاوية السفلى
3. **إمكانية إنشاء حساب جديد** وتسجيل الدخول
4. **حفظ التغييرات** في القوالب والإعدادات

### في حالة وجود مشاكل:

1. **تحقق من متغيرات البيئة**:
   - تأكد من صحة NEXT_PUBLIC_SUPABASE_URL
   - تأكد من صحة NEXT_PUBLIC_SUPABASE_ANON_KEY
   - أعد تشغيل التطبيق بعد التغيير

2. **تحقق من قاعدة البيانات**:
   - تأكد من تشغيل جميع السكريبتات
   - تحقق من وجود الجداول في Supabase

3. **تحقق من وحدة التحكم**:
   - افتح Developer Tools (F12)
   - ابحث عن أخطاء في Console

## 🔧 الميزات المتاحة

### بعد التفعيل الكامل:

- ✅ **نظام مصادقة كامل** (تسجيل دخول/إنشاء حساب)
- ✅ **إدارة قوالب الواتساب** (إنشاء/تعديل/حذف)
- ✅ **إعدادات السلات المتروكة** (مدد زمنية/تفعيل)
- ✅ **ربط واتساب ويب** (تجريبي)
- ✅ **حفظ البيانات** في قاعدة البيانات
- ✅ **أمان البيانات** مع Row Level Security

### في وضع التطوير (بدون Supabase):

- ✅ **جميع الواجهات** تعمل ببيانات وهمية
- ✅ **تجربة كاملة** للنظام
- ❌ **لا يتم حفظ البيانات** (تختفي عند إعادة التحميل)

## 📞 الدعم

إذا واجهت أي مشاكل:

1. تحقق من [وثائق Supabase](https://supabase.com/docs)
2. راجع ملف `TROUBLESHOOTING.md`
3. تحقق من Issues في GitHub

## 🔒 الأمان

- لا تشارك ملف `.env.local` مع أحد
- احتفظ بكلمة مرور قاعدة البيانات في مكان آمن
- استخدم HTTPS في الإنتاج
- فعّل Row Level Security في Supabase
\`\`\`

الآن سأضيف ملف استكشاف الأخطاء:
