"use client";

import React from "react";
import { SkelonProvider as BaseSkelonProvider } from "@skelon/react";

export function SkeletonProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseSkelonProvider
      options={{
        color: "oklch(0.96 0.005 255)", // Very light slate
        highlightColor: "oklch(0.98 0.002 255)", // Almost white
        duration: 1.5,
      }}
    >
      {children}
    </BaseSkelonProvider>
  );
}
