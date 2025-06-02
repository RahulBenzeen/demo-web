"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart } from "@/components/line-chart"
import { PieChart } from "@/components/pie-chart"
import { useState } from "react"

interface AnalyticsChartsProps {
  postsLoading: boolean
  categoriesLoading: boolean
  posts: any[]
  categories: any[]
  getCategoryData: () => { name: string; value: number }[]
  getTrendData: (timeRange: "7d" | "30d" | "90d") => {
    labels: string[]
    views: number[]
    likes: number[]
    comments: number[]
  }
}

export function AnalyticsCharts({
  postsLoading,
  categoriesLoading,
  getCategoryData,
  getTrendData,
}: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const categoryData = getCategoryData()
  const trendData = getTrendData(timeRange)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Performance metrics over time</CardDescription>
            </div>
            <div className="flex gap-1">
              {(["7d", "30d", "90d"] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          {postsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <LineChart
              data={[
                {
                  name: "Views",
                  data: trendData.views,
                  color: "#3b82f6",
                },
                {
                  name: "Likes",
                  data: trendData.likes,
                  color: "#10b981",
                },
                {
                  name: "Comments",
                  data: trendData.comments,
                  color: "#f59e0b",
                },
              ]}
              categories={trendData.labels}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posts by Category</CardTitle>
          <CardDescription>Content distribution across categories</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {categoriesLoading || postsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : categoryData.length > 0 ? (
            <PieChart data={categoryData} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
