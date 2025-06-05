-- إدراج قوالب افتراضية للمستخدمين الجدد
CREATE OR REPLACE FUNCTION public.create_default_templates_for_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- إدراج القوالب الافتراضية
  INSERT INTO public.templates (user_id, name, type, text_content) VALUES
    (user_uuid, 'قالب التذكير الأول', 'first', 'مرحباً! لاحظنا أنك تركت بعض المنتجات في سلة التسوق. لا تفوت الفرصة واكمل طلبك الآن! 🛍️'),
    (user_uuid, 'قالب العرض الخاص', 'first', 'عرض خاص لك! احصل على خصم 10% على طلبك المتروك. استخدم الكود: SAVE10 💰'),
    (user_uuid, 'قالب التذكير الثاني', 'second', 'آخر فرصة! المنتجات في سلتك قد تنفد قريباً. اكمل طلبك الآن قبل فوات الأوان! ⏰'),
    (user_uuid, 'قالب العرض المحدود', 'second', 'عرض محدود! خصم 15% + شحن مجاني على طلبك. الكود: FINAL15 🚚');

  -- إنشاء إعدادات افتراضية
  INSERT INTO public.settings (user_id, template_first_id, template_second_id)
  SELECT 
    user_uuid,
    (SELECT id FROM public.templates WHERE user_id = user_uuid AND type = 'first' LIMIT 1),
    (SELECT id FROM public.templates WHERE user_id = user_uuid AND type = 'second' LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تحديث دالة إنشاء المستخدم لتشمل القوالب الافتراضية
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  customer_role_id UUID;
BEGIN
  -- الحصول على معرف دور العميل
  SELECT id INTO customer_role_id FROM public.roles WHERE name = 'customer';
  
  -- إدراج المستخدم الجديد
  INSERT INTO public.users (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email);
  
  -- ربط المستخدم بدور العميل
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (NEW.id, customer_role_id);
  
  -- إنشاء القوالب والإعدادات الافتراضية
  PERFORM public.create_default_templates_for_user(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
