# استكشاف الأخطاء وحلها

## 🚨 المشاكل الشائعة وحلولها

### 1. "وضع التطوير" لا يختفي

**السبب**: متغيرات البيئة غير مكونة بشكل صحيح

**الحل**:
\`\`\`bash
# تحقق من وجود الملف
ls -la .env.local

# تحقق من محتوى الملف
cat .env.local

# تأكد من عدم وجود مسافات إضافية
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
\`\`\`

### 2. خطأ "Invalid API key"

**السبب**: مفتاح API غير صحيح

**الحل**:
1. اذهب إلى Supabase Dashboard
2. Settings > API
3. انسخ **anon/public** key (ليس service_role)
4. تأكد من نسخ المفتاح كاملاً

### 3. خطأ "Project not found"

**السبب**: رابط المشروع غير صحيح

**الحل**:
1. تحقق من رابط المشروع في Supabase
2. يجب أن يكون بالشكل: `https://[project-ref].supabase.co`
3. لا تضع `/` في النهاية

### 4. لا يمكن إنشاء حساب جديد

**السبب**: جداول قاعدة البيانات غير موجودة

**الحل**:
1. اذهب إلى Supabase > SQL Editor
2. شغّل السكريبتات بالترتيب:
   - `01-create-auth-tables.sql`
   - `02-create-business-tables.sql`
   - `03-insert-default-data.sql`

### 5. خطأ "RLS policy violation"

**السبب**: سياسات الأمان غير مفعلة

**الحل**:
\`\`\`sql
-- في SQL Editor، شغّل:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
\`\`\`

### 6. البيانات لا تُحفظ

**السبب**: مشكلة في الاتصال أو الصلاحيات

**الحل**:
1. تحقق من Console في المتصفح (F12)
2. ابحث عن رسائل خطأ
3. تأكد من تشغيل جميع السكريبتات

### 7. خطأ "Failed to fetch"

**السبب**: مشكلة في الشبكة أو CORS

**الحل**:
1. تحقق من اتصال الإنترنت
2. تأكد من صحة رابط Supabase
3. أعد تشغيل التطبيق

## 🔍 تشخيص المشاكل

### فحص متغيرات البيئة

\`\`\`javascript
// أضف هذا في أي مكون React للتحقق
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
\`\`\`

### فحص الاتصال بقاعدة البيانات

\`\`\`javascript
// في المتصفح Console
import { supabase } from './src/lib/supabase'
const { data, error } = await supabase.from('users').select('count')
console.log('Connection test:', { data, error })
\`\`\`

### فحص الجداول

في Supabase Dashboard > Table Editor، تأكد من وجود:
- `users`
- `roles`
- `user_roles`
- `templates`
- `settings`
- `abandoned_carts`

## 📋 قائمة التحقق

- [ ] ملف `.env.local` موجود ومكون بشكل صحيح
- [ ] متغيرات البيئة صحيحة (URL + Key)
- [ ] مشروع Supabase نشط وجاهز
- [ ] جميع السكريبتات تم تشغيلها
- [ ] الجداول موجودة في قاعدة البيانات
- [ ] RLS مفعل على الجداول
- [ ] التطبيق تم إعادة تشغيله بعد التغييرات

## 🆘 طلب المساعدة

إذا لم تحل المشكلة:

1. **جمع المعلومات**:
   - نسخة Node.js: `node --version`
   - نسخة npm: `npm --version`
   - نظام التشغيل
   - رسالة الخطأ كاملة

2. **فحص Logs**:
   - Console في المتصفح
   - Terminal حيث يعمل التطبيق
   - Supabase Logs في Dashboard

3. **إنشاء Issue**:
   - اذهب إلى GitHub Repository
   - أنشئ Issue جديد
   - أرفق المعلومات والصور

## 🔄 إعادة التعيين الكاملة

إذا فشل كل شيء:

\`\`\`bash
# 1. احذف node_modules
rm -rf node_modules

# 2. احذف .next
rm -rf .next

# 3. أعد تثبيت المكتبات
npm install

# 4. أعد إنشاء .env.local
cp .env.local.example .env.local
# ثم أدخل القيم الصحيحة

# 5. أعد تشغيل التطبيق
npm run dev
\`\`\`

في Supabase:
1. احذف جميع الجداول
2. أعد تشغيل السكريبتات بالترتيب
3. تأكد من تفعيل RLS
\`\`\`

أخيراً، سأضيف ملف .gitignore محدث:

```plaintext file=".gitignore"
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
.env.development
.env.production

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Logs
logs
*.log

# Supabase
.supabase/
