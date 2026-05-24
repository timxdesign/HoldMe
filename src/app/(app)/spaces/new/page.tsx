"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Lock, Users, Sparkles, Loader2 } from "lucide-react"

const visibilityOptions = [
  {
    value: "private",
    label: "Private",
    description: "Only people you invite can see and join",
    icon: Lock,
  },
  {
    value: "members_only",
    label: "Members Only",
    description: "Visible to all members, invite to join",
    icon: Users,
  },
]

export default function NewSpacePage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState("private")
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { setVisible(true) }, [])

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
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
      <div
        className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      >
        <Link
          href="/spaces"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Spaces
        </Link>
      </div>

      <div
        className={`transition-all duration-600 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand mb-3">
            <Sparkles className="h-3 w-3" />
            New Space
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create an accountability space
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            A shared space where you and your partners track goals, check in, and encourage each other.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Space name
            </label>
            <Input
              id="name"
              placeholder="e.g., 30 Day Discipline Challenge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-10"
            />
            <p className="text-[11px] text-muted-foreground">
              Choose something memorable that captures the mission.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="description"
              placeholder="What are you working toward together?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {description.length > 0 && (
              <p className="text-[11px] text-muted-foreground text-right">
                {description.length}/200
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Visibility</label>
            <div className="grid gap-3">
              {visibilityOptions.map((option) => {
                const isSelected = visibility === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVisibility(option.value)}
                    className={`relative flex items-start gap-3 rounded-xl p-4 text-left ring-1 transition-all ${
                      isSelected
                        ? "ring-brand bg-brand/5 shadow-sm"
                        : "ring-foreground/10 hover:ring-foreground/20 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-2 shrink-0 ${
                        isSelected ? "bg-brand/15" : "bg-muted"
                      }`}
                    >
                      <option.icon
                        className={`h-4 w-4 ${
                          isSelected ? "text-brand" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? "text-brand" : ""}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brand" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 gap-2"
            disabled={loading || !name.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Space"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
