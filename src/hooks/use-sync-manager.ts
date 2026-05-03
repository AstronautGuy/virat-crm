"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { getOfflineQueue, removeFromOfflineQueue } from "./offline-db";

export function useSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const createSale = api.sales.createSale.useMutation();
  const createReplacement = api.replacements.createReplacement.useMutation();

  const updateCount = useCallback(async () => {
    const queue = await getOfflineQueue();
    setPendingCount(queue.length);
  }, []);

  const flushQueue = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;

    const queue = await getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    console.log(`[SyncManager] Flushing ${queue.length} operations...`);

    for (const op of queue) {
      try {
        if (op.type === "createSale") {
          await createSale.mutateAsync(op.data);
        } else if (op.type === "createReplacement") {
          await createReplacement.mutateAsync(op.data);
        }
        
        // Success - remove from local queue
        if (op.id) await removeFromOfflineQueue(op.id);
      } catch (error) {
        console.error(`[SyncManager] Failed to sync op ${op.id}:`, error);
        // If it's a validation error, we might want to discard or mark it
        // For now, we'll stop the flush to avoid repeated failures
        break;
      }
    }

    await updateCount();
    setIsSyncing(false);
  }, [createSale, createReplacement, isSyncing, updateCount]);

  useEffect(() => {
    // Initial count
    void updateCount();

    // Listen for online event
    const handleOnline = () => void flushQueue();
    window.addEventListener("online", handleOnline);

    // Periodic check every 30s
    const interval = setInterval(() => void flushQueue(), 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      clearInterval(interval);
    };
  }, [flushQueue, updateCount]);

  return { isSyncing, pendingCount, flushQueue };
}
