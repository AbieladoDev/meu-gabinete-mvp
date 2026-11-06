"use client"

import { cn } from "@/lib/utils"

interface GridPatternProps {
  className?: string
  squares?: [number, number][]
}

export function GridPattern({ className, squares }: GridPatternProps) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-muted-foreground/10 stroke-muted-foreground/10",
        className
      )}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 32V0h32" fill="none" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      {squares && (
        <svg className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect
              key={index}
              width="31"
              height="31"
              x={x * 32 + 1}
              y={y * 32 + 1}
              className="fill-muted-foreground/5"
              strokeWidth="0"
            />
          ))}
        </svg>
      )}
    </svg>
  )
}
