import { useState, useCallback } from "react"
import logoImg from "@/imports/logo__2_.png"
import { ProfileDto } from "@/types"
import type { AuthUser } from "@/context/AuthContext"
import { authService } from "@/services/authService"

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "login" | "register"
type ToastType = "success" | "error"

interface ToastItem {
  id: string
  type: ToastType
  message: string
  exiting?: boolean
}

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface FieldErrors {
  [key: string]: string
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function uid() {
  return Math.random().toString(36).slice(2)
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path fill="currentColor" className="opacity-80" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success")
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
  )
}

function ToastList({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-[10px] shadow-lg border min-w-[280px] max-w-[340px] ${t.exiting ? "toast-exit" : "toast-enter"} ${t.type === "success" ? "bg-white border-[#c3e6d1] text-[#1a7f4b]" : "bg-white border-[#f5c6c6] text-[#c0392b]"}`}
        >
          <span className="mt-0.5">
            <ToastIcon type={t.type} />
          </span>
          <p className="text-sm flex-1 leading-snug" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
            {t.message}
          </p>
          <button onClick={() => onDismiss(t.id)} className="ml-1 text-current opacity-40 hover:opacity-70 cursor-pointer transition-opacity duration-150 shrink-0" aria-label="Dismiss">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Field ───────────────────────────────────────────────────────────────────

function Field({
  label, id, type = "text", value, onChange, error, placeholder, disabled, autoComplete, showToggle,
}: {
  label: string; id: string; type?: string; value: string; onChange: (v: string) => void
  error?: string; placeholder?: string; disabled?: boolean; autoComplete?: string; showToggle?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const canToggle = type === "password" && !!showToggle
  const inputType = canToggle && visible ? "text" : type

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-[#111111]" style={{ fontFamily: "'Archivo', sans-serif" }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id} type={inputType} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled} autoComplete={autoComplete}
          className={`h-10 w-full rounded-[8px] border px-3 text-sm text-[#111111] bg-white placeholder:text-[#c0c0c0] outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${canToggle ? "pr-10" : ""} ${error ? "border-[#c0392b] ring-2 ring-[#c0392b]/15" : "border-[#E5E5E5] focus:border-[#7F40E4] focus:ring-2 focus:ring-[#7F40E4]/15"}`}
          style={{ fontFamily: "'Jost', sans-serif" }}
        />
        {canToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-[6px] text-[#8A8A8A] hover:text-[#5F5F5F] hover:bg-[#F5F5F5] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 3l14 14" />
                <path d="M8.45 8.45A3 3 0 0011.55 11.55" />
                <path d="M6.85 6.85A8.55 8.55 0 002.4 10s2.6 4.5 7.6 4.5a8.2 8.2 0 003.2-.62" />
                <path d="M12.9 12.9A8.55 8.55 0 0017.6 10S15 5.5 10 5.5c-.58 0-1.13.06-1.65.17" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M2.4 10S5 5.5 10 5.5 17.6 10 17.6 10 15 14.5 10 14.5 2.4 10 2.4 10z" />
                <circle cx="10" cy="10" r="2.5" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[12px] text-[#c0392b] flex items-center gap-1" style={{ fontFamily: "'Jost', sans-serif" }} role="alert">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 shrink-0">
            <path fillRule="evenodd" d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6.5a.75.75 0 110-1.5.75.75 0 010 1.5z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: (msg: string, user: AuthUser) => void }) {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  function set(field: keyof LoginForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }))
    if (serverError) setServerError("")
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!form.email.trim()) errs.email = "Email is required."
    else if (!isValidEmail(form.email)) errs.email = "Enter a valid email address."
    if (!form.password) errs.password = "Password is required."
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setServerError("")
    try {
  const user = await authService.login(form.email, form.password)

  onSuccess(
    "Signed in successfully. Welcome back!",
    user,
  )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to sign in. Please try again."
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-[8px] border border-[#f5c6c6] bg-[#fdf2f2] px-3 py-2.5 text-sm text-[#c0392b]" style={{ fontFamily: "'Jost', sans-serif" }} role="alert">
          {serverError}
        </div>
      )}
      <Field id="login-email" label="Email Address" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} placeholder="you@example.com" disabled={loading} autoComplete="email" />
      <Field id="login-password" label="Password" type="password" value={form.password} onChange={(v) => set("password", v)} error={errors.password} placeholder="Enter your password" disabled={loading} autoComplete="current-password" showToggle />
      <PrimaryButton loading={loading} loadingLabel="Signing in…" label="Sign In" />
    </form>
  )
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: (msg: string, email: string) => void }) {
  const [form, setForm] = useState<RegisterForm>({ fullName: "", email: "", password: "", confirmPassword: "" })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  function set(field: keyof RegisterForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }))
    if (serverError) setServerError("")
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!form.fullName.trim()) errs.fullName = "Full name is required."
    else if (form.fullName.trim().length < 2) errs.fullName = "Name must be at least 2 characters."
    if (!form.email.trim()) errs.email = "Email is required."
    else if (!isValidEmail(form.email)) errs.email = "Enter a valid email address."
    if (!form.password) errs.password = "Password is required."
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters."
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password."
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match."
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setServerError("")
    try {
      await authService.register(form.fullName, form.email, form.password, form.confirmPassword)
      onSuccess("Account created successfully. Welcome to Avian!", form.email)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again."
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && (
        <div className="rounded-[8px] border border-[#f5c6c6] bg-[#fdf2f2] px-3 py-2.5 text-sm text-[#c0392b]" style={{ fontFamily: "'Jost', sans-serif" }} role="alert">
          {serverError}
        </div>
      )}
      <Field id="reg-fullname" label="Full Name" value={form.fullName} onChange={(v) => set("fullName", v)} error={errors.fullName} placeholder="Jane Smith" disabled={loading} autoComplete="name" />
      <Field id="reg-email" label="Email Address" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} placeholder="you@example.com" disabled={loading} autoComplete="email" />
      <Field id="reg-password" label="Create Password" type="password" value={form.password} onChange={(v) => set("password", v)} error={errors.password} placeholder="Min. 8 characters" disabled={loading} autoComplete="new-password" showToggle />
      <Field id="reg-confirm" label="Confirm Password" type="password" value={form.confirmPassword} onChange={(v) => set("confirmPassword", v)} error={errors.confirmPassword} placeholder="Re-enter your password" disabled={loading} autoComplete="new-password" showToggle />
      <PrimaryButton loading={loading} loadingLabel="Creating account…" label="Create Account" />
    </form>
  )
}

function PrimaryButton({ loading, loadingLabel, label }: { loading: boolean; loadingLabel: string; label: string }) {
  return (
    <button
      type="submit" disabled={loading}
      className="mt-1 h-10 w-full rounded-[8px] flex items-center justify-center gap-2 text-sm font-semibold text-white cursor-pointer transition-all duration-[180ms] disabled:opacity-70 disabled:cursor-not-allowed"
      style={{ fontFamily: "'Archivo', sans-serif", background: "#7F40E4" }}
      onMouseEnter={(e) => { if (!loading) { (e.currentTarget.style.background = "#6b32cc"); e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(127,64,228,0.3)" } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#7F40E4"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "" }}
    >
      {loading ? (<><Spinner /><span>{loadingLabel}</span></>) : label}
    </button>
  )
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

export default function AuthPage({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [tab, setTab] = useState<Tab>("login")
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = uid()
    setToasts((prev) => [...prev.slice(-2), { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 200)
    }, 4500)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 200)
  }, [])

function handleLoginSuccess(msg: string, user: AuthUser) {
  addToast("success", msg)
  setTimeout(() => onAuthenticated(user), 800)
}

function handleRegisterSuccess(msg: string, email: string) {
  addToast("success", msg)
  setTab("login")
}

  return (
    <div className="h-full min-h-screen flex" style={{ background: "#F8F8F7" }}>
      <ToastList toasts={toasts} onDismiss={dismiss} />

      {/* Logo — absolute top-left */}
      <div className="absolute top-5 left-5 z-10">
        <img src={logoImg} alt="Avian" className="h-8 w-auto object-contain drop-shadow-sm" />
      </div>

      {/* Left image panel */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1709626011485-6fe000ea2dbc?w=1400&h=1200&fit=crop&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(20,5,45,0.72) 0%, rgba(127,64,228,0.28) 100%)" }} />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="text-white/90 text-2xl font-semibold leading-snug" style={{ fontFamily: "'Archivo', sans-serif" }}>
            Manage work.<br />Move fast.
          </p>
          <p className="mt-2 text-white/55 text-sm leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
            Avian keeps your team's tasks organized, prioritized,<br />and always within reach.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-0 overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-[26px] font-bold text-[#111111] leading-tight tracking-tight" style={{ fontFamily: "'Archivo', sans-serif" }}>
              {tab === "login" ? "Welcome back." : "Create your account."}
            </h1>
            <p className="mt-1.5 text-sm text-[#5F5F5F]" style={{ fontFamily: "'Jost', sans-serif" }}>
              {tab === "login" ? "Sign in to your Avian workspace." : "Get started — it only takes a moment."}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex mb-7 rounded-[9px] p-1" style={{ background: "#F0EDF9" }} role="tablist">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className="flex-1 h-8 rounded-[6px] text-[13px] font-semibold cursor-pointer transition-all duration-[180ms]"
                style={{ fontFamily: "'Archivo', sans-serif", background: tab === t ? "#7F40E4" : "transparent", color: tab === t ? "#ffffff" : "#5F5F5F", boxShadow: tab === t ? "0 1px 4px rgba(127,64,228,0.25)" : "none" }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="rounded-[14px] border border-[#E5E5E5] bg-white p-7" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            {tab === "login"
              ? <LoginForm onSuccess={handleLoginSuccess} />
              : <RegisterForm onSuccess={handleRegisterSuccess} />}
          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-sm text-[#8A8A8A]" style={{ fontFamily: "'Jost', sans-serif" }}>
            {tab === "login" ? (
              <>Don&apos;t have an account?{" "}<button onClick={() => setTab("register")} className="text-[#7F40E4] font-semibold cursor-pointer hover:underline" style={{ fontFamily: "'Archivo', sans-serif" }}>Register</button></>
            ) : (
              <>Already have an account?{" "}<button onClick={() => setTab("login")} className="text-[#7F40E4] font-semibold cursor-pointer hover:underline" style={{ fontFamily: "'Archivo', sans-serif" }}>Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
