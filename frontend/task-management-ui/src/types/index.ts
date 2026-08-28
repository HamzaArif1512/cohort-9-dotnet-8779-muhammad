// ─── Dashboard DTO ────────────────────────────────────────────────────────────

export interface TaskStatusSummaryDto {
  status: TaskStatus
  count: number
}

export interface TaskPrioritySummaryDto {
  priority: TaskPriority
  count: number
}

export interface UserDashboardDto {
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
  dueSoonTasks: number
  highPriorityTasks: number
  completionRate: number
  taskByStatus: TaskStatusSummaryDto[]
  taskByPriority: TaskPrioritySummaryDto[]
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskStatus = "Pending" | "InProgress" | "Completed" 
export type TaskPriority = "Low" | "Medium" | "High"

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  categoryName: string
  assigneeName: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

// ─── Task filter / search state (mirrors TaskSearchDto) ───────────────────────

export interface TaskFilterState {
  status: TaskStatus[]
  priority: TaskPriority[]
  category: string[]
  dueDatePreset: "any" | "due-soon"
}

export const DEFAULT_FILTERS: TaskFilterState = {
  status: [],
  priority: [],
  category: [],
  dueDatePreset: "any",
}

export interface GetTasksParams {
  keyword: string
  filters: TaskFilterState
  page: number
  pageSize: number
}

export interface GetTasksResult {
  tasks: Task[]
  totalCount: number
}

// ─── Admin Dashboard DTO ──────────────────────────────────────────────────────

export interface TaskAssigneeSummaryDto {
  userId: string
  userName: string
  taskCount: number
}

export interface AdminDashboardDto {
  totalUsers: number
  activeAssignees: number
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
  dueSoonTasks: number
  highPriorityTasks: number
  completionRate: number
  taskByStatus: TaskStatusSummaryDto[]
  taskByPriority: TaskPrioritySummaryDto[]
  taskByAssignee: TaskAssigneeSummaryDto[]
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface ProfileDto {
  id: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  fullName: string
  email: string
  role: "user" | "admin"
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  exiting?: boolean
}
