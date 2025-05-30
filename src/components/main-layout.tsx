import React from "react";
import { useTheme } from "./theme-provider";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  
  return (
    <main className="flex-1 overflow-auto relative">
      {/* Premium background pattern */}
      <div className={cn(
        "fixed inset-0 z-0 opacity-10 pointer-events-none",
        theme === "dark" 
          ? "bg-[url('https://images.unsplash.com/photo-1505506874110-6a7a69069a08?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')]"
          : "bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')]"
      )} />
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </main>
  );
};

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');