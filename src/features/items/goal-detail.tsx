"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FadeIn } from "@/components/ui/fade-in"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  ChatRound,
  CheckCircle,
  Heart,
  MenuDots,
  Pen2,
  Restart,
  Target,
  TrashBinTrash,
} from "@solar-icons/react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  userId: string
  content: string
  parentId: string | null
  createdAt: string
  userName: string
  avatarUrl: string | null
}

interface Strength {
  id: string
  senderId: string
  senderName: string
  message: string | null
  createdAt: string
}

interface GoalDetailProps {
  spaceId: string
  goalId: string
  title: string
  description: string | null
  status: string
  frequency: string
  goalOwnerId: string
  goalOwnerName: string
  currentUserId: string
  isSpaceOwner: boolean
  isGoalOwner: boolean
  comments: Comment[]
  strengths: Strength[]
  memberMap: Record<string, { name: string; avatarUrl: string | null }>
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  one_time: "Once",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function CommentRow({
  comment,
  hasThreadLine,
  onReply,
  onDelete,
  isOwn,
  isNew,
  replyCount,
}: {
  comment: Comment
  hasThreadLine: boolean
  onReply: (commentId: string, userName: string) => void
  onDelete?: (commentId: string) => void
  isOwn: boolean
  isNew: boolean
  replyCount?: number
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className={cn("relative group/comment", isNew && "animate-in fade-in slide-in-from-bottom-3 duration-400")}>
      <div className="flex gap-3 items-start">
        {/* Avatar column with optional thread line */}
        <div className="relative flex flex-col items-center shrink-0">
          <Avatar size="sm" className="relative z-[1]">
            <AvatarFallback className="text-[10px] bg-foreground/[0.06]">
              {getInitials(comment.userName)}
            </AvatarFallback>
          </Avatar>
          {hasThreadLine && (
            <div className="w-[2px] bg-foreground/[0.08] flex-1 mt-1.5 rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[13px] font-semibold truncate">{comment.userName}</span>
            <span className="text-[11px] text-muted-foreground shrink-0">
              · {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false })}
            </span>
          </div>
          <p className="text-[14px] leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onReply(comment.id, comment.userName)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-brand transition-colors group/reply"
            >
              <ChatRound className="h-3.5 w-3.5 group-hover/reply:scale-110 transition-transform" />
              {replyCount !== undefined && replyCount > 0 && (
                <span className="text-[11px]">{replyCount}</span>
              )}
            </button>
            {isOwn && onDelete && (
              confirmDelete ? (
                <span className="flex items-center gap-2 animate-in fade-in duration-200">
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-[11px] font-medium text-destructive hover:underline transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-muted-foreground/0 group-hover/comment:text-muted-foreground hover:!text-destructive transition-colors"
                >
                  <TrashBinTrash className="h-3.5 w-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InlineReplyInput({
  replyUserName,
  currentUserName,
  value,
  onChange,
  onSubmit,
  onCancel,
  posting,
  inputRef,
}: {
  replyUserName: string
  currentUserName: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  posting: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* "Replying to" label with thread line */}
      <div className="flex gap-3 items-stretch ml-[3px]">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-[2px] bg-foreground/[0.08] flex-1 rounded-full ml-[12px]" />
        </div>
        <div className="flex items-center gap-1 py-2">
          <span className="text-[12px] text-muted-foreground">
            Replying to <span className="text-brand font-medium">{replyUserName}</span>
          </span>
          <button
            onClick={onCancel}
            className="text-[11px] text-muted-foreground/50 hover:text-foreground ml-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Input row with current user avatar */}
      <div className="flex gap-3 items-start mt-0.5">
        <Avatar size="sm" className="shrink-0 mt-1.5">
          <AvatarFallback className="text-[10px] bg-foreground/[0.06]">
            {getInitials(currentUserName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 flex items-start gap-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSubmit()
              }
            }}
            placeholder="Post your reply"
            rows={1}
            className="w-full bg-transparent text-[14px] outline-none resize-none placeholder:text-muted-foreground/40 py-1.5 leading-relaxed"
            autoFocus
          />
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!value.trim() || posting}
            className="h-8 rounded-full text-xs px-4 shrink-0 mt-0.5"
          >
            {posting ? <Restart className="h-3 w-3 animate-spin" /> : "Reply"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function CommentThread({
  comment,
  replies,
  currentUserId,
  onReply,
  onDelete,
  newCommentIds,
  isReplyActive,
  replyUserName,
  currentUserName,
  replyValue,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
  replyPosting,
  replyInputRef,
}: {
  comment: Comment
  replies: Comment[]
  currentUserId: string
  onReply: (commentId: string, userName: string) => void
  onDelete: (commentId: string) => void
  newCommentIds: Set<string>
  isReplyActive: boolean
  replyUserName: string
  currentUserName: string
  replyValue: string
  onReplyChange: (v: string) => void
  onReplySubmit: () => void
  onReplyCancel: () => void
  replyPosting: boolean
  replyInputRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  const [collapsed, setCollapsed] = useState(replies.length > 3)
  const visibleReplies = collapsed ? replies.slice(-2) : replies
  const hiddenCount = replies.length - visibleReplies.length
  const hasRepliesOrActiveReply = replies.length > 0 || isReplyActive

  return (
    <div>
      {/* Parent comment — show thread line if it has replies or active reply input */}
      <CommentRow
        comment={comment}
        hasThreadLine={hasRepliesOrActiveReply}
        onReply={onReply}
        onDelete={onDelete}
        isOwn={comment.userId === currentUserId}
        isNew={newCommentIds.has(comment.id)}
        replyCount={replies.length}
      />

      {/* "Show more" collapsed indicator */}
      {hiddenCount > 0 && (
        <div className="flex gap-3 items-center ml-[3px] mb-0.5">
          <div className="w-[2px] self-stretch bg-foreground/[0.08] rounded-full ml-[12px]" />
          <button
            onClick={() => setCollapsed(false)}
            className="text-[12px] font-medium text-brand hover:underline py-1.5 flex items-center gap-1.5 transition-colors"
          >
            Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
          </button>
        </div>
      )}

      {/* Replies */}
      {visibleReplies.map((reply, i) => {
        const isLast = i === visibleReplies.length - 1 && !isReplyActive
        return (
          <div key={reply.id} className="ml-[3px]" style={{ animationDelay: `${i * 40}ms` }}>
            <CommentRow
              comment={reply}
              hasThreadLine={!isLast}
              onReply={(_, userName) => onReply(comment.id, userName)}
              onDelete={onDelete}
              isOwn={reply.userId === currentUserId}
              isNew={newCommentIds.has(reply.id)}
            />
          </div>
        )
      })}

      {/* Inline reply input */}
      {isReplyActive && (
        <div className={replies.length > 0 ? "ml-[3px]" : ""}>
          <InlineReplyInput
            replyUserName={replyUserName}
            currentUserName={currentUserName}
            value={replyValue}
            onChange={onReplyChange}
            onSubmit={onReplySubmit}
            onCancel={onReplyCancel}
            posting={replyPosting}
            inputRef={replyInputRef}
          />
        </div>
      )}
    </div>
  )
}

function OwnerStrengthBreakdown({
  strengths,
  memberMap,
}: {
  strengths: Strength[]
  memberMap: Record<string, { name: string; avatarUrl: string | null }>
}) {
  const perUser: Record<string, { name: string; count: number }> = {}
  for (const s of strengths) {
    if (!perUser[s.senderId]) {
      perUser[s.senderId] = {
        name: memberMap[s.senderId]?.name ?? s.senderName,
        count: 0,
      }
    }
    perUser[s.senderId].count++
  }

  const sorted = Object.entries(perUser).sort((a, b) => b[1].count - a[1].count)

  return (
    <div className="space-y-1.5">
      {sorted.map(([userId, data], i) => (
        <div
          key={userId}
          className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2 duration-300"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Avatar size="sm" className="shrink-0 !size-5">
            <AvatarFallback className="text-[9px] bg-foreground/[0.06]">
              {getInitials(data.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs flex-1 truncate">{data.name}</span>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-pink-400 fill-pink-400" />
            <span className="text-xs font-semibold tabular-nums">{data.count}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function GoalDetail({
  spaceId,
  goalId,
  title,
  description,
  status,
  frequency,
  goalOwnerId,
  goalOwnerName,
  currentUserId,
  isSpaceOwner,
  isGoalOwner,
  comments: initialComments,
  strengths: initialStrengths,
  memberMap,
}: GoalDetailProps) {
  const [comments, setComments] = useState(initialComments)
  const [strengths, setStrengths] = useState(initialStrengths)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(null)
  const [posting, setPosting] = useState(false)
  const [sendingStrength, setSendingStrength] = useState(false)
  const [strengthPulse, setStrengthPulse] = useState(false)
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingGoal, setDeletingGoal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editDescription, setEditDescription] = useState(description ?? "")
  const [savingEdit, setSavingEdit] = useState(false)
  const [localTitle, setLocalTitle] = useState(title)
  const [localDescription, setLocalDescription] = useState(description)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const currentUserName = memberMap[currentUserId]?.name ?? "You"
  const myStrengthCount = strengths.filter((s) => s.senderId === currentUserId).length
  const totalStrengthCount = strengths.length

  const handleRealtimeComment = useCallback(
    (payload: { new: { id: string; user_id: string; content: string; parent_id: string | null; created_at: string; item_id: string } }) => {
      const c = payload.new
      if (c.item_id !== goalId || c.user_id === currentUserId) return
      const member = memberMap[c.user_id]
      const newC: Comment = {
        id: c.id,
        userId: c.user_id,
        content: c.content,
        parentId: c.parent_id,
        createdAt: c.created_at,
        userName: member?.name ?? "Someone",
        avatarUrl: member?.avatarUrl ?? null,
      }
      setComments((prev) => [...prev, newC])
      setNewCommentIds((prev) => new Set(prev).add(c.id))
    },
    [goalId, currentUserId, memberMap]
  )

  const handleRealtimeStrength = useCallback(
    (payload: { new: { id: string; sender_id: string; item_id: string; message: string | null; created_at: string } }) => {
      const s = payload.new
      if (s.item_id !== goalId || s.sender_id === currentUserId) return
      const member = memberMap[s.sender_id]
      setStrengths((prev) => [
        ...prev,
        {
          id: s.id,
          senderId: s.sender_id,
          senderName: member?.name ?? "Someone",
          message: s.message,
          createdAt: s.created_at,
        },
      ])
      setStrengthPulse(true)
      setTimeout(() => setStrengthPulse(false), 600)
    },
    [goalId, currentUserId, memberMap]
  )

  useEffect(() => {
    const channel = supabase
      .channel(`goal-${goalId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `item_id=eq.${goalId}` }, handleRealtimeComment)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "strengths", filter: `item_id=eq.${goalId}` }, handleRealtimeStrength)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [goalId, supabase, handleRealtimeComment, handleRealtimeStrength])

  function handleReply(commentId: string, userName: string) {
    setReplyTo({ id: commentId, userName })
    inputRef.current?.focus()
  }

  async function handleDeleteComment(commentId: string) {
    const { error } = await supabase.from("comments").delete().eq("id", commentId)
    if (error) {
      toast.error("Failed to delete comment")
      return
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId))
    if (replyTo?.id === commentId) {
      setReplyTo(null)
      setNewComment("")
    }
  }

  async function handlePost() {
    const content = newComment.trim()
    if (!content || posting) return

    setPosting(true)

    const insertData: { item_id: string; user_id: string; content: string; parent_id?: string } = {
      item_id: goalId,
      user_id: currentUserId,
      content,
    }
    if (replyTo) {
      insertData.parent_id = replyTo.id
    }

    const { data, error } = await supabase
      .from("comments")
      .insert(insertData)
      .select("id, created_at")
      .single()

    setPosting(false)

    if (error || !data) {
      toast.error("Failed to post comment")
      return
    }

    const newC: Comment = {
      id: data.id,
      userId: currentUserId,
      content,
      parentId: replyTo?.id ?? null,
      createdAt: data.created_at,
      userName: memberMap[currentUserId]?.name ?? "You",
      avatarUrl: memberMap[currentUserId]?.avatarUrl ?? null,
    }

    setComments((prev) => [...prev, newC])
    setNewCommentIds((prev) => new Set(prev).add(data.id))
    setNewComment("")
    setReplyTo(null)
  }

  async function handleSendStrength() {
    if (sendingStrength || isGoalOwner) return

    setSendingStrength(true)

    const { error } = await supabase.from("strengths").insert({
      item_id: goalId,
      sender_id: currentUserId,
      receiver_id: goalOwnerId,
    })

    setSendingStrength(false)

    if (error) {
      toast.error("Could not send strength")
      return
    }

    const newS: Strength = {
      id: crypto.randomUUID(),
      senderId: currentUserId,
      senderName: memberMap[currentUserId]?.name ?? "You",
      message: null,
      createdAt: new Date().toISOString(),
    }

    setStrengths((prev) => [...prev, newS])
    setStrengthPulse(true)
    setTimeout(() => setStrengthPulse(false), 600)
    toast.success("Strength sent!")
  }

  async function handleDeleteGoal() {
    setDeletingGoal(true)
    const { error } = await supabase
      .from("accountability_items")
      .delete()
      .eq("id", goalId)

    if (error) {
      setDeletingGoal(false)
      setShowDeleteConfirm(false)
      toast.error("Failed to delete goal")
      return
    }

    toast.success("Goal deleted")
    router.push(`/spaces/${spaceId}`)
  }

  function startEditing() {
    setEditTitle(localTitle)
    setEditDescription(localDescription ?? "")
    setEditing(true)
    setShowDeleteConfirm(false)
  }

  async function handleSaveEdit() {
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      toast.error("Title can't be empty")
      return
    }

    setSavingEdit(true)
    const { error } = await supabase
      .from("accountability_items")
      .update({
        title: trimmedTitle,
        description: editDescription.trim() || null,
      })
      .eq("id", goalId)

    setSavingEdit(false)

    if (error) {
      toast.error("Failed to update goal")
      return
    }

    setLocalTitle(trimmedTitle)
    setLocalDescription(editDescription.trim() || null)
    setEditing(false)
    toast.success("Goal updated")
  }

  const topLevelComments = comments
    .filter((c) => !c.parentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const repliesByParent: Record<string, Comment[]> = {}
  for (const c of comments) {
    if (c.parentId) {
      if (!repliesByParent[c.parentId]) repliesByParent[c.parentId] = []
      repliesByParent[c.parentId].push(c)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 flex flex-col min-h-[calc(100vh-64px)]">
      {/* Header */}
      <FadeIn>
        <Link
          href={`/spaces/${spaceId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-foreground/[0.04] p-2.5 shrink-0 mt-0.5">
            <Target className="h-4 w-4 text-foreground/60" />
          </div>

          {editing ? (
            <div className="flex-1 min-w-0 animate-in fade-in duration-200">
              <div className="space-y-2.5">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={80}
                  placeholder="Goal title"
                  autoFocus
                  className="w-full bg-foreground/[0.03] rounded-lg ring-1 ring-foreground/[0.08] px-3 py-2 text-sm font-medium outline-none focus:ring-foreground/20 transition-colors"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  placeholder="Description (optional)"
                  className="w-full bg-foreground/[0.03] rounded-lg ring-1 ring-foreground/[0.08] px-3 py-2 text-sm outline-none focus:ring-foreground/20 transition-colors resize-none"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={savingEdit || !editTitle.trim()}
                    className="h-8 rounded-lg text-xs gap-1.5 px-4"
                  >
                    {savingEdit ? (
                      <Restart className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {savingEdit ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    disabled={savingEdit}
                    className="h-8 rounded-lg text-xs text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-heading leading-tight">{localTitle}</h1>
              {localDescription && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {localDescription}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-foreground/[0.04] text-muted-foreground">
                  {frequencyLabels[frequency] ?? frequency}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-foreground/[0.04] text-muted-foreground capitalize">
                  {status}
                </span>
                {!isGoalOwner && (
                  <span className="text-[11px] text-muted-foreground">
                    by {goalOwnerName}
                  </span>
                )}
              </div>
            </div>
          )}

          {(isGoalOwner || isSpaceOwner) && !editing && (
            <DropdownMenu>
              <DropdownMenuTrigger className="shrink-0 p-1.5 -mr-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-foreground/[0.04] transition-colors data-popup-open:text-foreground data-popup-open:bg-foreground/[0.04]">
                <MenuDots className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                <DropdownMenuItem onClick={startEditing}>
                  <Pen2 className="h-3.5 w-3.5" />
                  Edit goal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <TrashBinTrash className="h-3.5 w-3.5" />
                  Delete goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="mt-4 rounded-xl ring-1 ring-destructive/20 bg-destructive/[0.03] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-sm font-medium">Delete this goal?</p>
            <p className="text-xs text-muted-foreground mt-1">
              This will permanently remove the goal, all check-ins, comments, and strength received. This can't be undone.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteGoal}
                disabled={deletingGoal}
                className="h-8 rounded-lg text-xs gap-1.5 px-4"
              >
                {deletingGoal ? (
                  <Restart className="h-3 w-3 animate-spin" />
                ) : (
                  <TrashBinTrash className="h-3 w-3" />
                )}
                {deletingGoal ? "Deleting..." : "Yes, delete"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingGoal}
                className="h-8 rounded-lg text-xs text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </FadeIn>

      {/* Strength Section */}
      <FadeIn delay={150} className="mt-6">
        {isGoalOwner ? (
          totalStrengthCount > 0 ? (
            <div className="rounded-xl bg-pink-500/[0.03] ring-1 ring-pink-500/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                  <span className="text-sm font-medium">Strength</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">{totalStrengthCount}</span>
              </div>
              <OwnerStrengthBreakdown strengths={strengths} memberMap={memberMap} />
            </div>
          ) : null
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={handleSendStrength}
              disabled={sendingStrength}
              className={cn(
                "flex items-center gap-2 text-sm text-pink-500 hover:text-pink-600 transition-all active:scale-95",
                strengthPulse && "scale-105"
              )}
            >
              {sendingStrength ? (
                <Restart className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    strengthPulse ? "fill-pink-500 scale-125" : ""
                  )}
                />
              )}
              <span className="font-medium">Send Strength</span>
            </button>
            {myStrengthCount > 0 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                You sent {myStrengthCount}
              </span>
            )}
          </div>
        )}
      </FadeIn>

      {/* Comments Section */}
      <FadeIn delay={250} className="mt-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">
            Comments
            {comments.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                ({comments.length})
              </span>
            )}
          </span>
        </div>

        {/* Comment input — always visible at top */}
        <div className="sticky top-0 z-10 bg-background pb-3 mb-1">
          <div className="flex gap-3 items-start rounded-xl bg-foreground/[0.02] ring-1 ring-foreground/[0.06] px-3 py-2.5 transition-all focus-within:ring-foreground/15">
            <Avatar size="sm" className="shrink-0 mt-0.5">
              <AvatarFallback className="text-[10px] bg-foreground/[0.06]">
                {getInitials(currentUserName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <textarea
                ref={replyTo ? undefined : inputRef}
                value={replyTo ? "" : newComment}
                onChange={(e) => { if (!replyTo) setNewComment(e.target.value) }}
                onFocus={() => { if (replyTo) { setReplyTo(null); setNewComment("") } }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !replyTo) {
                    e.preventDefault()
                    handlePost()
                  }
                }}
                placeholder="Write a comment..."
                rows={1}
                className="w-full bg-transparent text-[14px] outline-none resize-none placeholder:text-muted-foreground/40 py-0.5 leading-relaxed"
              />
              <Button
                size="sm"
                onClick={() => { if (!replyTo) handlePost() }}
                disabled={replyTo ? true : !newComment.trim() || posting}
                className="h-8 rounded-full text-xs px-4 shrink-0"
              >
                {posting && !replyTo ? <Restart className="h-3 w-3 animate-spin" /> : "Post"}
              </Button>
            </div>
          </div>
        </div>

        {topLevelComments.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-xs text-muted-foreground text-center">
              No comments yet. Be the first to share your thoughts.
            </p>
          </div>
        ) : (
          <div className="flex-1 divide-y divide-foreground/[0.06]">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="py-3 first:pt-0">
                <CommentThread
                  comment={comment}
                  replies={repliesByParent[comment.id] ?? []}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onDelete={handleDeleteComment}
                  newCommentIds={newCommentIds}
                  isReplyActive={replyTo?.id === comment.id}
                  replyUserName={replyTo?.userName ?? ""}
                  currentUserName={currentUserName}
                  replyValue={newComment}
                  onReplyChange={setNewComment}
                  onReplySubmit={handlePost}
                  onReplyCancel={() => { setReplyTo(null); setNewComment("") }}
                  replyPosting={posting}
                  replyInputRef={inputRef}
                />
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  )
}
