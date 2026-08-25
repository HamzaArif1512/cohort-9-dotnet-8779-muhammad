import { createHashRouter, Navigate, useNavigate } from "react-router"
import AuthPage from "@/pages/AuthPage"
import UserLayout from "@/layouts/UserLayout"
import AdminLayout from "@/layouts/AdminLayout"
import DashboardPage from "@/pages/DashboardPage"
import TasksPage from "@/pages/TasksPage"
import ProfilePage from "@/pages/ProfilePage"
import AdminDashboardPage from "@/pages/AdminDashboardPage"
import AdminTasksPage from "@/pages/AdminTasksPage"
import ManageUsersPage from "@/pages/ManageUsersPage"
import { AuthUser, useAuth } from "@/context/AuthContext"

// Thin wrapper rendered by the router — has full router context.
// Keeps AuthPage free of router hooks so it renders safely anywhere.
function AuthRoute() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />
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
    Component: UserLayout,
    children: [
      { index: true, Component: () => <Navigate to="/user/dashboard" replace /> },
      { path: "dashboard", Component: DashboardPage },
      { path: "tasks", Component: TasksPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: () => <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", Component: AdminDashboardPage },
      { path: "tasks", Component: AdminTasksPage },
      { path: "profile", Component: ProfilePage },
      { path: "manage-users", Component: ManageUsersPage },
    ],
  },
])
