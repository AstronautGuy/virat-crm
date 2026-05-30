"use client";

import React from "react";
import { motion } from "framer-motion";
import { slideUp } from "@/lib/animations";
import { Loader2 } from "lucide-react";

interface PageWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function PageWrapper({ children, isLoading }: PageWrapperProps) {
  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full relative min-h-[50vh]"
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}
      <div className={isLoading ? "opacity-50 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
        {children}
      </div>
    </motion.div>
  );
}
