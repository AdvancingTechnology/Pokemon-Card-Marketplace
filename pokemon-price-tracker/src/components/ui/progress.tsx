"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, style, ...props }, ref) => {
    const progressColor = (style as React.CSSProperties & { '--progress-color'?: string })?.['--progress-color'] || '#8B5CF6';

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 transition-all"
          style={{
            transform: `translateX(-${100 - (value || 0)}%)`,
            backgroundColor: progressColor
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
