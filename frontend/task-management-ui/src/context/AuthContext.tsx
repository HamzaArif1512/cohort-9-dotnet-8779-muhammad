import { createContext, useContext, useState, useEffect } from "react"
import {getProfile, login as loginService, logout as logoutService} from "@/services/authService"

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: "user" | "admin"
  isActive: boolean
  createdAt: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function normaizeRole(role: string): "user" | "admin" {
  return role === "admin" ? "admin" : "user"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem("accessToken")

      if(!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        const profile = await getProfile()
        setUser({
          id: profile.id,
          fullName: profile.fullName,
          email: profile.email,
          role: normaizeRole(profile.role),
          isActive: profile.isActive,
          createdAt: profile.createdAt,
        })
      } catch (error) {
        console.error("Failed to restore session:", error)
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("accessTokenExpiresAt")
        localStorage.removeItem("refreshTokenExpiresAt")
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email: string, password: string) => {
    const authResponse = await loginService({ email, password })

    localStorage.setItem("accessToken", authResponse.accessToken)
    localStorage.setItem("refreshToken", authResponse.refreshToken)
    localStorage.setItem("accessTokenExpiresAt", authResponse.accessTokenExpiresAt)
    localStorage.setItem("refreshTokenExpiresAt", authResponse.refreshTokenExpiresAt)

    const profile = await getProfile()

    setUser({
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      role: normaizeRole(profile.role),
      isActive: profile.isActive,
      createdAt: profile.createdAt,
    })
  }
  
  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken")
    try{
      if (refreshToken) {
        await logoutService(refreshToken)
      }
    } finally {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("accessTokenExpiresAt")
      localStorage.removeItem("refreshTokenExpiresAt")
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
