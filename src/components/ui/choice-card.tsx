"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChoiceCardProps {
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export function ChoiceCard({
  selected = false,
  onClick,
  disabled = false,
  children,
  className,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative cursor-pointer rounded-sm border px-3 py-1 pr-8 text-left text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        selected
          ? "dark:border-blue-700 border-blue-500 text-blue-500 dark:text-blue-400"
          : "border-neutral-300 bg-transparent text-neutral-500 hover:border-neutral-400 hover:bg-muted/50 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {children}
      {selected && (
        <Check className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
      )}
    </button>
  )
}
