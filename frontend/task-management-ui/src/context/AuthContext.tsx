import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { authService } from "@/services/authService"

export interface AuthUser {
  fullName: string
  email: string
  role: "user" | "admin"
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (user: AuthUser) => void
  logout: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    async function restoreSession() {
      const accessToken =
        localStorage.getItem("accessToken")

      if (!accessToken) {
        setLoading(false)
        return
      }

      try {
        const profile =
          await authService.getProfile()

        setUser(profile)
      } catch {
        setUser(null)
        await authService.logout().catch(() => undefined)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  function login(user: AuthUser) {
    setUser(user)
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider",
    )
  }

  return ctx
}