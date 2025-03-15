"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import * as React from "react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { format } from "date-fns"

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
}

interface DashboardChartProps {
  title: string
  currentPeriod?: Metric[]
  previousPeriod?: Metric[]
  isLoading?: boolean
}

const chartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  lastPeriod: { label: "Last Period", color: "var(--chart-2)" },
}

const prepareChartData = (currentPeriod: Metric[] = [], previousPeriod: Metric[] = []) => {
  const aggregateByDate = (data: Metric[]) =>
    data.reduce((map, { date, revenue }) => {
      const formattedDate = format(new Date(date), "dd/MM")
      map.set(formattedDate, (map.get(formattedDate) || 0) + Number(revenue))
      return map
    }, new Map<string, number>())

  const currentMap = aggregateByDate(currentPeriod)
  const previousMap = aggregateByDate(previousPeriod)
  const allDates = [...new Set([...currentMap.keys(), ...previousMap.keys()])].sort()

  // Se houver apenas uma data, retornar apenas um ponto
  if (allDates.length === 1) {
    const date = allDates[0]
    return [{
      date,
      revenue: (currentMap.get(date) || 0).toFixed(2),
      lastPeriod: (previousMap.get(date) || 0).toFixed(2),
    }]
  }

  return allDates.map(date => ({
    date,
    revenue: currentMap.get(date)?.toFixed(2) || "0.00",
    lastPeriod: previousMap.get(date)?.toFixed(2) || "0.00",
  }))
}

export function DashboardChart({ title, currentPeriod = [], previousPeriod = [], isLoading = false }: DashboardChartProps) {
  const chartData = React.useMemo(() => prepareChartData(currentPeriod, previousPeriod), [currentPeriod, previousPeriod])

  const customTick = (props: any) => {
    const { x, y, payload } = props;
    
    // Se for data única, centralizar
    if (chartData.length === 1) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={10}
            textAnchor="middle"
            fill="currentColor"
            fontSize={12}
            className="text-muted-foreground"
          >
            {payload.value}
          </text>
        </g>
      );
    }

    // Para múltiplas datas, alinhar primeira à esquerda e última à direita
    const isFirstDate = payload.value === chartData[0].date;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={10}
          textAnchor={isFirstDate ? "start" : "end"}
          fill="currentColor"
          fontSize={12}
          className="text-muted-foreground"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <Card className="col-span-12 md:col-span-7 rounded-md gap-0 py-0">
      <CardHeader className="p-4">
        <CardTitle className="text-sm text-muted-foreground font-normal">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              {Object.keys(chartConfig).map(key => (
                <linearGradient key={key} id={key} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig[key].color} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={chartConfig[key].color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickMargin={8}
              className="text-muted-foreground"
              ticks={chartData.length === 1 
                ? [chartData[0].date] 
                : [chartData[0].date, chartData[chartData.length - 1].date]
              }
              interval={0}
              tick={customTick}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {Object.keys(chartConfig).map(key => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartConfig[key].color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${key})`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
