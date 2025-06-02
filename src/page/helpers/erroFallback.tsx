
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorFallbackProps {
  error?: Error | null;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-xl border shadow-lg p-6 space-y-6">
        <div className="text-center">
          <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-16 h-16 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10" />
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-foreground">
              Oops, Something Went Wrong!
            </h1>
            <p className="mt-2 text-muted-foreground">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>
            
            {error && (
              <div className="mt-4 p-3 bg-muted/50 rounded text-sm text-left font-mono overflow-x-auto">
                <details className="cursor-pointer">
                  <summary className="font-medium text-foreground">
                    Error Details
                  </summary>
                  <div className="mt-2 text-destructive">
                    {error.message || "Unknown error"}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="flex-1 gap-2"
            onClick={onReset}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="flex-1 gap-2"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>Error ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          <p className="mt-1">Please include this ID if contacting support</p>
        </div>
      </div>
    </div>
  );
}