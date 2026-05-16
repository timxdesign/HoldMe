"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface InviteButtonProps {
  spaceId: string
}

export function InviteButton({ spaceId }: InviteButtonProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
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
        email: email || null,
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
    toast.success("Invite created!")
    setEmail("")
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" className="w-full gap-2" />}
      >
        <UserPlus className="h-4 w-4" />
        Invite Partner
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite an Accountability Partner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="partner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to generate a share link instead.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating invite..." : "Create Invite"}
          </Button>
        </form>

        {inviteLink && (
          <div className="space-y-2 pt-2 border-t">
            <Label>Share this link</Label>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="text-xs" />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
