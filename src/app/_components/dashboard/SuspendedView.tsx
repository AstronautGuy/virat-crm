"use client";

import { ShieldAlert, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SuspendedView() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Successfully logged out");
        router.push("/login");
        router.refresh();
      } else {
        toast.error("Logout failed");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      {/* Premium Ambient Background */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-red-950/20 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-indigo-950/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="z-10 w-full max-w-lg"
      >
        <div className="overflow-hidden rounded-3xl border border-red-500/10 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-2xl md:p-12">
          {/* Glowing locked icon */}
          <div className="relative mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-950/50 shadow-lg shadow-red-950/40">
            <ShieldAlert className="h-10 w-10 animate-pulse text-red-500" />
            <div className="absolute inset-0 animate-ping rounded-3xl border border-red-500/30 opacity-25" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            System Suspended
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Access to this platform has been temporarily frozen by the sovereign
            **System Developer** for licensing audit, system maintenance, or
            service suspension.
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-slate-800 bg-slate-950/50 p-4 font-mono text-xs text-red-400/80">
            STATUS: SYSTEM_LOCKOUT_ENFORCED
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full rounded-2xl border-slate-800 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Status
            </Button>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full rounded-2xl bg-red-600 font-semibold text-white hover:bg-red-700 sm:w-auto"
            >
              {isLoggingOut ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
