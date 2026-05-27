"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FadeIn } from "@/components/ui/fade-in"
import { ArrowLeft, Camera, Restart } from "@solar-icons/react"
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
  Fitness: "\u{1F4AA}",
  Faith: "\u{1F64F}",
  Education: "\u{1F4DA}",
  Business: "\u{1F4BC}",
  "Content Creation": "\u{1F3A8}",
  "Mental Health": "\u{1F9E0}",
  Reading: "\u{1F4D6}",
  Career: "\u{1F680}",
  Relationships: "\u{2764}\u{FE0F}",
  Finance: "\u{1F4B0}",
}

interface EditProfileFormProps {
  userId: string
  profile: {
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    interests: string[] | null
  }
}

export function EditProfileForm({ userId, profile }: EditProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name ?? "")
  const [bio, setBio] = useState(profile.bio ?? "")
  const [interests, setInterests] = useState<string[]>(profile.interests ?? [])
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
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
  }

  async function handleSave() {
    if (!fullName.trim()) {
      toast.error("Name can't be empty")
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from("users")
      .update({ full_name: fullName.trim(), bio: bio.trim() || null, interests })
      .eq("id", userId)

    setSaving(false)
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Profile updated!")
    router.push("/profile")
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
      <FadeIn>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
      </FadeIn>

      <FadeIn delay={75}>
        <h1 className="text-2xl font-bold tracking-tight mt-6">Edit profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your personal information
        </p>
      </FadeIn>

      <div className="mt-8 space-y-8">
        {/* Avatar */}
        <FadeIn delay={150}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Photo</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="group relative shrink-0"
                disabled={uploading}
              >
                <Avatar className="h-20 w-20 ring-2 ring-foreground/5 transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xl font-bold bg-brand/10 text-brand">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  {uploading ? (
                    <Restart className="h-5 w-5 text-white animate-spin" />
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
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-sm text-brand font-medium hover:underline transition-colors"
              >
                {uploading ? "Uploading..." : "Change photo"}
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Name */}
        <FadeIn delay={200}>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="h-11 rounded-xl"
            />
          </div>
        </FadeIn>

        {/* Bio */}
        <FadeIn delay={250}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                {bio.length}/160
              </span>
            </div>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are you working towards?"
              rows={3}
              maxLength={160}
              className="rounded-xl resize-none text-sm"
            />
          </div>
        </FadeIn>

        {/* Interests */}
        <FadeIn delay={300}>
          <div className="space-y-3">
            <label className="text-sm font-medium">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = interests.includes(interest)
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-all duration-200 active:scale-95",
                      selected
                        ? "ring-brand bg-brand/8 text-brand"
                        : "ring-foreground/8 text-muted-foreground hover:ring-foreground/15"
                    )}
                  >
                    <span className="text-sm">{interestEmojis[interest]}</span>
                    {interest}
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>

        {/* Save */}
        <FadeIn delay={350}>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl gap-2"
              onClick={handleSave}
              disabled={saving || !fullName.trim()}
            >
              {saving && <Restart className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
