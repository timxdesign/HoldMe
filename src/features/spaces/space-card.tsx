import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Users, ChevronRight, Heart, Target } from "lucide-react"

interface SpaceCardProps {
  space: {
    id: string
    name: string
    description: string | null
    visibility: string
    space_members: { count: number }[] | null
    accountability_items?: { count: number }[] | null
  }
  strengthCount?: number
}

export function SpaceCard({ space, strengthCount = 0 }: SpaceCardProps) {
  const memberCount = space.space_members?.[0]?.count ?? 0
  const itemCount = space.accountability_items?.[0]?.count ?? 0

  return (
    <Link href={`/spaces/${space.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 p-4 transition-all duration-200 hover:ring-brand/30 hover:shadow-md">
        {strengthCount > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-pink-500/10 text-pink-500 rounded-full px-2 py-0.5 animate-pulse">
            <Heart className="h-3 w-3 fill-current" />
            <span className="text-[10px] font-semibold">{strengthCount}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{space.name}</h3>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {space.visibility === "private" ? "Private" : "Open"}
              </Badge>
            </div>
            {space.description && (
              <p className="text-sm text-muted-foreground truncate mb-3">
                {space.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
              {itemCount > 0 && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {itemCount} goal{itemCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}
