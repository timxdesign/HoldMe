import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface SpaceCardProps {
  space: {
    id: string
    name: string
    description: string | null
    visibility: string
    space_members: { count: number }[] | null
  }
}

export function SpaceCard({ space }: SpaceCardProps) {
  const memberCount = space.space_members?.[0]?.count ?? 0

  return (
    <Link href={`/spaces/${space.id}`}>
      <Card className="hover:border-brand/30 transition-colors">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-1 min-w-0">
            <h3 className="font-medium truncate">{space.name}</h3>
            {space.description && (
              <p className="text-sm text-muted-foreground truncate">
                {space.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{memberCount}</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {space.visibility === "private" ? "Private" : "Members"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
