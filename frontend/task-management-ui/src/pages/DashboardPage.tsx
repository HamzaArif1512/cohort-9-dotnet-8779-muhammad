import { useState, useEffect } from "react"
import type { UserDashboardDto } from "@/types"
import { getUserDashboard } from "@/services/dashboardService"

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

// ─── Stat card icons ──────────────────────────────────────────────────────────

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

function IconPending() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l2.5 2.5" />
    </svg>
  )
}

function IconInProgress() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
      <path d="M10 3a7 7 0 110 14A7 7 0 0110 3z" strokeDasharray="22 22" strokeDashoffset="11" />
      <path d="M10 3a7 7 0 017 7" />
    </svg>
  )
}

function IconCompleted() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
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
      <path d="M10 3v8M10 14.5v1" strokeWidth="2" />
    </svg>
  )
}

// ─── Skeleton block ───────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[6px] animate-pulse ${className}`}
      style={{ background: "linear-gradient(90deg, #F0F0EF 25%, #E8E8E7 50%, #F0F0EF 75%)", backgroundSize: "200% 100%" }}
    />
  )
}

// ─── Task Summary Card ────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accentColor: string
  accentBg: string
  iconBg: string
}

function TaskSummaryCard({ label, value, icon, accentColor, accentBg, iconBg }: SummaryCardProps) {
  return (
    <div
      className="bg-white rounded-[12px] border p-5 flex flex-col gap-3 cursor-default transition-all duration-[180ms] hover:-translate-y-0.5"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"); e.currentTarget.style.borderColor = accentColor + "40" }}
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
        <div className="h-full rounded-full transition-all duration-700" style={{ background: accentColor, width: value > 0 ? "100%" : "0%" }} />
      </div>
    </div>
  )
}

function TaskSummaryCardSkeleton() {
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

// ─── Attention Metric Card ────────────────────────────────────────────────────

interface AttentionCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accentColor: string
  accentBg: string
  description: string
}

function AttentionMetricCard({ label, value, icon, accentColor, accentBg, description }: AttentionCardProps) {
  return (
    <div
      className="bg-white rounded-[12px] border px-5 py-4 flex items-center gap-4 cursor-default transition-all duration-[180ms] hover:-translate-y-0.5"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = accentColor + "40" }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = C.border }}
    >
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: accentBg, color: accentColor }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-wide truncate" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>{label}</p>
        <p className="text-[11px] mt-0.5 truncate" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>{description}</p>
      </div>
      <span
        className="text-[28px] font-bold shrink-0"
        style={{ fontFamily: "'Archivo', sans-serif", color: value > 0 ? accentColor : C.textMuted }}
      >
        {value}
      </span>
    </div>
  )
}

function AttentionCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border px-5 py-4 flex items-center gap-4" style={{ borderColor: C.border }}>
      <Skeleton className="w-10 h-10 rounded-[10px] shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      <Skeleton className="h-8 w-8 shrink-0" />
    </div>
  )
}

// ─── Completion Rate Card ─────────────────────────────────────────────────────

function CompletionRateCard({ rate, total }: { rate: number; total: number }) {
  const pct = Math.round(rate)
  const isEmpty = total === 0

  return (
    <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-5 h-full" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>
          Completion Rate
        </p>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: C.primaryLight }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.6" strokeLinecap="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <p className="text-[13px] font-medium" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>No tasks yet</p>
          <p className="text-[12px] mt-1" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>Completion rate appears once you have tasks.</p>
        </div>
      ) : (
        <>
          <div className="flex items-end gap-3">
            <span className="text-[52px] font-bold leading-none" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
              {pct}
            </span>
            <span className="text-[20px] font-semibold pb-1" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted }}>%</span>
          </div>

          <div>
            <p className="text-[13px] mb-3" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
              Task completion rate
            </p>
            {/* Progress bar */}
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F0F0EF" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: pct >= 75
                    ? C.success
                    : pct >= 40
                    ? C.primary
                    : C.secondary,
                }}
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

function CompletionRateCardSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-5" style={{ borderColor: C.border }}>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-12 w-24" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>
    </div>
  )
}

// ─── Segmented Bar (shared) ───────────────────────────────────────────────────

interface BarSegment {
  label: string
  value: number
  color: string
}

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
            style={{ width: `${pct}%`, background: seg.color, minWidth: pct > 0 ? "6px" : 0 }}
            title={`${seg.label}: ${seg.value} (${Math.round(pct)}%)`}
          />
        )
      })}
    </div>
  )
}

// ─── Task Status Chart ────────────────────────────────────────────────────────

function TaskStatusChart({ data }: { data: UserDashboardDto["TaskByStatus"] }) {
  const total = data.Pending + data.InProgress + data.Completed
  const isEmpty = total === 0

  const segments: BarSegment[] = [
    { label: "Pending", value: data.Pending, color: C.secondary },
    { label: "In Progress", value: data.InProgress, color: C.primary },
    { label: "Completed", value: data.Completed, color: C.success },
  ]

  return (
    <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-5 h-full" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>
          Status Distribution
        </p>
        {!isEmpty && (
          <p className="text-[12px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
            {total} total tasks
          </p>
        )}
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#F5F5F5" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.6" strokeLinecap="round" className="w-5 h-5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <p className="text-[13px] font-medium" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>No tasks yet</p>
          <p className="text-[12px] mt-1" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>Distribution will appear here.</p>
        </div>
      ) : (
        <>
          {/* Stacked bar */}
          <SegmentedBar segments={segments} />

          {/* Legend + breakdown */}
          <div className="flex flex-col gap-3 mt-1">
            {segments.map((seg) => {
              const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0
              return (
                <div key={seg.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                  <span className="text-[13px] flex-1" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                    {seg.label}
                  </span>
                  <span className="text-[13px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
                    {seg.value}
                  </span>
                  <span className="text-[12px] w-9 text-right" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function StatusChartSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border p-6 flex flex-col gap-5" style={{ borderColor: C.border }}>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-2.5 w-full rounded-full" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Task Priority Chart ──────────────────────────────────────────────────────

function PriorityBar({
  label, value, total, color, bg,
}: { label: string; value: number; total: number; color: string; bg: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-4">
      <span
        className="text-[13px] font-medium w-14 shrink-0"
        style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}
      >
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "#F0F0EF" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex items-center gap-2 shrink-0 w-16 justify-end">
        <span className="text-[13px] font-semibold" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>{value}</span>
        <span
          className="text-[11px] px-1.5 py-0.5 rounded-[4px] font-medium"
          style={{ fontFamily: "'Jost', sans-serif", background: bg, color }}
        >
          {pct}%
        </span>
      </div>
    </div>
  )
}

function TaskPriorityChart({ data }: { data: UserDashboardDto["TaskByPriority"] }) {
  const total = data.Low + data.Medium + data.High
  const isEmpty = total === 0

  return (
    <div className="bg-white rounded-[12px] border p-6" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="mb-5">
        <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}>
          Priority Distribution
        </p>
        {!isEmpty && (
          <p className="text-[12px] mt-0.5" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>
            Breakdown of tasks by priority level
          </p>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#F5F5F5" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.6" strokeLinecap="round" className="w-5 h-5">
              <path d="M10 2L2 17h16L10 2z" />
              <path d="M10 8v4M10 14.5v.5" />
            </svg>
          </div>
          <p className="text-[13px] font-medium" style={{ fontFamily: "'Archivo', sans-serif", color: C.textSecondary }}>No tasks yet</p>
          <p className="text-[12px] mt-1" style={{ fontFamily: "'Jost', sans-serif", color: C.textMuted }}>Priority breakdown will appear here once you add tasks.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <PriorityBar label="High" value={data.High} total={total} color={C.error} bg={C.errorLight} />
          <PriorityBar label="Medium" value={data.Medium} total={total} color={C.warning} bg={C.warningLight} />
          <PriorityBar label="Low" value={data.Low} total={total} color={C.textMuted} bg="#F5F5F5" />
        </div>
      )}
    </div>
  )
}

function PriorityChartSkeleton() {
  return (
    <div className="bg-white rounded-[12px] border p-6" style={{ borderColor: C.border }}>
      <Skeleton className="h-3 w-36 mb-5" />
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-3 w-14 shrink-0" />
            <Skeleton className="flex-1 h-2.5 rounded-full" />
            <Skeleton className="h-3 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard Skeleton ───────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Primary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <TaskSummaryCardSkeleton key={i} />)}
      </div>
      {/* Attention metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <AttentionCardSkeleton key={i} />)}
      </div>
      {/* Completion + status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CompletionRateCardSkeleton />
        <StatusChartSkeleton />
      </div>
      {/* Priority */}
      <PriorityChartSkeleton />
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.errorLight }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 2L2 19h20L12 2z" />
          <path d="M12 9v5M12 16.5v.5" strokeWidth="2" />
        </svg>
      </div>
      <h2 className="text-[18px] font-semibold mb-2" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
        Unable to load dashboard
      </h2>
      <p className="text-[14px] mb-6 max-w-xs" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
        Something went wrong while retrieving your task metrics. Please try again.
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

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<UserDashboardDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const result = await getUserDashboard()
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
          <DashboardSkeleton />
        ) : error ? (
          <DashboardError onRetry={load} />
        ) : data ? (
          <div className="flex flex-col gap-6">

            {/* Page header */}
            <div>
              <h1 className="text-[22px] font-bold leading-tight" style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}>
                Dashboard
              </h1>
              <p className="mt-1 text-[14px]" style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}>
                Here&apos;s an overview of your tasks and current workload.
              </p>
            </div>

            {/* Primary metrics — 4 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <TaskSummaryCard
                label="Total Tasks"
                value={data.TotalTasks}
                icon={<IconTotal />}
                accentColor={C.primary}
                accentBg={C.primaryLight}
                iconBg={C.primaryLight}
              />
              <TaskSummaryCard
                label="Pending"
                value={data.PendingTasks}
                icon={<IconPending />}
                accentColor={C.secondary}
                accentBg={C.secondaryLight}
                iconBg={C.secondaryLight}
              />
              <TaskSummaryCard
                label="In Progress"
                value={data.InProgressTasks}
                icon={<IconInProgress />}
                accentColor={C.primary}
                accentBg={C.primaryLight}
                iconBg={C.primaryLight}
              />
              <TaskSummaryCard
                label="Completed"
                value={data.CompletedTasks}
                icon={<IconCompleted />}
                accentColor={C.success}
                accentBg={C.successLight}
                iconBg={C.successLight}
              />
            </div>

            {/* Attention metrics — 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AttentionMetricCard
                label="Overdue"
                value={data.OverdueTasks}
                icon={<IconOverdue />}
                accentColor={C.error}
                accentBg={C.errorLight}
                description="Tasks past their due date"
              />
              <AttentionMetricCard
                label="Due Soon"
                value={data.DueSoonTasks}
                icon={<IconDueSoon />}
                accentColor={C.warning}
                accentBg={C.warningLight}
                description="Due within the next 3 days"
              />
              <AttentionMetricCard
                label="High Priority"
                value={data.HighPriorityTasks}
                icon={<IconHighPriority />}
                accentColor="#9B59B6"
                accentBg="#F5EEFF"
                description="Tasks marked as high priority"
              />
            </div>

            {/* Completion + status — 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CompletionRateCard rate={data.CompletionRate} total={data.TotalTasks} />
              <TaskStatusChart data={data.TaskByStatus} />
            </div>

            {/* Priority distribution — full width */}
            <TaskPriorityChart data={data.TaskByPriority} />

          </div>
        ) : null}
      </div>
    </div>
  )
}
