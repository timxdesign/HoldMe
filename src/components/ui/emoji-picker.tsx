"use client"

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react"
import { cn } from "@/lib/utils"

const PickerComponent = lazy(async () => {
  const [{ default: data }, { default: Picker }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("@emoji-mart/data") as any,
    import("@emoji-mart/react"),
  ])

  return {
    default: function EmojiMartPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
      return (
        <Picker
          data={data}
          onEmojiSelect={(emoji: { native: string }) => onSelect(emoji.native)}
          theme="auto"
          previewPosition="none"
          skinTonePosition="none"
          maxFrequentRows={2}
          perLine={8}
        />
      )
    },
  }
})

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  className?: string
}

export function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, handleClickOutside])

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji)
      setOpen(false)
    },
    [onSelect]
  )

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-bottom-right [&>em-emoji-picker]:!border-foreground/10 [&>em-emoji-picker]:!rounded-xl [&>em-emoji-picker]:!shadow-xl">
          <Suspense
            fallback={
              <div className="w-[352px] h-[400px] rounded-xl bg-card ring-1 ring-foreground/10 shadow-xl flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
              </div>
            }
          >
            <PickerComponent onSelect={handleSelect} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
