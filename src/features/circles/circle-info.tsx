"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FadeIn } from "@/components/ui/fade-in"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Camera,
  Copy,
  CheckCircle,
  Letter,
  Link as LinkIcon,
  Logout,
  Pen,
  Restart,
  UserPlus,
  UsersGroupRounded,
  Magnifer,
  Crown,
  CloseCircle,
} from "@solar-icons/react"
import { toast } from "sonner"

interface CircleInfoProps {
  circle: {
    id: string
    name: string
    emoji: string | null
    description: string | null
    image_url: string | null
    created_by: string
  }
  members: {
    user_id: string
    role: string
    users: { full_name: string | null; avatar_url: string | null; email: string | null } | null
  }[]
  currentUserId: string
  isOwner: boolean
}

export function CircleInfo({ circle, members: initialMembers, currentUserId, isOwner }: CircleInfoProps) {
  const [members] = useState(initialMembers)
  const [imageUrl, setImageUrl] = useState(circle.image_url)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [editName, setEditName] = useState(circle.name)
  const [editDescription, setEditDescription] = useState(circle.description ?? "")
  const [saving, setSaving] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [inviteEmails, setInviteEmails] = useState("")
  const [sendingEmails, setSendingEmails] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true
    const name = (m.users?.full_name ?? "").toLowerCase()
    const email = (m.users?.email ?? "").toLowerCase()
    const q = searchQuery.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split(".").pop()
    const filePath = `${circle.id}/cover.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("circle-images")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      toast.error("Upload failed")
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("circle-images")
      .getPublicUrl(filePath)

    const url = publicUrl + "?t=" + Date.now()
    await supabase.from("circles").update({ image_url: publicUrl }).eq("id", circle.id)

    setImageUrl(url)
    setUploading(false)
    toast.success("Image updated!")
  }, [circle.id, supabase])

  async function handleSaveEdit() {
    if (!editName.trim()) {
      toast.error("Name can't be empty")
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from("circles")
      .update({
        name: editName.trim(),
        description: editDescription.trim() || null,
      })
      .eq("id", circle.id)

    setSaving(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Circle updated!")
    setShowEditDialog(false)
    router.refresh()
  }

  async function handleGenerateLink() {
    setGeneratingLink(true)
    const { data, error } = await supabase
      .from("circle_invites")
      .insert({ circle_id: circle.id, inviter_id: currentUserId })
      .select()
      .single()

    setGeneratingLink(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setInviteLink(`${window.location.origin}/circle-invite/${data.token}`)
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSendEmails() {
    const emailList = inviteEmails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter(Boolean)

    if (emailList.length === 0) {
      toast.error("Enter at least one email")
      return
    }

    setSendingEmails(true)
    const res = await fetch("/api/circle-invite/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ circleId: circle.id, emails: emailList }),
    })

    const data = await res.json()
    setSendingEmails(false)

    if (!res.ok) {
      toast.error(data.error)
      return
    }

    if (data.successCount > 0) {
      toast.success(`Invited ${data.successCount} ${data.successCount === 1 ? "person" : "people"}!`)
      setInviteEmails("")
    }

    const failed = data.results?.filter((r: { success: boolean }) => !r.success) ?? []
    if (failed.length > 0) {
      for (const f of failed) {
        toast.error(`${f.email}: ${f.error}`)
      }
    }
  }

  async function handleLeave() {
    setLeaving(true)
    const { error } = await supabase
      .from("circle_members")
      .delete()
      .eq("circle_id", circle.id)
      .eq("user_id", currentUserId)

    setLeaving(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("You left the circle")
    router.push("/circles")
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Circle Profile Header */}
      <FadeIn>
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Circle Image */}
          <div className="relative group">
            {imageUrl ? (
              <div className="h-24 w-24 rounded-2xl overflow-hidden ring-2 ring-foreground/5">
                <img
                  src={imageUrl}
                  alt={circle.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-brand/20 to-purple-500/20 flex items-center justify-center ring-2 ring-foreground/5">
                <span className="text-4xl">{circle.emoji ?? "🎯"}</span>
              </div>
            )}
            {isOwner && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
              >
                {uploading ? (
                  <Restart className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Circle Name & Description */}
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight">{circle.name}</h1>
            {circle.description && (
              <p className="text-sm text-muted-foreground/70 max-w-sm">{circle.description}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg"
                onClick={() => {
                  setEditName(circle.name)
                  setEditDescription(circle.description ?? "")
                  setShowEditDialog(true)
                }}
              >
                <Pen className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg"
              onClick={() => {
                setInviteLink("")
                setInviteEmails("")
                setCopied(false)
                setShowInviteDialog(true)
              }}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </Button>
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:border-red-500/30"
                onClick={() => setShowLeaveDialog(true)}
              >
                <Logout className="h-3.5 w-3.5" />
                Leave
              </Button>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Members Section */}
      <FadeIn delay={100}>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersGroupRounded className="h-4 w-4 text-muted-foreground/50" />
              <h2 className="text-sm font-semibold text-muted-foreground/70 uppercase tracking-wide">
                Members
              </h2>
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground tabular-nums">
                {members.length}
              </span>
            </div>
          </div>

          {/* Search */}
          {members.length > 5 && (
            <div className="relative">
              <Magnifer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-sm rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  <CloseCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Member List */}
          <div className="space-y-0.5">
            {filteredMembers.map((m, idx) => {
              const name = m.users?.full_name ?? "Unknown"
              const initial = name.charAt(0).toUpperCase()
              const avatarUrl = m.users?.avatar_url
              const isMemberOwner = m.role === "owner"
              const isCurrentUser = m.user_id === currentUserId

              return (
                <div
                  key={m.user_id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 transition-colors duration-150 animate-in fade-in slide-in-from-bottom-1"
                  style={{ animationDelay: `${idx * 30}ms`, animationFillMode: "both" }}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-brand/60 to-purple-500/60 text-white">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{name}</span>
                      {isCurrentUser && (
                        <span className="text-[10px] text-muted-foreground/50">you</span>
                      )}
                    </div>
                    {m.users?.email && (
                      <p className="text-[11px] text-muted-foreground/50 truncate">{m.users.email}</p>
                    )}
                  </div>
                  {isMemberOwner && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      <Crown className="h-3 w-3" />
                      Owner
                    </span>
                  )}
                </div>
              )
            })}

            {filteredMembers.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground/50">No members found</p>
              </div>
            )}
          </div>
        </section>
      </FadeIn>

      {/* Edit Circle Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit circle</DialogTitle>
            <DialogDescription>Update your circle&apos;s name and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={60}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="edit-desc" className="text-sm font-medium">Description</label>
                <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                  {editDescription.length}/200
                </span>
              </div>
              <Textarea
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="What's this circle about?"
                rows={3}
                maxLength={200}
                className="rounded-xl resize-none text-sm"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editName.trim()} className="gap-1.5 rounded-lg">
              {saving && <Restart className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog
        open={showInviteDialog}
        onOpenChange={(v) => {
          setShowInviteDialog(v)
          if (!v) {
            setInviteLink("")
            setInviteEmails("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to circle</DialogTitle>
            <DialogDescription>Send email invites or share a link.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Email invites */}
            <div className="space-y-2">
              <label htmlFor="invite-emails" className="text-sm font-medium">
                Email addresses
              </label>
              <Textarea
                id="invite-emails"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder={"friend@example.com\nanother@example.com"}
                rows={3}
                className="rounded-xl resize-none text-sm"
              />
              <p className="text-[11px] text-muted-foreground/50">
                Separate multiple emails with commas or new lines
              </p>
            </div>
            <Button
              className="w-full gap-2"
              onClick={handleSendEmails}
              disabled={sendingEmails || !inviteEmails.trim()}
            >
              {sendingEmails ? (
                <Restart className="h-4 w-4 animate-spin" />
              ) : (
                <Letter className="h-4 w-4" />
              )}
              {sendingEmails ? "Sending..." : "Send Invites"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Share link */}
            {!inviteLink ? (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleGenerateLink}
                disabled={generatingLink}
              >
                {generatingLink ? (
                  <Restart className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                Generate Share Link
              </Button>
            ) : (
              <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <Input value={inviteLink} readOnly className="text-xs h-9" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-9 w-9 shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Circle Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-1">
              <Logout className="h-5 w-5 text-red-500" />
            </div>
            <DialogTitle className="text-center">Leave this circle?</DialogTitle>
            <DialogDescription className="text-center">
              You&apos;ll lose access to all goals and activity in this circle. You can rejoin later if invited again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={leaving}
              className="gap-1.5 rounded-lg"
            >
              {leaving ? (
                <Restart className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Logout className="h-3.5 w-3.5" />
              )}
              {leaving ? "Leaving..." : "Yes, leave"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
              disabled={leaving}
              className="rounded-lg"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
