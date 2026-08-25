// ─── Dashboard DTO ────────────────────────────────────────────────────────────

export interface TaskByStatusDto {
  Pending: number
  InProgress: number
  Completed: number
}

export interface TaskByPriorityDto {
  Low: number
  Medium: number
  High: number
}

export interface UserDashboardDto {
  TotalTasks: number
  PendingTasks: number
  InProgressTasks: number
  CompletedTasks: number
  OverdueTasks: number
  DueSoonTasks: number
  HighPriorityTasks: number
  CompletionRate: number
  TaskByStatus: TaskByStatusDto
  TaskByPriority: TaskByPriorityDto
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

export interface AssigneeTaskCount {
  AssigneeName: string
  TaskCount: number
}

export interface AdminDashboardDto {
  TotalUsers: number
  ActiveAssignees: number
  TotalTasks: number
  PendingTasks: number
  InProgressTasks: number
  CompletedTasks: number
  OverdueTasks: number
  DueSoonTasks: number
  HighPriorityTasks: number
  CompletionRate: number
  TaskByStatus: TaskByStatusDto
  TaskByPriority: TaskByPriorityDto
  TaskByAssignee: AssigneeTaskCount[]
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface ProfileDto {
  FullName: string
  Email: string
  Role: string
  CreatedAt: string // ISO date string
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
