"use client"

import { useState, useEffect } from "react"

export function InviteIllustration() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div className="flex justify-center mb-2">
      <div
        className={`relative transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <circle cx="40" cy="58" r="22" className="fill-brand/15" />
          <circle cx="40" cy="48" r="9" className="fill-brand" />
          <path
            d="M22 72c0-10 8-14 18-14s18 4 18 14"
            className="stroke-brand"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          <circle cx="78" cy="58" r="22" className="fill-brand-secondary/15" />
          <circle cx="78" cy="48" r="9" className="fill-brand-secondary" />
          <path
            d="M60 72c0-10 8-14 18-14s18 4 18 14"
            className="stroke-brand-secondary"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          <g
            className={`transition-all duration-500 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            style={{ transformOrigin: "59px 30px" }}
          >
            <circle cx="59" cy="30" r="12" className="fill-brand" />
            <path
              d="M53 30h12M59 24v12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          <circle
            cx="16"
            cy="38"
            r="3"
            className={`fill-brand/30 transition-all duration-700 delay-300 ${visible ? "opacity-100" : "opacity-0"}`}
          />
          <circle
            cx="104"
            cy="42"
            r="2.5"
            className={`fill-brand-secondary/30 transition-all duration-700 delay-400 ${visible ? "opacity-100" : "opacity-0"}`}
          />
          <circle
            cx="24"
            cy="82"
            r="2"
            className={`fill-brand/20 transition-all duration-700 delay-500 ${visible ? "opacity-100" : "opacity-0"}`}
          />
          <circle
            cx="98"
            cy="78"
            r="2.5"
            className={`fill-brand-secondary/20 transition-all duration-700 delay-600 ${visible ? "opacity-100" : "opacity-0"}`}
          />
        </svg>
      </div>
    </div>
  )
}
