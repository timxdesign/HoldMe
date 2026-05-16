import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { ItemList } from "@/features/items/item-list"
import { MemberList } from "@/features/spaces/member-list"
import { InviteButton } from "@/features/spaces/invite-button"
import { AddItemForm } from "@/features/items/add-item-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SpacePageProps {
  params: Promise<{ id: string }>
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: space } = await supabase
    .from("spaces")
    .select("*")
    .eq("id", id)
    .single()

  if (!space) {
    notFound()
  }

  const { data: items } = await supabase
    .from("accountability_items")
    .select("*")
    .eq("space_id", id)
    .order("created_at", { ascending: false })

  const { data: members } = await supabase
    .from("space_members")
    .select("*, users(id, full_name, avatar_url)")
    .eq("space_id", id)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = space.owner_id === user?.id

  return (
    <>
      <TopBar title={space.name} showCreate={false} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {space.description && (
          <p className="text-sm text-muted-foreground">{space.description}</p>
        )}

        <Tabs defaultValue="items" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="items" className="flex-1">
              Items
            </TabsTrigger>
            <TabsTrigger value="members" className="flex-1">
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4 mt-4">
            {isOwner && <AddItemForm spaceId={id} />}
            <ItemList items={items ?? []} currentUserId={user?.id ?? ""} />
          </TabsContent>

          <TabsContent value="members" className="space-y-4 mt-4">
            {isOwner && <InviteButton spaceId={id} />}
            <MemberList members={members ?? []} ownerId={space.owner_id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
