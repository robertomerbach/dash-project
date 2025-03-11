"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/utils"

export interface Metric {
  id: string;
  date: string;
  revenue: number;
  cost: number;
  impressions: number;
  clicks: number;
  ad_impressions: number;
  ad_clicks: number;
  ad_coverage: number;
  viewability: number;
  domainId: string;
  country?: string;
}

interface DashboardCountriesProps {
  metrics?: {
    currentPeriod: Metric[];
  } | null;
  title?: string;
  className?: string;
  isLoading?: boolean;
}

function calculateCountryMetrics(data: Metric[] = []) {
  return data.reduce<Record<string, { revenue: number; impressions: number; clicks: number }>>(
    (acc, { country = "Unknown", revenue = 0, impressions = 0, clicks = 0 }) => {
      acc[country] = acc[country] || { revenue: 0, impressions: 0, clicks: 0 };
      acc[country].revenue += revenue;
      acc[country].impressions += impressions;
      acc[country].clicks += clicks;
      return acc;
    },
    {}
  );
}

export function DashboardCountries({ metrics, title, className, isLoading }: DashboardCountriesProps) {
  const countryMetrics = calculateCountryMetrics(metrics?.currentPeriod);

  const sortedCountries = Object.entries(countryMetrics)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <Card className={`py-0 gap-0 col-span-12 md:col-span-5 rounded-md ${className}`}>
      <CardHeader className="p-4 flex flex-row justify-between items-center">
        <CardTitle className="text-sm text-muted-foreground font-normal">{title}</CardTitle>
        <Link className="text-sm font-normal underline" href="/reports/countries">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-12 text-sm text-muted-foreground mb-1">
              <div className="col-span-6">Country</div>
              <div className="col-span-3 text-right">Impressions</div>
              <div className="col-span-3 text-right">Revenue</div>
            </div>
            {sortedCountries.map(([country, data]) => (
              <div key={country} className="grid grid-cols-12 items-center">
                <div className="col-span-6 text-sm">{country}</div>
                <div className="col-span-3 text-right text-sm">{formatNumber(data.impressions)}</div>
                <div className="col-span-3 text-right text-sm">{formatCurrency(data.revenue)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
