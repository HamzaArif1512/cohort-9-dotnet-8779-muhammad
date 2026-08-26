import apiClient from "./apiClient"
import type { TaskPriority, TaskStatus } from "@/types"

interface BackendAdminUserListDto {
  id: string
  name: string
  email: string
  createdAt: string
  taskCount: number
}

interface BackendAdminUserDetailsDto {
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

interface BackendAdminUserTaskDto {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  categoryId: number | null
  categoryName: string | null
}

interface CreateAdminUserDto {
  Name: string
  Email: string
  Password: string
}

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

function mapAdminUserTask(
  task: BackendAdminUserTaskDto,
): AdminUserTaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    category: task.categoryName ?? "Uncategorized",
    dueDate: task.dueDate ?? "",
  }
}

export async function getUsers(): Promise<AdminUserDto[]> {
  const response =
    await apiClient.get<BackendAdminUserListDto[]>("/AdminUser")

  return response.data
}

export async function getUser(
  userId: string,
): Promise<AdminUserDetailsDto> {
  const response =
    await apiClient.get<BackendAdminUserDetailsDto>(
      `/AdminUser/${userId}`,
    )

  return response.data
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
    await apiClient.post<BackendAdminUserListDto>(
      "/AdminUser",
      request,
    )

  return response.data
}