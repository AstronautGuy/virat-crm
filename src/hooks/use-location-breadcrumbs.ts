"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";

const TRACKING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MIN_ACCURACY = 100; // 100 meters

export function useLocationBreadcrumbs() {
  const { data: user } = api.users.getMe.useQuery();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  const logBreadcrumb = (api.location.logBreadcrumb as any).useMutation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const captureLocation = () => {
    if (!navigator.geolocation) return;
    if (user?.role === "Admin") return; // Admins are not tracked

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Only log if accuracy is decent (or if it's the best we have)
        if (accuracy < MIN_ACCURACY) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          logBreadcrumb.mutate({
            latitude,
            longitude,
            accuracy,
          });
        }
      },
      (error) => {
        // If high accuracy failed, try again with low accuracy
        if (error.code === error.TIMEOUT) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              logBreadcrumb.mutate({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
            },
            (err) => console.error("Breadcrumb error (low accuracy fallback):", err.message),
            { enableHighAccuracy: false, timeout: 10000 }
          );
        } else {
          console.error("Breadcrumb error:", error.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 1000 * 60 * 5, // Accept cached location up to 5 mins old
      }
    );
  };

  useEffect(() => {
    // Don't start tracking until we know the user's role
    if (!user) return;
    
    // If Admin, don't track
    if (user.role === "Admin") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Start tracking
    captureLocation();
    
    timerRef.current = setInterval(captureLocation, TRACKING_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]);

  return null;
}
