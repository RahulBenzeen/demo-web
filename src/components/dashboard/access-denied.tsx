"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface AccessDeniedProps {
  onGoBack: () => void
}

export function AccessDenied({ onGoBack }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-8">You don't have permission to access the admin dashboard.</p>
      <Button onClick={onGoBack}>Go Back Home</Button>
    </div>
  )
}
