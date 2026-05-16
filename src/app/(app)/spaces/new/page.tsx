"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TopBar } from "@/components/layout/top-bar"
import { toast } from "sonner"

export default function NewSpacePage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState("private")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
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

    const { data: space, error } = await supabase
      .from("spaces")
      .insert({
        name,
        description: description || null,
        owner_id: user.id,
        visibility,
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    await supabase.from("space_members").insert({
      space_id: space.id,
      user_id: user.id,
      role: "owner",
    })

    toast.success("Space created!")
    router.push(`/spaces/${space.id}`)
  }

  return (
    <>
      <TopBar title="Create Space" showCreate={false} />
      <div className="max-w-lg mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold">New Accountability Space</h2>
            <p className="text-sm text-muted-foreground">
              Create a space to track your goals and invite accountability
              partners.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Space name</Label>
                <Input
                  id="name"
                  placeholder="e.g., 30 Day Discipline Challenge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this space about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={(val) => setVisibility(val ?? "private")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      Private — Only invited members
                    </SelectItem>
                    <SelectItem value="members_only">
                      Members Only — Visible to all members
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Space"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
