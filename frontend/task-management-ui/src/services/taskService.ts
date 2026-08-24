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
    category: response.categoryName,
    assignee: response.assigneeName,
    dueDate: response.dueDate,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  }
}

export const TASK_CATEGORIES = [
  "Backend",
  "Database",
  "Design",
  "Development",
  "DevOps",
  "Documentation",
  "Frontend",
  "Security",
  "Testing",
]

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
      filters.category.includes(task.category),
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
  const existingResponse =
    await apiClient.get<TaskResponseDto>(`/Task/${id}`)

  const existingTask = existingResponse.data

  const updateDto: UpdateTaskDto = {
    title: existingTask.title,
    description: existingTask.description,
    dueDate: existingTask.dueDate,
    priority: existingTask.priority,
    status,
    categoryId: 0,
    assigneeId: "",
  }

  const response = await apiClient.put<TaskResponseDto>(
    `/Task/${id}`,
    updateDto,
  )

  return mapTask(response.data)
}