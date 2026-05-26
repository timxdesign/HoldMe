"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { Letter, Restart, ArrowLeft } from "@solar-icons/react"

function getNextUrl() {
  if (typeof window === "undefined") return "/dashboard"
  const params = new URLSearchParams(window.location.search)
  return params.get("next") ?? "/dashboard"
}

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={`transition-all duration-500 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [stepTransition, setStepTransition] = useState(false)
  const supabase = createClient()

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { full_name: fullName },
      },
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setStepTransition(true)
    setTimeout(() => {
      setOtpSent(true)
      setStepTransition(false)
    }, 200)
    toast.success("Check your email for the verification code")
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    try {
      const res = await fetch("/api/invite/auto-join", { method: "POST" })
      const data = await res.json()
      if (data.joined > 0) {
        toast.success(`You've been added to ${data.joined} space${data.joined > 1 ? "s" : ""}!`)
      }
    } catch {}

    window.location.href = getNextUrl()
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getNextUrl())}`,
      },
    })
    if (error) toast.error(error.message)
  }

  function handleBack() {
    setStepTransition(true)
    setTimeout(() => {
      setOtpSent(false)
      setOtp("")
      setStepTransition(false)
    }, 200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-8">
        {/* Brand */}
        <FadeUp className="flex flex-col items-center gap-3">
          <img
            src="/brand-asset/logo-mark.svg"
            alt=""
            className="h-11 w-11 animate-in zoom-in-75 duration-500"
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Stay consistent together
            </p>
          </div>
        </FadeUp>

        {/* Form area */}
        <div
          className={`transition-all duration-200 ease-out ${
            stepTransition ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
          }`}
        >
          {!otpSent ? (
            <FadeUp delay={80}>
              <form onSubmit={handleSendOtp} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 text-sm rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 placeholder:text-muted-foreground/40"
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-sm rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 placeholder:text-muted-foreground/40"
                />
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-medium"
                  disabled={loading || !email.trim() || !fullName.trim()}
                >
                  {loading ? (
                    <Restart className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Letter className="h-4 w-4 mr-2" />
                      Send verification code
                    </>
                  )}
                </Button>
              </form>
            </FadeUp>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-foreground transition-colors mb-1"
              >
                <ArrowLeft className="h-3 w-3" />
                {email}
              </button>
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  autoFocus
                  className="h-11 text-sm rounded-xl bg-muted/40 border-0 ring-1 ring-foreground/[0.06] focus-visible:ring-brand/40 placeholder:text-muted-foreground/40 text-center tracking-[0.3em] font-mono"
                />
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl text-sm font-medium"
                  disabled={loading || otp.length < 6}
                >
                  {loading ? (
                    <Restart className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Divider */}
        <FadeUp delay={160}>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-foreground/[0.06]" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-foreground/[0.06]" />
          </div>
        </FadeUp>

        {/* Google */}
        <FadeUp delay={240}>
          <button
            onClick={handleGoogleSignup}
            className="w-full h-11 rounded-xl bg-muted/40 ring-1 ring-foreground/[0.06] hover:ring-foreground/10 hover:bg-muted/60 transition-all text-sm font-medium flex items-center justify-center gap-2.5"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </FadeUp>

        {/* Footer link */}
        <FadeUp delay={320}>
          <p className="text-center text-xs text-muted-foreground/50">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand font-medium hover:underline">
              Log in
            </Link>
          </p>
        </FadeUp>
      </div>
    </div>
  )
}
