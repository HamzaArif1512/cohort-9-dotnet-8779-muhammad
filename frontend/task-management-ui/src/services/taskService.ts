import type {
  Task,
  TaskStatus,
  GetTasksParams,
  GetTasksResult,
} from "@/types"
import apiClient from "./apiClient"

interface TaskResponseDto {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  dueDate: string
  priority: "Low" | "Medium" | "High"
  status: "Pending" | "InProgress" | "Completed"
  categoryName: string
  assigneeName: string
}

interface UpdateTaskDto {
  title: string
  description: string
  dueDate: string
  priority: "Low" | "Medium" | "High"
  status: TaskStatus
  categoryId: number
  assigneeId: string
}

function mapTask(response: TaskResponseDto): Task {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    status: response.status,
    priority: response.priority,
    categoryName: response.categoryName,
    assigneeName: response.assigneeName,
    dueDate: response.dueDate,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  }
}

export interface CategoryDto {
  id: number
  name: string
}

interface BackendCategoryDto {
  id: number
  name: string
}

function mapCategory(
  category: BackendCategoryDto,
): CategoryDto {
  return {
    id: category.id,
    name: category.name,
  }
}

export async function getCategories(): Promise<CategoryDto[]> {
  const response = await apiClient.get<BackendCategoryDto[]>(
    "/Categories",
  )

  return response.data.map(mapCategory)
}

export async function getTasks(
  params: GetTasksParams,
): Promise<GetTasksResult> {
  const response = await apiClient.get<TaskResponseDto[]>("/Task")

  let tasks = response.data.map(mapTask)

  const {
    keyword,
    filters,
    page,
    pageSize,
  } = params

  if (keyword) {
    const searchTerm = keyword.toLowerCase()

    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm),
    )
  }

  if (filters.status.length > 0) {
    tasks = tasks.filter((task) =>
      filters.status.includes(task.status),
    )
  }

  if (filters.priority.length > 0) {
    tasks = tasks.filter((task) =>
      filters.priority.includes(task.priority),
    )
  }

  if (filters.category.length > 0) {
    tasks = tasks.filter((task) =>
      filters.category.includes(task.categoryName),
    )
  }

  if (filters.dueDatePreset === "due-soon") {
    const now = new Date()
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(now.getDate() + 3)

    tasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate)

      return dueDate >= now && dueDate <= threeDaysFromNow
    })
  }

  const totalCount = tasks.length

  const start = (page - 1) * pageSize
  const paginatedTasks = tasks.slice(start, start + pageSize)

  return {
    tasks: paginatedTasks,
    totalCount,
  }
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<Task> {
  const response = await apiClient.patch<TaskResponseDto>(
    `/Task/${id}/status`,
    { status },
  )

  return mapTask(response.data)
}