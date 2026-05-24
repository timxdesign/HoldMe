import Link from "next/link"
import { Users, ChevronRight, Heart, Target, Lock, Globe } from "lucide-react"

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
  ownerName?: string
}

export function SpaceCard({ space, strengthCount = 0, ownerName }: SpaceCardProps) {
  const memberCount = space.space_members?.[0]?.count ?? 0
  const itemCount = space.accountability_items?.[0]?.count ?? 0
  const isPrivate = space.visibility === "private"

  return (
    <Link href={`/spaces/${space.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-all duration-300 hover:ring-brand/30 hover:shadow-lg hover:-translate-y-0.5">
        <div className="h-1 bg-gradient-to-r from-brand/60 via-brand-secondary/40 to-brand/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-[15px] truncate group-hover:text-brand transition-colors">
                  {space.name}
                </h3>
              </div>
              {ownerName && (
                <p className="text-[11px] text-muted-foreground mb-1">
                  by <span className="font-medium text-foreground/60">{ownerName}</span>
                </p>
              )}
              {space.description && (
                <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                  {space.description}
                </p>
              )}
            </div>
            <div className="shrink-0 flex flex-col items-center gap-2">
              {strengthCount > 0 && (
                <div className="flex items-center gap-1 bg-pink-500/10 text-pink-500 rounded-full px-2 py-0.5">
                  <Heart className="h-3 w-3 fill-current animate-pulse" />
                  <span className="text-[10px] font-bold">{strengthCount}</span>
                </div>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 transition-all duration-300 group-hover:text-brand group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>

        <div className="px-4 pb-3.5 pt-0">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
              <Users className="h-3 w-3" />
              <span className="font-medium">{memberCount}</span>
            </span>
            {itemCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1">
                <Target className="h-3 w-3" />
                <span className="font-medium">{itemCount}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1">
              {isPrivate ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
              <span className="font-medium">{isPrivate ? "Private" : "Open"}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
