// components/Skeleton.tsx
"use client"

type SkeletonProps = {
  width?: string | number
  height?: string | number
  className?: string
  circle?: boolean
}

export default function Skeleton({ width = "100%", height = "1rem", className = "", circle = false }: SkeletonProps) {
  const baseClasses = `
    animate-pulse
    bg-gray-200 dark:bg-neutral-700
    ${circle ? "rounded-full" : "rounded-md"}
  `
  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{ width, height }}
    />
  )
}
