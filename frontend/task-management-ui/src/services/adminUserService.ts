import apiClient from "./apiClient"
import type { TaskStatus } from "@/types"

// Backend DTOs
interface AdminUserListDto {
  Id: string
  Name: string
  Email: string
  CreatedAt: string
  TaskCount: number
}

interface BackendAdminUserDetailsDto {
  Id: string
  Name: string
  Email: string
  CreatedAt: string
  TaskCount: number
  PendingTasks: number
  InProgressTasks: number
  CompletedTasks: number
  OverdueTasks: number
}

interface BackendAdminUserTaskDto {
  Id: string
  Title: string
  Description: string | null
  Status: TaskStatus
  Priority: TaskPriority
  DueDate: string | null
  CategoryId: number | null
  CategoryName: string | null
}

interface CreateAdminUserDto {
  Name: string
  Email: string
  Password: string
}

// Frontend DTOs
export interface AdminUserDto {
  id: string
  name: string
  email: string
  createdAt: string
  taskCount: number
}

export interface AdminUserDetailsDto {
  id: string
  name: string
  email: string
  createdAt: string
  taskCount: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
}

export interface AdminUserTaskDto {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  category: string
  dueDate: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
}

// Mapping
function mapAdminUser(user: AdminUserListDto): AdminUserDto {
  return {
    id: user.Id,
    name: user.Name,
    email: user.Email,
    createdAt: user.CreatedAt,
    taskCount: user.TaskCount,
  }
}

function mapAdminUserDetails(
  user: BackendAdminUserDetailsDto,
): AdminUserDetailsDto {
  return {
    id: user.Id,
    name: user.Name,
    email: user.Email,
    createdAt: user.CreatedAt,
    taskCount: user.TaskCount,
    pendingTasks: user.PendingTasks,
    inProgressTasks: user.InProgressTasks,
    completedTasks: user.CompletedTasks,
    overdueTasks: user.OverdueTasks,
  }
}

function mapAdminUserTask(
  task: BackendAdminUserTaskDto,
): AdminUserTaskDto {
  return {
    id: task.Id,
    title: task.Title,
    description: task.Description ?? "",
    status: task.Status,
    priority: task.Priority,
    category: task.CategoryName ?? "Uncategorized",
    dueDate: task.DueDate ?? "",
  }
}

// API calls
export async function getUsers(): Promise<AdminUserDto[]> {
  const response =
    await apiClient.get<AdminUserListDto[]>("/AdminUser")

  return response.data.map(mapAdminUser)
}

export async function getUser(
  userId: string,
): Promise<AdminUserDetailsDto> {
  const response =
    await apiClient.get<BackendAdminUserDetailsDto>(
      `/AdminUser/${userId}`,
    )

  return mapAdminUserDetails(response.data)
}

export async function getUserTasks(
  userId: string,
): Promise<AdminUserTaskDto[]> {
  const response =
    await apiClient.get<BackendAdminUserTaskDto[]>(
      `/AdminUser/${userId}/tasks`,
    )

  return response.data.map(mapAdminUserTask)
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<AdminUserDto> {
  const request: CreateAdminUserDto = {
    Name: payload.name,
    Email: payload.email,
    Password: payload.password,
  }

  const response =
    await apiClient.post<AdminUserListDto>(
      "/AdminUser",
      request,
    )

  return mapAdminUser(response.data)
}