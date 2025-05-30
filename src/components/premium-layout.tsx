import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const PremiumLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="container mx-auto p-4 md:p-6 max-w-6xl"
    >
      <div className="bg-background/80 backdrop-blur-lg rounded-2xl border border-border/30 shadow-xl p-4 md:p-8">
        {children}
      </div>
    </motion.div>
  );
};