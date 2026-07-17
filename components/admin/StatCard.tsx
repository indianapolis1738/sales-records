"use client"

import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: string
  loading?: boolean
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "bg-blue-600",
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-neutral-700" />
            <div className="mt-4 h-8 w-20 rounded bg-slate-200 dark:bg-neutral-700" />
            <div className="mt-3 h-3 w-28 rounded bg-slate-200 dark:bg-neutral-700" />
          </div>

          <div className="h-14 w-14 rounded-xl bg-slate-200 dark:bg-neutral-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="group rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`${color} flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg transition-transform group-hover:scale-110`}
        >
          <Icon size={26} />
        </div>

      </div>
    </div>
  )
}