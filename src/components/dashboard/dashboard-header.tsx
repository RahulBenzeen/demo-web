"use client"

import { Button } from "@/components/ui/button"
import { Plus, Download, RefreshCw } from "lucide-react"

interface DashboardHeaderProps {
  onNewPost: () => void
  onExport: () => void
  onRefresh: () => void
}

export function DashboardHeader({ onNewPost, onExport, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Analyze your blog's performance and manage content</p>
      </div>

      <div className="flex gap-2">
        <Button onClick={onNewPost} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
        <Button variant="outline" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
