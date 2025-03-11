"use client"

import * as React from "react"
import { FilterDate } from "./filter-date"
import { DateRange } from "react-day-picker"
import { FilterFaceted } from "./filter-faceted"
import { Skeleton } from "@/components/ui/skeleton"
import { ButtonRefresh } from "./button-refresh"
import { useSites } from "@/hooks/use-sites"

interface DashboardHeaderProps {
  dateRange: {
    start: Date
    end: Date
  }
  onDateRangeChange: (range: { start: Date; end: Date }) => void
  selectedSites?: string[]
  onSitesChange?: (sites: string[]) => void
}

export function DashboardHeader({
  dateRange,
  onDateRangeChange,
  selectedSites = [],
  onSitesChange,
}: DashboardHeaderProps) {
  const { data: sites, isLoading } = useSites()
  
  const convertedDateRange: DateRange = {
    from: dateRange.start,
    to: dateRange.end,
  }

  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({
        start: range.from,
        end: range.to,
      })
    }
  }

  const siteOptions = sites?.map((site) => ({
    label: site.name,
    value: site.id,
  })) || []

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-medium">Dashboard</h2>
      </div>
      <div className="flex items-center gap-2">
        <ButtonRefresh />
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-[90px]" />
            <Skeleton className="h-10 w-[246px]" />
          </>
        ) : (
          <>
            <FilterFaceted
              title="Sites"
              options={siteOptions}
              onSelectionChange={onSitesChange}
              selected={selectedSites}
            />
            <FilterDate
              initialDateRange={convertedDateRange}
              onDateRangeChange={handleDateChange}
            />
          </>
        )}
      </div>
    </div>
  )
}