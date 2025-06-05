-- إنشاء جدول اتصالات سلة
CREATE TABLE IF NOT EXISTS public.salla_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  store_id VARCHAR(255) UNIQUE NOT NULL,
  store_name VARCHAR(255),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  webhook_secret VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.salla_connections ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can manage own salla connections" ON public.salla_connections
  FOR ALL USING (auth.uid() = user_id);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_salla_connections_user_id ON public.salla_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_salla_connections_store_id ON public.salla_connections(store_id);
CREATE INDEX IF NOT EXISTS idx_salla_connections_active ON public.salla_connections(is_active);

-- إضافة حقول سلة للمستخدمين
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS salla_store_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS salla_connected BOOLEAN DEFAULT FALSE;
