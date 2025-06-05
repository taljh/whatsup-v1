-- إدراج القوالب الافتراضية
WITH user_data AS (
  SELECT id FROM users WHERE email = 'raz.abayas@gmail.com' LIMIT 1
)
INSERT INTO message_templates (user_id, template_name, template_content, template_type)
SELECT 
  user_data.id,
  template_name,
  template_content,
  template_type
FROM user_data,
(VALUES 
  ('قالب تذكير بالسلة المتروكة', 'مرحباً! لاحظنا أنك تركت بعض المنتجات في سلة التسوق. لا تفوت الفرصة واكمل طلبك الآن!', 'first_reminder'),
  ('قالب عرض خصم', 'مرحباً! احصل على خصم 10% على طلبك المتروك. استخدم الكود: SAVE10', 'first_reminder'),
  ('قالب تذكير ثاني', 'آخر فرصة! المنتجات في سلتك قد تنفد قريباً. اكمل طلبك الآن قبل فوات الأوان!', 'second_reminder'),
  ('قالب عرض خاص', 'عرض خاص لك! خصم 15% على طلبك + شحن مجاني. الكود: SPECIAL15', 'second_reminder')
) AS templates(template_name, template_content, template_type)
ON CONFLICT DO NOTHING;
