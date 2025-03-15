import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="gap-0 rounded-md py-0 max-h-[112px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <Skeleton className="h-6 w-[120px] mb-[10px]" />
            <Skeleton className="h-4 w-[160px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
      <Card className="gap-0 rounded-md py-0 col-span-12 lg:col-span-7 max-h-[274px]">
        <CardHeader className="p-4">
          <Skeleton className="h-6 w-[140px]" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
      <Card className="gap-0 rounded-md py-0 col-span-12 lg:col-span-5 max-h-[274px]">
        <CardHeader className="p-4">
          <Skeleton className="h-6 w-[140px]" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
