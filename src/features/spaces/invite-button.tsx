"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Copy, Check, Mail, Link as LinkIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface InviteButtonProps {
  spaceId: string
}

export function InviteButton({ spaceId }: InviteButtonProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  async function handleEmailInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    const res = await fetch("/api/invite/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId, email }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error)
      return
    }

    setInviteLink(data.inviteLink)
    setEmailSent(true)
    if (data.isNewUser && data.emailSent) {
      toast.success("Invite sent! They'll be added automatically when they sign up.")
    } else if (data.isNewUser && !data.emailSent) {
      toast.success("Invite created! Share the link with them to sign up.")
    } else {
      toast.success("Invite created! Share the link with them.")
    }
    setEmail("")
  }

  async function handleGenerateLink() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("invites")
      .insert({
        space_id: spaceId,
        inviter_id: user.id,
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    const link = `${window.location.origin}/invite/${data.token}`
    setInviteLink(link)
    toast.success("Link created!")
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setEmail("")
    setInviteLink("")
    setEmailSent(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) handleReset()
      }}
    >
      <DialogTrigger
        render={<Button size="sm" variant="default" className="gap-1.5 rounded-lg" />}
      >
        <UserPlus className="h-3.5 w-3.5" />
        Invite
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a partner</DialogTitle>
          <DialogDescription>
            Send an email invite or generate a share link.
          </DialogDescription>
        </DialogHeader>

        {!emailSent && !inviteLink ? (
          <div className="space-y-4">
            <form onSubmit={handleEmailInvite} className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="invite-email" className="text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="partner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {loading ? "Sending..." : "Send Email Invite"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-popover px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGenerateLink}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              Generate Share Link
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {emailSent && (
              <div className="rounded-xl bg-green-500/10 p-3 text-center">
                <Mail className="h-5 w-5 text-green-600 mx-auto mb-1.5" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Invite sent!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  They&apos;ll be automatically added when they sign up.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Invite link</label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="text-xs h-10" />
                <Button size="icon" variant="outline" onClick={handleCopy} className="h-10 w-10 shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleReset}>
              Invite Another
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
