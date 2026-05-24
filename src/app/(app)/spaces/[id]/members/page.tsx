import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MemberList } from "@/features/spaces/member-list"
import { InviteButton } from "@/features/spaces/invite-button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface MembersPageProps {
  params: Promise<{ id: string }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: space }, { data: members }] = await Promise.all([
    supabase.from("spaces").select("name, owner_id").eq("id", id).single(),
    supabase
      .from("space_members")
      .select("*, users(id, full_name, avatar_url)")
      .eq("space_id", id),
  ])

  if (!space) {
    notFound()
  }

  const isOwner = space.owner_id === user?.id

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <div className="space-y-4">
        <Link
          href={`/spaces/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to {space.name}
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Members</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {members?.length ?? 0} member{(members?.length ?? 0) !== 1 ? "s" : ""} in this space
            </p>
          </div>
          {isOwner && <InviteButton spaceId={id} />}
        </div>
      </div>

      <MemberList members={members ?? []} ownerId={space.owner_id} />
    </div>
  )
}
