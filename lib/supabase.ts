import { createClient } from "@supabase/supabase-js"

// التحقق من متغيرات البيئة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// التحقق من صحة تكوين Supabase
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "undefined" &&
  supabaseAnonKey !== "undefined" &&
  supabaseUrl !== "" &&
  supabaseAnonKey !== ""
)

console.log("Supabase configured:", isSupabaseConfigured)
if (isSupabaseConfigured) {
  console.log("Supabase URL:", supabaseUrl?.substring(0, 30) + "...")
} else {
  console.log("Supabase not configured, using mock client")
}

// إنشاء عميل Supabase أو عميل وهمي
let supabase: any

if (isSupabaseConfigured) {
  // إنشاء عميل Supabase الحقيقي
  supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
} else {
  // إنشاء عميل وهمي للتطوير
  supabase = {
    auth: {
      signUp: async () => ({ data: { user: { id: "mock-user-id" } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: "mock-user-id" } }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: { id: "mock-user-id" } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      upsert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  }
}

export { supabase }

// أنواع البيانات
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  salla_token?: string
  salla_store_id?: string
  salla_connected?: boolean
  whatsapp_status: boolean
  whatsapp_session_data?: any
  whatsapp_number?: string
  whatsapp_connected?: boolean
  created_at: string
  updated_at: string
}

export interface SallaConnection {
  id: string
  user_id: string
  store_id: string
  store_name: string
  access_token: string
  refresh_token: string
  token_expires_at?: string
  webhook_secret?: string
  is_active: boolean
  last_sync_at?: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description: string
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  role: Role
  created_at: string
}

export interface Template {
  id: string
  user_id: string
  name: string
  type: "first" | "second"
  text_content: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Settings {
  id: string
  user_id: string
  is_active: boolean
  delay_minutes_first: number
  delay_minutes_second: number
  template_first_id?: string
  template_second_id?: string
  second_reminder_enabled: boolean
  created_at: string
  updated_at: string
}

export interface AbandonedCart {
  id: string
  user_id: string
  salla_cart_id?: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  cart_url: string
  total_amount: number
  currency: string
  items?: any
  status: "pending" | "recovered" | "expired"
  first_reminder_sent: boolean
  second_reminder_sent: boolean
  first_reminder_sent_at?: string
  second_reminder_sent_at?: string
  recovered_at?: string
  created_at: string
  updated_at: string
}

// بيانات وهمية للاستخدام في وضع التطوير
const mockTemplates: Template[] = [
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
]

const mockSettings: Settings = {
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
}

const mockUser: User = {
  id: "mock-user-id",
  name: "مستخدم تجريبي",
  email: "demo@example.com",
  phone: "+966501234567",
  whatsapp_status: false,
  salla_connected: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// دوال المصادقة
export const auth = {
  signUp: async (email: string, password: string, name: string) => {
    try {
      console.log("Attempting to sign up with email:", email)

      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock signup data")
        return {
          data: { user: { ...mockUser, email, name } },
          error: null,
        }
      }

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      console.log("Signup result:", result)
      return result
    } catch (error) {
      console.error("Auth error during signup:", error)
      return {
        data: { user: null },
        error: { message: "خطأ في إنشاء الحساب" },
      }
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email)

      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock signin data")
        return {
          data: { user: { ...mockUser, email } },
          error: null,
        }
      }

      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Signin result:", result)
      return result
    } catch (error) {
      console.error("Auth error during signin:", error)
      return {
        data: { user: null },
        error: { message: "خطأ في تسجيل الدخول" },
      }
    }
  },

  signOut: async () => {
    try {
      if (!isSupabaseConfigured) {
        console.log("Development mode: Mock signout")
        return { error: null }
      }

      return await supabase.auth.signOut()
    } catch (error) {
      console.error("Auth error during signout:", error)
      return { error: null }
    }
  },

  getCurrentUser: async () => {
    try {
      console.log("Getting current user from Supabase")

      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock user")
        return mockUser
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log("Current user:", user)
      return user
    } catch (error) {
      console.error("Auth error getting current user:", error)
      return null
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    try {
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock auth state change")
        // محاكاة تغيير حالة المصادقة
        setTimeout(() => {
          callback("SIGNED_IN", { user: mockUser })
        }, 100)
        return { data: { subscription: { unsubscribe: () => {} } } }
      }

      return supabase.auth.onAuthStateChange(callback)
    } catch (error) {
      console.error("Auth error during state change:", error)
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  },
}

// دوال قاعدة البيانات
export const database = {
  // المستخدمين
  getCurrentUserProfile: async () => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock user profile")
        return {
          data: mockUser,
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.log("No authenticated user found")
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      console.log("Fetching user profile for ID:", user.id)
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          user_roles (
            role:roles (*)
          ),
          salla_connections (*)
        `)
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return {
          data: null,
          error,
        }
      }

      console.log("User profile fetched:", data)
      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في جلب بيانات المستخدم" },
      }
    }
  },

  updateUserProfile: async (updates: Partial<User>) => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock updated user profile")
        return {
          data: { ...mockUser, ...updates, updated_at: new Date().toISOString() },
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("users")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في تحديث بيانات المستخدم" },
      }
    }
  },

  // اتصالات سلة
  getSallaConnection: async () => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock Salla connection")
        return {
          data: {
            id: "mock-connection-id",
            user_id: "mock-user-id",
            store_id: "123456",
            store_name: "متجر تجريبي",
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("salla_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في جلب بيانات اتصال سلة" },
      }
    }
  },

  // القوالب
  getTemplates: async () => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock templates")
        return {
          data: mockTemplates,
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: [],
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true })

      return { data: data || [], error }
    } catch (error) {
      console.error("Database error:", error)
      return { data: [], error: { message: "خطأ في جلب القوالب" } }
    }
  },

  createTemplate: async (template: Omit<Template, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock created template")
        const newTemplate = {
          id: `template-${Date.now()}`,
          user_id: "mock-user-id",
          ...template,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockTemplates.push(newTemplate)
        return {
          data: newTemplate,
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("templates")
        .insert({
          ...template,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في إنشاء القالب" },
      }
    }
  },

  updateTemplate: async (id: string, updates: Partial<Template>) => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock updated template")
        const templateIndex = mockTemplates.findIndex((t) => t.id === id)
        if (templateIndex >= 0) {
          mockTemplates[templateIndex] = {
            ...mockTemplates[templateIndex],
            ...updates,
            updated_at: new Date().toISOString(),
          }
          return {
            data: mockTemplates[templateIndex],
            error: null,
          }
        }
        return {
          data: null,
          error: { message: "Template not found" },
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في تحديث القالب" },
      }
    }
  },

  deleteTemplate: async (id: string) => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Mock deleting template")
        const templateIndex = mockTemplates.findIndex((t) => t.id === id)
        if (templateIndex >= 0) {
          mockTemplates[templateIndex].is_active = false
          return {
            data: mockTemplates[templateIndex],
            error: null,
          }
        }
        return {
          data: null,
          error: { message: "Template not found" },
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      // حذف ناعم - تعيين is_active إلى false
      const { data, error } = await supabase
        .from("templates")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في حذف القالب" },
      }
    }
  },

  // الإعدادات
  getSettings: async () => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock settings")
        return {
          data: mockSettings,
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase.from("settings").select("*").eq("user_id", user.id).single()

      // إذا لم توجد إعدادات، إنشاء إعدادات افتراضية
      if (error?.code === "PGRST116") {
        const defaultSettings = {
          user_id: user.id,
          is_active: true,
          delay_minutes_first: 60,
          delay_minutes_second: 1440,
          second_reminder_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: newData, error: newError } = await supabase
          .from("settings")
          .insert(defaultSettings)
          .select()
          .single()

        return { data: newData, error: newError }
      }

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في جلب الإعدادات" },
      }
    }
  },

  updateSettings: async (updates: Partial<Settings>) => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock updated settings")
        mockSettings.updated_at = new Date().toISOString()
        Object.assign(mockSettings, updates)
        return {
          data: mockSettings,
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("settings")
        .upsert({
          ...updates,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في تحديث الإعدادات" },
      }
    }
  },

  // السلات المتروكة
  getAbandonedCarts: async () => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock abandoned carts")
        return {
          data: [
            {
              id: "cart-1",
              user_id: "mock-user-id",
              customer_name: "أحمد محمد",
              customer_phone: "+966501234567",
              customer_email: "ahmed@example.com",
              cart_url: "https://example.com/cart/123",
              total_amount: 350.75,
              currency: "SAR",
              status: "pending",
              first_reminder_sent: false,
              second_reminder_sent: false,
              created_at: new Date(Date.now() - 30 * 60000).toISOString(),
              updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
            },
            {
              id: "cart-2",
              user_id: "mock-user-id",
              customer_name: "سارة علي",
              customer_phone: "+966509876543",
              customer_email: "sara@example.com",
              cart_url: "https://example.com/cart/456",
              total_amount: 520.0,
              currency: "SAR",
              status: "pending",
              first_reminder_sent: true,
              second_reminder_sent: false,
              first_reminder_sent_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
              created_at: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
              updated_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
            },
          ],
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: [],
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      return { data: data || [], error }
    } catch (error) {
      console.error("Database error:", error)
      return { data: [], error: { message: "خطأ في جلب السلات المتروكة" } }
    }
  },

  createAbandonedCart: async (cart: Omit<AbandonedCart, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock created abandoned cart")
        return {
          data: {
            id: `cart-${Date.now()}`,
            user_id: "mock-user-id",
            ...cart,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("abandoned_carts")
        .insert({
          ...cart,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في إنشاء السلة المتروكة" },
      }
    }
  },

  updateAbandonedCart: async (id: string, updates: Partial<AbandonedCart>) => {
    try {
      // في وضع التطوير، إرجاع بيانات وهمية
      if (!isSupabaseConfigured) {
        console.log("Development mode: Returning mock updated abandoned cart")
        return {
          data: {
            id,
            user_id: "mock-user-id",
            customer_name: "أحمد محمد",
            customer_phone: "+966501234567",
            customer_email: "ahmed@example.com",
            cart_url: "https://example.com/cart/123",
            total_amount: 350.75,
            currency: "SAR",
            status: "pending",
            first_reminder_sent: false,
            second_reminder_sent: false,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          error: null,
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          data: null,
          error: { message: "No authenticated user" },
        }
      }

      const { data, error } = await supabase
        .from("abandoned_carts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error("Database error:", error)
      return {
        data: null,
        error: { message: "خطأ في تحديث السلة المتروكة" },
      }
    }
  },
}
