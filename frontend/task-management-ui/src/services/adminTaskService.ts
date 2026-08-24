import type { Task, TaskStatus, TaskPriority } from "@/types"

let nextId = 100

export const ADMIN_ASSIGNEES = [
  "Jordan Lee", "Alex Morgan", "Sam Chen", "Riley Park",
  "Morgan Kim", "Casey White", "Jamie Brown", "Drew Taylor",
]

let ADMIN_MOCK_TASKS: Task[] = [
  { id: "1",  title: "Implement JWT authentication",         description: "Set up JSON Web Token auth flow including token generation, validation, and refresh logic.",                    status: "Pending",    priority: "High",   category: "Security",      assignee: "Jordan Lee",  dueDate: "2026-08-20", createdAt: "2026-08-01T09:00:00Z", updatedAt: "2026-08-18T14:30:00Z" },
  { id: "2",  title: "Write unit tests for auth module",     description: "Achieve 80%+ coverage for the authentication service including edge cases.",                                      status: "InProgress", priority: "Medium", category: "Testing",       assignee: "Alex Morgan", dueDate: "2026-08-24", createdAt: "2026-08-02T10:00:00Z", updatedAt: "2026-08-20T09:15:00Z" },
  { id: "3",  title: "Update API documentation",             description: "Sync Swagger docs with latest endpoint changes and add examples for all routes.",                                  status: "Completed",  priority: "Low",    category: "Documentation", assignee: "Sam Chen",    dueDate: "2026-08-25", createdAt: "2026-08-03T08:00:00Z", updatedAt: "2026-08-22T16:00:00Z" },
  { id: "4",  title: "Fix CORS configuration",               description: "Resolve cross-origin request failures in the staging environment.",                                               status: "Pending",    priority: "High",   category: "Backend",       assignee: "Riley Park",  dueDate: "2026-08-19", createdAt: "2026-08-04T11:00:00Z", updatedAt: "2026-08-17T10:00:00Z" },
  { id: "5",  title: "Design login screen mockup",           description: "Create high-fidelity Figma mockups for the authentication screens.",                                              status: "Completed",  priority: "Medium", category: "Design",        assignee: "Morgan Kim",  dueDate: "2026-08-18", createdAt: "2026-08-05T09:30:00Z", updatedAt: "2026-08-17T12:00:00Z" },
  { id: "6",  title: "Set up CI/CD pipeline",                description: "Configure GitHub Actions for automated testing and deployment to staging and production.",                         status: "InProgress", priority: "High",   category: "DevOps",        assignee: "Casey White", dueDate: "2026-08-28", createdAt: "2026-08-06T14:00:00Z", updatedAt: "2026-08-21T08:30:00Z" },
  { id: "7",  title: "Optimize database queries",            description: "Profile slow queries and add appropriate indexes to improve response times.",                                      status: "Pending",    priority: "Medium", category: "Database",      assignee: "Jamie Brown", dueDate: "2026-08-30", createdAt: "2026-08-07T10:00:00Z", updatedAt: "2026-08-19T15:00:00Z" },
  { id: "8",  title: "Implement task notification system",   description: "Build email and in-app notification triggers for task assignment and status changes.",                             status: "Pending",    priority: "Low",    category: "Backend",       assignee: "Drew Taylor", dueDate: "2026-09-02", createdAt: "2026-08-08T09:00:00Z", updatedAt: "2026-08-20T11:00:00Z" },
  { id: "9",  title: "Code review for PR #45",               description: "Review the user profile update feature and provide detailed feedback.",                                            status: "InProgress", priority: "Medium", category: "Development",   assignee: "Jordan Lee",  dueDate: "2026-08-23", createdAt: "2026-08-09T13:00:00Z", updatedAt: "2026-08-22T10:00:00Z" },
  { id: "10", title: "Update React dependencies",            description: "Upgrade to React 19 stable and resolve any breaking changes.",                                                     status: "Pending",    priority: "Low",    category: "Frontend",      assignee: "Alex Morgan", dueDate: "2026-09-05", createdAt: "2026-08-10T08:00:00Z", updatedAt: "2026-08-18T09:00:00Z" },
  { id: "11", title: "Create API error handling middleware", description: "Standardise error responses and add global exception handling.",                                                   status: "Completed",  priority: "High",   category: "Backend",       assignee: "Sam Chen",    dueDate: "2026-08-19", createdAt: "2026-08-11T10:00:00Z", updatedAt: "2026-08-18T14:00:00Z" },
  { id: "12", title: "Write E2E tests for task flow",        description: "Cover the full task lifecycle with Playwright from creation to completion.",                                       status: "Pending",    priority: "Medium", category: "Testing",       assignee: "Riley Park",  dueDate: "2026-09-08", createdAt: "2026-08-12T09:00:00Z", updatedAt: "2026-08-20T13:00:00Z" },
  { id: "13", title: "Implement file upload endpoint",       description: "Add S3-backed file upload support with virus scanning and size limits.",                                           status: "InProgress", priority: "High",   category: "Backend",       assignee: "Morgan Kim",  dueDate: "2026-08-27", createdAt: "2026-08-13T11:00:00Z", updatedAt: "2026-08-21T16:00:00Z" },
  { id: "14", title: "Update README documentation",          description: "Rewrite the project README with setup instructions and architecture overview.",                                    status: "Pending",    priority: "Low",    category: "Documentation", assignee: "Casey White", dueDate: "2026-09-10", createdAt: "2026-08-14T08:00:00Z", updatedAt: "2026-08-19T09:00:00Z" },
  { id: "15", title: "Fix mobile responsiveness issues",     description: "Resolve layout breakages on screens below 768px in the dashboard and task views.",                                 status: "InProgress", priority: "Medium", category: "Frontend",      assignee: "Jamie Brown", dueDate: "2026-08-26", createdAt: "2026-08-15T10:00:00Z", updatedAt: "2026-08-22T08:00:00Z" },
  { id: "16", title: "Database migration for v2.0",          description: "Write and test migration scripts for the new user and task schema changes.",                                       status: "Pending",    priority: "High",   category: "Database",      assignee: "Drew Taylor", dueDate: "2026-08-29", createdAt: "2026-08-01T12:00:00Z", updatedAt: "2026-08-20T10:00:00Z" },
  { id: "17", title: "Implement search functionality",       description: "Full-text search across task titles and descriptions using Postgres tsvector.",                                    status: "Completed",  priority: "Medium", category: "Backend",       assignee: "Jordan Lee",  dueDate: "2026-08-21", createdAt: "2026-08-02T09:00:00Z", updatedAt: "2026-08-20T17:00:00Z" },
  { id: "18", title: "Set up monitoring and alerts",         description: "Configure Datadog dashboards and alert policies for critical API endpoints.",                                      status: "Pending",    priority: "Medium", category: "DevOps",        assignee: "Alex Morgan", dueDate: "2026-09-03", createdAt: "2026-08-03T14:00:00Z", updatedAt: "2026-08-19T11:00:00Z" },
  { id: "19", title: "Refactor authentication service",      description: "Split monolithic auth service into focused modules following SOLID principles.",                                   status: "InProgress", priority: "High",   category: "Backend",       assignee: "Sam Chen",    dueDate: "2026-08-25", createdAt: "2026-08-04T10:00:00Z", updatedAt: "2026-08-21T15:00:00Z" },
  { id: "20", title: "Add rate limiting to API",             description: "Protect public endpoints with per-IP rate limiting using a Redis sliding window.",                                 status: "Pending",    priority: "Medium", category: "Security",      assignee: "Riley Park",  dueDate: "2026-08-31", createdAt: "2026-08-05T08:00:00Z", updatedAt: "2026-08-18T12:00:00Z" },
  { id: "21", title: "Update user profile endpoints",        description: "Extend the profile API to support avatar upload and notification preferences.",                                    status: "Completed",  priority: "Low",    category: "Backend",       assignee: "Morgan Kim",  dueDate: "2026-08-20", createdAt: "2026-08-06T09:00:00Z", updatedAt: "2026-08-19T14:00:00Z" },
  { id: "22", title: "Performance testing",                  description: "Run k6 load tests against all critical API paths and document results.",                                           status: "Pending",    priority: "Medium", category: "Testing",       assignee: "Casey White", dueDate: "2026-09-07", createdAt: "2026-08-07T11:00:00Z", updatedAt: "2026-08-20T09:00:00Z" },
  { id: "23", title: "Fix login form validation",            description: "Correct client-side validation logic and improve error message clarity.",                                          status: "Completed",  priority: "Medium", category: "Frontend",      assignee: "Jamie Brown", dueDate: "2026-08-22", createdAt: "2026-08-08T10:00:00Z", updatedAt: "2026-08-21T13:00:00Z" },
  { id: "24", title: "Implement refresh token logic",        description: "Build secure silent refresh with token rotation and single-use enforcement.",                                      status: "InProgress", priority: "High",   category: "Security",      assignee: "Drew Taylor", dueDate: "2026-08-26", createdAt: "2026-08-09T09:00:00Z", updatedAt: "2026-08-22T11:00:00Z" },
  { id: "25", title: "Add pagination to tasks endpoint",     description: "Implement cursor-based pagination with configurable page size limits.",                                            status: "Completed",  priority: "Medium", category: "Backend",       assignee: "Jordan Lee",  dueDate: "2026-08-23", createdAt: "2026-08-10T14:00:00Z", updatedAt: "2026-08-22T16:00:00Z" },
  { id: "26", title: "Set up staging environment",           description: "Provision staging server, configure secrets, and sync the database schema.",                                      status: "Pending",    priority: "High",   category: "DevOps",        assignee: "Alex Morgan", dueDate: "2026-08-28", createdAt: "2026-08-11T08:00:00Z", updatedAt: "2026-08-19T10:00:00Z" },
  { id: "27", title: "Create user onboarding flow",          description: "Design and implement a guided first-run experience for new users.",                                                status: "Pending",    priority: "Medium", category: "Design",        assignee: "Sam Chen",    dueDate: "2026-09-01", createdAt: "2026-08-12T10:00:00Z", updatedAt: "2026-08-20T08:00:00Z" },
  { id: "28", title: "Upgrade TypeScript to v5.5",           description: "Update tsconfig settings and resolve any type errors introduced by the upgrade.",                                 status: "Pending",    priority: "Low",    category: "Development",   assignee: "Riley Park",  dueDate: "2026-09-12", createdAt: "2026-08-13T09:00:00Z", updatedAt: "2026-08-21T09:00:00Z" },
]

export interface AdminTaskFilterState {
  status: TaskStatus[]
  priority: TaskPriority[]
  category: string[]
  assignee: string[]
  dueDatePreset: "any" | "due-soon"
}

export const DEFAULT_ADMIN_FILTERS: AdminTaskFilterState = {
  status: [], priority: [], category: [], assignee: [], dueDatePreset: "any",
}

function matchesDueDatePreset(dueDate: string, preset: string): boolean {
  if (preset === "any") return true
  const due = new Date(dueDate)
  const now = new Date()
  const threeDays = new Date(now)
  threeDays.setDate(now.getDate() + 3)
  return due <= threeDays
}

export async function getAdminTasks(params: {
  keyword: string
  filters: AdminTaskFilterState
  page: number
  pageSize: number
}): Promise<{ tasks: Task[]; totalCount: number }> {
  await new Promise((r) => setTimeout(r, 600))
  const { keyword, filters, page, pageSize } = params

  const result = ADMIN_MOCK_TASKS.filter((t) => {
    if (keyword) {
      const q = keyword.toLowerCase()
      if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !t.assignee.toLowerCase().includes(q)) return false
    }
    if (filters.status.length && !filters.status.includes(t.status)) return false
    if (filters.priority.length && !filters.priority.includes(t.priority)) return false
    if (filters.category.length && !filters.category.includes(t.category)) return false
    if (filters.assignee.length && !filters.assignee.includes(t.assignee)) return false
    if (!matchesDueDatePreset(t.dueDate, filters.dueDatePreset)) return false
    return true
  })

  const totalCount = result.length
  const start = (page - 1) * pageSize
  const tasks = result.slice(start, start + pageSize)
  return { tasks, totalCount }
}

export interface CreateTaskPayload {
  title: string
  description: string
  assignee: string
  priority: TaskPriority
  category: string
  dueDate: string
}

export async function createAdminTask(payload: CreateTaskPayload): Promise<Task> {
  await new Promise((r) => setTimeout(r, 800))
  if (!payload.title.trim()) throw new Error("Title is required")
  const task: Task = {
    id: String(++nextId),
    title: payload.title.trim(),
    description: payload.description.trim(),
    status: "Pending",
    priority: payload.priority,
    category: payload.category,
    assignee: payload.assignee,
    dueDate: payload.dueDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  ADMIN_MOCK_TASKS = [task, ...ADMIN_MOCK_TASKS]
  return task
}

export interface UpdateTaskPayload {
  title: string
  description: string
  assignee: string
  status: TaskStatus
  priority: TaskPriority
  category: string
  dueDate: string
}

export async function updateAdminTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  await new Promise((r) => setTimeout(r, 800))
  const idx = ADMIN_MOCK_TASKS.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error("Task not found")
  const updated: Task = { ...ADMIN_MOCK_TASKS[idx], ...payload, updatedAt: new Date().toISOString() }
  ADMIN_MOCK_TASKS[idx] = updated
  return updated
}

export async function deleteAdminTask(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 600))
  ADMIN_MOCK_TASKS = ADMIN_MOCK_TASKS.filter((t) => t.id !== id)
}
