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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-950/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-red-500/10 overflow-hidden text-center p-8 md:p-12">
          {/* Glowing locked icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-950/50 border border-red-500/20 mb-8 shadow-lg shadow-red-950/40 relative">
            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
            <div className="absolute inset-0 rounded-3xl border border-red-500/30 animate-ping opacity-25" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Suspended
          </h1>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-md mx-auto">
            Access to this platform has been temporarily frozen by the sovereign **System Developer** for licensing audit, system maintenance, or service suspension.
          </p>

          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-red-400/80 mt-6 max-w-sm mx-auto">
            STATUS: SYSTEM_LOCKOUT_ENFORCED
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full sm:w-auto rounded-2xl border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status
            </Button>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full sm:w-auto rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isLoggingOut ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-2" />
              )}
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
