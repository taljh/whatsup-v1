"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./AuthProvider"
import { database, type Template, type Settings } from "../../lib/supabase"

export default function PageContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("abandoned-carts")
  const [templates, setTemplates] = useState<Template[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<"name" | "text_content" | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // جلب القوالب
      const { data: templatesData } = await database.getTemplates()
      setTemplates(templatesData || [])

      // جلب الإعدادات
      const { data: settingsData } = await database.getSettings()
      setSettings(settingsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      // في حالة الخطأ، استخدم بيانات افتراضية
      setTemplates([
        {
          id: "template-1",
          user_id: "mock-user-id",
          name: "قالب التذكير الأول",
          type: "first",
          text_content: "مرحباً! لاحظنا أنك تركت بعض المنتجات في سلة التسوق. لا تفوت الفرصة واكمل طلبك الآن! 🛍️",
          image_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "template-2",
          user_id: "mock-user-id",
          name: "قالب العرض الخاص",
          type: "first",
          text_content: "عرض خاص لك! احصل على خصم 10% على طلبك المتروك. استخدم الكود: SAVE10 💰",
          image_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "template-3",
          user_id: "mock-user-id",
          name: "قالب التذكير الثاني",
          type: "second",
          text_content: "آخر فرصة! المنتجات في سلتك قد تنفد قريباً. اكمل طلبك الآن قبل فوات الأوان! ⏰",
          image_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "template-4",
          user_id: "mock-user-id",
          name: "قالب العرض المحدود",
          type: "second",
          text_content: "عرض محدود! خصم 15% + شحن مجاني على طلبك. الكود: FINAL15 🚚",
          image_url: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      setSettings({
        id: "mock-settings-id",
        user_id: "mock-user-id",
        is_active: true,
        delay_minutes_first: 60,
        delay_minutes_second: 1440,
        template_first_id: "template-1",
        template_second_id: "template-3",
        second_reminder_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateChange = async (templateId: string, type: "first" | "second") => {
    try {
      const updateData = type === "first" ? { template_first_id: templateId } : { template_second_id: templateId }

      await database.updateSettings(updateData)

      // تحديث الحالة المحلية
      setSettings((prev) => (prev ? { ...prev, ...updateData } : null))
    } catch (error) {
      console.error("Error updating template:", error)
    }
  }

  const handleDelayChange = async (minutes: number, type: "first" | "second") => {
    try {
      const updateData = type === "first" ? { delay_minutes_first: minutes } : { delay_minutes_second: minutes }

      await database.updateSettings(updateData)

      // تحديث الحالة المحلية
      setSettings((prev) => (prev ? { ...prev, ...updateData } : null))
    } catch (error) {
      console.error("Error updating delay:", error)
    }
  }

  const handleToggleSecondReminder = async (enabled: boolean) => {
    try {
      await database.updateSettings({ second_reminder_enabled: enabled })

      // تحديث الحالة المحلية
      setSettings((prev) => (prev ? { ...prev, second_reminder_enabled: enabled } : null))
    } catch (error) {
      console.error("Error updating second reminder:", error)
    }
  }

  const handleToggleSystem = async (enabled: boolean) => {
    try {
      await database.updateSettings({ is_active: enabled })

      // تحديث الحالة المحلية
      setSettings((prev) => (prev ? { ...prev, is_active: enabled } : null))
    } catch (error) {
      console.error("Error updating system status:", error)
    }
  }

  const handleTemplateUpdate = async (templateId: string, field: "name" | "text_content", value: string) => {
    try {
      const updateData = { [field]: value }
      await database.updateTemplate(templateId, updateData)

      // تحديث الحالة المحلية
      setTemplates((prev) =>
        prev.map((template) => (template.id === templateId ? { ...template, ...updateData } : template)),
      )

      setEditingTemplate(null)
      setEditingField(null)
    } catch (error) {
      console.error("Error updating template:", error)
    }
  }

  const handleCreateTemplate = async (type: "first" | "second") => {
    try {
      const newTemplate = {
        name: `قالب جديد - ${type === "first" ? "الرسالة الأولى" : "الرسالة الثانية"}`,
        type,
        text_content: "اكتب محتوى الرسالة هنا...",
        is_active: true,
      }

      const { data } = await database.createTemplate(newTemplate)
      if (data) {
        setTemplates((prev) => [...prev, data])
      }
    } catch (error) {
      console.error("Error creating template:", error)
    }
  }

  const getTemplatesByType = (type: "first" | "second") => {
    return templates.filter((t) => t.type === type && t.is_active)
  }

  if (loading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full">
      <div className="space-y-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("abandoned-carts")}
            className={`py-3 px-5 font-medium focus:outline-none transition-colors duration-200 ${
              activeTab === "abandoned-carts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            السلات المتروكة
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`py-3 px-5 font-medium focus:outline-none transition-colors duration-200 ${
              activeTab === "templates"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            قوالب الواتساب
          </button>
        </div>

        {/* Abandoned Carts Tab */}
        {activeTab === "abandoned-carts" && (
          <div className="space-y-8">
            {/* Section Title and Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">السلات المتروكة</h3>
              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings?.is_active !== false}
                  onChange={(e) => handleToggleSystem(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              استرداد المبيعات المفقودة من خلال اتخاذ إجراءات ومتابعة العملاء الذين يتركون سلات التسوق قبل اكمال عملية
              الشراء. سنقوم بتضمين رابط السلة تلقائيا في الرسالة.
            </p>

            {/* Message Template Section 1 */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h4 className="text-md font-medium text-gray-800">الرسالة</h4>
              </div>

              {/* Template Selector */}
              <div className="relative">
                <select
                  className="appearance-none w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                  value={settings?.template_first_id || ""}
                  onChange={(e) => handleTemplateChange(e.target.value, "first")}
                >
                  <option value="">اختر القالب</option>
                  {getTemplatesByType("first").map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              {/* Delay Selector */}
              {settings?.template_first_id && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    المدة الزمنية قبل الإرسال (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10080"
                    value={settings?.delay_minutes_first || 60}
                    onChange={(e) => handleDelayChange(Number.parseInt(e.target.value) || 60, "first")}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                    placeholder="60"
                  />
                  <p className="text-xs text-gray-500">
                    سيتم إرسال الرسالة بعد {settings?.delay_minutes_first || 60} دقيقة من ترك السلة
                  </p>
                </div>
              )}
            </div>

            {/* Message Template Section 2 (Reminder) */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-md font-medium text-gray-800">الرسالة الثانية (تذكير)</h4>
                </div>
                {/* Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings?.second_reminder_enabled || false}
                    onChange={(e) => handleToggleSecondReminder(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {/* Template Selector */}
              <div className="relative">
                <select
                  className="appearance-none w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                  value={settings?.template_second_id || ""}
                  onChange={(e) => handleTemplateChange(e.target.value, "second")}
                  disabled={!settings?.second_reminder_enabled}
                >
                  <option value="">اختر القالب</option>
                  {getTemplatesByType("second").map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              {/* Delay Selector */}
              {settings?.template_second_id && settings?.second_reminder_enabled && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    المدة الزمنية قبل الإرسال (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10080"
                    value={settings?.delay_minutes_second || 1440}
                    onChange={(e) => handleDelayChange(Number.parseInt(e.target.value) || 1440, "second")}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:border-blue-500 bg-white shadow-sm"
                    placeholder="1440"
                  />
                  <p className="text-xs text-gray-500">
                    سيتم إرسال الرسالة بعد {settings?.delay_minutes_second || 1440} دقيقة كتذكير آخر
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">قوالب الواتساب</h3>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              قم بإنشاء وتعديل قوالب الرسائل التي سيتم إرسالها للعملاء. يمكنك النقر على أي نص لتعديله مباشرة.
            </p>

            {/* First Message Templates */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-800">قوالب الرسالة الأولى</h4>
                <button
                  onClick={() => handleCreateTemplate("first")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  + إضافة قالب جديد
                </button>
              </div>

              <div className="grid gap-4">
                {getTemplatesByType("first").map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    {/* Template Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">اسم القالب</label>
                      {editingTemplate === template.id && editingField === "name" ? (
                        <input
                          type="text"
                          defaultValue={template.name}
                          onBlur={(e) => handleTemplateUpdate(template.id, "name", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleTemplateUpdate(template.id, "name", e.currentTarget.value)
                            }
                          }}
                          autoFocus
                          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setEditingTemplate(template.id)
                            setEditingField("name")
                          }}
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-300 transition-colors"
                        >
                          {template.name}
                        </div>
                      )}
                    </div>

                    {/* Template Content */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">محتوى الرسالة</label>
                      {editingTemplate === template.id && editingField === "text_content" ? (
                        <textarea
                          defaultValue={template.text_content}
                          onBlur={(e) => handleTemplateUpdate(template.id, "text_content", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              handleTemplateUpdate(template.id, "text_content", e.currentTarget.value)
                            }
                          }}
                          autoFocus
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 resize-none"
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setEditingTemplate(template.id)
                            setEditingField("text_content")
                          }}
                          className="cursor-pointer hover:bg-gray-50 p-3 rounded border border-transparent hover:border-gray-300 transition-colors min-h-[100px] whitespace-pre-wrap"
                        >
                          {template.text_content}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      آخر تحديث: {new Date(template.updated_at).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Second Message Templates */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-800">قوالب الرسالة الثانية</h4>
                <button
                  onClick={() => handleCreateTemplate("second")}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  + إضافة قالب جديد
                </button>
              </div>

              <div className="grid gap-4">
                {getTemplatesByType("second").map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    {/* Template Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">اسم القالب</label>
                      {editingTemplate === template.id && editingField === "name" ? (
                        <input
                          type="text"
                          defaultValue={template.name}
                          onBlur={(e) => handleTemplateUpdate(template.id, "name", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleTemplateUpdate(template.id, "name", e.currentTarget.value)
                            }
                          }}
                          autoFocus
                          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setEditingTemplate(template.id)
                            setEditingField("name")
                          }}
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-300 transition-colors"
                        >
                          {template.name}
                        </div>
                      )}
                    </div>

                    {/* Template Content */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">محتوى الرسالة</label>
                      {editingTemplate === template.id && editingField === "text_content" ? (
                        <textarea
                          defaultValue={template.text_content}
                          onBlur={(e) => handleTemplateUpdate(template.id, "text_content", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              handleTemplateUpdate(template.id, "text_content", e.currentTarget.value)
                            }
                          }}
                          autoFocus
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 resize-none"
                        />
                      ) : (
                        <div
                          onClick={() => {
                            setEditingTemplate(template.id)
                            setEditingField("text_content")
                          }}
                          className="cursor-pointer hover:bg-gray-50 p-3 rounded border border-transparent hover:border-gray-300 transition-colors min-h-[100px] whitespace-pre-wrap"
                        >
                          {template.text_content}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      آخر تحديث: {new Date(template.updated_at).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
