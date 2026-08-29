import { useState, useEffect, useCallback, useRef } from "react"
import { useOutletContext } from "react-router"
import type { Task, TaskStatus, TaskFilterState, ToastType } from "@/types"
import { DEFAULT_FILTERS } from "@/types"
import {getTasks, updateTaskStatus } from "@/services/taskService"
import {getCategories, type CategoryDto} from "@/services/taskService"

// ─── Design tokens (shared with Dashboard) ────────────────────────────────────

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

function isDueSoon(dueDate: string, status: TaskStatus): boolean {
  if (status === "Completed") return false

  const due = new Date(`${dueDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return due.getTime() === today.getTime()
}

function isOverdue(dueDate: string, status: TaskStatus): boolean {
  if (status === "Completed") return false

  const due = new Date(`${dueDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return due.getTime() < today.getTime()
}

function countActiveFilters(f: TaskFilterState): number {
  return f.status.length + f.priority.length + f.category.length + (f.dueDatePreset !== "any" ? 1 : 0)
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; bg: string; text: string; border: string }> = {
  Pending:    { label: "Pending",     dot: C.secondary, bg: C.secondaryLight, text: "#92400e", border: "#fde68a" },
  InProgress: { label: "In Progress", dot: C.primary,   bg: C.primaryLight,   text: "#4c1d95", border: "#c4b5fd" },
  Completed:  { label: "Completed",   dot: C.success,   bg: C.successLight,   text: "#14532d", border: "#a7f3d0" },
}

const STATUS_ORDER: TaskStatus[] = ["Pending", "InProgress", "Completed"]

// ─── Priority config ──────────────────────────────────────────────────────────

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[6px] animate-pulse ${className}`}
      style={{ background: "linear-gradient(90deg, #F0F0EF 25%, #E8E8E7 50%, #F0F0EF 75%)", backgroundSize: "200%" }}
    />
  )
}

// ─── Status dropdown ──────────────────────────────────────────────────────────

function StatusControl({
  task,
  onUpdate,
}: {
  task: Task
  onUpdate: (id: string, status: TaskStatus) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const cfg = STATUS_CONFIG[task.status]

  // Close on outside click — no full-screen backdrop so card hover is undisturbed
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
    if (loading) return
    const rect = btnRef.current!.getBoundingClientRect()
    setDropPos({ top: rect.bottom + 4, left: rect.left })
    setOpen(true)
  }

  async function handleSelect(e: React.MouseEvent, status: TaskStatus) {
    e.stopPropagation()
    if (status === task.status) { setOpen(false); return }
    setOpen(false)
    setLoading(true)
    await onUpdate(task.id, status)
    setLoading(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap cursor-pointer transition-all duration-150 hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontFamily: "'Archivo', sans-serif", background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {loading ? (
          <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
        )}
        {cfg.label}
        {!loading && (
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-60">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-[999] bg-white border rounded-[10px] py-1.5 min-w-[148px]"
          style={{ top: dropPos.top, left: dropPos.left, borderColor: C.border, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          role="listbox"
        >
          {STATUS_ORDER.map((s) => {
            const c = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                role="option"
                aria-selected={s === task.status}
                onClick={(e) => handleSelect(e, s)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] cursor-pointer transition-colors duration-100 hover:bg-[#F8F8F7] text-left"
                style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary, background: s === task.status ? "#F8F8F7" : undefined }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} />
                {c.label}
                {s === task.status && (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 ml-auto" style={{ color: C.primary }}>
                    <path fillRule="evenodd" d="M13.707 4.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L6 10.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// ─── Table view ───────────────────────────────────────────────────────────────

function TaskTableSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border overflow-hidden" style={{ borderColor: C.border }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#FAFAF9" }}>
            {["Task", "Status", "Priority", "Category", "Due Date", "Updated"].map((h) => (
              <th key={h} className="text-left px-4 py-3">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <tr key={i} style={{ borderBottom: `1px solid #F5F5F4` }}>
              <td className="px-4 py-3.5"><div className="flex flex-col gap-1.5"><Skeleton className="h-3.5 w-48" /><Skeleton className="h-2.5 w-32" /></div></td>
              <td className="px-4 py-3.5"><Skeleton className="h-6 w-24 rounded-full" /></td>
              <td className="px-4 py-3.5"><Skeleton className="h-5 w-14 rounded-[4px]" /></td>
              <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-[4px]" /></td>
              <td className="px-4 py-3.5"><Skeleton className="h-3 w-16" /></td>
              <td className="px-4 py-3.5"><Skeleton className="h-3 w-12" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TaskTable({
  tasks,
  onRowClick,
  onStatusUpdate,
}: {
  tasks: Task[]
  onRowClick: (task: Task) => void
  onStatusUpdate: (id: string, status: TaskStatus) => Promise<void>
}) {
  const headers = ["Task", "Status", "Priority", "Category", "Due Date", "Updated"]

  return (
    <div className="bg-white rounded-[12px] border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#FAFAF9" }}>
              {headers.map((h) => (
                <th
                  key={h}
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
              const dueSoon = !overdue && isDueSoon(task.dueDate, task.status)
              return (
                <tr
                  key={task.id}
                  onClick={() => onRowClick(task)}
                  className="cursor-pointer group transition-colors duration-150"
                  style={{
                    borderBottom: idx < tasks.length - 1 ? `1px solid #F5F5F4` : undefined,
                    background: "white",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAF9" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white" }}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onRowClick(task)}
                  aria-label={`Open task: ${task.title}`}
                >
                  {/* Task title + description */}
                  <td className="px-4 py-3.5 max-w-[280px]">
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
                  {/* Status */}
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <StatusControl task={task} onUpdate={onStatusUpdate} />
                  </td>
                  {/* Priority */}
                  <td className="px-4 py-3.5">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <CategoryTag category={task.categoryName} />
                  </td>
                  {/* Due date */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className="text-[12px]"
                      style={{ fontFamily: "'Jost', sans-serif", color: overdue ? C.error : dueSoon ? C.warning : C.textSecondary, fontWeight: overdue || dueSoon ? 600 : 400 }}
                    >
                      {(overdue || dueSoon) && (
                        <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 inline mr-1 mb-0.5">
                          <path fillRule="evenodd" d="M6 1a5 5 0 100 10A5 5 0 006 1zM5.5 3.5a.5.5 0 011 0v3a.5.5 0 01-1 0v-3zm.5 5a.5.5 0 100-1 .5.5 0 000 1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {overdue ? "Overdue" : dueSoon ? "Due soon" : "Due"} · {formatDate(task.dueDate)}
                    </span>
                  </td>
                  {/* Updated */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
                      {formatRelative(task.updatedAt)}
                    </span>
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

function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border p-5 flex flex-col gap-3" style={{ borderColor: C.border }}>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-14 rounded-[4px]" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onClick,
  onStatusUpdate,
}: {
  task: Task
  onClick: (task: Task) => void
  onStatusUpdate: (id: string, status: TaskStatus) => Promise<void>
}) {
  const overdue = isOverdue(task.dueDate, task.status)
  const dueSoon = !overdue && isDueSoon(task.dueDate, task.status)
  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white rounded-[12px] border p-5 flex flex-col gap-3 cursor-pointer transition-shadow transition-colors duration-[180ms] group"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor = C.borderStrong }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = C.border }}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(task)}
      aria-label={`Open task: ${task.title}`}
    >
      {/* Top row: priority + due date */}
      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <span
          className="text-[11px]"
          style={{ fontFamily: "'Jost', sans-serif", color: overdue ? C.error : dueSoon ? C.warning : C.textMuted, fontWeight: overdue || dueSoon ? 600 : 400 }}
        >
          {overdue && "⚠ Overdue "}
          {dueSoon && "⚠ Due soon "}
          {!overdue && !dueSoon && "Due "}
          {formatDate(task.dueDate)}
        </span>
      </div>

      {/* Title */}
      <p
        className="text-[13px] font-semibold leading-snug group-hover:text-[#7F40E4] transition-colors duration-150"
        style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
      >
        {task.title}
      </p>

      {/* Category */}
      <div>
        <CategoryTag category={task.categoryName} />
      </div>

      {/* Bottom row: updated + status */}
      <div className="flex items-center justify-between pt-1 mt-auto border-t" style={{ borderColor: "#F5F5F4" }}>
        <span className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
          {formatRelative(task.updatedAt)}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <StatusControl task={task} onUpdate={onStatusUpdate} />
        </div>
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

function FilterCheckbox({
  checked,
  onChange,
  label,
  color,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  color?: string
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
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
        className="text-[13px] flex items-center gap-1.5 group-hover:text-[#111] transition-colors duration-100"
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

function FilterModal({
  open,
  pending,
  categories,
  onChangePending,
  onApply,
  onClear,
  onClose,
}: {
  open: boolean
  pending: TaskFilterState
  categories: CategoryDto[]
  onChangePending: (f: TaskFilterState) => void
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
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-[440px] bg-white rounded-[16px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <h2 className="text-[15px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
            Filters
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5]" aria-label="Close filters">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Status */}
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

          {/* Priority */}
          <FilterSection title="Priority">
            {(["High", "Medium", "Low"] as const).map((p) => (
              <FilterCheckbox
                key={p}
                checked={pending.priority.includes(p)}
                onChange={() => onChangePending({ ...pending, priority: toggleArr(pending.priority, p) as TaskFilterState["priority"] })}
                label={p}
                color={p === "High" ? C.error : p === "Medium" ? C.warning : C.textMuted}
              />
            ))}
          </FilterSection>

          <div className="h-px" style={{ background: C.border }} />

          {/* Category */}
          <FilterSection title="Category">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <FilterCheckbox
                  key={cat.id}
                  checked={pending.category.includes(cat.name)}
                  onChange={() => onChangePending({ ...pending, category: toggleArr(pending.category, cat.name) })}
                  label={cat.name}
                />
              ))}
            </div>
          </FilterSection>

          <div className="h-px" style={{ background: C.border }} />

          {/* Due date */}
          <FilterSection title="Due Date">
            {([
              { value: "any",      label: "Any time" },
              { value: "due-soon", label: "Due within 3 days" },
            ] as { value: TaskFilterState["dueDatePreset"]; label: string }[]).map((opt) => (
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

        {/* Footer */}
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

function FilterChips({
  applied,
  onRemoveStatus,
  onRemovePriority,
  onRemoveCategory,
  onRemoveDueDate,
  onClearAll,
}: {
  applied: TaskFilterState
  onRemoveStatus: (s: TaskStatus) => void
  onRemovePriority: (p: string) => void
  onRemoveCategory: (c: string) => void
  onRemoveDueDate: () => void
  onClearAll: () => void
}) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [
    ...applied.status.map((s) => ({ key: `s-${s}`, label: `Status: ${STATUS_CONFIG[s].label}`, onRemove: () => onRemoveStatus(s) })),
    ...applied.priority.map((p) => ({ key: `p-${p}`, label: `Priority: ${p}`, onRemove: () => onRemovePriority(p) })),
    ...applied.category.map((c) => ({ key: `c-${c}`, label: `Category: ${c}`, onRemove: () => onRemoveCategory(c) })),
    ...(applied.dueDatePreset !== "any" ? [{ key: "dd", label: "Due within 3 days", onRemove: onRemoveDueDate }] : []),
  ]

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <div
          key={chip.key}
          className="inline-flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full border text-[12px]"
          style={{ fontFamily: "'Jost', sans-serif", borderColor: C.border, color: C.textSecondary, background: "white" }}
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="w-4 h-4 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-100 hover:bg-[#F0F0EF]"
            aria-label={`Remove filter: ${chip.label}`}
          >
            <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M3.293 3.293a1 1 0 011.414 0L6 4.586l1.293-1.293a1 1 0 111.414 1.414L7.414 6l1.293 1.293a1 1 0 01-1.414 1.414L6 7.414 4.707 8.707a1 1 0 01-1.414-1.414L4.586 6 3.293 4.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
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

// ─── Task detail modal ────────────────────────────────────────────────────────

function TaskDetailModal({
  task,
  onClose,
  onStatusUpdate,
}: {
  task: Task | null
  onClose: () => void
  onStatusUpdate: (id: string, status: TaskStatus) => Promise<void>
}) {
  useEffect(() => {
    if (!task) return
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [task, onClose])

  if (!task) return null

  const overdue = isOverdue(task.dueDate, task.status)
  const dueSoon = !overdue && isDueSoon(task.dueDate, task.status)

  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-label={task.title}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.32)" }} onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-[520px] bg-white rounded-[16px] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.20)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b" style={{ borderColor: C.border }}>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.07em" }}>
              Task Detail
            </p>
            <h2 className="text-[16px] font-bold leading-snug" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[7px] cursor-pointer transition-colors duration-150 hover:bg-[#F5F5F5] shrink-0 mt-0.5"
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: C.textMuted }}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <CategoryTag category={task.categoryName} />
          </div>

          {/* Description */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.07em" }}>
              Description
            </p>
            <p
              className="text-[14px] leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: "'Jost', sans-serif", color: task.description ? C.textSecondary : C.textMuted, fontStyle: task.description ? "normal" : "italic" }}
            >
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.07em" }}>
                Due Date
              </p>
              <p
                className="text-[13px] font-medium flex items-center gap-1"
                style={{ fontFamily: "'Jost', sans-serif", color: overdue ? C.error : dueSoon ? C.warning : C.textSecondary }}
              >
                {(overdue || dueSoon) && (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 shrink-0" style={{ color: overdue ? C.error : C.warning }}>
                    <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zM7.25 4.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                  </svg>
                )}
                {overdue ? "Overdue · " : dueSoon ? "Due Soon · " : ""}{new Date(task.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.07em" }}>
                Last Updated
              </p>
              <p className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                {formatRelative(task.updatedAt)}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.07em" }}>
                Category
              </p>
              <p className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                {task.categoryName}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.07em" }}>
                Priority
              </p>
              <p className="text-[13px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                {task.priority}
              </p>
            </div>
          </div>
        </div>

        {/* Footer — status control */}
        <div className="flex items-center justify-between px-6 py-4 border-t gap-3" style={{ borderColor: C.border, background: "#FAFAF9" }}>
          <p className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
            Update status:
          </p>
          <StatusControl task={task} onUpdate={onStatusUpdate} />
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ type, onClear }: { type: "no-tasks" | "no-results" | "no-filter-results"; onClear?: () => void }) {
  const config = {
    "no-tasks":          { heading: "No tasks assigned",              body: "You don't currently have any tasks assigned to you." },
    "no-results":        { heading: "No matching tasks",              body: "Try adjusting your search or clearing your filters." },
    "no-filter-results": { heading: "No tasks match these filters",   body: "Try removing one or more filters." },
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
      <p className="text-[13px] max-w-xs" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>{config.body}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="mt-5 h-9 px-4 rounded-[8px] text-[13px] font-medium border cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5]"
          style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary, borderColor: C.border }}
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

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
        Something went wrong while retrieving your tasks.
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

// ─── Tasks Page ───────────────────────────────────────────────────────────────

interface OutletCtx { addToast: (type: ToastType, message: string) => void }

export default function TasksPage() {
  const { addToast } = useOutletContext<OutletCtx>()
  // View & search
  const [view, setView] = useState<"list" | "cards">("list")
  const [searchInput, setSearchInput] = useState("")
  const [keyword, setKeyword] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filters
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [pendingFilters, setPendingFilters] = useState<TaskFilterState>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<TaskFilterState>(DEFAULT_FILTERS)
  const activeFilterCount = countActiveFilters(appliedFilters)

  // Pagination
  const [page, setPage] = useState(1)

  // Detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Data
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch {
        // Keep filters usable even if category lookup fails.
      }
    }

    loadCategories()
  }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Fetch when keyword/filters/page change
  const load = useCallback(
    async (isPageChange = false) => {
      if (isPageChange) setPageLoading(true)
      else { setLoading(true); setError(false) }
      try {
        const res = await getTasks({ keyword, filters: appliedFilters, page, pageSize: PAGE_SIZE })
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

  // Status update
  async function handleStatusUpdate(id: string, status: TaskStatus) {
    try {
      const updated = await updateTaskStatus(id, status)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setSelectedTask((prev) => (prev?.id === id ? updated : prev))
      addToast("success", "Task status updated successfully.")
    } catch {
      addToast("error", "Unable to update task status.")
    }
  }

  // Filter actions
  function handleApplyFilters() {
    setAppliedFilters(pendingFilters)
    setPage(1)
    setFilterModalOpen(false)
  }
  function handleClearFilters() {
    setPendingFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
    setFilterModalOpen(false)
  }
  function handleOpenFilterModal() {
    setPendingFilters(appliedFilters)
    setFilterModalOpen(true)
  }

  // Chip removal helpers
  function removeStatus(s: TaskStatus) {
    const f = { ...appliedFilters, status: appliedFilters.status.filter((x) => x !== s) }
    setAppliedFilters(f); setPendingFilters(f); setPage(1)
  }
  function removePriority(p: string) {
    const f = { ...appliedFilters, priority: appliedFilters.priority.filter((x) => x !== p) }
    setAppliedFilters(f); setPendingFilters(f); setPage(1)
  }
  function removeCategory(c: string) {
    const f = { ...appliedFilters, category: appliedFilters.category.filter((x) => x !== c) }
    setAppliedFilters(f); setPendingFilters(f); setPage(1)
  }
  function removeDueDate() {
    const f = { ...appliedFilters, dueDatePreset: "any" as const }
    setAppliedFilters(f); setPendingFilters(f); setPage(1)
  }

  function handlePageChange(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const hasSearch   = keyword.trim().length > 0
  const hasFilters  = activeFilterCount > 0
  const emptyType   = hasSearch || hasFilters ? (hasFilters && !hasSearch ? "no-filter-results" : "no-results") : "no-tasks"

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
      <div className="max-w-[1100px] mx-auto px-6 py-8 flex flex-col gap-6">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
              Tasks
            </h1>
            <p className="mt-1 text-[14px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
              View and manage the status of your assigned tasks.
            </p>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: C.textMuted }}>
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M13 13l3.5 3.5" />
              </svg>
              <input
                ref={searchInputRef}
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tasks…"
                className="h-9 pl-9 pr-8 rounded-[8px] border text-[13px] outline-none transition-all duration-150"
                style={{ fontFamily: "'Jost', sans-serif", borderColor: C.border, color: C.text, width: 200, background: "white" }}
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

            {/* Filters button */}
            <button
              onClick={handleOpenFilterModal}
              className="h-9 px-3.5 rounded-[8px] border flex items-center gap-2 text-[13px] font-medium cursor-pointer transition-all duration-150 hover:bg-[#F5F5F5]"
              style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary, borderColor: activeFilterCount > 0 ? C.primary : C.border, background: activeFilterCount > 0 ? C.primaryLight : "white" }}
              aria-label={`Filters${activeFilterCount ? ` (${activeFilterCount} active)` : ""}`}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 5h14M6 10h8M9 15h2" />
              </svg>
              <span style={{ color: activeFilterCount > 0 ? C.primary : C.textSecondary }}>Filters</span>
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
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {activeFilterCount > 0 && (
          <FilterChips
            applied={appliedFilters}
            onRemoveStatus={removeStatus}
            onRemovePriority={removePriority}
            onRemoveCategory={removeCategory}
            onRemoveDueDate={removeDueDate}
            onClearAll={handleClearFilters}
          />
        )}

        {/* ── Content area ── */}
        <div className="flex flex-col gap-4">
          {loading ? (
            view === "list" ? (
              <TaskTableSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <TaskCardSkeleton key={i} />)}
              </div>
            )
          ) : error ? (
            <ErrorState onRetry={() => load(false)} />
          ) : tasks.length === 0 ? (
            <EmptyState type={emptyType} onClear={hasFilters || hasSearch ? handleClearFilters : undefined} />
          ) : pageLoading ? (
            view === "list" ? <TaskTableSkeleton /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <TaskCardSkeleton key={i} />)}
              </div>
            )
          ) : view === "list" ? (
            <TaskTable tasks={tasks} onRowClick={setSelectedTask} onStatusUpdate={handleStatusUpdate} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={setSelectedTask} onStatusUpdate={handleStatusUpdate} />
              ))}
            </div>
          )}

          {/* Pagination (hidden while loading) */}
          {!loading && !error && totalCount > 0 && (
            <Pagination page={page} totalCount={totalCount} pageSize={PAGE_SIZE} onChange={handlePageChange} />
          )}
        </div>
      </div>

      {/* Filter modal */}
      <FilterModal
        open={filterModalOpen}
        pending={pendingFilters}
        categories={categories}
        onChangePending={setPendingFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClose={() => setFilterModalOpen(false)}
      />

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}
