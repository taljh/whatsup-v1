-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(20),
  whatsapp_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول قوالب الرسائل
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  template_content TEXT NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'first_reminder' أو 'second_reminder'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول إعدادات السلات المتروكة
CREATE TABLE IF NOT EXISTS abandoned_cart_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT TRUE,
  first_reminder_template_id UUID REFERENCES message_templates(id),
  second_reminder_enabled BOOLEAN DEFAULT FALSE,
  second_reminder_template_id UUID REFERENCES message_templates(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج بيانات تجريبية
INSERT INTO users (email, name, whatsapp_number, whatsapp_connected) 
VALUES ('raz.abayas@gmail.com', 'Talal', '+966501234567', FALSE)
ON CONFLICT (email) DO NOTHING;
