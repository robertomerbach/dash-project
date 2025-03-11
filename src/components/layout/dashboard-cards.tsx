"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { formatCurrency, formatNumber, calculatePercentageChange } from "@/lib/utils"

interface Metric {
  id: string
  date: string
  revenue: number
  cost: number
  impressions: number
  clicks: number
  ad_impressions: number
  ad_clicks: number
  ad_coverage: number
  viewability: number
  domainId: string
  country?: string
}

interface DashboardCardsProps {
  metrics: {
    currentPeriod: Metric[]
    previousPeriod: Metric[]
  } | null
}

const safeDivision = (numerator: number, denominator: number): number => 
  denominator !== 0 ? numerator / denominator : 0

const calculateMetrics = (data: Metric[] = []) =>
  data.reduce(
    (acc, { revenue, cost, impressions, clicks, ad_impressions, ad_clicks }) => ({
      revenue: acc.revenue + Number(revenue || 0),
      cost: acc.cost + Number(cost || 0),
      impressions: acc.impressions + (impressions || 0),
      clicks: acc.clicks + (clicks || 0),
      ad_impressions: acc.ad_impressions + (ad_impressions || 0),
      ad_clicks: acc.ad_clicks + (ad_clicks || 0),
    }),
    { revenue: 0, cost: 0, impressions: 0, clicks: 0, ad_impressions: 0, ad_clicks: 0 }
  )

export function DashboardCards({ metrics }: DashboardCardsProps) {
  const current = calculateMetrics(metrics?.currentPeriod)
  const previous = calculateMetrics(metrics?.previousPeriod)

  const profit = current.revenue - current.cost
  const previousProfit = previous.revenue - previous.cost

  const ROI = safeDivision(profit, current.cost) * 100
  const previousROI = safeDivision(previousProfit, previous.cost)

  const cardData = [
    { title: "Revenue", value: formatCurrency(current.revenue), change: calculatePercentageChange(previous.revenue, current.revenue) },
    { title: "Investments", value: formatCurrency(current.cost), change: calculatePercentageChange(previous.cost, current.cost) },
    { title: "Profit", value: formatCurrency(profit), change: calculatePercentageChange(previousProfit, profit) },
    { title: "ROI", value: `${ROI.toFixed(2)}%`, change: calculatePercentageChange(previousROI, ROI) },
    { title: "Impressions", value: formatNumber(current.impressions), change: calculatePercentageChange(previous.impressions, current.impressions), hidden: true },
    { title: "Clicks", value: formatNumber(current.clicks), change: calculatePercentageChange(previous.clicks, current.clicks), hidden: true },
    { title: "CPC", value: formatCurrency(safeDivision(current.cost, current.clicks)), change: calculatePercentageChange(safeDivision(previous.cost, previous.clicks), safeDivision(current.cost, current.clicks)), hidden: true },
    { title: "ECPM", value: formatCurrency(safeDivision(current.revenue, current.impressions / 1000)), change: calculatePercentageChange(safeDivision(previous.revenue, previous.impressions / 1000), safeDivision(current.revenue, current.impressions / 1000)), hidden: true },
  ]

  return (
    <div className="grid auto-rows-min gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map(({ title, value, change, hidden }, index) => (
        <Card key={index} className={`py-0 gap-0 rounded-md ${hidden ? "hidden md:block" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl mb-1 font-medium">{value}</div>
            <p className="text-sm text-muted-foreground">
              <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
                {isFinite(change) ? `${change >= 0 ? "+" : ""}${change}` : "0"}%
              </span>{" "}
              last period
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}