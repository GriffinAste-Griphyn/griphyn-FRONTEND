"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarIcon, ClockIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

type ApiDeal = {
  id: string
  title: string | null
  summary: string | null
  status: string
  source: string
  estimatedValue: number | null
  currencyCode: string | null
  dueDate: string | null
  metadata: string | null
  createdAt: string
  updatedAt: string
  brand?: {
    name: string | null
  } | null
}

type DeliverableTask = {
  id: string
  dealId: string
  title: string
  description: string
  brand: string
  dueDate: Date | null
  status: string
  source: string
  creativeBrief: CreativeBrief
  deliverableType: string | null
  deliverableCount: number | null
}

const STATUS_STYLES: Record<string, string> = {
  Overdue: "border-destructive/60 bg-destructive/10 text-destructive",
  "Due today": "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Due tomorrow": "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "Due this week": "border-primary/50 bg-primary/5 text-primary",
  Upcoming: "border-border/60 bg-muted/30 text-foreground",
  "No due date": "border-border/60 bg-muted/30 text-muted-foreground",
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type CreativeBrief = {
  campaign?: string
  objective?: string
  timeline?: string
  brandGuidelines?: string
  talkingPoints: string[]
  hashtags?: string
}

const parseMetadata = (raw: string | null) => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

const parseDate = (input: unknown): Date | null => {
  if (!input || typeof input !== "string") return null
  const date = new Date(input)
  if (!Number.isNaN(date.getTime())) return date
  const fallback = Date.parse(input)
  if (!Number.isNaN(fallback)) return new Date(fallback)
  return null
}

const getString = (value: unknown) => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const getStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
}

const buildCreativeBrief = (metadata: Record<string, unknown>, deal: ApiDeal): CreativeBrief => {
  const talkingPoints = getStringArray(metadata.talkingPoints ?? metadata.talking_points)
  return {
    campaign: getString(metadata.campaign) ?? deal.title ?? undefined,
    objective: getString(metadata.objective) ?? deal.summary ?? undefined,
    timeline: getString(metadata.timeline),
    brandGuidelines: getString(metadata.brandGuidelines),
    talkingPoints,
    hashtags: getString(metadata.hashtags),
  }
}

const getStatusLabel = (dueDate: Date | null) => {
  if (!dueDate) return "No due date"
  const now = new Date()
  const diff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "Overdue"
  if (diff === 0) return "Due today"
  if (diff === 1) return "Due tomorrow"
  if (diff <= 7) return "Due this week"
  return "Upcoming"
}

export default function ContentCalendarPage() {
  const [tasks, setTasks] = useState<DeliverableTask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedTask, setSelectedTask] = useState<DeliverableTask | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/deals?limit=100", { cache: "no-store" })
        if (!response.ok) throw new Error(`Failed to load deals (${response.status})`)
        const payload = (await response.json()) as { data?: ApiDeal[] }
        if (cancelled) return

        const deals = Array.isArray(payload.data) ? payload.data : []
        const mapped: DeliverableTask[] = []

        deals.forEach((deal) => {
          const metadata = parseMetadata(deal.metadata)
          const brand = metadata.brandName ?? deal.brand?.name ?? "Unknown brand"
          const deliverablesList = Array.isArray(metadata.deliverablesList) ? metadata.deliverablesList : []
          const fallbackDue = parseDate(metadata.timeline) ?? parseDate(deal.dueDate)
          const creativeBrief = buildCreativeBrief(metadata, deal)

          if (deliverablesList.length > 0) {
            deliverablesList.forEach((deliverable: any, index: number) => {
              const label = typeof deliverable.type === "string" ? deliverable.type : "Deliverable"
              const count = typeof deliverable.count === "number" ? deliverable.count : null
              const specs = typeof deliverable.specs === "string" ? deliverable.specs : null

              mapped.push({
                id: `${deal.id}-${index}`,
                dealId: deal.id,
                title: count ? `${count}× ${label}` : label,
                description: specs ?? (deal.title ?? deal.summary ?? ""),
                brand,
                dueDate: fallbackDue,
                status: getStatusLabel(fallbackDue),
                source: deal.source,
                creativeBrief,
                deliverableType: label,
                deliverableCount: count,
              })
            })
          } else {
            mapped.push({
              id: deal.id,
              dealId: deal.id,
              title: deal.title ?? "Campaign planning",
              description: deal.summary ?? "Review brief and next steps",
              brand,
              dueDate: fallbackDue,
              status: getStatusLabel(fallbackDue),
              source: deal.source,
              creativeBrief,
              deliverableType: null,
              deliverableCount: null,
            })
          }
        })

        setTasks(mapped)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load content calendar")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, DeliverableTask[]>()
    tasks.forEach((task) => {
      if (!task.dueDate) return
      const key = format(task.dueDate, "yyyy-MM-dd")
      const existing = map.get(key)
      if (existing) {
        existing.push(task)
      } else {
        map.set(key, [task])
      }
    })
    map.forEach((list) => {
      list.sort((a, b) => {
        const timeA = a.dueDate ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER
        const timeB = b.dueDate ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER
        if (timeA !== timeB) return timeA - timeB
        return a.title.localeCompare(b.title)
      })
    })
    return map
  }, [tasks])

  const visibleDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const unscheduledTasks = useMemo(() => tasks.filter((task) => !task.dueDate), [tasks])

  const handleMonthChange = (direction: "previous" | "next" | "current") => {
    if (direction === "previous") {
      setCurrentMonth((prev) => subMonths(prev, 1))
    } else if (direction === "next") {
      setCurrentMonth((prev) => addMonths(prev, 1))
    } else {
      const today = new Date()
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    }
  }

  const selectedDueDateLabel = selectedTask?.dueDate ? format(selectedTask.dueDate, "MMMM d, yyyy") : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Content Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Track deliverables, approvals, and publish dates across your active deals.
          </p>
        </div>
      </div>

      <Card className="border border-border bg-card shadow-sm">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">{format(currentMonth, "MMMM yyyy")}</h2>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                Updated in real time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => handleMonthChange("previous")}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMonthChange("current")}
              >
                Today
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => handleMonthChange("next")}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading schedule…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <div className="min-w-[720px] space-y-3">
                  <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground">
                    {WEEKDAY_LABELS.map((label) => (
                      <div key={label} className="px-2">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {visibleDays.map((day) => {
                      const key = format(day, "yyyy-MM-dd")
                      const dayTasks = tasksByDate.get(key) ?? []
                      const highlight = isToday(day)
                      const inCurrentMonth = isSameMonth(day, currentMonth)

                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex min-h-[120px] flex-col gap-2 rounded-xl border border-border/60 bg-muted/10 p-2",
                            !inCurrentMonth && "bg-muted/30 text-muted-foreground/80",
                            highlight && "border-primary/70 bg-primary/5"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span
                              className={cn(
                                "inline-flex size-6 items-center justify-center rounded-full",
                                highlight
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground/80"
                              )}
                            >
                              {format(day, "d")}
                            </span>
                            {dayTasks.length > 0 ? (
                              <span className="text-[10px] text-muted-foreground">
                                {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex flex-1 flex-col gap-2">
                            {dayTasks.slice(0, 3).map((task) => (
                              <button
                                key={task.id}
                                className={cn(
                                  "rounded-md border px-2 py-1 text-left text-[11px] leading-tight transition hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  STATUS_STYLES[task.status] ?? "border-border/60 bg-muted/30 text-foreground"
                                )}
                                type="button"
                                onClick={() => setSelectedTask(task)}
                              >
                                <p className="font-semibold truncate">{task.title}</p>
                                <p className="text-[10px] uppercase text-muted-foreground truncate">{task.brand}</p>
                              </button>
                            ))}
                            {dayTasks.length > 3 ? (
                              <p className="text-[10px] text-muted-foreground">
                                +{dayTasks.length - 3} more
                              </p>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No deliverables scheduled yet. Once deals are created, they’ll appear on the calendar.
                </p>
              ) : null}

              {unscheduledTasks.length > 0 ? (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Unscheduled deliverables
                  </h3>
                  <div className="space-y-3">
                    {unscheduledTasks.map((item) => (
                      <button
                        key={item.id}
                        className="w-full rounded-xl border border-border/60 bg-muted/20 p-4 text-left transition hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        type="button"
                        onClick={() => setSelectedTask(item)}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {item.brand}
                            </p>
                            <p className="text-base font-semibold text-foreground">{item.title}</p>
                            {item.description ? (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            ) : null}
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                              <Badge variant="outline" className="text-xs">
                                {item.source === "EMAIL" ? "Inbound" : "Outbound"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!selectedTask} onOpenChange={(open) => (!open ? setSelectedTask(null) : undefined)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          {selectedTask ? (
            <div className="space-y-5">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle>{selectedTask.title}</DialogTitle>
                <DialogDescription>
                  {selectedTask.creativeBrief.campaign ?? selectedTask.brand}
                  {" | "}
                  {selectedDueDateLabel ? `Due ${selectedDueDateLabel}` : "No due date scheduled"}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedTask.source === "EMAIL" ? "Inbound" : "Outbound"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedTask.status}
                </Badge>
              </div>

              <div className="space-y-3">
                {selectedTask.deliverableType ? (
                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Deliverable</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTask.deliverableCount ? `${selectedTask.deliverableCount}× ` : ""}
                      {selectedTask.deliverableType}
                    </p>
                  </section>
                ) : null}

                {selectedTask.description ? (
                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Specs / Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                  </section>
                ) : null}

                {selectedTask.creativeBrief.objective ? (
                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Objective</h4>
                    <p className="text-sm text-muted-foreground">{selectedTask.creativeBrief.objective}</p>
                  </section>
                ) : null}

                {selectedTask.creativeBrief.timeline ? (
                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Timeline</h4>
                    <p className="text-sm text-muted-foreground">{selectedTask.creativeBrief.timeline}</p>
                  </section>
                ) : null}

                {selectedTask.creativeBrief.brandGuidelines ? (
                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Brand guidelines</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTask.creativeBrief.brandGuidelines}
                    </p>
                  </section>
                ) : null}

                {selectedTask.creativeBrief.talkingPoints.length > 0 ? (
                  <section className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Talking points</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-4">
                      {selectedTask.creativeBrief.talkingPoints.map((point, index) => (
                        <li key={`${point}-${index}`}>{point}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {selectedTask.creativeBrief.hashtags ? (
                  <section className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Hashtags</h4>
                    <p className="text-sm text-muted-foreground">{selectedTask.creativeBrief.hashtags}</p>
                  </section>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
