// مثال لاستخدام واجهة برمجة سلة

export async function getSallaStoreInfo(accessToken: string) {
  try {
    const response = await fetch("https://api.salla.dev/admin/v2/store/info", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`فشل في جلب معلومات المتجر: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("خطأ في جلب معلومات المتجر:", error)
    throw error
  }
}

export async function refreshSallaToken(refreshToken: string) {
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
      throw new Error(`فشل في تحديث التوكن: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("خطأ في تحديث توكن سلة:", error)
    throw error
  }
}

export async function getAbandonedCarts(accessToken: string) {
  try {
    // في سلة، السلات المتروكة هي طلبات بحالة "pending"
    const response = await fetch("https://api.salla.dev/admin/v2/orders?status=pending", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`فشل في جلب السلات المتروكة: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("خطأ في جلب السلات المتروكة:", error)
    throw error
  }
}
