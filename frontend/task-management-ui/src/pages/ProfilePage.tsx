import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/context/AuthContext"
import type { ProfileDto } from "@/types"
import { getProfile } from "@/services/profileService"

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  primary: "#7F40E4",
  primaryLight: "#F0EDF9",
  secondary: "#FFC000",
  secondaryLight: "#FFF9E6",
  text: "#111111",
  textSecondary: "#5F5F5F",
  textMuted: "#8A8A8A",
  border: "#E5E5E5",
  surface: "#FFFFFF",
  bg: "#F8F8F7",
  error: "#C0392B",
  errorLight: "#FDF2F2",
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconMail() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <path d="M2 7l8 5 8-5" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10 2l7 3v5c0 4-3 7-7 8C6 17 3 14 3 10V5l7-3z" />
      <path d="M7.5 10l2 2 3-3" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="3" width="16" height="15" rx="2" />
      <path d="M6 1v3M14 1v3M2 8h16" />
    </svg>
  )
}

function IconSignOut() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 13l3-3m0 0l-3-3m3 3H7" />
      <path d="M3 10V6a2 2 0 012-2h5" />
      <path d="M3 10v4a2 2 0 002 2h5" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="10" cy="7" r="3.5" />
      <path d="M3 18c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </svg>
  )
}

function IconKey() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="7.5" cy="10" r="4.5" />
      <path d="M11.5 10H18M16 8.5v3" />
    </svg>
  )
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

function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
      {/* Left card skeleton */}
      <div className="bg-white rounded-[14px] border" style={{ borderColor: C.border }}>
        <div className="px-7 pt-7 pb-6" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-5 w-24 rounded-[6px]" />
            </div>
            <Skeleton className="w-11 h-11 rounded-[12px] shrink-0" />
          </div>
        </div>
        <div className="px-7 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4" style={{ borderBottom: i < 3 ? `1px solid ${C.border}` : undefined }}>
              <Skeleton className="w-8 h-8 rounded-[8px] shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column skeleton */}
      <div className="flex flex-col gap-4">
        {/* Access card skeleton */}
        <div className="bg-white rounded-[14px] border p-6 flex flex-col gap-4" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-[8px]" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>

        {/* Session card skeleton */}
        <div className="bg-white rounded-[14px] border p-6 flex flex-col gap-4" style={{ borderColor: C.border }}>
          <Skeleton className="h-2.5 w-20" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-10 w-full rounded-[8px]" />
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

function roleDisplay(role: string): string {
  return role.toLowerCase() === "admin" ? "Administrator" : "Team Member"
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role.toLowerCase() === "admin"
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold"
      style={{
        fontFamily: "'Archivo', sans-serif",
        background: isAdmin ? C.secondaryLight : C.primaryLight,
        color: isAdmin ? "#8A6200" : C.primary,
        letterSpacing: "0.02em",
      }}
    >
      {isAdmin ? "Administrator" : "Team Member"}
    </span>
  )
}

// ─── Profile field row ────────────────────────────────────────────────────────

function ProfileField({
  icon, label, value, isLast = false,
}: {
  icon: React.ReactNode; label: string; value: string; isLast?: boolean
}) {
  return (
    <div
      className="flex items-center gap-4 py-4"
      style={{ borderBottom: isLast ? undefined : `1px solid ${C.border}` }}
    >
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
        style={{ background: "#F5F5F5", color: C.textMuted }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
          style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}
        >
          {label}
        </p>
        <p
          className="text-[14px] font-medium truncate"
          style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

// ─── Member since row (yellow accent) ─────────────────────────────────────────

function MemberSinceField({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div
        className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
        style={{ background: C.secondaryLight, color: "#8A6200" }}
      >
        <IconCalendar />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
          style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}
        >
          Member Since
        </p>
        <p
          className="text-[14px] font-medium"
          style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
        >
          {formatMemberSince(date)}
        </p>
      </div>
    </div>
  )
}

// ─── Profile identity card (left) ─────────────────────────────────────────────

function ProfileCard({ data }: { data: ProfileDto }) {
  return (
    <div
      className="bg-white rounded-[14px] border"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="px-7 pt-7 pb-6" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-[26px] font-bold leading-tight"
              style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
            >
              {data.fullName}
            </h2>
            <div className="mt-2.5">
              <RoleBadge role={data.role} />
            </div>
          </div>
          {/* Profile icon mark */}
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: C.primaryLight, color: C.primary }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="10" cy="7" r="3.5" />
              <path d="M3 18c0-3.5 3.1-6 7-6s7 2.5 7 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="px-7 py-2">
        <ProfileField icon={<IconMail />} label="Email Address" value={data.email} />
        <ProfileField icon={<IconUser />} label="Role" value={roleDisplay(data.role)} />
        <MemberSinceField date={data.createdAt} />
      </div>
    </div>
  )
}

// ─── Access level card (top-right) ────────────────────────────────────────────

function AccessCard({ role }: { role: string }) {
  const isAdmin = role.toLowerCase() === "admin"
  return (
    <div
      className="bg-white rounded-[14px] border p-6"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
          style={{
            background: isAdmin ? C.secondaryLight : C.primaryLight,
            color: isAdmin ? "#8A6200" : C.primary,
          }}
        >
          {isAdmin ? <IconKey /> : <IconShield />}
        </div>
        <p
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}
        >
          Access Level
        </p>
      </div>

      <p
        className="text-[16px] font-bold mb-2"
        style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
      >
        {roleDisplay(role)}
      </p>
      <p
        className="text-[13px] leading-relaxed"
        style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}
      >
        {isAdmin
          ? "Full administrative access to manage users, tasks, and system configuration across the platform."
          : "Standard access to create and manage your own tasks, view your dashboard, and update your profile."}
      </p>
    </div>
  )
}

// ─── Session / logout card (bottom-right) ─────────────────────────────────────

function SessionCard({ onLogout }: { onLogout: () => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className="bg-white rounded-[14px] border p-6"
      style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wide mb-3"
        style={{ fontFamily: "'Archivo', sans-serif", color: C.textMuted, letterSpacing: "0.06em" }}
      >
        Session
      </p>
      <p
        className="text-[13px] leading-relaxed mb-5"
        style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}
      >
        You are currently signed in. Signing out will end your session and return you to the login screen.
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold border cursor-pointer transition-all duration-[180ms]"
          style={{
            fontFamily: "'Archivo', sans-serif",
            color: C.error,
            borderColor: `${C.error}38`,
            background: C.errorLight,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fce8e8"
            e.currentTarget.style.borderColor = `${C.error}70`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.errorLight
            e.currentTarget.style.borderColor = `${C.error}38`
          }}
        >
          <IconSignOut />
          Sign Out
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <p
            className="text-[13px] font-medium text-center"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
          >
            Confirm sign out?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold border cursor-pointer transition-all duration-[180ms]"
              style={{
                fontFamily: "'Archivo', sans-serif",
                color: C.textSecondary,
                borderColor: C.border,
                background: "white",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F5F5" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white" }}
            >
              Cancel
            </button>
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2.5 rounded-[8px] text-[13px] font-semibold cursor-pointer transition-all duration-[180ms]"
              style={{
                fontFamily: "'Archivo', sans-serif",
                color: "white",
                background: C.error,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#a93226"
                e.currentTarget.style.transform = "translateY(-1px)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(192,57,43,0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.error
                e.currentTarget.style.transform = ""
                e.currentTarget.style.boxShadow = ""
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: C.errorLight }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={C.error} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M12 2L2 19h20L12 2z" />
          <path d="M12 9v5M12 16.5v.5" strokeWidth="2" />
        </svg>
      </div>
      <h2
        className="text-[18px] font-semibold mb-2"
        style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
      >
        Unable to load profile
      </h2>
      <p
        className="text-[14px] mb-6 max-w-xs"
        style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}
      >
        Something went wrong while retrieving your profile. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition-all duration-[180ms]"
        style={{ fontFamily: "'Archivo', sans-serif", background: C.primary }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#6b32cc"
          e.currentTarget.style.transform = "translateY(-1px)"
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(127,64,228,0.3)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = C.primary
          e.currentTarget.style.transform = ""
          e.currentTarget.style.boxShadow = ""
        }}
      >
        Retry
      </button>
    </div>
  )
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  function onLogout() { logout(); navigate("/") }
  const [data, setData] = useState<ProfileDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const result = await getProfile()
      setData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Merge auth identity so role and name always reflect the logged-in account
  const profile = data && user
    ? { ...data, Role: user.role, FullName: user.fullName, Email: user.email }
    : data

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: C.bg }}>
      <div className="max-w-[1100px] mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1
            className="text-[22px] font-bold leading-tight"
            style={{ fontFamily: "'Archivo', sans-serif", color: C.text }}
          >
            Profile
          </h1>
          <p
            className="mt-1 text-[14px]"
            style={{ fontFamily: "'Jost', sans-serif", color: C.textSecondary }}
          >
            Your account information and session settings.
          </p>
        </div>

        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <ProfileError onRetry={load} />
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
            {/* Left: identity card */}
            <ProfileCard data={profile} />

            {/* Right: access + session stacked */}
            <div className="flex flex-col gap-4">
              <AccessCard role={profile.role} />
              <SessionCard onLogout={onLogout} />
            </div>
          </div>
        ) : null}

      </div>
    </div>
  )
}
