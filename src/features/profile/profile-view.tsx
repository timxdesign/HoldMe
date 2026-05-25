"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Camera,
  Check,
  ChevronRight,
  Heart,
  Layout,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Target,
  Calendar,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const INTERESTS = [
  "Fitness",
  "Faith",
  "Education",
  "Business",
  "Content Creation",
  "Mental Health",
  "Reading",
  "Career",
  "Relationships",
  "Finance",
]

const interestEmojis: Record<string, string> = {
  Fitness: "💪",
  Faith: "🙏",
  Education: "📚",
  Business: "💼",
  "Content Creation": "🎨",
  "Mental Health": "🧠",
  Reading: "📖",
  Career: "🚀",
  Relationships: "❤️",
  Finance: "💰",
}

interface ProfileViewProps {
  profile: {
    id: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    interests: string[] | null
  } | null
  userId: string
  email: string
  stats: {
    spacesOwned: number
    spacesJoined: number
    totalGoals: number
    completedCheckins: number
    totalCheckins: number
    strengthsSent: number
    strengthsReceived: number
    memberSince: string
  }
}

export function ProfileView({ profile, userId, email, stats }: ProfileViewProps) {
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? [])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const completionRate =
    stats.totalCheckins > 0
      ? Math.round((stats.completedCheckins / stats.totalCheckins) * 100)
      : 0

  const memberDate = new Date(stats.memberSince)
  const memberMonths = Math.max(
    1,
    Math.floor(
      (Date.now() - memberDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
  )

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  async function handleSave() {
    setSaving(true)

    const { error } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        bio: bio || null,
        interests,
      })
      .eq("id", userId)

    setSaving(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Profile updated!")
    setEditing(false)
    router.refresh()
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split(".").pop()
    const filePath = `${userId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error("Upload failed")
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", userId)

    setAvatarUrl(publicUrl + "?t=" + Date.now())
    setUploading(false)
    toast.success("Photo updated!")
    router.refresh()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="relative rounded-2xl bg-card ring-1 ring-foreground/10 overflow-hidden">
        {/* Gradient banner */}
        <div className="h-24 bg-gradient-to-r from-brand via-blue-400 to-brand/80" />

        <div className="px-5 pb-5">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4 flex items-end justify-between">
            <button
              onClick={() => fileRef.current?.click()}
              className="group relative"
              disabled={uploading}
            >
              <Avatar className="h-20 w-20 ring-4 ring-card shadow-lg">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="text-xl font-bold bg-brand/10 text-brand">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </button>

            {!editing && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-full h-8 text-xs"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3 w-3" />
                Edit profile
              </Button>
            )}
          </div>

          {/* Name and bio */}
          {editing ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Full name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Bio
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What are you working towards?"
                  rows={3}
                  className="rounded-xl resize-none"
                  maxLength={160}
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {bio.length}/160
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-lg font-bold">
                {fullName || "Add your name"}
              </h2>
              {bio ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">
                  No bio yet
                </p>
              )}
            </div>
          )}

          {/* Email + member since */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {email}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Joined {memberDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={<Target className="h-4 w-4" />}
          iconBg="bg-brand/10"
          iconColor="text-brand"
          value={stats.totalGoals}
          label="Goals created"
        />
        <StatTile
          icon={<CheckCircle2 className="h-4 w-4" />}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          value={`${completionRate}%`}
          label="Completion rate"
        />
        <StatTile
          icon={<Heart className="h-4 w-4" />}
          iconBg="bg-pink-500/10"
          iconColor="text-pink-500"
          value={stats.strengthsReceived}
          label="Strengths received"
        />
        <StatTile
          icon={<Zap className="h-4 w-4" />}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
          value={stats.strengthsSent}
          label="Strengths sent"
        />
      </div>

      {/* Activity Summary */}
      <div className="rounded-2xl bg-card ring-1 ring-foreground/10 p-5 space-y-3">
        <h3 className="text-sm font-semibold">Activity summary</h3>
        <div className="space-y-2.5">
          <ActivityRow
            label="Spaces owned"
            value={stats.spacesOwned}
            icon={<Layout className="h-3.5 w-3.5 text-brand" />}
          />
          <ActivityRow
            label="Spaces joined"
            value={stats.spacesJoined}
            icon={<Layout className="h-3.5 w-3.5 text-purple-500" />}
          />
          <ActivityRow
            label="Total check-ins"
            value={stats.completedCheckins}
            icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
          />
          <ActivityRow
            label="Months active"
            value={memberMonths}
            icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
          />
        </div>
      </div>

      {/* Interests */}
      <div className="rounded-2xl bg-card ring-1 ring-foreground/10 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Interests</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-brand font-medium hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-200">
            {INTERESTS.map((interest) => {
              const selected = interests.includes(interest)
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium ring-1 transition-all duration-200",
                    selected
                      ? "ring-brand bg-brand/5 text-brand"
                      : "ring-foreground/10 text-muted-foreground hover:ring-foreground/20 hover:bg-muted/50"
                  )}
                >
                  <span className="text-base">{interestEmojis[interest]}</span>
                  <span className="truncate">{interest}</span>
                  {selected && <Check className="h-3.5 w-3.5 ml-auto shrink-0" />}
                </button>
              )
            })}
          </div>
        ) : interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium"
              >
                <span>{interestEmojis[interest]}</span>
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">
            No interests selected
          </p>
        )}
      </div>

      {/* Edit actions */}
      {editing && (
        <div className="flex gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-11"
            onClick={() => {
              setFullName(profile?.full_name ?? "")
              setBio(profile?.bio ?? "")
              setInterests(profile?.interests ?? [])
              setEditing(false)
            }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl h-11 gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      )}

      {/* Quick links */}
      <div className="rounded-2xl bg-card ring-1 ring-foreground/10 overflow-hidden divide-y divide-foreground/5">
        <QuickLink
          href="/settings"
          label="Notification settings"
          description="Manage push notifications and reminders"
        />
        <QuickLink
          href="/spaces"
          label="Your spaces"
          description={`${stats.spacesOwned} owned, ${stats.spacesJoined} joined`}
        />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full rounded-2xl ring-1 ring-destructive/20 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  )
}

function StatTile({
  icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  value: number | string
  label: string
}) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-foreground/10 p-4 space-y-2 transition-all duration-300 hover:ring-foreground/15 hover:shadow-sm">
      <div className={cn("inline-flex items-center justify-center h-8 w-8 rounded-xl", iconBg)}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function ActivityRow({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

function QuickLink({
  href,
  label,
  description,
}: {
  href: string
  label: string
  description: string
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors group"
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium group-hover:text-brand transition-colors">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors" />
    </a>
  )
}
