import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Users — Admin",
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Badge variant="secondary">{users?.length ?? 0} total</Badge>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="grid grid-cols-[1fr_1fr_100px] gap-4 text-xs font-medium text-muted-foreground px-2">
            <span>User</span>
            <span>Email</span>
            <span>Joined</span>
          </div>
        </CardHeader>
        <CardContent className="divide-y">
          {users?.map((user) => {
            const initials = user.full_name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() ?? "?"

            return (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_1fr_100px] gap-4 items-center py-3 px-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {user.full_name ?? "—"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground truncate">
                  {user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
