import type { UserDashboardDto, AdminDashboardDto } from "@/types"

// Mock data matching the exact DTO shape — swap for real fetch() call when backend is ready.
const MOCK_DATA: UserDashboardDto = {
  TotalTasks: 21,
  PendingTasks: 5,
  InProgressTasks: 9,
  CompletedTasks: 7,
  OverdueTasks: 3,
  DueSoonTasks: 4,
  HighPriorityTasks: 6,
  CompletionRate: 33,
  TaskByStatus: {
    Pending: 5,
    InProgress: 9,
    Completed: 7,
  },
  TaskByPriority: {
    Low: 8,
    Medium: 7,
    High: 6,
  },
}

// Replace the body of this function with:
//   const res = await fetch("/api/dashboard/user", { credentials: "include" })
//   if (!res.ok) throw new Error("Failed to load dashboard")
//   return res.json() as Promise<UserDashboardDto>
export async function getUserDashboard(): Promise<UserDashboardDto> {
  await new Promise((r) => setTimeout(r, 1200))
  return MOCK_DATA
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const MOCK_ADMIN: AdminDashboardDto = {
  TotalUsers: 12,
  ActiveAssignees: 8,
  TotalTasks: 67,
  PendingTasks: 18,
  InProgressTasks: 24,
  CompletedTasks: 25,
  OverdueTasks: 7,
  DueSoonTasks: 11,
  HighPriorityTasks: 14,
  CompletionRate: 37,
  TaskByStatus: { Pending: 18, InProgress: 24, Completed: 25 },
  TaskByPriority: { Low: 22, Medium: 28, High: 17 },
  TaskByAssignee: [
    { AssigneeName: "Ali Khan", TaskCount: 18 },
    { AssigneeName: "Emily Chen", TaskCount: 13 },
    { AssigneeName: "Sarah Ahmed", TaskCount: 11 },
    { AssigneeName: "Hamza Arif", TaskCount: 9 },
    { AssigneeName: "Priya Nair", TaskCount: 7 },
    { AssigneeName: "John Doe", TaskCount: 5 },
    { AssigneeName: "Marcus Rivera", TaskCount: 3 },
    { AssigneeName: "David Park", TaskCount: 1 },
  ],
}

// Replace body with:
//   const res = await fetch("/api/dashboard/admin", { credentials: "include" })
//   if (!res.ok) throw new Error("Failed to load admin dashboard")
//   return res.json() as Promise<AdminDashboardDto>
export async function getAdminDashboard(): Promise<AdminDashboardDto> {
  await new Promise((r) => setTimeout(r, 1200))
  return MOCK_ADMIN
}
