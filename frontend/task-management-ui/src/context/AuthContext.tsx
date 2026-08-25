import {
  createContext,
  useContext,
  useState,
} from "react"

export interface AuthUser {
  fullName: string
  email: string
  role: "user" | "admin"
}

interface AuthContextValue {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
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

  return (
    <AuthContext.Provider
      value={{
        user,
        login: setUser,
        logout: () => setUser(null),
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