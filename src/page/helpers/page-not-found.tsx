// src/page/not-found.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

const NotFoundPage = () => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-1/4 -right-1/4 w-[80vh] h-[80vh] rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5"></div>
        <div className="absolute bottom-0 left-0 w-[60vh] h-[60vh] rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/5"></div>
        <div className="absolute top-1/3 left-1/4 w-[40vh] h-[40vh] rounded-full bg-pink-500/10 blur-3xl dark:bg-pink-500/5"></div>
      </div>
      
      {/* Main content */}
      <div className={`max-w-4xl w-full rounded-3xl overflow-hidden backdrop-blur-lg z-10 ${
        theme === 'dark' 
          ? 'bg-card/80 border border-gray-800' 
          : 'bg-white/90 border border-gray-200'
      } shadow-2xl p-8 md:p-12 relative`}>
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Animation container */}
          <div className="w-full md:w-2/5 flex justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-48 h-48 rounded-full ${
                  theme === 'dark' ? 'bg-indigo-900/20' : 'bg-indigo-100'
                } flex items-center justify-center`}>
                  <div className={`w-32 h-32 rounded-full ${
                    theme === 'dark' ? 'bg-indigo-800/30' : 'bg-indigo-200'
                  } flex items-center justify-center`}>
                    <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                      404
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className={`absolute top-0 left-0 w-12 h-12 rounded-full ${
                theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-300'
              } animate-float1`}></div>
              <div className={`absolute bottom-4 right-2 w-8 h-8 rounded-full ${
                theme === 'dark' ? 'bg-pink-500/30' : 'bg-pink-300'
              } animate-float2`}></div>
              <div className={`absolute top-8 right-0 w-10 h-10 rounded-full ${
                theme === 'dark' ? 'bg-indigo-500/30' : 'bg-indigo-300'
              } animate-float3`}></div>
            </div>
          </div>
          
          {/* Text content */}
          <div className="w-full md:w-3/5 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-lg mx-auto md:mx-0">
              The page you're looking for seems to have vanished into the digital void. 
              It might have been moved, deleted, or perhaps it never existed.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mb-8">
              <Button 
                asChild 
                variant="default" 
                className="rounded-xl py-6 px-8 text-lg font-medium transition-all hover:scale-105 shadow-lg"
              >
                <Link to="/">Back to Home</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="rounded-xl py-6 px-8 text-lg font-medium transition-all hover:scale-105"
              >
                <Link to="/">Browse Posts</Link>
              </Button>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-4 max-w-lg mx-auto md:mx-0">
              <h3 className="font-medium text-foreground mb-2">While you're here, try:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>Checking the URL for typos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>Searching for what you need</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>Exploring our trending content</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500">•</span>
                  <span>Contacting support if stuck</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating astronaut */}
      <div className={`absolute bottom-8 right-8 z-20 w-24 h-24 ${
        isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } transition-all duration-1000`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="90" fill="#4F46E5" opacity="0.1" />
          <g transform="translate(60, 60)">
            <circle cx="40" cy="30" r="20" fill="#FBBF24" />
            <circle cx="35" cy="25" r="2" fill="#000" />
            <circle cx="45" cy="25" r="2" fill="#000" />
            <path d="M30 40 Q40 50 50 40" stroke="#000" strokeWidth="2" fill="none" />
            <rect x="25" y="50" width="30" height="40" rx="5" fill="#3B82F6" />
            <rect x="20" y="60" width="10" height="20" rx="3" fill="#3B82F6" />
            <rect x="50" y="60" width="10" height="20" rx="3" fill="#3B82F6" />
            <rect x="30" y="90" width="5" height="20" rx="2" fill="#3B82F6" />
            <rect x="45" y="90" width="5" height="20" rx="2" fill="#3B82F6" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default NotFoundPage;