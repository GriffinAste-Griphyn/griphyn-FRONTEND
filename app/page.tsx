import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Clock } from "lucide-react"

const upcomingDeliverables = [
  {
    dueLabel: "Due today",
    task: "Publish sponsored IG Reel",
    detail: "Nova Apparel spring launch",
    status: "due-today",
  },
  {
    dueLabel: "Due tomorrow",
    task: "Send draft to brand for approval",
    detail: "Lowes DIY fall refresh",
    status: "due-soon",
  },
  {
    dueLabel: "Due in 3 days",
    task: "Shoot TikTok deliverables",
    detail: "Urban Lifestyle Co cross-promo",
    status: "scheduled",
  },
  {
    dueLabel: "Awaiting payment",
    task: "Confirm wire for Adidas",
    detail: "Invoice #AD-204 expected Nov 3",
    status: "payment",
  },
]

function getTaskBadge(status: string) {
  switch (status) {
    case "due-today":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Due today
        </Badge>
      )
    case "due-soon":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Due tomorrow
        </Badge>
      )
    case "scheduled":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Scheduled
        </Badge>
      )
    case "payment":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Awaiting payment
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function HomePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-1">Welcome back, Griffin</h1>
        <p className="text-muted-foreground">Your AI agent is working 24/7 to grow your business.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Financial Summary</h2>
        <div className="md:hidden">
          <Card className="border border-border bg-card shadow-sm">
            <div className="divide-y divide-border">
              <div className="py-2 px-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>This Month's Earnings</span>
                </div>
                <p className="text-2xl font-semibold text-foreground leading-tight">$12,450</p>
                <p className="text-xs text-green-600">+23% vs last month</p>
              </div>

              <div className="py-2 px-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Pending Payments</span>
                </div>
                <p className="text-2xl font-semibold text-foreground leading-tight">$8,200</p>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </div>

              <div className="py-2 px-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Projected This Quarter</span>
                </div>
                <p className="text-2xl font-semibold text-foreground leading-tight">$38,900</p>
                <p className="text-xs text-muted-foreground">Based on active deals</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-6">
          <Card className="border border-border bg-card shadow-sm rounded-2xl">
            <div className="p-6 md:p-7 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>This Month's Earnings</span>
              </div>
              <p className="text-3xl font-semibold text-foreground leading-tight">$12,450</p>
              <p className="text-xs text-green-600">+23% vs last month</p>
            </div>
          </Card>

          <Card className="border border-border bg-card shadow-sm rounded-2xl">
            <div className="p-6 md:p-7 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Pending Payments</span>
              </div>
              <p className="text-3xl font-semibold text-foreground leading-tight">$8,200</p>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </div>
          </Card>

          <Card className="border border-border bg-card shadow-sm rounded-2xl">
            <div className="p-6 md:p-7 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Projected This Quarter</span>
              </div>
              <p className="text-3xl font-semibold text-foreground leading-tight">$38,900</p>
              <p className="text-xs text-muted-foreground">Based on active deals</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border border-border bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <h2 className="text-xl font-semibold text-foreground">Upcoming Deliverables</h2>
              </div>
              <p className="text-xs text-muted-foreground">Stay ahead of due dates</p>
            </div>

            <div className="grid gap-3">
              {upcomingDeliverables.map((item, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/60 bg-muted/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.dueLabel}
                      </p>
                      <p className="text-sm font-semibold text-foreground">{item.task}</p>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                    {getTaskBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
