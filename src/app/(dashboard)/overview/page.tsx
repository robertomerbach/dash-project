"use client"

import { useState } from "react"
import { startOfMonth, endOfMonth } from "date-fns"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { DashboardCountries } from "@/components/dashboard/dashboard-countries"
import { DashboardSkeleton, DashboardChartsSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { useMetrics, aggregateMetricsByDate, aggregateMetricsByCountry } from "@/hooks/use-metrics"

export default function DashboardPage() {

  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })
  
  const [selectedSites, setSelectedSites] = useState<string[]>([])

  // Usar o hook useMetrics para buscar dados simulados
  const { data: metricsData, isLoading, isError } = useMetrics(
    selectedSites,
    dateRange
  )

  // Processar os dados para o formato esperado pelos componentes
  const processedMetrics = !isLoading && !isError && metricsData ? {
    currentPeriod: Object.values(aggregateMetricsByDate(metricsData)),
    previousPeriod: [] // Poderíamos gerar dados para o período anterior se necessário
  } : null

  // Dados agregados por país para o componente de países
  const countriesData = !isLoading && !isError && metricsData ? {
    currentPeriod: Object.values(aggregateMetricsByCountry(metricsData)),
    previousPeriod: []
  } : null

  return (
    <div className="container mx-auto space-y-6">
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedSites={selectedSites}
        onSitesChange={setSelectedSites}
      />

      <div>
        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <div className="text-center text-red-500">
            Error loading metrics. Please try again.
          </div>
        ) : (
          <DashboardCards metrics={processedMetrics} />
        )}
      </div>

      <div>
        {isLoading ? (
          <DashboardChartsSkeleton />
        ) : isError ? (
          <div className="text-center text-red-500">
            Error loading metrics. Please try again.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            <DashboardChart
              title="Overview"
              currentPeriod={processedMetrics?.currentPeriod}
              previousPeriod={processedMetrics?.previousPeriod}
            />
            <DashboardCountries
              title="Countries"
              metrics={countriesData}
            />
          </div>
        )}
      </div>
    </div>
  )
}