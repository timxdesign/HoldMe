"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ArrowLeft, Restart, Record } from "@solar-icons/react"

const emojis = ["🎯", "💪", "📚", "🏃", "🧘", "✍️", "🌱", "🔥", "💡", "🤝", "❤️", "⭐"]

export default function NewCirclePage() {
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🎯")
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

    const { data: circle, error } = await supabase
      .from("circles")
      .insert({ name: name.trim(), emoji, created_by: user.id })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    await supabase.from("circle_members").insert({
      circle_id: circle.id,
      user_id: user.id,
      role: "owner",
    })

    toast.success("Circle created!")
    router.push(`/circles/${circle.id}`)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10">
      <div
        className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      >
        <Link
          href="/circles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Circles
        </Link>
      </div>

      <div
        className={`transition-all duration-600 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand mb-3">
            <Record className="h-3 w-3" />
            New Circle
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create a circle
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            A group where everyone shares goals and keeps each other accountable.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pick an icon</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`h-10 w-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    emoji === e
                      ? "bg-brand/10 ring-2 ring-brand scale-110"
                      : "bg-muted/60 hover:bg-muted ring-1 ring-foreground/[0.06]"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Circle name
            </label>
            <Input
              id="name"
              placeholder="e.g., Morning Runners, Book Club Goals"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={60}
              className="h-10"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 gap-2"
            disabled={loading || !name.trim()}
          >
            {loading ? (
              <>
                <Restart className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Circle"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
