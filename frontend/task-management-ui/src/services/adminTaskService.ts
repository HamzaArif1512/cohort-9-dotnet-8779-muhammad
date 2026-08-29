import apiClient from "./apiClient"
import type { Task, TaskStatus, TaskPriority } from "@/types"
import axios from "axios"

interface TaskResponseDto {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  categoryName: string
  assigneeName: string
}

export interface AdminTaskFilterState {
  statuses: TaskStatus[]
  priorities: TaskPriority[]
  categoryIds: number[]
  assigneeIds: string[]
  dueDatePreset: "any" | "due-soon"
}

export const DEFAULT_ADMIN_FILTERS: AdminTaskFilterState = {
  statuses: [],
  priorities: [],
  categoryIds: [],
  assigneeIds: [],
  dueDatePreset: "any",
}

export interface GetAdminTasksParams {
  keyword: string
  filters: AdminTaskFilterState
  page: number
  pageSize: number
}

export interface GetAdminTasksResult {
  tasks: Task[]
  totalCount: number
}

export interface CreateTaskPayload {
  title: string
  description: string
  priority: TaskPriority
  categoryId: number
  assigneeId: string
  dueDate: string
}

export interface UpdateTaskPayload {
  title: string
  description: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  categoryId: number
  assigneeId: string
}

function mapTaskResponse(dto: TaskResponseDto): Task {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    status: dto.status,
    priority: dto.priority,
    categoryName: dto.categoryName,
    assigneeName: dto.assigneeName,
    dueDate: dto.dueDate,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

function getDueSoonDates() {
  const from = new Date()
  const to = new Date()

  to.setDate(to.getDate() + 3)

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

export async function getAdminTasks(
  params: GetAdminTasksParams,
): Promise<GetAdminTasksResult> {
  const { keyword, filters, page, pageSize } = params

const queryParams: Record<string, string> = {}

if (keyword.trim()) {
  queryParams.Keyword = keyword.trim()
}

if (filters.statuses.length > 0) {
  queryParams.Statuses = filters.statuses.join(",")
}

if (filters.priorities.length > 0) {
  queryParams.Priorities = filters.priorities.join(",")
}

if (filters.categoryIds.length > 0) {
  queryParams.CategoryIds = filters.categoryIds.join(",")
}

if (filters.assigneeIds.length > 0) {
  queryParams.AssigneeIds = filters.assigneeIds.join(",")
}

if (filters.dueDatePreset === "due-soon") {
  const { from, to } = getDueSoonDates()

  queryParams.DateDueFrom = from
  queryParams.DateDueTo = to
}

  const response = await apiClient.get<TaskResponseDto[]>(
    "/Task/search",
    {
      params: queryParams,
    },
  )

  const allTasks = response.data.map(mapTaskResponse)
  const totalCount = allTasks.length

  const start = (page - 1) * pageSize
  const tasks = allTasks.slice(start, start + pageSize)

  return {
    tasks,
    totalCount,
  }
}

export async function getTaskById(
  id: string,
): Promise<Task> {
  const response = await apiClient.get<TaskResponseDto>(
    `/Task/${id}`,
  )

  return mapTaskResponse(response.data)
}

export async function createAdminTask(
  payload: CreateTaskPayload,
): Promise<Task> {
  const response = await apiClient.post<TaskResponseDto>(
    "/Task",
    payload,
  )

  return mapTaskResponse(response.data)
}

export async function updateAdminTask(
  id: string,
  payload: UpdateTaskPayload,
): Promise<Task> {
  try {
    const response = await apiClient.put<TaskResponseDto>(
      `/Task/${id}`,
      payload,
    )

    return mapTaskResponse(response.data)
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errors = error.response?.data?.errors

      if (errors) {
        const firstError = Object.values(errors)[0]

        if (Array.isArray(firstError) && firstError.length > 0) {
          throw new Error(firstError[0])
        }
      }

      const message = error.response?.data?.message

      if (message) {
        throw new Error(message)
      }
    }

    throw new Error("Failed to update task. Please try again.")
  }
}

export async function deleteAdminTask(
  id: string,
): Promise<void> {
  await apiClient.delete(`/Task/${id}`)
}