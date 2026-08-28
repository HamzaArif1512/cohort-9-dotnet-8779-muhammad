import {
  createHashRouter,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router"
import AuthPage from "@/pages/AuthPage"
import UserLayout from "@/layouts/UserLayout"
import AdminLayout from "@/layouts/AdminLayout"
import DashboardPage from "@/pages/DashboardPage"
import TasksPage from "@/pages/TasksPage"
import ProfilePage from "@/pages/ProfilePage"
import AdminDashboardPage from "@/pages/AdminDashboardPage"
import AdminTasksPage from "@/pages/AdminTasksPage"
import ManageUsersPage from "@/pages/ManageUsersPage"
import { type AuthUser, useAuth } from "@/context/AuthContext"

function ProtectedRoute({
  requiredRole,
}: {
  requiredRole: AuthUser["role"]
}) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (user.role !== requiredRole) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
        replace
      />
    )
  }

  return <Outlet />
}

// Thin wrapper rendered by the router — has full router context.
// Keeps AuthPage free of router hooks so it renders safely anywhere.
function AuthRoute() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()

  if (loading) return null

  if (user) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
        replace
      />
    )
  }

function handleAuthenticated(user: AuthUser) {
  login(user)

  navigate(
    user.role === "admin"
      ? "/admin/dashboard"
      : "/user/dashboard",
  )
}

  return <AuthPage onAuthenticated={handleAuthenticated} />
}

export const router = createHashRouter([
  {
    path: "/",
    Component: AuthRoute,
  },
  {
    path: "/user",
    element: <ProtectedRoute requiredRole="user" />,
    children: [
      {
        element: <UserLayout />,
        children: [
          {
            index: true,
            Component: () => <Navigate to="/user/dashboard" replace />,
          },
          { path: "dashboard", Component: DashboardPage },
          { path: "tasks", Component: TasksPage },
          { path: "profile", Component: ProfilePage },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            Component: () => <Navigate to="/admin/dashboard" replace />,
          },
          { path: "dashboard", Component: AdminDashboardPage },
          { path: "tasks", Component: AdminTasksPage },
          { path: "profile", Component: ProfilePage },
          { path: "manage-users", Component: ManageUsersPage },
        ],
      },
    ],
  },
])
