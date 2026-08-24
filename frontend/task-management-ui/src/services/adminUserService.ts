import type { TaskStatus, TaskPriority } from "@/types"

// ─── DTOs ─────────────────────────────────────────────────────────────────────

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
  role: "user"
}

export interface AdminUserTaskDto {
  id: string
  title: string
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

// ─── Mock data ────────────────────────────────────────────────────────────────

let nextUserId = 200

let MOCK_USERS: AdminUserDto[] = [
  { id: "u1",  name: "Jordan Lee",      email: "jordan.lee@example.com",    createdAt: "2026-03-12T09:00:00Z", taskCount: 5 },
  { id: "u2",  name: "Alex Morgan",     email: "alex.morgan@example.com",   createdAt: "2026-04-05T10:00:00Z", taskCount: 4 },
  { id: "u3",  name: "Sam Chen",        email: "sam.chen@example.com",      createdAt: "2026-04-18T11:00:00Z", taskCount: 4 },
  { id: "u4",  name: "Riley Park",      email: "riley.park@example.com",    createdAt: "2026-05-02T09:30:00Z", taskCount: 3 },
  { id: "u5",  name: "Morgan Kim",      email: "morgan.kim@example.com",    createdAt: "2026-05-15T14:00:00Z", taskCount: 4 },
  { id: "u6",  name: "Casey White",     email: "casey.white@example.com",   createdAt: "2026-06-01T08:00:00Z", taskCount: 3 },
  { id: "u7",  name: "Jamie Brown",     email: "jamie.brown@example.com",   createdAt: "2026-06-20T10:00:00Z", taskCount: 3 },
  { id: "u8",  name: "Drew Taylor",     email: "drew.taylor@example.com",   createdAt: "2026-07-03T09:00:00Z", taskCount: 4 },
  { id: "u9",  name: "Avery Jones",     email: "avery.jones@example.com",   createdAt: "2026-07-14T11:00:00Z", taskCount: 2 },
  { id: "u10", name: "Quinn Adams",     email: "quinn.adams@example.com",   createdAt: "2026-07-22T14:00:00Z", taskCount: 6 },
  { id: "u11", name: "Blake Martinez",  email: "blake.m@example.com",       createdAt: "2026-08-01T09:00:00Z", taskCount: 1 },
  { id: "u12", name: "Harper Wilson",   email: "harper.w@example.com",      createdAt: "2026-08-05T10:00:00Z", taskCount: 3 },
  { id: "u13", name: "Logan Davis",     email: "logan.d@example.com",       createdAt: "2026-08-10T11:00:00Z", taskCount: 0 },
  { id: "u14", name: "Skyler Reed",     email: "skyler.r@example.com",      createdAt: "2026-08-14T13:00:00Z", taskCount: 2 },
  { id: "u15", name: "Charlie Fox",     email: "charlie.f@example.com",     createdAt: "2026-08-18T09:00:00Z", taskCount: 1 },
]

const MOCK_TASKS: Record<string, AdminUserTaskDto[]> = {
  u1: [
    { id: "t1",  title: "Implement JWT authentication",   status: "Pending",    priority: "High",   category: "Security",    dueDate: "2026-08-20" },
    { id: "t2",  title: "Code review for PR #45",         status: "InProgress", priority: "Medium", category: "Development", dueDate: "2026-08-23" },
    { id: "t3",  title: "Implement search functionality", status: "Completed",  priority: "Medium", category: "Backend",     dueDate: "2026-08-21" },
    { id: "t4",  title: "Add pagination to tasks",        status: "Completed",  priority: "Medium", category: "Backend",     dueDate: "2026-08-23" },
    { id: "t5",  title: "Fix login form validation",      status: "Completed",  priority: "Medium", category: "Frontend",    dueDate: "2026-08-22" },
  ],
  u2: [
    { id: "t6",  title: "Write unit tests for auth",      status: "InProgress", priority: "Medium", category: "Testing",     dueDate: "2026-08-24" },
    { id: "t7",  title: "Update React dependencies",      status: "Pending",    priority: "Low",    category: "Frontend",    dueDate: "2026-09-05" },
    { id: "t8",  title: "Set up monitoring and alerts",   status: "Pending",    priority: "Medium", category: "DevOps",      dueDate: "2026-09-03" },
    { id: "t9",  title: "Set up staging environment",     status: "Pending",    priority: "High",   category: "DevOps",      dueDate: "2026-08-28" },
  ],
  u3: [
    { id: "t10", title: "Update API documentation",       status: "Completed",  priority: "Low",    category: "Documentation", dueDate: "2026-08-25" },
    { id: "t11", title: "Create API error handling",      status: "Completed",  priority: "High",   category: "Backend",     dueDate: "2026-08-19" },
    { id: "t12", title: "Refactor authentication service",status: "InProgress", priority: "High",   category: "Backend",     dueDate: "2026-08-25" },
    { id: "t13", title: "Create user onboarding flow",    status: "Pending",    priority: "Medium", category: "Design",      dueDate: "2026-09-01" },
  ],
  u4: [
    { id: "t14", title: "Fix CORS configuration",         status: "Pending",    priority: "High",   category: "Backend",     dueDate: "2026-08-19" },
    { id: "t15", title: "Write E2E tests for task flow",  status: "Pending",    priority: "Medium", category: "Testing",     dueDate: "2026-09-08" },
    { id: "t16", title: "Add rate limiting to API",       status: "Pending",    priority: "Medium", category: "Security",    dueDate: "2026-08-31" },
  ],
  u5: [
    { id: "t17", title: "Design login screen mockup",     status: "Completed",  priority: "Medium", category: "Design",      dueDate: "2026-08-18" },
    { id: "t18", title: "Implement file upload endpoint", status: "InProgress", priority: "High",   category: "Backend",     dueDate: "2026-08-27" },
    { id: "t19", title: "Update user profile endpoints",  status: "Completed",  priority: "Low",    category: "Backend",     dueDate: "2026-08-20" },
    { id: "t20", title: "Performance testing",            status: "Pending",    priority: "Medium", category: "Testing",     dueDate: "2026-09-07" },
  ],
  u6: [
    { id: "t21", title: "Set up CI/CD pipeline",          status: "InProgress", priority: "High",   category: "DevOps",      dueDate: "2026-08-28" },
    { id: "t22", title: "Update README documentation",    status: "Pending",    priority: "Low",    category: "Documentation", dueDate: "2026-09-10" },
    { id: "t23", title: "Performance testing",            status: "Pending",    priority: "Medium", category: "Testing",     dueDate: "2026-09-07" },
  ],
  u7: [
    { id: "t24", title: "Optimize database queries",      status: "Pending",    priority: "Medium", category: "Database",    dueDate: "2026-08-30" },
    { id: "t25", title: "Fix mobile responsiveness",      status: "InProgress", priority: "Medium", category: "Frontend",    dueDate: "2026-08-26" },
    { id: "t26", title: "Fix login form validation",      status: "Completed",  priority: "Medium", category: "Frontend",    dueDate: "2026-08-22" },
  ],
  u8: [
    { id: "t27", title: "Implement task notifications",   status: "Pending",    priority: "Low",    category: "Backend",     dueDate: "2026-09-02" },
    { id: "t28", title: "Database migration for v2.0",    status: "Pending",    priority: "High",   category: "Database",    dueDate: "2026-08-29" },
    { id: "t29", title: "Implement refresh token logic",  status: "InProgress", priority: "High",   category: "Security",    dueDate: "2026-08-26" },
    { id: "t30", title: "Upgrade TypeScript to v5.5",     status: "Pending",    priority: "Low",    category: "Development", dueDate: "2026-09-12" },
  ],
  u9: [
    { id: "t31", title: "Review accessibility audit",     status: "Pending",    priority: "Medium", category: "Frontend",    dueDate: "2026-09-05" },
    { id: "t32", title: "Document onboarding process",    status: "Completed",  priority: "Low",    category: "Documentation", dueDate: "2026-08-25" },
  ],
  u10: [
    { id: "t33", title: "Implement CSV export feature",   status: "InProgress", priority: "Medium", category: "Backend",     dueDate: "2026-08-30" },
    { id: "t34", title: "Set up Redis caching layer",     status: "Pending",    priority: "High",   category: "Backend",     dueDate: "2026-09-01" },
    { id: "t35", title: "Write integration tests",        status: "Pending",    priority: "Medium", category: "Testing",     dueDate: "2026-09-10" },
    { id: "t36", title: "Design email templates",         status: "Completed",  priority: "Low",    category: "Design",      dueDate: "2026-08-22" },
    { id: "t37", title: "Configure SMTP service",         status: "InProgress", priority: "Medium", category: "Backend",     dueDate: "2026-08-28" },
    { id: "t38", title: "Load test API endpoints",        status: "Pending",    priority: "High",   category: "Testing",     dueDate: "2026-09-08" },
  ],
  u11: [
    { id: "t39", title: "Add dark mode support",          status: "Pending",    priority: "Low",    category: "Frontend",    dueDate: "2026-09-15" },
  ],
  u12: [
    { id: "t40", title: "Audit database indexes",         status: "Pending",    priority: "Medium", category: "Database",    dueDate: "2026-09-03" },
    { id: "t41", title: "Implement audit logging",        status: "InProgress", priority: "High",   category: "Security",    dueDate: "2026-08-27" },
    { id: "t42", title: "Update Swagger annotations",     status: "Completed",  priority: "Low",    category: "Documentation", dueDate: "2026-08-24" },
  ],
  u13: [],
  u14: [
    { id: "t43", title: "Set up error tracking",          status: "Pending",    priority: "Medium", category: "DevOps",      dueDate: "2026-09-05" },
    { id: "t44", title: "Implement webhook support",      status: "InProgress", priority: "Medium", category: "Backend",     dueDate: "2026-09-02" },
  ],
  u15: [
    { id: "t45", title: "Create API usage dashboard",     status: "Pending",    priority: "Low",    category: "Design",      dueDate: "2026-09-20" },
  ],
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<AdminUserDto[]> {
  await new Promise((r) => setTimeout(r, 700))
  return [...MOCK_USERS]
}

export async function getUser(userId: string): Promise<AdminUserDetailsDto> {
  await new Promise((r) => setTimeout(r, 500))
  const u = MOCK_USERS.find((x) => x.id === userId)
  if (!u) throw new Error("User not found")
  return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, role: "user" }
}

export async function getUserTasks(userId: string): Promise<AdminUserTaskDto[]> {
  await new Promise((r) => setTimeout(r, 600))
  return MOCK_TASKS[userId] ?? []
}

export async function createUser(payload: CreateUserPayload): Promise<AdminUserDto> {
  await new Promise((r) => setTimeout(r, 900))
  const emailLower = payload.email.toLowerCase().trim()
  if (MOCK_USERS.some((u) => u.email.toLowerCase() === emailLower)) {
    throw Object.assign(new Error("Email already exists"), { code: "EMAIL_DUPLICATE" })
  }
  const newUser: AdminUserDto = {
    id: `u${++nextUserId}`,
    name: payload.name.trim(),
    email: payload.email.trim(),
    createdAt: new Date().toISOString(),
    taskCount: 0,
  }
  MOCK_USERS = [newUser, ...MOCK_USERS]
  MOCK_TASKS[newUser.id] = []
  return newUser
}
