"use client";

import React from "react";
import { motion } from "framer-motion";
import { slideUp } from "@/lib/animations";
import { Skelon } from "@skelon/react";

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
      className="w-full"
    >
      <Skelon loading={isLoading ?? false}>
        {children}
      </Skelon>
    </motion.div>
  );
}
