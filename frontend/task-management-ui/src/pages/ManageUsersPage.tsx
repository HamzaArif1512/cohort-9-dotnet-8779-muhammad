import { useState, useEffect, useCallback, useRef } from "react"
import { useOutletContext } from "react-router"
import type { TaskStatus, ToastType } from "@/types"
import {
  getUsers,
  getUser,
  getUserTasks,
  createUser,
  type AdminUserDto,
  type AdminUserDetailsDto,
  type AdminUserTaskDto,
} from "@/services/adminUserService"

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  primary:       "#7F40E4",
  primaryHover:  "#6b32cc",
  primaryLight:  "#F0EDF9",
  secondary:     "#FFC000",
  secondaryLight:"#FFF9E6",
  success:       "#1a7f4b",
  successLight:  "#F0FAF4",
  error:         "#C0392B",
  errorLight:    "#FDF2F2",
  warning:       "#D97706",
  text:          "#111111",
  textSecondary: "#5F5F5F",
  textMuted:     "#8A8A8A",
  border:        "#E5E5E5",
  borderStrong:  "#D6D6D6",
  surface:       "#FFFFFF",
  bg:            "#F8F8F7",
}

const PAGE_SIZE = 10

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ["#7F40E4", "#1a7f4b", "#D97706", "#2563EB", "#7C3AED", "#047857", "#B45309", "#C0392B"]

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

// ─── Password rules ───────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { key: "length",    label: "At least 8 characters",    test: (p: string) => p.length >= 8 },
  { key: "upper",     label: "Uppercase letter (A–Z)",   test: (p: string) => /[A-Z]/.test(p) },
  { key: "lower",     label: "Lowercase letter (a–z)",   test: (p: string) => /[a-z]/.test(p) },
  { key: "number",    label: "Number (0–9)",              test: (p: string) => /[0-9]/.test(p) },
  { key: "special",   label: "Special character",         test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function validatePassword(p: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(p)) return `Password must include: ${rule.label.toLowerCase()}.`
  }
  return null
}

// ─── Status + priority configs ────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  Pending:    { label: "Pending",     dot: C.secondary, bg: C.secondaryLight, text: "#92400e", border: "#fde68a" },
  InProgress: { label: "In Progress", dot: C.primary,   bg: C.primaryLight,   text: "#4c1d95", border: "#c4b5fd" },
  Completed:  { label: "Completed",   dot: C.success,   bg: C.successLight,   text: "#14532d", border: "#a7f3d0" },
}

const PRIORITY_CONFIG: Record<string, { bg: string; text: string }> = {
  High:   { bg: "#FEF2F2", text: "#991B1B" },
  Medium: { bg: "#FFFBEB", text: "#92400E" },
  Low:    { bg: "#F5F5F5", text: "#525252" },
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap"
      style={{ fontFamily: "'Archivo', sans-serif", background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.Low
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
      style={{ fontFamily: "'Archivo', sans-serif", background: cfg.bg, color: cfg.text, letterSpacing: "0.05em" }}
    >
      {priority}
    </span>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[6px] animate-pulse ${className}`}
      style={{ background: "linear-gradient(90deg, #F0F0EF 25%, #E8E8E7 50%, #F0F0EF 75%)", backgroundSize: "200%" }}
    />
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  function getPages(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "...")[] = [1]
    if (page > 3) pages.push("...")
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p)
    if (page < totalPages - 2) pages.push("...")
    pages.push(totalPages)
    return pages
  }

  const btn = "h-8 min-w-[32px] px-2 rounded-[7px] text-[13px] font-medium flex items-center justify-center transition-all duration-150 cursor-pointer"

  return (
    <div className="flex items-center justify-between pt-1">
      <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
        {total === 0 ? "No users" : `Showing ${start}–${end} of ${total} user${total !== 1 ? "s" : ""}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className={`${btn} gap-1 px-3 border`}
          style={{ fontFamily: "'Archivo', sans-serif", borderColor: C.border, color: C.textSecondary, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M10 12L6 8l4-4" /></svg>
          Prev
        </button>
        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`d${i}`} className="w-8 text-center text-[13px]" style={{ color: C.textMuted }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={btn}
              style={{ fontFamily: "'Archivo', sans-serif", background: p === page ? C.primary : "transparent", color: p === page ? "white" : C.textSecondary, fontWeight: p === page ? 600 : 400 }}
              onMouseEnter={(e) => { if (p !== page) e.currentTarget.style.background = C.primaryLight }}
              onMouseLeave={(e) => { if (p !== page) e.currentTarget.style.background = "transparent" }}
            >{p}</button>
          )
        )}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className={`${btn} gap-1 px-3 border`}
          style={{ fontFamily: "'Archivo', sans-serif", borderColor: C.border, color: C.textSecondary, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
        >
          Next
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5"><path d="M6 4l4 4-4 4" /></svg>
        </button>
      </div>
    </div>
  )
}

// ─── User avatar ──────────────────────────────────────────────────────────────

function UserAvatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.33, fontFamily: "'Archivo', sans-serif" }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Task count badge ─────────────────────────────────────────────────────────

function TaskCountBadge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium"
      style={{ fontFamily: "'Jost', sans-serif", color: count > 0 ? C.textSecondary : C.textMuted }}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" style={{ color: count > 0 ? C.primary : C.textMuted }}>
        <rect x="3" y="2" width="10" height="12" rx="1.5" />
        <path d="M6 6h4M6 9h4M6 12h2" />
      </svg>
      {count} {count === 1 ? "task" : "tasks"}
    </span>
  )
}

// ─── List skeletons ───────────────────────────────────────────────────────────

function UserTableSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border overflow-hidden" style={{ borderColor: C.border }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#FAFAF9" }}>
            {["User", "Email", "Tasks", "Joined"].map((h) => (
              <th key={h} className="text-left px-5 py-3"><Skeleton className="h-3 w-16" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <tr key={i} style={{ borderBottom: `1px solid #F5F5F4` }}>
              <td className="px-5 py-3.5"><div className="flex items-center gap-3"><Skeleton className="w-8 h-8 rounded-full" /><Skeleton className="h-3.5 w-32" /></div></td>
              <td className="px-5 py-3.5"><Skeleton className="h-3 w-44" /></td>
              <td className="px-5 py-3.5"><Skeleton className="h-3 w-16" /></td>
              <td className="px-5 py-3.5"><Skeleton className="h-3 w-20" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border p-5 flex flex-col gap-3" style={{ borderColor: C.border }}>
      <div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="flex flex-col gap-2 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-40" /></div></div>
      <div className="h-px" style={{ background: C.border }} />
      <div className="flex justify-between"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-20" /></div>
    </div>
  )
}

// ─── User Table ───────────────────────────────────────────────────────────────

function UserTable({ users, onRowClick }: { users: AdminUserDto[]; onRowClick: (u: AdminUserDto) => void }) {
  const headers = ["User", "Email", "Tasks", "Joined"]
  return (
    <div className="bg-white rounded-[12px] border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#FAFAF9" }}>
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr
                key={u.id}
                onClick={() => onRowClick(u)}
                className="cursor-pointer group transition-colors duration-150"
                style={{ borderBottom: idx < users.length - 1 ? `1px solid #F5F5F4` : undefined, background: "white" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAF9" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white" }}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onRowClick(u)}
                aria-label={`View user: ${u.name}`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={u.name} size={32} />
                    <span
                      className="text-[13px] font-semibold group-hover:text-[#7F40E4] transition-colors duration-150 whitespace-nowrap"
                      style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
                    >
                      {u.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                    {u.email}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <TaskCountBadge count={u.taskCount} />
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
                    {formatDateShort(u.createdAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({ user, onClick }: { user: AdminUserDto; onClick: (u: AdminUserDto) => void }) {
  return (
    <div
      onClick={() => onClick(user)}
      className="bg-white rounded-[12px] border p-5 flex flex-col gap-4 cursor-pointer transition-shadow transition-colors duration-[180ms] group"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor = C.borderStrong }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = C.border }}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(user)}
      aria-label={`View user: ${user.name}`}
    >
      <div className="flex items-center gap-3">
        <UserAvatar name={user.name} size={40} />
        <div className="flex flex-col gap-0.5 min-w-0">
          <p
            className="text-[14px] font-semibold truncate group-hover:text-[#7F40E4] transition-colors duration-150"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
          >
            {user.name}
          </p>
          <p className="text-[12px] truncate" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
            {user.email}
          </p>
        </div>
      </div>

      <div className="h-px" style={{ background: C.border }} />

      <div className="flex items-center justify-between">
        <TaskCountBadge count={user.taskCount} />
        <span className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
          Joined {formatDateShort(user.createdAt)}
        </span>
      </div>
    </div>
  )
}

// ─── Empty / Error states ─────────────────────────────────────────────────────

function EmptyState({ type, onAddUser }: { type: "no-users" | "no-results"; onAddUser?: () => void }) {
  const cfg = {
    "no-users":   { heading: "No users registered", body: "There are currently no regular users in the system." },
    "no-results": { heading: "No matching users",   body: "Try adjusting your search." },
  }[type]
  return (
    <div className="bg-white rounded-[12px] border py-16 flex flex-col items-center text-center" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: C.primaryLight }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="9" cy="7" r="4" /><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold mb-1.5" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>{cfg.heading}</h3>
      <p className="text-[13px] max-w-xs mb-5" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>{cfg.body}</p>
      {type === "no-users" && onAddUser && (
        <button
          onClick={onAddUser}
          className="h-9 px-4 rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition-all duration-[180ms]"
          style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
          onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryHover }}
          onMouseLeave={(e) => { e.currentTarget.style.background = C.primary }}
        >
          + Add User
        </button>
      )}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-white rounded-[12px] border py-16 flex flex-col items-center text-center" style={{ borderColor: C.border }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: C.errorLight }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 2L2 19h20L12 2z" /><path d="M12 9v5M12 16.5v.5" strokeWidth="2" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold mb-1.5" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Unable to load users</h3>
      <p className="text-[13px] max-w-xs mb-5" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>Something went wrong while retrieving the user list.</p>
      <button
        onClick={onRetry}
        className="h-9 px-4 rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition-all duration-[180ms]"
        style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryHover }}
        onMouseLeave={(e) => { e.currentTarget.style.background = C.primary }}
      >
        Retry
      </button>
    </div>
  )
}

// ─── User Details Modal ───────────────────────────────────────────────────────

function UserTaskList({ tasks, loading }: { tasks: AdminUserTaskDto[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor: "#F5F5F4" }}>
            <Skeleton className="h-3.5 flex-1 max-w-[180px]" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-[4px]" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="w-9 h-9 rounded-full flex items-center justify-center mb-3" style={{ background: "#F5F5F5" }}>
          <svg viewBox="0 0 20 20" fill="none" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M7 4H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
            <rect x="7" y="2" width="6" height="4" rx="1" />
          </svg>
        </div>
        <p className="text-[13px] font-medium mb-0.5" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>No tasks assigned</p>
        <p className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>This user currently has no tasks assigned.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["Task", "Status", "Priority", "Category", "Due"].map((h) => (
              <th
                key={h}
                className="text-left pb-2.5 pt-1 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap pr-4"
                style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.07em" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, idx) => (
            <tr
              key={task.id}
              className="group"
              style={{ borderBottom: idx < tasks.length - 1 ? `1px solid #F5F5F4` : undefined }}
            >
              <td className="py-2.5 pr-4 max-w-[200px]">
                <p className="text-[12px] font-medium truncate" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
                  {task.title}
                </p>
              </td>
              <td className="py-2.5 pr-4">
                <StatusBadge status={task.status} />
              </td>
              <td className="py-2.5 pr-4">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className="py-2.5 pr-4">
                <span className="text-[11px] px-2 py-0.5 rounded-[4px] whitespace-nowrap" style={{ fontFamily: "'Jost', sans-serif", background: "#F5F5F5", color: C.textSecondary }}>
                  {task.category}
                </span>
              </td>
              <td className="py-2.5 whitespace-nowrap">
                <span className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
                  {formatDateShort(task.dueDate)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserDetailsModal({ userId, userName, onClose }: { userId: string; userName: string; onClose: () => void }) {
  const [userDetail, setUserDetail] = useState<AdminUserDetailsDto | null>(null)
  const [tasks, setTasks] = useState<AdminUserTaskDto[]>([])
  const [detailLoading, setDetailLoading] = useState(true)
  const [taskLoading, setTaskLoading] = useState(true)
  const [detailError, setDetailError] = useState(false)

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    setDetailLoading(true)
    setTaskLoading(true)
    setDetailError(false)

    getUser(userId).then((u) => {
      if (!cancelled) { setUserDetail(u); setDetailLoading(false) }
    }).catch(() => {
      if (!cancelled) { setDetailError(true); setDetailLoading(false) }
    })

    getUserTasks(userId).then((t) => {
      if (!cancelled) { setTasks(t); setTaskLoading(false) }
    }).catch(() => {
      if (!cancelled) { setTasks([]); setTaskLoading(false) }
    })

    return () => { cancelled = true }
  }, [userId])

  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-label={`User details: ${userName}`}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-[600px] bg-white rounded-[16px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <h2 className="text-[15px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>User Details</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5]" aria-label="Close">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* User info */}
          <div className="px-6 py-5 border-b" style={{ borderColor: C.border }}>
            {detailLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex flex-col gap-2"><Skeleton className="h-5 w-36" /><Skeleton className="h-3.5 w-48" /></div>
              </div>
            ) : detailError ? (
              <div className="flex flex-col items-center py-4 text-center">
                <p className="text-[13px] font-medium mb-1" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Unable to load user details</p>
                <p className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>Something went wrong while retrieving this user's information.</p>
              </div>
            ) : userDetail && (
              <div className="flex items-center gap-4">
                <UserAvatar name={userDetail.name} size={48} />
                <div>
                  <h3 className="text-[17px] font-bold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
                    {userDetail.name}
                  </h3>
                  <p className="text-[13px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                    {userDetail.email}
                  </p>
                  <p className="text-[11px] mt-1" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
                    Member since {formatDate(userDetail.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tasks section */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[13px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
                Assigned Tasks
              </h4>
              {!taskLoading && (
                <span className="text-[12px] px-2.5 py-0.5 rounded-full" style={{ fontFamily: "'Jost', sans-serif", background: C.primaryLight, color: C.primary }}>
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </span>
              )}
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "min(320px, 40vh)" }}>
              <UserTaskList tasks={tasks} loading={taskLoading} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t" style={{ borderColor: C.border }}>
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-[8px] text-[13px] font-medium border cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5]"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary, borderColor: C.border }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add User Modal ───────────────────────────────────────────────────────────

interface AddUserForm {
  name: string
  email: string
  password: string
}

function PasswordInput({ value, onChange, error, disabled }: { value: string; onChange: (v: string) => void; error?: string; disabled?: boolean }) {
  const [visible, setVisible] = useState(false)
  const [focused, setFocused] = useState(false)
  const anyRuleFailed = value.length > 0 && PASSWORD_RULES.some((r) => !r.test(value))
  const showChecklist = focused || (value.length > 0 && anyRuleFailed)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          className="w-full h-9 rounded-[8px] border text-[13px] outline-none pr-10 transition-all duration-150"
          style={{
            fontFamily: "'Jost', sans-serif",
            padding: "0 36px 0 12px",
            color: C.text,
            background: "white",
            borderColor: error ? C.error : focused ? C.primary : C.border,
            boxShadow: focused ? `0 0 0 3px rgba(127,64,228,0.12)` : "",
          }}
          aria-describedby="pw-requirements"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-[4px] cursor-pointer transition-colors duration-150 hover:bg-[#F0F0EF] disabled:opacity-50"
          aria-label={visible ? "Hide password" : "Show password"}
          style={{ color: C.textMuted }}
        >
          {visible ? (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M17.94 11.94A10.07 10.07 0 0118 10c0-4.42-3.58-8-8-8S2 5.58 2 10c0 .34.02.68.06 1M2 10s1.7-4 8-4m8 4s-1.7 4-8 4a12.5 12.5 0 01-5-1M3 3l14 14" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M10 4C5.58 4 2 10 2 10s3.58 6 8 6 8-6 8-6-3.58-6-8-6z" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
          )}
        </button>
      </div>

      {error && <p className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.error }}>{error}</p>}

      {showChecklist && (
        <div id="pw-requirements" className="grid grid-cols-2 gap-x-4 gap-y-1 pt-0.5">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(value)
            return (
              <div key={rule.key} className="flex items-center gap-1.5">
                <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 shrink-0" style={{ color: ok ? C.success : C.textMuted }}>
                  {ok ? (
                    <path fillRule="evenodd" d="M10.293 2.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L5 7.586l5.293-5.293z" clipRule="evenodd" />
                  ) : (
                    <circle cx="6" cy="6" r="4" stroke={C.textMuted} strokeWidth="1.5" fill="none" />
                  )}
                </svg>
                <span className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: ok ? C.success : C.textMuted }}>
                  {rule.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: AdminUserDto) => void }) {
  const [form, setForm] = useState<AddUserForm>({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<Partial<Record<keyof AddUserForm | "form", string>>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape" && !loading) onClose() }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [onClose, loading])

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = "Full name is required."
    else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters."
    if (!form.email.trim()) errs.email = "Email is required."
    else if (!isValidEmail(form.email)) errs.email = "Please enter a valid email address."
    if (!form.password) errs.password = "Password is required."
    else { const pwErr = validatePassword(form.password); if (pwErr) errs.password = pwErr }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate() || loading) return
    setLoading(true)
    setErrors({})
    try {
      const user = await createUser({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      onCreated(user)
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code === "EMAIL_DUPLICATE") {
        setErrors({ email: "A user with this email already exists." })
      } else {
        setErrors({ form: "Unable to create user. Please try again." })
      }
    } finally {
      setLoading(false)
    }
  }

  function set(key: keyof AddUserForm, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => { const n = { ...e }; delete n[key]; delete n.form; return n })
  }

  const inputStyle: React.CSSProperties = {
    height: 36, borderRadius: 8, fontSize: 13, fontFamily: "'Jost', sans-serif",
    color: C.text, padding: "0 12px", outline: "none", width: "100%", background: "white",
    boxSizing: "border-box",
  }

  function focusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = C.primary
    e.target.style.boxShadow = `0 0 0 3px rgba(127,64,228,0.12)`
  }
  function blurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = errors[e.target.name as keyof AddUserForm] ? C.error : C.border
    e.target.style.boxShadow = ""
  }

  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-label="Add user">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} onClick={loading ? undefined : onClose} />
      <div
        className="relative w-full max-w-[460px] bg-white rounded-[16px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <div>
            <h2 className="text-[16px] font-bold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Add User</h2>
            <p className="text-[12px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>Create a new regular user account.</p>
          </div>
          <button onClick={loading ? undefined : onClose} className="w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5] disabled:opacity-50" disabled={loading} aria-label="Close">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {errors.form && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-[8px]" style={{ background: C.errorLight }}>
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 shrink-0" style={{ color: C.error }}>
                <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <p className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.error }}>{errors.form}</p>
            </div>
          )}

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-name" className="text-[12px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>
              Full Name <span style={{ color: C.error }}>*</span>
            </label>
            <input
              id="add-name"
              name="name"
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Jordan Lee"
              disabled={loading}
              autoFocus
              style={{ ...inputStyle, border: `1px solid ${errors.name ? C.error : C.border}` }}
              onFocus={focusInput}
              onBlur={blurInput}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && <p id="name-error" className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.error }}>{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-email" className="text-[12px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>
              Email Address <span style={{ color: C.error }}>*</span>
            </label>
            <input
              id="add-email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="user@example.com"
              disabled={loading}
              style={{ ...inputStyle, border: `1px solid ${errors.email ? C.error : C.border}` }}
              onFocus={focusInput}
              onBlur={blurInput}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <p id="email-error" className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.error }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>
              Password <span style={{ color: C.error }}>*</span>
            </label>
            <PasswordInput
              value={form.password}
              onChange={(v) => set("password", v)}
              error={errors.password}
              disabled={loading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: C.border }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="h-9 px-4 rounded-[8px] text-[13px] font-medium border cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5] disabled:opacity-50"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary, borderColor: C.border }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-9 px-5 rounded-[8px] text-[13px] font-semibold text-white flex items-center gap-2 cursor-pointer transition-all duration-[180ms] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(127,64,228,0.3)" } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "" }}
          >
            {loading && (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Creating…" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Manage Users Page ────────────────────────────────────────────────────────

interface OutletCtx { addToast: (type: ToastType, message: string) => void }

export default function ManageUsersPage() {
  const { addToast } = useOutletContext<OutletCtx>()

  const [view, setView] = useState<"list" | "cards">("list")
  const [search, setSearch] = useState("")
  const [allUsers, setAllUsers] = useState<AdminUserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)

  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const searchRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const users = await getUsers()
      setAllUsers(users)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Client-side search + pagination
  const filtered = search.trim()
    ? allUsers.filter((u) => {
        const q = search.toLowerCase()
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      })
    : allUsers

  const totalCount = filtered.length
  const pagedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  function handleCreated(user: AdminUserDto) {
    setAddOpen(false)
    addToast("success", "User created successfully")
    setAllUsers((prev) => [user, ...prev])
    setPage(1)
  }

  function handlePageChange(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const hasSearch = search.trim().length > 0

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
      <div className="max-w-[1100px] mx-auto px-6 py-8 flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
              User Management
            </h1>
            <p className="mt-1 text-[14px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
              Manage regular users and review their assigned workload.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: C.textMuted }}>
                <circle cx="8.5" cy="8.5" r="5.5" /><path d="M13 13l3.5 3.5" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users…"
                className="h-9 pl-9 pr-8 rounded-[8px] border text-[13px] outline-none transition-all duration-150"
                style={{ fontFamily: "'Jost', sans-serif", borderColor: C.border, color: C.text, width: 190, background: "white" }}
                onFocus={(e) => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px rgba(127,64,228,0.12)` }}
                onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "" }}
                aria-label="Search users"
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full cursor-pointer opacity-50 hover:opacity-80 transition-opacity duration-100"
                  aria-label="Clear search"
                >
                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3" style={{ color: C.textMuted }}>
                    <path fillRule="evenodd" d="M3.293 3.293a1 1 0 011.414 0L6 4.586l1.293-1.293a1 1 0 111.414 1.414L7.414 6l1.293 1.293a1 1 0 01-1.414 1.414L6 7.414 4.707 8.707a1 1 0 01-1.414-1.414L4.586 6 3.293 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex rounded-[8px] border overflow-hidden" style={{ borderColor: C.border }}>
              {(["list", "cards"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="h-9 px-3 flex items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-all duration-150"
                  style={{ fontFamily: "'Archivo', sans-serif", background: view === v ? C.primaryLight : "white", color: view === v ? C.primary : C.textMuted, borderRight: v === "list" ? `1px solid ${C.border}` : undefined }}
                  aria-pressed={view === v}
                  aria-label={v === "list" ? "List view" : "Card view"}
                >
                  {v === "list" ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-4 h-4"><path d="M3 5h14M3 10h14M3 15h14" /></svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect x="3" y="3" width="6" height="6" rx="1" /><rect x="11" y="3" width="6" height="6" rx="1" />
                      <rect x="3" y="11" width="6" height="6" rx="1" /><rect x="11" y="11" width="6" height="6" rx="1" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{v === "list" ? "List" : "Cards"}</span>
                </button>
              ))}
            </div>

            {/* Add User */}
            <button
              onClick={() => setAddOpen(true)}
              className="h-9 px-4 rounded-[8px] text-[13px] font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-all duration-[180ms]"
              style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(127,64,228,0.3)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "" }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col gap-4">
          {loading ? (
            view === "list" ? (
              <UserTableSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <UserCardSkeleton key={i} />)}
              </div>
            )
          ) : error ? (
            <ErrorState onRetry={load} />
          ) : pagedUsers.length === 0 ? (
            <EmptyState type={hasSearch ? "no-results" : "no-users"} onAddUser={() => setAddOpen(true)} />
          ) : view === "list" ? (
            <UserTable users={pagedUsers} onRowClick={setSelectedUser} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedUsers.map((u) => (
                <UserCard key={u.id} user={u} onClick={setSelectedUser} />
              ))}
            </div>
          )}

          {!loading && !error && totalCount > PAGE_SIZE && (
            <Pagination page={page} total={totalCount} pageSize={PAGE_SIZE} onChange={handlePageChange} />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {selectedUser && (
        <UserDetailsModal
          userId={selectedUser.id}
          userName={selectedUser.name}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {addOpen && (
        <AddUserModal
          onClose={() => setAddOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
