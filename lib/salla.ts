import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface SallaConnection {
  id: string
  user_id: string
  store_id: string
  store_name: string
  access_token: string
  refresh_token: string
  token_expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export class SallaAPI {
  private baseUrl = "https://api.salla.dev/admin/v2"

  constructor(private accessToken: string) {}

  // تحديث التوكن
  static async refreshToken(refreshToken: string): Promise<any> {
    try {
      const response = await fetch("https://accounts.salla.sa/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: process.env.SALLA_CLIENT_ID,
          client_secret: process.env.SALLA_CLIENT_SECRET,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error refreshing Salla token:", error)
      throw error
    }
  }

  // جلب معلومات المتجر
  async getStoreInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/store/info`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get store info: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting store info:", error)
      throw error
    }
  }

  // جلب السلات المتروكة
  async getAbandonedCarts(page = 1, perPage = 50): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/orders?status=pending&page=${page}&per_page=${perPage}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get abandoned carts: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting abandoned carts:", error)
      throw error
    }
  }

  // جلب معلومات العميل
  async getCustomer(customerId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get customer: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting customer:", error)
      throw error
    }
  }

  // جلب جميع السلات المتروكة مع التصفح التلقائي للصفحات
  async getAllAbandonedCarts(maxPages = 5): Promise<any[]> {
    try {
      let allCarts: any[] = []
      let currentPage = 1
      let hasMorePages = true

      while (hasMorePages && currentPage <= maxPages) {
        console.log(`Fetching abandoned carts page ${currentPage}...`)
        const response = await this.getAbandonedCarts(currentPage, 50)

        const carts = response.data || []
        allCarts = [...allCarts, ...carts]

        // التحقق مما إذا كانت هناك صفحات أخرى
        const pagination = response.pagination
        hasMorePages = pagination && pagination.current_page < pagination.total_pages
        currentPage++
      }

      return allCarts
    } catch (error) {
      console.error("Error getting all abandoned carts:", error)
      throw error
    }
  }
}

// دوال مساعدة لإدارة اتصالات سلة
export const sallaConnections = {
  // جلب اتصال سلة للمستخدم
  async getByUserId(userId: string): Promise<SallaConnection | null> {
    try {
      const { data, error } = await supabase
        .from("salla_connections")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error getting Salla connection:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getByUserId:", error)
      return null
    }
  },

  // جلب اتصال سلة بواسطة store_id
  async getByStoreId(storeId: string): Promise<SallaConnection | null> {
    try {
      const { data, error } = await supabase
        .from("salla_connections")
        .select("*")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error getting Salla connection by store ID:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getByStoreId:", error)
      return null
    }
  },

  // تحديث التوكن
  async updateTokens(
    connectionId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn?: number,
  ): Promise<boolean> {
    try {
      const updateData: any = {
        access_token: accessToken,
        refresh_token: refreshToken,
        updated_at: new Date().toISOString(),
      }

      if (expiresIn) {
        updateData.token_expires_at = new Date(Date.now() + expiresIn * 1000).toISOString()
      }

      const { error } = await supabase.from("salla_connections").update(updateData).eq("id", connectionId)

      if (error) {
        console.error("Error updating tokens:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in updateTokens:", error)
      return false
    }
  },

  // تعطيل الاتصال
  async deactivate(connectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("salla_connections")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", connectionId)

      if (error) {
        console.error("Error deactivating connection:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in deactivate:", error)
      return false
    }
  },

  // إنشاء عميل API مع تحديث التوكن التلقائي
  async createAPIClient(userId: string): Promise<SallaAPI | null> {
    try {
      const connection = await this.getByUserId(userId)
      if (!connection) {
        return null
      }

      // التحقق من انتهاء صلاحية التوكن
      if (connection.token_expires_at) {
        const expiresAt = new Date(connection.token_expires_at)
        const now = new Date()

        // إذا انتهت الصلاحية أو ستنتهي خلال 5 دقائق
        if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
          console.log("Token expired, refreshing...")

          const tokenData = await SallaAPI.refreshToken(connection.refresh_token)

          await this.updateTokens(connection.id, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in)

          return new SallaAPI(tokenData.access_token)
        }
      }

      return new SallaAPI(connection.access_token)
    } catch (error) {
      console.error("Error creating API client:", error)
      return null
    }
  },

  // جلب جميع السلات المتروكة للمستخدم
  async fetchAbandonedCarts(userId: string): Promise<any[]> {
    try {
      console.log(`Fetching abandoned carts for user ${userId}...`)

      // إنشاء عميل API سلة
      const apiClient = await this.createAPIClient(userId)
      if (!apiClient) {
        console.error("Failed to create Salla API client")
        return []
      }

      // جلب جميع السلات المتروكة
      const carts = await apiClient.getAllAbandonedCarts()
      console.log(`Found ${carts.length} abandoned carts`)

      // تحديث وقت آخر مزامنة
      const connection = await this.getByUserId(userId)
      if (connection) {
        await supabase
          .from("salla_connections")
          .update({
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection.id)
      }

      return carts
    } catch (error) {
      console.error("Error fetching abandoned carts:", error)
      return []
    }
  },

  // حفظ السلات المتروكة في قاعدة البيانات
  async saveAbandonedCarts(userId: string, carts: any[]): Promise<{ saved: number; skipped: number }> {
    try {
      let saved = 0
      let skipped = 0

      for (const cart of carts) {
        // التحقق من وجود السلة مسبقاً
        const { data: existingCart } = await supabase
          .from("abandoned_carts")
          .select("id")
          .eq("salla_cart_id", cart.id.toString())
          .eq("user_id", userId)
          .single()

        if (existingCart) {
          skipped++
          continue
        }

        // استخراج معلومات العميل
        const customer = cart.customer || {}
        const shipping = cart.shipping || {}
        const shippingAddress = shipping.address || {}

        // تحويل بيانات السلة
        const cartData = {
          user_id: userId,
          salla_cart_id: cart.id.toString(),
          customer_name: customer.first_name
            ? `${customer.first_name} ${customer.last_name || ""}`
            : shippingAddress.name || "عميل",
          customer_phone: customer.mobile || shippingAddress.phone || null,
          customer_email: customer.email || null,
          cart_url: cart.url || `https://${cart.store_subdomain}.mysalla.com/cart`,
          total_amount: cart.amounts?.total?.amount || 0,
          currency: cart.currency || "SAR",
          items: cart.items || [],
          status: "pending",
          first_reminder_sent: false,
          second_reminder_sent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // إضافة السلة الجديدة
        const { error } = await supabase.from("abandoned_carts").insert(cartData)

        if (error) {
          console.error(`Error saving cart ${cart.id}:`, error)
        } else {
          saved++
        }
      }

      return { saved, skipped }
    } catch (error) {
      console.error("Error saving abandoned carts:", error)
      return { saved: 0, skipped: 0 }
    }
  },
}
