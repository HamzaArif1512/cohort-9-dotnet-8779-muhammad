import { useState } from "react"
import { useNavigate, useLocation } from "react-router"
import { useAuth } from "@/context/AuthContext"
import logoImg from "@/imports/logo__2_.png"

// ─── Icon components (monoline SVG, consistent weight) ────────────────────────

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function IconTasks() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
      <path d="M16 3.13a4 4 0 010 7.75" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
      <path d="M3 12V7a2 2 0 012-2h6" />
      <path d="M3 12v5a2 2 0 002 2h6" />
    </svg>
  )
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="absolute left-full ml-3 whitespace-nowrap px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium text-white pointer-events-none z-50"
          style={{ fontFamily: "'Archivo', sans-serif", background: "#111111", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
          role="tooltip"
        >
          {label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "#111111" }} />
        </div>
      )}
    </div>
  )
}

// ─── Nav Button ───────────────────────────────────────────────────────────────

function NavButton({
  label, icon, active = false, onClick,
}: {
  label: string; icon: React.ReactNode; active?: boolean; onClick?: () => void
}) {
  return (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={`w-11 h-11 rounded-[10px] flex items-center justify-center transition-all duration-[180ms] cursor-pointer ${
          active
            ? "bg-[#7F40E4] text-white shadow-sm"
            : "text-[#8A8A8A] hover:bg-[#F0EDF9] hover:text-[#7F40E4]"
        }`}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

// ─── User Avatar ─────────────────────────────────────────────────────────────

function UserAvatar({ name }: { name: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate("/")
  }

  return (
    <div className="relative flex flex-col items-center">
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute bottom-full left-full ml-3 mb-0 bg-white border border-[#E5E5E5] rounded-[10px] py-1.5 w-44 z-50"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
          >
            <div className="px-3 py-2 border-b border-[#F0F0F0] mb-1">
              <p className="text-[13px] font-semibold text-[#111111] truncate" style={{ fontFamily: "'Archivo', sans-serif" }}>{name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#5F5F5F] hover:bg-[#FDF2F2] hover:text-[#c0392b] cursor-pointer transition-colors duration-150"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              <IconLogout />
              Sign out
            </button>
          </div>
        </>
      )}
      <Tooltip label={name}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-all duration-[180ms] hover:opacity-90 hover:scale-105"
          style={{ fontFamily: "'Archivo', sans-serif", background: "linear-gradient(135deg, #7F40E4, #9b5ee8)" }}
          aria-label="User menu"
        >
          {initials}
        </button>
      </Tooltip>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  basePath: "/user" | "/admin"
  userName: string
  showManageUsers?: boolean
}

export default function Sidebar({ basePath, userName, showManageUsers = false }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(segment: string) {
    return location.pathname.startsWith(`${basePath}/${segment}`)
  }

  function go(segment: string) {
    navigate(`${basePath}/${segment}`)
  }

  return (
    <nav
      className="fixed left-0 top-0 h-full z-30 flex flex-col items-center py-5 gap-0"
      style={{ width: 80, background: "#FFFFFF", borderRight: "1px solid #E5E5E5" }}
      aria-label="Main navigation"
    >
      {/* Logo mark */}
      <div className="mb-5">
        <img src={logoImg} alt="Avian" className="w-10 h-10 object-contain" />
      </div>

      {/* Divider */}
      <div className="w-9 h-px mb-5" style={{ background: "#E5E5E5" }} />

      {/* Primary nav */}
      <div className="flex flex-col items-center gap-1.5 flex-1">
        <NavButton
          label="Dashboard"
          icon={<IconDashboard />}
          active={isActive("dashboard")}
          onClick={() => go("dashboard")}
        />
        <NavButton
          label="Tasks"
          icon={<IconTasks />}
          active={isActive("tasks")}
          onClick={() => go("tasks")}
        />
        <NavButton
          label="Profile"
          icon={<IconProfile />}
          active={isActive("profile")}
          onClick={() => go("profile")}
        />
        {showManageUsers && (
          <NavButton
            label="Manage Users"
            icon={<IconUsers />}
            active={isActive("manage-users")}
            onClick={() => go("manage-users")}
          />
        )}
      </div>

      {/* Divider */}
      <div className="w-9 h-px mb-4" style={{ background: "#E5E5E5" }} />

      {/* User avatar */}
      <UserAvatar name={userName} />
    </nav>
  )
}
