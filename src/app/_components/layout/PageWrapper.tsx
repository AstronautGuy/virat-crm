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
      className="relative min-h-[50vh] w-full"
    >
      {isLoading ? (
        <div className="bg-background/50 absolute inset-0 z-50 flex items-center justify-center rounded-xl backdrop-blur-sm">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : null}
      <div
        className={
          isLoading
            ? "pointer-events-none opacity-50 transition-opacity duration-300"
            : "transition-opacity duration-300"
        }
      >
        {children}
      </div>
    </motion.div>
  );
}
