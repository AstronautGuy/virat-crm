"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { env } from "@/env";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushSettings() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveSubscription = api.notifications.savePushSubscription.useMutation();
  const deleteSubscription = api.notifications.deletePushSubscription.useMutation();

  useEffect(() => {
    async function checkSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setLoading(false);
    }
    void checkSubscription();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (subscription) {
        // Unsubscribe
        await subscription.unsubscribe();
        await deleteSubscription.mutateAsync({ endpoint: subscription.endpoint });
        setSubscription(null);
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          throw new Error("Permission not granted");
        }

        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
        });

        const subJson = sub.toJSON();
        if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
          throw new Error("Invalid subscription object");
        }

        await saveSubscription.mutateAsync({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth,
          },
          userAgent: navigator.userAgent,
        });

        setSubscription(sub);
      }
    } catch (err) {
      console.error("Push subscription error:", err);
      setError(err instanceof Error ? err.message : "Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return (
      <div className="text-xs text-gray-500 italic">
        Push notifications are not supported in this browser.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
          <p className="text-xs text-gray-500">Get real-time alerts for approvals and updates.</p>
        </div>
        <Button
          variant={subscription ? "outline" : "default"}
          size="sm"
          onClick={handleToggle}
          disabled={loading}
          className="h-9 px-4"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : subscription ? (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Disable
            </>
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Enable
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
