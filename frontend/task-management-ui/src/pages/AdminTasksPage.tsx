import { useState, useEffect, useCallback, useRef } from "react"
import { useOutletContext } from "react-router"
import type { Task, TaskStatus, TaskPriority, ToastType } from "@/types"
import {
  ADMIN_ASSIGNEES,
  DEFAULT_ADMIN_FILTERS,
  getAdminTasks,
  createAdminTask,
  updateAdminTask,
  deleteAdminTask,
  type AdminTaskFilterState,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/services/adminTaskService"
import { TASK_CATEGORIES } from "@/services/taskService"

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
  warningLight:  "#FFFBEB",
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
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function isOverdue(dueDate: string, status: TaskStatus): boolean {
  return status !== "Completed" && new Date(dueDate) < new Date()
}

function countAdminActiveFilters(f: AdminTaskFilterState): number {
  return f.status.length + f.priority.length + f.category.length + f.assignee.length + (f.dueDatePreset !== "any" ? 1 : 0)
}

function getInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ["#7F40E4", "#1a7f4b", "#D97706", "#2563EB", "#7C3AED", "#047857", "#B45309", "#C0392B"]

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  Pending:    { label: "Pending",     dot: C.secondary, bg: C.secondaryLight, text: "#92400e", border: "#fde68a" },
  InProgress: { label: "In Progress", dot: C.primary,   bg: C.primaryLight,   text: "#4c1d95", border: "#c4b5fd" },
  Completed:  { label: "Completed",   dot: C.success,   bg: C.successLight,   text: "#14532d", border: "#a7f3d0" },
}

const STATUS_ORDER: TaskStatus[] = ["Pending", "InProgress", "Completed"]

const PRIORITY_CONFIG: Record<string, { bg: string; text: string }> = {
  High:   { bg: "#FEF2F2", text: "#991B1B" },
  Medium: { bg: "#FFFBEB", text: "#92400E" },
  Low:    { bg: "#F5F5F5", text: "#525252" },
}

// ─── Shared badge components ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap"
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

function CategoryTag({ category }: { category: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] whitespace-nowrap"
      style={{ fontFamily: "'Jost', sans-serif", background: "#F5F5F5", color: C.textSecondary }}
    >
      {category}
    </span>
  )
}

function AssigneeCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
        style={{ background: avatarColor(name) }}
      >
        {getInitials(name)}
      </div>
      <span className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
        {name}
      </span>
    </div>
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

// ─── Action menu ──────────────────────────────────────────────────────────────

function TaskActionMenu({
  task,
  onView,
  onEdit,
  onDelete,
}: {
  task: Task
  onView: (t: Task) => void
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [open])

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    const rect = btnRef.current!.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, left: rect.right - 160 })
    setOpen(true)
  }

  const menuActions = [
    {
      label: "View task",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      ),
      action: () => onView(task),
      danger: false,
    },
    {
      label: "Edit task",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M11.5 2.5a2.121 2.121 0 013 3L5 15H2v-3L11.5 2.5z" />
        </svg>
      ),
      action: () => onEdit(task),
      danger: false,
    },
    {
      label: "Delete task",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" />
        </svg>
      ),
      action: () => onDelete(task),
      danger: true,
    },
  ]

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-7 h-7 flex items-center justify-center rounded-[6px] cursor-pointer transition-colors duration-150 hover:bg-[#F0F0EF]"
        style={{ color: C.textMuted }}
        aria-label="Task actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-[999] bg-white border rounded-[10px] py-1.5 w-[160px]"
          style={{ top: pos.top, left: pos.left, borderColor: C.border, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          role="menu"
        >
            {menuActions.map(({ label, icon, action, danger }) => (
              <button
                key={label}
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); setOpen(false); action() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] cursor-pointer transition-colors duration-100 text-left hover:bg-[#F8F8F7]"
                style={{ fontFamily: "'Jost', sans-serif", color: danger ? C.error : C.textSecondary }}
                onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "#FDF2F2" : "#F8F8F7" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "" }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
      )}
    </>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

function AdminTaskTableSkeleton() {
  const headers = ["Task", "Assignee", "Status", "Priority", "Category", "Due Date", "Updated", ""]
  return (
    <div className="bg-white rounded-[12px] border overflow-hidden" style={{ borderColor: C.border }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#FAFAF9" }}>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3">
                <Skeleton className="h-3 w-14" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <tr key={i} style={{ borderBottom: `1px solid #F5F5F4` }}>
              <td className="px-4 py-3.5"><div className="flex flex-col gap-1.5"><Skeleton className="h-3.5 w-44" /><Skeleton className="h-2.5 w-28" /></div></td>
              <td className="px-4 py-3.5"><div className="flex items-center gap-2"><Skeleton className="w-6 h-6 rounded-full" /><Skeleton className="h-3 w-20" /></div></td>
              <td className="px-4 py-3.5"><Skeleton className="h-6 w-24 rounded-full" /></td>
              <td className="px-4 py-3.5"><Skeleton className="h-5 w-14 rounded-[4px]" /></td>
              <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-[4px]" /></td>
              <td className="px-4 py-3.5"><Skeleton className="h-3 w-16" /></td>
              <td className="px-4 py-3.5"><Skeleton className="h-3 w-12" /></td>
              <td className="px-4 py-3.5"><Skeleton className="w-7 h-7 rounded-[6px]" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdminTaskTable({
  tasks,
  onView,
  onEdit,
  onDelete,
}: {
  tasks: Task[]
  onView: (t: Task) => void
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
}) {
  const headers = ["Task", "Assignee", "Status", "Priority", "Category", "Due Date", "Updated", ""]

  return (
    <div className="bg-white rounded-[12px] border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#FAFAF9" }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => {
              const overdue = isOverdue(task.dueDate, task.status)
              return (
                <tr
                  key={task.id}
                  onClick={() => onView(task)}
                  className="cursor-pointer group transition-colors duration-150"
                  style={{ borderBottom: idx < tasks.length - 1 ? `1px solid #F5F5F4` : undefined, background: "white" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAF9" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white" }}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onView(task)}
                  aria-label={`View task: ${task.title}`}
                >
                  <td className="px-4 py-3.5 max-w-[260px]">
                    <p
                      className="text-[13px] font-semibold truncate group-hover:text-[#7F40E4] transition-colors duration-150"
                      style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
                    >
                      {task.title}
                    </p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
                      {task.description}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <AssigneeCell name={task.assignee} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3.5">
                    <CategoryTag category={task.category} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className="text-[12px]"
                      style={{ fontFamily: "'Jost', sans-serif", color: overdue ? C.error : C.textSecondary, fontWeight: overdue ? 600 : 400 }}
                    >
                      {overdue && (
                        <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 inline mr-1 mb-0.5">
                          <path fillRule="evenodd" d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5a.5.5 0 011 0v3a.5.5 0 01-1 0v-3zm.5 5a.5.5 0 100-1 .5.5 0 000 1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {formatDate(task.dueDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
                      {formatRelative(task.updatedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <TaskActionMenu task={task} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Card view ────────────────────────────────────────────────────────────────

function AdminTaskCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border p-5 flex flex-col gap-3" style={{ borderColor: C.border }}>
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-14 rounded-[4px]" />
        <Skeleton className="w-7 h-7 rounded-[6px]" />
      </div>
      <Skeleton className="h-4 w-4/5" />
      <div className="flex items-center gap-2"><Skeleton className="w-6 h-6 rounded-full" /><Skeleton className="h-3 w-20" /></div>
      <Skeleton className="h-5 w-20 rounded-[4px]" />
      <div className="flex justify-between items-center pt-1 border-t" style={{ borderColor: "#F5F5F4" }}>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  )
}

function AdminTaskCard({
  task,
  onView,
  onEdit,
  onDelete,
}: {
  task: Task
  onView: (t: Task) => void
  onEdit: (t: Task) => void
  onDelete: (t: Task) => void
}) {
  const overdue = isOverdue(task.dueDate, task.status)
  return (
    <div
      onClick={() => onView(task)}
      className="bg-white rounded-[12px] border p-5 flex flex-col gap-3 cursor-pointer transition-shadow transition-colors duration-[180ms] group"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor = C.borderStrong }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = C.border }}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onView(task)}
      aria-label={`View task: ${task.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        <div onClick={(e) => e.stopPropagation()}>
          <TaskActionMenu task={task} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      <p
        className="text-[13px] font-semibold leading-snug group-hover:text-[#7F40E4] transition-colors duration-150"
        style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
      >
        {task.title}
      </p>

      <AssigneeCell name={task.assignee} />

      <div className="flex items-center gap-2 flex-wrap">
        <CategoryTag category={task.category} />
        <span
          className="text-[11px]"
          style={{ fontFamily: "'Jost', sans-serif", color: overdue ? C.error : C.textMuted, fontWeight: overdue ? 600 : 400 }}
        >
          {overdue ? "⚠ Overdue " : "Due "}{formatDate(task.dueDate)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 mt-auto border-t" style={{ borderColor: "#F5F5F4" }}>
        <span className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
          {formatRelative(task.updatedAt)}
        </span>
        <StatusBadge status={task.status} />
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalCount,
  pageSize,
  onChange,
}: {
  page: number
  totalCount: number
  pageSize: number
  onChange: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  function getPages(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "...")[] = [1]
    if (page > 3) pages.push("...")
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p)
    if (page < totalPages - 2) pages.push("...")
    pages.push(totalPages)
    return pages
  }

  const btnBase = "h-8 min-w-[32px] px-2 rounded-[7px] text-[13px] font-medium flex items-center justify-center transition-all duration-150 cursor-pointer"

  return (
    <div className="flex items-center justify-between pt-1">
      <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
        {totalCount === 0 ? "No tasks" : `Showing ${start}–${end} of ${totalCount} task${totalCount !== 1 ? "s" : ""}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className={`${btnBase} gap-1 px-3 border`}
          style={{ fontFamily: "'Archivo', sans-serif", borderColor: C.border, color: page === 1 ? C.textMuted : C.textSecondary, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Prev
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} className="w-8 text-center text-[13px]" style={{ color: C.textMuted }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={btnBase}
              style={{
                fontFamily: "'Archivo', sans-serif",
                background: p === page ? C.primary : "transparent",
                color: p === page ? "white" : C.textSecondary,
                fontWeight: p === page ? 600 : 400,
              }}
              onMouseEnter={(e) => { if (p !== page) e.currentTarget.style.background = C.primaryLight }}
              onMouseLeave={(e) => { if (p !== page) e.currentTarget.style.background = "transparent" }}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className={`${btnBase} gap-1 px-3 border`}
          style={{ fontFamily: "'Archivo', sans-serif", borderColor: C.border, color: page === totalPages ? C.textMuted : C.textSecondary, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
        >
          Next
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Filter modal ─────────────────────────────────────────────────────────────

function FilterCheckbox({ checked, onChange, label, color }: { checked: boolean; onChange: (v: boolean) => void; label: string; color?: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div
        className="w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-150 shrink-0"
        style={{ borderColor: checked ? C.primary : C.borderStrong, background: checked ? C.primary : "white" }}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </div>
      <span
        className="text-[13px] flex items-center gap-1.5"
        style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}
        onClick={() => onChange(!checked)}
      >
        {color && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />}
        {label}
      </span>
    </label>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.08em" }}>
        {title}
      </p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}

function AdminFilterModal({
  open,
  pending,
  onChangePending,
  onApply,
  onClear,
  onClose,
}: {
  open: boolean
  pending: AdminTaskFilterState
  onChangePending: (f: AdminTaskFilterState) => void
  onApply: () => void
  onClear: () => void
  onClose: () => void
}) {
  if (!open) return null

  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
  }

  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-label="Task filters">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-[460px] bg-white rounded-[16px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <h2 className="text-[15px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Filters</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5]" aria-label="Close filters">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          <FilterSection title="Status">
            {(["Pending", "InProgress", "Completed"] as TaskStatus[]).map((s) => (
              <FilterCheckbox
                key={s}
                checked={pending.status.includes(s)}
                onChange={() => onChangePending({ ...pending, status: toggleArr(pending.status, s) as TaskStatus[] })}
                label={STATUS_CONFIG[s].label}
                color={STATUS_CONFIG[s].dot}
              />
            ))}
          </FilterSection>

          <div className="h-px" style={{ background: C.border }} />

          <FilterSection title="Priority">
            {(["High", "Medium", "Low"] as const).map((p) => (
              <FilterCheckbox
                key={p}
                checked={pending.priority.includes(p)}
                onChange={() => onChangePending({ ...pending, priority: toggleArr(pending.priority, p) as AdminTaskFilterState["priority"] })}
                label={p}
                color={p === "High" ? C.error : p === "Medium" ? C.warning : C.textMuted}
              />
            ))}
          </FilterSection>

          <div className="h-px" style={{ background: C.border }} />

          <FilterSection title="Assignee">
            <div className="grid grid-cols-2 gap-2">
              {ADMIN_ASSIGNEES.map((a) => (
                <FilterCheckbox
                  key={a}
                  checked={pending.assignee.includes(a)}
                  onChange={() => onChangePending({ ...pending, assignee: toggleArr(pending.assignee, a) })}
                  label={a}
                />
              ))}
            </div>
          </FilterSection>

          <div className="h-px" style={{ background: C.border }} />

          <FilterSection title="Category">
            <div className="grid grid-cols-2 gap-2">
              {TASK_CATEGORIES.map((cat) => (
                <FilterCheckbox
                  key={cat}
                  checked={pending.category.includes(cat)}
                  onChange={() => onChangePending({ ...pending, category: toggleArr(pending.category, cat) })}
                  label={cat}
                />
              ))}
            </div>
          </FilterSection>

          <div className="h-px" style={{ background: C.border }} />

          <FilterSection title="Due Date">
            {([
              { value: "any",      label: "Any time" },
              { value: "due-soon", label: "Due within 3 days" },
            ] as { value: AdminTaskFilterState["dueDatePreset"]; label: string }[]).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150 shrink-0"
                  style={{ borderColor: pending.dueDatePreset === opt.value ? C.primary : C.borderStrong }}
                  onClick={() => onChangePending({ ...pending, dueDatePreset: opt.value })}
                >
                  {pending.dueDatePreset === opt.value && (
                    <div className="w-2 h-2 rounded-full" style={{ background: C.primary }} />
                  )}
                </div>
                <span
                  className="text-[13px]"
                  style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}
                  onClick={() => onChangePending({ ...pending, dueDatePreset: opt.value })}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </FilterSection>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t gap-3" style={{ borderColor: C.border }}>
          <button
            onClick={onClear}
            className="h-9 px-4 rounded-[8px] text-[13px] font-medium border cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5]"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary, borderColor: C.border }}
          >
            Clear all
          </button>
          <button
            onClick={onApply}
            className="h-9 px-5 rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition-all duration-[180ms]"
            style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(127,64,228,0.3)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "" }}
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Active filter chips ──────────────────────────────────────────────────────

function AdminFilterChips({
  applied,
  onRemove,
  onClearAll,
}: {
  applied: AdminTaskFilterState
  onRemove: (key: string, val: string) => void
  onClearAll: () => void
}) {
  const chips: { key: string; label: string }[] = [
    ...applied.status.map((s) => ({ key: `status:${s}`, label: `Status: ${STATUS_CONFIG[s].label}` })),
    ...applied.priority.map((p) => ({ key: `priority:${p}`, label: `Priority: ${p}` })),
    ...applied.assignee.map((a) => ({ key: `assignee:${a}`, label: `Assignee: ${a}` })),
    ...applied.category.map((c) => ({ key: `category:${c}`, label: `Category: ${c}` })),
    ...(applied.dueDatePreset !== "any" ? [{ key: "due:soon", label: "Due within 3 days" }] : []),
  ]

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const [type, val] = chip.key.split(":")
        return (
          <div
            key={chip.key}
            className="inline-flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full border text-[12px]"
            style={{ fontFamily: "'Jost', sans-serif", borderColor: C.border, color: C.textSecondary, background: "white" }}
          >
            {chip.label}
            <button
              onClick={() => onRemove(type, val)}
              className="w-4 h-4 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-100 hover:bg-[#F0F0EF]"
              aria-label={`Remove filter: ${chip.label}`}
            >
              <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5" style={{ color: C.textMuted }}>
                <path fillRule="evenodd" d="M3.293 3.293a1 1 0 011.414 0L6 4.586l1.293-1.293a1 1 0 111.414 1.414L7.414 6l1.293 1.293a1 1 0 01-1.414 1.414L6 7.414 4.707 8.707a1 1 0 01-1.414-1.414L4.586 6 3.293 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )
      })}
      <button
        onClick={onClearAll}
        className="h-7 px-3 rounded-full text-[12px] cursor-pointer transition-colors duration-150 hover:bg-[#F0F0EF]"
        style={{ fontFamily: "'Jost', sans-serif", color: C.error }}
      >
        Clear all
      </button>
    </div>
  )
}

// ─── Empty / Error states ─────────────────────────────────────────────────────

function AdminEmptyState({ type, onCreateTask, onClear }: { type: "no-tasks" | "no-results" | "no-filter-results"; onCreateTask: () => void; onClear?: () => void }) {
  const config = {
    "no-tasks":          { heading: "No tasks available",           body: "There are currently no tasks in the system." },
    "no-results":        { heading: "No matching tasks",            body: "Try adjusting your search or clearing your filters." },
    "no-filter-results": { heading: "No tasks match these filters", body: "Try removing one or more filters." },
  }[type]

  return (
    <div className="bg-white rounded-[12px] border py-16 flex flex-col items-center text-center" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: C.primaryLight }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold mb-1.5" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>{config.heading}</h3>
      <p className="text-[13px] max-w-xs mb-5" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>{config.body}</p>
      <div className="flex items-center gap-3">
        {onClear && (
          <button
            onClick={onClear}
            className="h-9 px-4 rounded-[8px] text-[13px] font-medium border cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5]"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary, borderColor: C.border }}
          >
            Clear filters
          </button>
        )}
        {type === "no-tasks" && (
          <button
            onClick={onCreateTask}
            className="h-9 px-4 rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition-all duration-[180ms]"
            style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryHover }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primary }}
          >
            + Create Task
          </button>
        )}
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-white rounded-[12px] border py-16 flex flex-col items-center text-center" style={{ borderColor: C.border }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: C.errorLight }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 2L2 19h20L12 2z" />
          <path d="M12 9v5M12 16.5v.5" strokeWidth="2" />
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold mb-1.5" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Unable to load tasks</h3>
      <p className="text-[13px] max-w-xs mb-5" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
        Something went wrong while retrieving system tasks.
      </p>
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

// ─── Shared form helpers ──────────────────────────────────────────────────────

const INPUT_BASE: React.CSSProperties = {
  height: 36, borderRadius: 8, border: `1px solid ${C.border}`,
  fontSize: 13, fontFamily: "'Jost', sans-serif", color: C.text,
  padding: "0 12px", outline: "none", width: "100%", background: "white",
  boxSizing: "border-box",
}

function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>
        {label}{required && <span style={{ color: C.error }}> *</span>}
      </label>
      {children}
      {error && <p className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.error }}>{error}</p>}
    </div>
  )
}

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = C.primary
  e.target.style.boxShadow = `0 0 0 3px rgba(127,64,228,0.12)`
}

function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = C.border
  e.target.style.boxShadow = ""
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

interface CreateFormData {
  title: string
  description: string
  assignee: string
  priority: TaskPriority
  category: string
  dueDate: string
}

function CreateTaskModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: Task) => void }) {
  const [form, setForm] = useState<CreateFormData>({
    title: "",
    description: "",
    assignee: ADMIN_ASSIGNEES[0],
    priority: "Medium",
    category: TASK_CATEGORIES[0],
    dueDate: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateFormData, string>>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const errs: Partial<Record<keyof CreateFormData, string>> = {}
    if (!form.title.trim()) errs.title = "Title is required"
    if (!form.dueDate) errs.dueDate = "Due date is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate() || loading) return
    setLoading(true)
    try {
      const payload: CreateTaskPayload = {
        title: form.title,
        description: form.description,
        assignee: form.assignee,
        priority: form.priority,
        category: form.category,
        dueDate: form.dueDate,
      }
      const task = await createAdminTask(payload)
      onCreated(task)
    } catch {
      // parent handles error toast
    } finally {
      setLoading(false)
    }
  }

  function set(key: keyof CreateFormData, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-label="Create task">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-[520px] bg-white rounded-[16px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "92vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <h2 className="text-[16px] font-bold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Create Task</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5]" aria-label="Close">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <FormField label="Title" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Task title"
              style={{ ...INPUT_BASE, borderColor: errors.title ? C.error : C.border }}
              onFocus={focusInput}
              onBlur={blurInput}
              autoFocus
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the task…"
              rows={3}
              style={{ ...INPUT_BASE, height: "auto", padding: "8px 12px", resize: "vertical", lineHeight: "1.5" }}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Assignee" required>
              <select
                value={form.assignee}
                onChange={(e) => set("assignee", e.target.value)}
                style={{ ...INPUT_BASE, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                {ADMIN_ASSIGNEES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </FormField>

            <FormField label="Priority" required>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value as TaskPriority)}
                style={{ ...INPUT_BASE, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                {["Low", "Medium", "High"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                style={{ ...INPUT_BASE, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>

            <FormField label="Due Date" required error={errors.dueDate}>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                style={{ ...INPUT_BASE, borderColor: errors.dueDate ? C.error : C.border, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </FormField>
          </div>

          <div className="p-3 rounded-[8px] flex items-center gap-2" style={{ background: C.primaryLight }}>
            <svg viewBox="0 0 16 16" fill="none" stroke={C.primary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 5v3M8 11v.5" />
            </svg>
            <p className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.primary }}>
              New tasks are automatically set to <strong>Pending</strong> status.
            </p>
          </div>
        </div>

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
            {loading ? "Creating…" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Task Modal ──────────────────────────────────────────────────────────

interface EditFormData {
  title: string
  description: string
  assignee: string
  status: TaskStatus
  priority: TaskPriority
  category: string
  dueDate: string
}

function EditTaskModal({ task, onClose, onUpdated }: { task: Task; onClose: () => void; onUpdated: (t: Task) => void }) {
  const [form, setForm] = useState<EditFormData>({
    title: task.title,
    description: task.description,
    assignee: task.assignee,
    status: task.status,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof EditFormData, string>>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const errs: Partial<Record<keyof EditFormData, string>> = {}
    if (!form.title.trim()) errs.title = "Title is required"
    if (!form.dueDate) errs.dueDate = "Due date is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate() || loading) return
    setLoading(true)
    try {
      const payload: UpdateTaskPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        assignee: form.assignee,
        status: form.status,
        priority: form.priority,
        category: form.category,
        dueDate: form.dueDate,
      }
      const updated = await updateAdminTask(task.id, payload)
      onUpdated(updated)
    } catch {
      // parent handles error toast
    } finally {
      setLoading(false)
    }
  }

  function set(key: keyof EditFormData, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-label="Edit task">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-[520px] bg-white rounded-[16px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "92vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <h2 className="text-[16px] font-bold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Edit Task</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5]" aria-label="Close">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <FormField label="Title" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              style={{ ...INPUT_BASE, borderColor: errors.title ? C.error : C.border }}
              onFocus={focusInput}
              onBlur={blurInput}
              autoFocus
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              style={{ ...INPUT_BASE, height: "auto", padding: "8px 12px", resize: "vertical", lineHeight: "1.5" }}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Assignee" required>
              <select
                value={form.assignee}
                onChange={(e) => set("assignee", e.target.value)}
                style={{ ...INPUT_BASE, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                {ADMIN_ASSIGNEES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </FormField>

            <FormField label="Status" required>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as TaskStatus)}
                style={{ ...INPUT_BASE, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priority" required>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value as TaskPriority)}
                style={{ ...INPUT_BASE, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                {["Low", "Medium", "High"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormField>

            <FormField label="Category" required>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                style={{ ...INPUT_BASE, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Due Date" required error={errors.dueDate}>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              style={{ ...INPUT_BASE, borderColor: errors.dueDate ? C.error : C.border, cursor: "pointer" }}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </FormField>
        </div>

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
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Task Detail Modal ────────────────────────────────────────────────────────

function TaskDetailModal({ task, onClose, onEdit }: { task: Task; onClose: () => void; onEdit: (t: Task) => void }) {
  const overdue = isOverdue(task.dueDate, task.status)

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Assignee",    value: <AssigneeCell name={task.assignee} /> },
    { label: "Status",      value: <StatusBadge status={task.status} /> },
    { label: "Priority",    value: <PriorityBadge priority={task.priority} /> },
    { label: "Category",    value: <CategoryTag category={task.category} /> },
    { label: "Due Date",    value: <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: overdue ? C.error : C.textSecondary, fontWeight: overdue ? 600 : 400 }}>{overdue ? "⚠ Overdue — " : ""}{formatDate(task.dueDate)}</span> },
    { label: "Last Updated",value: <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>{formatRelative(task.updatedAt)}</span> },
    { label: "Created",     value: <span className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>{formatDate(task.createdAt)}</span> },
  ]

  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-label="Task detail">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} onClick={onClose} />
      <div
        className="relative w-full max-w-[520px] bg-white rounded-[16px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <h2 className="text-[15px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Task Details</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5]" aria-label="Close">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div>
            <h3 className="text-[16px] font-bold leading-snug mb-2" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-[13px] leading-relaxed" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                {task.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-1">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <span className="text-[12px] font-medium shrink-0 w-28" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted }}>
                  {label}
                </span>
                <div className="flex-1 flex justify-end">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: C.border }}>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-[8px] text-[13px] font-medium border cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5]"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary, borderColor: C.border }}
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onEdit(task) }}
            className="h-9 px-5 rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition-all duration-[180ms]"
            style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryHover }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.primary }}
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirmation ──────────────────────────────────────────────────────

function DeleteConfirmDialog({
  task,
  loading,
  onConfirm,
  onCancel,
}: {
  task: Task
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" aria-modal="true" role="alertdialog">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} onClick={loading ? undefined : onCancel} />
      <div
        className="relative w-full max-w-[420px] bg-white rounded-[16px] p-6"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4" style={{ background: C.errorLight }}>
          <svg viewBox="0 0 20 20" fill="none" stroke={C.error} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M3 6h14M5 6l1 11h8l1-11M8 6V4h4v2" />
          </svg>
        </div>

        <h2 className="text-[16px] font-bold mb-2" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
          Delete task?
        </h2>
        <p className="text-[13px] leading-relaxed mb-6" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
          Are you sure you want to delete <strong className="font-semibold" style={{ color: C.text }}>"{task.title}"</strong>? This action cannot be undone.
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 rounded-[8px] text-[13px] font-medium border cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5] disabled:opacity-50"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary, borderColor: C.border }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-9 px-4 rounded-[8px] text-[13px] font-semibold text-white flex items-center gap-2 cursor-pointer transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Archivo', sans-serif", background: C.error }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#a93226" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.error }}
          >
            {loading && (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Deleting…" : "Delete Task"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Tasks Page ─────────────────────────────────────────────────────────

interface OutletCtx { addToast: (type: ToastType, message: string) => void }

export default function AdminTasksPage() {
  const { addToast } = useOutletContext<OutletCtx>()

  const [view, setView] = useState<"list" | "cards">("list")
  const [searchInput, setSearchInput] = useState("")
  const [keyword, setKeyword] = useState("")

  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [pendingFilters, setPendingFilters] = useState<AdminTaskFilterState>(DEFAULT_ADMIN_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<AdminTaskFilterState>(DEFAULT_ADMIN_FILTERS)
  const activeFilterCount = countAdminActiveFilters(appliedFilters)

  const [page, setPage] = useState(1)
  const [tasks, setTasks] = useState<Task[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState(false)

  // Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [viewTask, setViewTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setKeyword(searchInput); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const load = useCallback(
    async (isPageChange = false) => {
      if (isPageChange) setPageLoading(true)
      else { setLoading(true); setError(false) }
      try {
        const res = await getAdminTasks({ keyword, filters: appliedFilters, page, pageSize: PAGE_SIZE })
        setTasks(res.tasks)
        setTotalCount(res.totalCount)
      } catch {
        if (!isPageChange) setError(true)
      } finally {
        setLoading(false)
        setPageLoading(false)
      }
    },
    [keyword, appliedFilters, page]
  )

  useEffect(() => { load(page > 1) }, [load])

  // CRUD handlers
  async function handleCreated(task: Task) {
    setCreateOpen(false)
    addToast("success", "Task created successfully")
    setTasks((prev) => [task, ...prev.slice(0, PAGE_SIZE - 1)])
    setTotalCount((n) => n + 1)
  }

  async function handleUpdated(updated: Task) {
    setEditTask(null)
    addToast("success", "Task updated successfully")
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function handleDelete() {
    if (!deleteTask || deleteLoading) return
    setDeleteLoading(true)
    try {
      await deleteAdminTask(deleteTask.id)
      addToast("success", "Task deleted successfully")
      setTasks((prev) => prev.filter((t) => t.id !== deleteTask.id))
      setTotalCount((n) => Math.max(0, n - 1))
      setDeleteTask(null)
    } catch {
      addToast("error", "Unable to delete task")
    } finally {
      setDeleteLoading(false)
    }
  }

  // Filter actions
  function handleApplyFilters() { setAppliedFilters(pendingFilters); setPage(1); setFilterModalOpen(false) }
  function handleClearFilters() { setPendingFilters(DEFAULT_ADMIN_FILTERS); setAppliedFilters(DEFAULT_ADMIN_FILTERS); setPage(1); setFilterModalOpen(false) }
  function handleOpenFilterModal() { setPendingFilters(appliedFilters); setFilterModalOpen(true) }

  function handleRemoveChip(type: string, val: string) {
    const f = { ...appliedFilters }
    if (type === "status") f.status = f.status.filter((x) => x !== val) as typeof f.status
    else if (type === "priority") f.priority = f.priority.filter((x) => x !== val) as typeof f.priority
    else if (type === "assignee") f.assignee = f.assignee.filter((x) => x !== val)
    else if (type === "category") f.category = f.category.filter((x) => x !== val)
    else if (type === "due") f.dueDatePreset = "any"
    setAppliedFilters(f); setPendingFilters(f); setPage(1)
  }

  function handlePageChange(p: number) { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }) }

  const hasSearch  = keyword.trim().length > 0
  const hasFilters = activeFilterCount > 0
  const emptyType  = hasSearch || hasFilters ? (hasFilters && !hasSearch ? "no-filter-results" : "no-results") : "no-tasks"

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
              Tasks
            </h1>
            <p className="mt-1 text-[14px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
              Manage tasks across the entire system.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: C.textMuted }}>
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M13 13l3.5 3.5" />
              </svg>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tasks or assignees…"
                className="h-9 pl-9 pr-8 rounded-[8px] border text-[13px] outline-none transition-all duration-150"
                style={{ fontFamily: "'Jost', sans-serif", borderColor: C.border, color: C.text, width: 220, background: "white" }}
                onFocus={(e) => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px rgba(127,64,228,0.12)` }}
                onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "" }}
                aria-label="Search tasks"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full cursor-pointer opacity-50 hover:opacity-80 transition-opacity duration-100"
                  aria-label="Clear search"
                >
                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3" style={{ color: C.textMuted }}>
                    <path fillRule="evenodd" d="M3.293 3.293a1 1 0 011.414 0L6 4.586l1.293-1.293a1 1 0 111.414 1.414L7.414 6l1.293 1.293a1 1 0 01-1.414 1.414L6 7.414 4.707 8.707a1 1 0 01-1.414-1.414L4.586 6 3.293 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filters */}
            <button
              onClick={handleOpenFilterModal}
              className="h-9 px-3.5 rounded-[8px] border flex items-center gap-2 text-[13px] font-medium cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5]"
              style={{ fontFamily: "'Archivo', sans-serif", color: activeFilterCount > 0 ? C.primary : C.textSecondary, borderColor: activeFilterCount > 0 ? C.primary : C.border, background: activeFilterCount > 0 ? C.primaryLight : "white" }}
              aria-label={`Filters${activeFilterCount ? ` (${activeFilterCount} active)` : ""}`}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 5h14M6 10h8M9 15h2" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: C.primary }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

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
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-4 h-4">
                      <path d="M3 5h14M3 10h14M3 15h14" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <rect x="3" y="3" width="6" height="6" rx="1" />
                      <rect x="11" y="3" width="6" height="6" rx="1" />
                      <rect x="3" y="11" width="6" height="6" rx="1" />
                      <rect x="11" y="11" width="6" height="6" rx="1" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{v === "list" ? "List" : "Cards"}</span>
                </button>
              ))}
            </div>

            {/* Create Task */}
            <button
              onClick={() => setCreateOpen(true)}
              className="h-9 px-4 rounded-[8px] text-[13px] font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-all duration-[180ms]"
              style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(127,64,228,0.3)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "" }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Create Task
            </button>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {activeFilterCount > 0 && (
          <AdminFilterChips applied={appliedFilters} onRemove={handleRemoveChip} onClearAll={handleClearFilters} />
        )}

        {/* ── Content ── */}
        <div className="flex flex-col gap-4">
          {loading ? (
            view === "list" ? (
              <AdminTaskTableSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <AdminTaskCardSkeleton key={i} />)}
              </div>
            )
          ) : error ? (
            <ErrorState onRetry={() => load(false)} />
          ) : tasks.length === 0 ? (
            <AdminEmptyState
              type={emptyType}
              onCreateTask={() => setCreateOpen(true)}
              onClear={hasFilters || hasSearch ? handleClearFilters : undefined}
            />
          ) : pageLoading ? (
            view === "list" ? (
              <AdminTaskTableSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <AdminTaskCardSkeleton key={i} />)}
              </div>
            )
          ) : view === "list" ? (
            <AdminTaskTable
              tasks={tasks}
              onView={(t) => setViewTask(t)}
              onEdit={(t) => setEditTask(t)}
              onDelete={(t) => setDeleteTask(t)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <AdminTaskCard
                  key={task.id}
                  task={task}
                  onView={(t) => setViewTask(t)}
                  onEdit={(t) => setEditTask(t)}
                  onDelete={(t) => setDeleteTask(t)}
                />
              ))}
            </div>
          )}

          {!loading && !error && totalCount > 0 && (
            <Pagination page={page} totalCount={totalCount} pageSize={PAGE_SIZE} onChange={handlePageChange} />
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AdminFilterModal
        open={filterModalOpen}
        pending={pendingFilters}
        onChangePending={setPendingFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClose={() => setFilterModalOpen(false)}
      />

      {createOpen && (
        <CreateTaskModal
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onUpdated={handleUpdated}
        />
      )}

      {viewTask && (
        <TaskDetailModal
          task={viewTask}
          onClose={() => setViewTask(null)}
          onEdit={(t) => { setViewTask(null); setEditTask(t) }}
        />
      )}

      {deleteTask && (
        <DeleteConfirmDialog
          task={deleteTask}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => { if (!deleteLoading) setDeleteTask(null) }}
        />
      )}
    </div>
  )
}
