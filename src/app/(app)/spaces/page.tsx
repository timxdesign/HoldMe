import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/layout/top-bar"
import { SpaceCard } from "@/features/spaces/space-card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Spaces",
}

export default async function SpacesPage() {
  const supabase = await createClient()

  const { data: spaces } = await supabase
    .from("spaces")
    .select("*, space_members(count)")
    .order("updated_at", { ascending: false })

  return (
    <>
      <TopBar title="Spaces" />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Button asChild className="w-full gap-2">
          <Link href="/spaces/new">
            <Plus className="h-4 w-4" />
            Create New Space
          </Link>
        </Button>

        {spaces && spaces.length > 0 ? (
          <div className="grid gap-3">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-2">
              You haven&apos;t created or joined any spaces yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Create a space to start tracking your goals with trusted people.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
