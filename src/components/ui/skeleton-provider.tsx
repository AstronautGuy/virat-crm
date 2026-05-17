"use client";

import React from "react";

export function SkeletonProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
