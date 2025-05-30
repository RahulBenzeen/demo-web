"use client"

import { type ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { currentUser, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        navigate("/sign-in");
      } else if (adminOnly && userProfile?.role !== "admin") {
        navigate("/");
      }
    }
  }, [currentUser, userProfile, isLoading, navigate, adminOnly]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || (adminOnly && userProfile?.role !== "admin")) {
    return null; // Brief null render before navigation happens
  }

  return <>{children}</>;
}
