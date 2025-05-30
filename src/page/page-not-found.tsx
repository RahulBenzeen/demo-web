// src/page/not-found.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const NotFoundPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className={`max-w-3xl w-full rounded-2xl overflow-hidden ${
        theme === 'dark' 
          ? 'bg-card' 
          : 'bg-white'
      } border shadow-lg p-8`}>
        <div className="text-center">
          <div className="text-9xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            404
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Please check the URL or navigate back to our homepage.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="default" className="rounded-lg py-5 px-6">
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg py-5 px-6">
              <Link to="/posts">Browse Posts</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;