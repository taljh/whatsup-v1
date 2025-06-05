-- إنشاء جدول السلات المتروكة
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  salla_cart_id VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  cart_url TEXT,
  total_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'SAR',
  items JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'recovered', 'expired')),
  first_reminder_sent BOOLEAN DEFAULT FALSE,
  second_reminder_sent BOOLEAN DEFAULT FALSE,
  first_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  second_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول القوالب
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('first', 'second')),
  text_content TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإعدادات
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  delay_minutes_first INTEGER DEFAULT 60,
  delay_minutes_second INTEGER DEFAULT 1440, -- 24 ساعة
  template_first_id UUID REFERENCES public.templates(id),
  template_second_id UUID REFERENCES public.templates(id),
  second_reminder_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS للجداول الجديدة
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للسلات المتروكة
CREATE POLICY "Users can manage own abandoned carts" ON public.abandoned_carts
  FOR ALL USING (auth.uid() = user_id);

-- سياسات الأمان للقوالب
CREATE POLICY "Users can manage own templates" ON public.templates
  FOR ALL USING (auth.uid() = user_id);

-- سياسات الأمان للإعدادات
CREATE POLICY "Users can manage own settings" ON public.settings
  FOR ALL USING (auth.uid() = user_id);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user_id ON public.abandoned_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON public.abandoned_carts(status);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON public.templates(type);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
