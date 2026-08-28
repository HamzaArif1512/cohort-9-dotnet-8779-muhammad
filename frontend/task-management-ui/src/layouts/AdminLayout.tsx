import { Navigate, Outlet } from "react-router"
import { useAuth } from "@/context/AuthContext"
import { useToast, ToastList } from "@/components/Toast"
import Sidebar from "@/components/Sidebar"
import type { ToastType } from "@/types"

export default function AdminLayout() {
  const { user } = useAuth()
  const { toasts, add: addToast, dismiss } = useToast()

  if (!user || user.role !== "admin") return <Navigate to="/" replace />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8F8F7" }}>
      <ToastList toasts={toasts} onDismiss={dismiss} />
      <Sidebar basePath="/admin" userName={user.fullName} showManageUsers={true} />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: 80 }}>
        <Outlet context={{ addToast: (type: ToastType, message: string) => addToast(type, message) }} />
      </div>
    </div>
  )
}
