"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, UsersGroupTwoRounded, Crown } from "@solar-icons/react"

interface SpaceHeaderProps {
  spaceId: string
  name: string
  description: string | null
  memberCount: number
  isOwner: boolean
  ownerName?: string
}

export function SpaceHeader({
  spaceId,
  name,
  description,
  memberCount,
  isOwner,
  ownerName,
}: SpaceHeaderProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  return (
    <div>
      <div
        className={`transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <Link
          href="/spaces"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Spaces
        </Link>
      </div>

      <div
        className={`mt-5 transition-all duration-600 delay-75 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {name}
          </h1>
          {isOwner && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand shrink-0">
              <Crown className="h-2.5 w-2.5" />
              Owner
            </span>
          )}
        </div>
      </div>

      <div
        className={`mt-3 transition-all duration-600 delay-150 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {ownerName && (
            <span className="text-sm text-muted-foreground">
              by{" "}
              <span className="font-medium text-foreground/70">
                {ownerName}
              </span>
            </span>
          )}
          <Link
            href={`/spaces/${spaceId}/members`}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
          >
            <UsersGroupTwoRounded className="h-3 w-3" />
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </Link>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground/80 mt-3 max-w-lg leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
