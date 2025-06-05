"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { auth, database, type User, isSupabaseConfigured } from "../../lib/supabase"

interface AuthContextType {
  user: any | null
  userProfile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    try {
      console.log("Refreshing user profile")
      const { data, error } = await database.getCurrentUserProfile()
      if (error) {
        console.error("Error fetching user profile:", error)
      } else {
        console.log("Refreshed profile data:", data)
        setUserProfile(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing auth, Supabase configured:", isSupabaseConfigured)

        if (!isSupabaseConfigured) {
          console.log("Supabase not configured, skipping auth initialization")
          setLoading(false)
          return
        }

        const currentUser = await auth.getCurrentUser()
        console.log("Current user from auth:", currentUser)
        setUser(currentUser)
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // الاستماع لتغييرات المصادقة (فقط إذا كان Supabase مكوناً)
    if (isSupabaseConfigured) {
      try {
        console.log("Setting up auth state change listener")
        const {
          data: { subscription },
        } = auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.id)
          setUser(session?.user ?? null)
          if (!session?.user) {
            setUserProfile(null)
          }
        })

        return () => {
          console.log("Cleaning up auth state change listener")
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth state change error:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      console.log("User changed, refreshing profile")
      refreshProfile()
    } else {
      console.log("No user or Supabase not configured, clearing profile")
      setUserProfile(null)
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email)

      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, cannot sign in")
        return {
          data: { user: null },
          error: { message: "قاعدة البيانات غير مكونة. يرجى تكوين Supabase أولاً." },
        }
      }

      const result = await auth.signIn(email, password)

      if (result.error) {
        console.error("Sign in error:", result.error)
        return result
      }

      console.log("Sign in successful:", result.data?.user?.id)
      setUser(result.data?.user)
      return result
    } catch (error) {
      console.error("Sign in error:", error)
      return { data: { user: null }, error: { message: "خطأ في تسجيل الدخول" } }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log("Signing up with email:", email)

      if (!isSupabaseConfigured) {
        console.log("Supabase not configured, cannot sign up")
        return {
          data: { user: null },
          error: { message: "قاعدة البيانات غير مكونة. يرجى تكوين Supabase أولاً." },
        }
      }

      const result = await auth.signUp(email, password, name)

      if (result.error) {
        console.error("Sign up error:", result.error)
        return result
      }

      console.log("Sign up successful:", result.data?.user?.id)
      return result
    } catch (error) {
      console.error("Sign up error:", error)
      return { data: { user: null }, error: { message: "خطأ في إنشاء الحساب" } }
    }
  }

  const signOut = async () => {
    try {
      console.log("Signing out")
      if (isSupabaseConfigured) {
        await auth.signOut()
      }
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error("Sign out error:", error)
      // في جميع الأحوال، قم بتسجيل الخروج محلياً
      setUser(null)
      setUserProfile(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
