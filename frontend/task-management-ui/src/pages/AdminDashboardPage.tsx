import { useState, useEffect } from "react"
import type { AdminDashboardDto, TaskPriority, TaskStatus } from "@/types"
import { getAdminDashboard } from "@/services/dashboardService"

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  primary: "#7F40E4",
  primaryLight: "#F0EDF9",
  secondary: "#FFC000",
  secondaryLight: "#FFF9E6",
  success: "#1a7f4b",
  successLight: "#F0FAF4",
  error: "#C0392B",
  errorLight: "#FDF2F2",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  text: "#111111",
  textSecondary: "#5F5F5F",
  textMuted: "#8A8A8A",
  border: "#E5E5E5",
  surface: "#FFFFFF",
  bg: "#F8F8F7",
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[6px] animate-pulse ${className}`}
      style={{ background: "linear-gradient(90deg, #F0F0EF 25%, #E8E8E7 50%, #F0F0EF 75%)", backgroundSize: "200% 100%" }}
    />
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconUsers() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
      <circle cx="7.5" cy="6" r="3" />
      <path d="M1 18v-1.5a4.5 4.5 0 019 0V18" />
      <path d="M13 9a3 3 0 100-6" />
      <path d="M19 18v-1.5a4.5 4.5 0 00-3-4.24" />
    </svg>
  )
}

function IconActiveUsers() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
      <circle cx="10" cy="7" r="3.5" />
      <path d="M3 18c0-3.5 3.1-6 7-6s7 2.5 7 6" />
      <circle cx="16" cy="5" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconTotal() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
      <rect x="2" y="2" width="7" height="7" rx="1.2" />
      <rect x="11" y="2" width="7" height="7" rx="1.2" />
      <rect x="2" y="11" width="7" height="7" rx="1.2" />
      <rect x="11" y="11" width="7" height="7" rx="1.2" />
    </svg>
  )
}

function IconPercent() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="14" cy="14" r="2.5" />
      <path d="M17 3L3 17" />
    </svg>
  )
}

function IconPending() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l2.5 2.5" />
    </svg>
  )
}

function IconInProgress() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10 3a7 7 0 017 7" />
      <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" strokeDasharray="22 22" strokeDashoffset="11" />
    </svg>
  )
}

function IconCompleted() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="10" cy="10" r="8" />
      <path d="M6.5 10l2.5 2.5 4.5-4.5" />
    </svg>
  )
}

function IconOverdue() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10 2L2 17h16L10 2z" />
      <path d="M10 8v4M10 14.5v.5" />
    </svg>
  )
}

function IconDueSoon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M7 2v3M13 2v3M3 9h14" />
      <path d="M7 13h3M7 13l2-2" />
    </svg>
  )
}

function IconHighPriority() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10 3v8M10 14.5v1" strokeWidth="2.2" />
    </svg>
  )
}

// ─── System metric card (top 4) ───────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  accentColor: string
  iconBg: string
  accentBg: string
}

function MetricCard({ label, value, icon, accentColor, iconBg, accentBg }: MetricCardProps) {
  return (
    <div
      className="bg-white rounded-[12px] border p-5 flex flex-col gap-3 cursor-default transition-shadow transition-colors duration-[180ms]"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = accentColor + "40" }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = C.border }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>
          {label}
        </span>
        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: iconBg, color: accentColor }}>
          {icon}
        </div>
      </div>
      <div>
        <span className="text-[36px] font-bold leading-none" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
          {value}
        </span>
      </div>
      <div className="h-[3px] rounded-full" style={{ background: accentBg }}>
        <div className="h-full w-full rounded-full" style={{ background: accentColor }} />
      </div>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border p-5 flex flex-col gap-3" style={{ borderColor: C.border }}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="w-7 h-7 rounded-[7px]" />
      </div>
      <Skeleton className="h-9 w-16" />
      <Skeleton className="h-[3px] w-full" />
    </div>
  )
}

// ─── Compact task status card (second row of 6) ────────────────────────────────

interface CompactCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accentColor: string
  accentBg: string
  description: string
}

function CompactCard({ label, value, icon, accentColor, accentBg, description }: CompactCardProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="bg-white rounded-[12px] border px-4 py-3.5 flex items-center gap-3.5 cursor-default transition-shadow transition-colors duration-[180ms]"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { setHovered(true); e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; e.currentTarget.style.borderColor = accentColor + "55" }}
      onMouseLeave={(e) => { setHovered(false); e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = C.border }}
    >
      <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: accentBg, color: accentColor }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em", overflow: hovered ? "visible" : "hidden", textOverflow: hovered ? "unset" : "ellipsis", whiteSpace: hovered ? "normal" : "nowrap" }}
        >
          {label}
        </p>
        <p
          className="text-[11px] mt-0.5"
          style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted, overflow: hovered ? "visible" : "hidden", textOverflow: hovered ? "unset" : "ellipsis", whiteSpace: hovered ? "normal" : "nowrap" }}
        >
          {description}
        </p>
      </div>
      <span
        className="text-[26px] font-bold shrink-0 leading-none"
        style={{ fontFamily: "'Archivo', sans-serif", color: value > 0 ? accentColor : C.textMuted }}
      >
        {value}
      </span>
    </div>
  )
}

function CompactCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border px-4 py-3.5 flex items-center gap-3.5" style={{ borderColor: C.border }}>
      <Skeleton className="w-9 h-9 rounded-[9px] shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-2 w-24" />
      </div>
      <Skeleton className="h-7 w-7 shrink-0" />
    </div>
  )
}

// ─── Completion rate card ─────────────────────────────────────────────────────

function CompletionRateCard({ rate, total }: { rate: number; total: number }) {
  const pct = Math.round(rate)
  const isEmpty = total === 0
  return (
    <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-5 h-full" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>
        Completion Rate
      </p>
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <p className="text-[13px] font-medium" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>No tasks yet</p>
          <p className="text-[12px] mt-1" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>Completion rate will appear once tasks exist.</p>
        </div>
      ) : (
        <>
          <div className="flex items-end gap-3">
            <span className="text-[52px] font-bold leading-none" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>{pct}</span>
            <span className="text-[20px] font-semibold pb-1" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted }}>%</span>
          </div>
          <div>
            <p className="text-[13px] mb-3" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>System-wide task completion rate</p>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F0F0EF" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 75 ? C.success : pct >= 40 ? C.primary : C.secondary }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>0%</span>
              <span className="text-[11px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>100%</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Status distribution chart ────────────────────────────────────────────────

interface BarSegment { label: string; value: number; color: string }

function SegmentedBar({ segments }: { segments: BarSegment[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return null
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden flex gap-[2px]">
      {segments.map((seg) => {
        const pct = (seg.value / total) * 100
        if (pct === 0) return null
        return (
          <div
            key={seg.label}
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: seg.color, minWidth: "6px" }}
            title={`${seg.label}: ${seg.value} (${Math.round(pct)}%)`}
          />
        )
      })}
    </div>
  )
}

function TaskStatusChart({ data }: { data: AdminDashboardDto["taskByStatus"] }) {
  const statusCounts: Record<TaskStatus, number> = {
    Pending: 0,
    InProgress: 0,
    Completed: 0,
  }

  for (const item of data) {
    statusCounts[item.status] = item.count
  }

  const total = statusCounts.Pending + statusCounts.InProgress + statusCounts.Completed
  const isEmpty = total === 0
  const segments: BarSegment[] = [
    { label: "Pending", value: statusCounts.Pending, color: C.secondary },
    { label: "In Progress", value: statusCounts.InProgress, color: C.primary },
    { label: "Completed", value: statusCounts.Completed, color: C.success },
  ]
  return (
    <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-5 h-full" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>
          Status Distribution
        </p>
        {!isEmpty && (
          <p className="text-[12px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>{total} total tasks system-wide</p>
        )}
      </div>
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <p className="text-[13px] font-medium" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>No tasks yet</p>
          <p className="text-[12px] mt-1" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>Distribution will appear here.</p>
        </div>
      ) : (
        <>
          <SegmentedBar segments={segments} />
          <div className="flex flex-col gap-3 mt-1">
            {segments.map((seg) => {
              const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0
              return (
                <div key={seg.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                  <span className="text-[13px] flex-1" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>{seg.label}</span>
                  <span className="text-[13px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>{seg.value}</span>
                  <span className="text-[12px] w-9 text-right" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Priority distribution chart ──────────────────────────────────────────────

function PriorityRow({ label, value, total, color, bg }: { label: string; value: number; total: number; color: string; bg: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-4">
      <span className="text-[13px] font-medium w-14 shrink-0" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>{label}</span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "#F0F0EF" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex items-center gap-2 shrink-0 w-16 justify-end">
        <span className="text-[13px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>{value}</span>
        <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] font-medium" style={{ fontFamily: "'Jost', sans-serif", background: bg, color }}>{pct}%</span>
      </div>
    </div>
  )
}

function TaskPriorityChart({ data }: { data: AdminDashboardDto["taskByPriority"] }) {
  const priorityCounts: Record<TaskPriority, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
  }

  for (const item of data) {
    priorityCounts[item.priority] = item.count
  }

  const total = priorityCounts.Low + priorityCounts.Medium + priorityCounts.High
  const isEmpty = total === 0
  return (
    <div className="bg-white rounded-[12px] border p-6" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="mb-5">
        <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>Priority Distribution</p>
        {!isEmpty && <p className="text-[12px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>System-wide breakdown by priority level</p>}
      </div>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center py-6">
          <p className="text-[13px] font-medium" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>No tasks yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <PriorityRow label="High" value={priorityCounts.High} total={total} color={C.error} bg={C.errorLight} />
          <PriorityRow label="Medium" value={priorityCounts.Medium} total={total} color={C.warning} bg={C.warningLight} />
          <PriorityRow label="Low" value={priorityCounts.Low} total={total} color={C.textMuted} bg="#F5F5F5" />
        </div>
      )}
    </div>
  )
}

// ─── Assignee workload chart ──────────────────────────────────────────────────

function AssigneeWorkloadChart({ data }: { data: AdminDashboardDto["taskByAssignee"] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-[12px] border p-6 flex flex-col items-center justify-center text-center py-10" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p className="text-[13px] font-medium mb-1" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>No assigned tasks</p>
        <p className="text-[12px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>Workload distribution will appear once tasks are assigned.</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.taskCount - a.taskCount)
  const max = sorted[0].taskCount

  return (
    <div className="bg-white rounded-[12px] border p-6" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="mb-5">
        <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>
          Tasks by Assignee
        </p>
        <p className="text-[12px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
          Workload distribution across {data.length} team member{data.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map(({ userName, taskCount }) => {
          const pct = max > 0 ? (taskCount / max) * 100 : 0
          const isTop = taskCount === max
          return (
            <div key={userName} className="flex items-center gap-3">
              <span
                className="text-[13px] w-28 shrink-0 truncate"
                style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}
                title={userName}
              >
                {userName}
              </span>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "#F0F0EF" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: isTop ? C.primary : `${C.primary}80` }}
                />
              </div>
              <span
                className="text-[13px] font-semibold w-5 text-right shrink-0"
                style={{ fontFamily: "'Archivo', sans-serif", color: isTop ? C.primary : C.text }}
              >
                {taskCount}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Skeleton layout ──────────────────────────────────────────────────────────

function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <MetricCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => <CompactCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-5" style={{ borderColor: C.border }}>
          <Skeleton className="h-3 w-28" /><Skeleton className="h-12 w-24" />
          <div className="flex flex-col gap-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-full rounded-full" /></div>
        </div>
        <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-5" style={{ borderColor: C.border }}>
          <Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-full rounded-full" />
          <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3"><Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" /><Skeleton className="h-3 flex-1" /><Skeleton className="h-3 w-8" /></div>
          ))}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-4" style={{ borderColor: C.border }}>
          <Skeleton className="h-3 w-36 mb-1" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4"><Skeleton className="h-3 w-14 shrink-0" /><Skeleton className="flex-1 h-2.5 rounded-full" /><Skeleton className="h-3 w-16 shrink-0" /></div>
          ))}
        </div>
        <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-3" style={{ borderColor: C.border }}>
          <Skeleton className="h-3 w-32 mb-2" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3"><Skeleton className="h-3 w-28 shrink-0" /><Skeleton className="flex-1 h-2.5 rounded-full" /><Skeleton className="h-3 w-5 shrink-0" /></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function AdminDashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.errorLight }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 2L2 19h20L12 2z" />
          <path d="M12 9v5M12 16.5v.5" strokeWidth="2" />
        </svg>
      </div>
      <h2 className="text-[18px] font-semibold mb-2" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>Unable to load dashboard</h2>
      <p className="text-[14px] mb-6 max-w-xs" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
        Something went wrong while retrieving system metrics. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition-all duration-[180ms]"
        style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#6b32cc"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(127,64,228,0.3)" }}
        onMouseLeave={(e) => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "" }}
      >
        Retry
      </button>
    </div>
  )
}

// ─── Admin Dashboard Page ─────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const result = await getAdminDashboard()
      setData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
      <div className="max-w-[1100px] mx-auto px-6 py-8">

        {loading ? (
          <AdminDashboardSkeleton />
        ) : error ? (
          <AdminDashboardError onRetry={load} />
        ) : data ? (
          <div className="flex flex-col gap-6">

            {/* Page header */}
            <div>
              <h1 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
                Admin Dashboard
              </h1>
              <p className="mt-1 text-[14px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                System-wide overview of users, tasks, and workload.
              </p>
            </div>

            {/* Row 1 — 4 system metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Users"
                value={data.totalUsers}
                icon={<IconUsers />}
                accentColor={C.primary}
                iconBg={C.primaryLight}
                accentBg="#E8DEF8"
              />
              <MetricCard
                label="Active Assignees"
                value={data.activeAssignees}
                icon={<IconActiveUsers />}
                accentColor="#6b32cc"
                iconBg="#EDE4FC"
                accentBg="#DDD0F8"
              />
              <MetricCard
                label="Total Tasks"
                value={data.totalTasks}
                icon={<IconTotal />}
                accentColor={C.textSecondary}
                iconBg="#F5F5F5"
                accentBg="#EBEBEB"
              />
              <MetricCard
                label="Completion Rate"
                value={`${Math.round(data.completionRate)}%`}
                icon={<IconPercent />}
                accentColor={C.success}
                iconBg={C.successLight}
                accentBg="#C6E8D6"
              />
            </div>

            {/* Row 2 — 6 compact task status cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              <CompactCard
                label="Pending"
                value={data.pendingTasks}
                icon={<IconPending />}
                accentColor="#92400e"
                accentBg={C.secondaryLight}
                description="Awaiting start"
              />
              <CompactCard
                label="In Progress"
                value={data.inProgressTasks}
                icon={<IconInProgress />}
                accentColor={C.primary}
                accentBg={C.primaryLight}
                description="Currently active"
              />
              <CompactCard
                label="Completed"
                value={data.completedTasks}
                icon={<IconCompleted />}
                accentColor={C.success}
                accentBg={C.successLight}
                description="Finished tasks"
              />
              <CompactCard
                label="Overdue"
                value={data.overdueTasks}
                icon={<IconOverdue />}
                accentColor={C.error}
                accentBg={C.errorLight}
                description="Past due date"
              />
              <CompactCard
                label="Due Soon"
                value={data.dueSoonTasks}
                icon={<IconDueSoon />}
                accentColor="#92400e"
                accentBg={C.secondaryLight}
                description="Within 3 days"
              />
              <CompactCard
                label="High Priority"
                value={data.highPriorityTasks}
                icon={<IconHighPriority />}
                accentColor="#7c3aed"
                accentBg="#F5EEFF"
                description="Flagged critical"
              />
            </div>

            {/* Row 3 — Completion rate + Status distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CompletionRateCard rate={data.completionRate} total={data.totalTasks} />
              <TaskStatusChart data={data.taskByStatus} />
            </div>

            {/* Row 4 — Priority distribution + Assignee workload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TaskPriorityChart data={data.taskByPriority} />
              <AssigneeWorkloadChart data={data.taskByAssignee} />
            </div>

          </div>
        ) : null}
      </div>
    </div>
  )
}
