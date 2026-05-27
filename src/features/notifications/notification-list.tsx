"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow, isToday, isYesterday } from "date-fns"
import {
  Heart,
  ChatRound,
  ClockCircle,
  UserPlus,
  CheckCircle,
  DangerCircle,
  Record,
  Restart,
  CloseCircle,
  AltArrowDown,
} from "@solar-icons/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ── Types ──

interface NotificationData {
  invite_id?: string
  space_id?: string
  space_name?: string
  inviter_name?: string
  sender_name?: string
  item_id?: string
  item_title?: string
  circle_id?: string
  goal_id?: string
  token?: string
  url?: string
  [key: string]: unknown
}

interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

interface GroupedNotification {
  key: string
  type: string
  items: Notification[]
  latestAt: string
  hasUnread: boolean
}

interface NotificationListProps {
  notifications: Notification[]
}

// ── Config ──

const typeConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}> = {
  strength: { icon: Heart, color: "text-pink-500", bg: "bg-pink-500/8" },
  comment: { icon: ChatRound, color: "text-brand", bg: "bg-brand/8" },
  reminder: { icon: ClockCircle, color: "text-blue-500", bg: "bg-blue-500/8" },
  invite: { icon: UserPlus, color: "text-green-500", bg: "bg-green-500/8" },
  checkin: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/8" },
  missed: { icon: DangerCircle, color: "text-red-400", bg: "bg-red-500/8" },
  circle_checkin: { icon: Record, color: "text-teal-500", bg: "bg-teal-500/8" },
}

const defaultConfig = { icon: ClockCircle, color: "text-muted-foreground", bg: "bg-muted" }

// ── Grouping logic ──

function getGroupKey(n: Notification): string {
  const d = n.data as NotificationData | null
  switch (n.type) {
    case "invite":
      return `invite:${n.id}`
    case "strength":
      return d?.item_id ? `strength:${d.item_id}` : `strength:${n.id}`
    case "circle_checkin":
      return d?.circle_id ? `circle_checkin:${d.circle_id}` : `circle_checkin:${n.id}`
    case "comment":
      return d?.item_id ? `comment:${d.item_id}` : `comment:${n.id}`
    case "missed":
      return d?.item_id ? `missed:${d.item_id}` : `missed:${n.id}`
    default:
      return `${n.type}:${n.id}`
  }
}

function buildGroups(items: Notification[]): GroupedNotification[] {
  const map = new Map<string, GroupedNotification>()
  const order: string[] = []

  for (const n of items) {
    const key = getGroupKey(n)
    const existing = map.get(key)
    if (existing) {
      existing.items.push(n)
      if (!n.read) existing.hasUnread = true
      if (n.created_at > existing.latestAt) existing.latestAt = n.created_at
    } else {
      map.set(key, {
        key,
        type: n.type,
        items: [n],
        latestAt: n.created_at,
        hasUnread: !n.read,
      })
      order.push(key)
    }
  }

  return order.map((k) => map.get(k)!)
}

function getGroupSummary(group: GroupedNotification): { title: string; body: string } {
  const first = group.items[0]
  const d = first.data as NotificationData | null
  const count = group.items.length

  if (count === 1) {
    return { title: first.title, body: first.body !== first.title ? first.body : "" }
  }

  const names = group.items
    .map((n) => {
      const nd = n.data as NotificationData | null
      return nd?.sender_name ?? nd?.inviter_name ?? null
    })
    .filter((n): n is string => n !== null)
  const uniqueNames = [...new Set(names)]

  const nameStr = formatNames(uniqueNames, count)
  const context = d?.item_title ? `"${d.item_title}"` : ""

  switch (group.type) {
    case "strength":
      return {
        title: `${nameStr} sent you strength`,
        body: context ? `On ${context}` : "",
      }
    case "circle_checkin":
      return {
        title: `${count} check-ins in your circle`,
        body: first.body,
      }
    case "comment":
      return {
        title: `${nameStr} commented`,
        body: context ? `On ${context}` : "",
      }
    case "missed":
      return {
        title: `${count} missed check-in${count > 1 ? "s" : ""}`,
        body: context ? `On ${context}` : "",
      }
    default:
      return { title: first.title, body: first.body }
  }
}

function formatNames(names: string[], totalCount: number): string {
  if (names.length === 0) return `${totalCount} people`
  if (names.length === 1 && totalCount === 1) return names[0]
  if (names.length === 1 && totalCount > 1) return `${names[0]} and ${totalCount - 1} other${totalCount - 1 > 1 ? "s" : ""}`
  if (names.length === 2 && totalCount === 2) return `${names[0]} and ${names[1]}`
  return `${names[0]}, ${names[1]} and ${totalCount - 2} other${totalCount - 2 > 1 ? "s" : ""}`
}

// ── Time bucketing ──

function bucketByTime(groups: GroupedNotification[]) {
  const today: GroupedNotification[] = []
  const yesterday: GroupedNotification[] = []
  const earlier: GroupedNotification[] = []

  for (const g of groups) {
    const d = new Date(g.latestAt)
    if (isToday(d)) today.push(g)
    else if (isYesterday(d)) yesterday.push(g)
    else earlier.push(g)
  }

  return { today, yesterday, earlier }
}

// ── Animation primitive ──

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div
      className={cn(
        "transition-all ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className
      )}
      style={{ transitionDuration: "500ms", transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ── Main component ──

export function NotificationList({ notifications }: NotificationListProps) {
  const [items, setItems] = useState(notifications)
  const supabase = createClient()
  const router = useRouter()

  const unreadCount = items.filter((n) => !n.read).length

  async function markAsRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function markGroupRead(ids: string[]) {
    const unread = ids.filter((id) => !items.find((n) => n.id === id)?.read)
    if (unread.length === 0) return
    await supabase.from("notifications").update({ read: true }).in("id", unread)
    setItems((prev) =>
      prev.map((n) => (unread.includes(n.id) ? { ...n, read: true } : n))
    )
  }

  async function markAllRead() {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds)
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function handleClick(n: Notification) {
    markAsRead(n.id)
    const d = n.data as NotificationData | null
    if (n.type === "invite" && d?.invite_id) return

    if (n.type === "comment" && d?.space_id && d?.item_id) {
      router.push(`/spaces/${d.space_id}/goals/${d.item_id}`)
      return
    }

    if (n.type === "strength" && d?.space_id && d?.item_id) {
      router.push(`/spaces/${d.space_id}/goals/${d.item_id}`)
      return
    }

    const url = d?.url ?? (d?.space_id ? `/spaces/${d.space_id}` : null)
    if (url) router.push(url)
  }

  if (items.length === 0) {
    return (
      <FadeUp className="text-center py-20">
        <div className="rounded-2xl bg-muted/30 p-5 inline-block mb-4">
          <CheckCircle className="h-6 w-6 text-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-muted-foreground/60">All caught up</p>
        <p className="text-xs text-muted-foreground/30 mt-1">
          Encouragement and updates will appear here.
        </p>
      </FadeUp>
    )
  }

  const groups = buildGroups(items)
  const { today, yesterday, earlier } = bucketByTime(groups)

  let delayOffset = 0

  return (
    <div className="space-y-6">
      {unreadCount > 0 && (
        <FadeUp>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/40">
              {unreadCount} unread
            </span>
            <button
              onClick={markAllRead}
              className="text-xs text-brand font-medium hover:underline"
            >
              Mark all read
            </button>
          </div>
        </FadeUp>
      )}

      {today.length > 0 && (
        <TimeBucket
          label="Today"
          groups={today}
          onGroupClick={handleClick}
          onMarkRead={markAsRead}
          onMarkGroupRead={markGroupRead}
          baseDelay={(delayOffset += 40, delayOffset)}
        />
      )}

      {yesterday.length > 0 && (
        <TimeBucket
          label="Yesterday"
          groups={yesterday}
          onGroupClick={handleClick}
          onMarkRead={markAsRead}
          onMarkGroupRead={markGroupRead}
          baseDelay={(delayOffset += today.length * 50 + 40, delayOffset)}
        />
      )}

      {earlier.length > 0 && (
        <TimeBucket
          label="Earlier"
          groups={earlier}
          onGroupClick={handleClick}
          onMarkRead={markAsRead}
          onMarkGroupRead={markGroupRead}
          baseDelay={(delayOffset += yesterday.length * 50 + 40, delayOffset)}
        />
      )}
    </div>
  )
}

// ── Time bucket ──

function TimeBucket({
  label,
  groups,
  onGroupClick,
  onMarkRead,
  onMarkGroupRead,
  baseDelay,
}: {
  label: string
  groups: GroupedNotification[]
  onGroupClick: (n: Notification) => void
  onMarkRead: (id: string) => void
  onMarkGroupRead: (ids: string[]) => void
  baseDelay: number
}) {
  return (
    <section>
      <FadeUp delay={baseDelay}>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-2 px-1">
          {label}
        </h3>
      </FadeUp>
      <div className="space-y-1.5">
        {groups.map((group, i) => (
          <GroupRow
            key={group.key}
            group={group}
            onItemClick={onGroupClick}
            onMarkRead={onMarkRead}
            onMarkGroupRead={onMarkGroupRead}
            delay={baseDelay + (i + 1) * 50}
          />
        ))}
      </div>
    </section>
  )
}

// ── Group row ──

function GroupRow({
  group,
  onItemClick,
  onMarkRead,
  onMarkGroupRead,
  delay,
}: {
  group: GroupedNotification
  onItemClick: (n: Notification) => void
  onMarkRead: (id: string) => void
  onMarkGroupRead: (ids: string[]) => void
  delay: number
}) {
  const [expanded, setExpanded] = useState(false)
  const isSingle = group.items.length === 1
  const isInviteGroup = group.type === "invite"
  const config = typeConfig[group.type] ?? defaultConfig
  const Icon = config.icon

  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  if (isSingle || isInviteGroup) {
    return (
      <>
        {group.items.map((n, i) => (
          <SingleRow
            key={n.id}
            notification={n}
            onClick={() => onItemClick(n)}
            onMarkRead={() => onMarkRead(n.id)}
            delay={delay + i * 40}
          />
        ))}
      </>
    )
  }

  const summary = getGroupSummary(group)

  function handleGroupClick() {
    setExpanded((prev) => !prev)
    if (!expanded) {
      onMarkGroupRead(group.items.map((n) => n.id))
    }
  }

  return (
    <div
      className={cn(
        "transition-all ease-out",
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
      )}
      style={{ transitionDuration: "400ms", transitionDelay: `${delay}ms` }}
    >
      {/* Collapsed header */}
      <button
        onClick={handleGroupClick}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-left transition-colors",
          group.hasUnread ? "bg-brand/[0.03]" : "",
          expanded ? "bg-muted/30" : "hover:bg-muted/40"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="relative shrink-0 mt-0.5">
            <div className={cn("rounded-full p-1.5", config.bg)}>
              <Icon className={cn("h-3.5 w-3.5", config.color)} />
            </div>
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-4 rounded-full bg-foreground/80 text-background text-[9px] font-bold px-1">
              {group.items.length}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm leading-snug", group.hasUnread && "font-medium")}>
              {summary.title}
            </p>
            {summary.body && (
              <p className="text-xs text-muted-foreground/50 mt-0.5 line-clamp-1">
                {summary.body}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/30 mt-1">
              {formatDistanceToNow(new Date(group.latestAt), { addSuffix: true })}
            </p>
          </div>
          <AltArrowDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-1 transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded children */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-6 border-l-2 border-foreground/[0.04] ml-7 mt-1 mb-2 space-y-0.5">
          {group.items.map((n, i) => (
            <ExpandedItem
              key={n.id}
              notification={n}
              onClick={() => onItemClick(n)}
              index={i}
              visible={expanded}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Single notification row (ungrouped or invite) ──

function SingleRow({
  notification,
  onClick,
  onMarkRead,
  delay,
}: {
  notification: Notification
  onClick: () => void
  onMarkRead: () => void
  delay: number
}) {
  const config = typeConfig[notification.type] ?? defaultConfig
  const Icon = config.icon
  const nd = notification.data as NotificationData | null
  const isInvite = notification.type === "invite" && nd?.invite_id

  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div
      className={cn(
        "transition-all ease-out",
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
      )}
      style={{ transitionDuration: "400ms", transitionDelay: `${delay}ms` }}
    >
      <div
        onClick={isInvite ? undefined : onClick}
        className={cn(
          "rounded-xl px-4 py-3 transition-colors",
          !notification.read && "bg-brand/[0.03]",
          !isInvite && "cursor-pointer hover:bg-muted/40"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("rounded-full p-1.5 mt-0.5 shrink-0", config.bg)}>
            <Icon className={cn("h-3.5 w-3.5", config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm leading-snug", !notification.read && "font-medium")}>
              {notification.title}
            </p>
            {notification.body !== notification.title && (
              <p className="text-xs text-muted-foreground/50 mt-0.5 line-clamp-2">
                {notification.body}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/30 mt-1.5">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>

            {isInvite && (
              <InviteActions notification={notification} onDone={onMarkRead} />
            )}
          </div>
          {!notification.read && !isInvite && (
            <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-2 animate-in fade-in duration-500" />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Expanded item inside a group ──

function ExpandedItem({
  notification,
  onClick,
  index,
  visible,
}: {
  notification: Notification
  onClick: () => void
  index: number
  visible: boolean
}) {
  const nd = notification.data as NotificationData | null
  const name = nd?.sender_name ?? nd?.inviter_name

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-muted/40 transition-all duration-200",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      )}
      style={{ transitionDelay: visible ? `${index * 40}ms` : "0ms" }}
    >
      {name && (
        <span className="h-5 w-5 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center shrink-0">
          <span className="text-[8px] font-bold text-foreground/50">
            {name.charAt(0).toUpperCase()}
          </span>
        </span>
      )}
      <span className="flex-1 min-w-0 truncate text-muted-foreground">
        {notification.title}
      </span>
      <span className="text-[10px] text-muted-foreground/30 shrink-0">
        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
      </span>
    </button>
  )
}

// ── Invite actions ──

function InviteActions({
  notification,
  onDone,
}: {
  notification: Notification
  onDone: () => void
}) {
  const [status, setStatus] = useState<"idle" | "accepting" | "declining" | "accepted" | "declined">("idle")
  const supabase = createClient()
  const router = useRouter()

  const nd = notification.data as NotificationData | null
  const inviteId = nd?.invite_id
  const spaceId = nd?.space_id

  if (!inviteId || !spaceId) return null

  if (status === "accepted") {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium animate-in fade-in duration-300">
        <CheckCircle className="h-3.5 w-3.5" />
        Joined — redirecting...
      </div>
    )
  }

  if (status === "declined") {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/50 animate-in fade-in duration-300">
        <CloseCircle className="h-3.5 w-3.5" />
        Declined
      </div>
    )
  }

  async function handleAccept() {
    setStatus("accepting")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Not authenticated")
      setStatus("idle")
      return
    }

    const { error: memberError } = await supabase
      .from("space_members")
      .insert({ space_id: spaceId!, user_id: user.id, role: "partner" })

    if (memberError && !memberError.message.includes("duplicate")) {
      toast.error("Failed to join space")
      setStatus("idle")
      return
    }

    await supabase
      .from("invites")
      .update({ status: "accepted" })
      .eq("id", inviteId!)

    setStatus("accepted")
    onDone()
    toast.success(`Joined ${nd?.space_name ?? "space"}!`)

    setTimeout(() => router.push(`/spaces/${spaceId}`), 1200)
  }

  async function handleDecline() {
    setStatus("declining")

    await supabase
      .from("invites")
      .update({ status: "declined" })
      .eq("id", inviteId!)

    setStatus("declined")
    onDone()
  }

  return (
    <div className="flex items-center gap-2 mt-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <Button
        size="sm"
        className="h-8 rounded-lg text-xs gap-1.5 px-4"
        onClick={handleAccept}
        disabled={status === "accepting" || status === "declining"}
      >
        {status === "accepting" ? (
          <Restart className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        )}
        {status === "accepting" ? "Joining..." : "Accept"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground"
        onClick={handleDecline}
        disabled={status === "accepting" || status === "declining"}
      >
        {status === "declining" ? "..." : "Decline"}
      </Button>
    </div>
  )
}
