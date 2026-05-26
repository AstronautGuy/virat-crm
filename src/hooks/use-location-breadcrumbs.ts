"use client";

import { useEffect, useRef, useCallback } from "react";
import { api } from "@/trpc/react";

const TRACKING_INTERVAL = 10 * 1000; // 10 seconds

export function useLocationBreadcrumbs() {
  const { data: user } = api.users.getMe.useQuery();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  const { mutate: logBreadcrumbMutate } = (api.location.logBreadcrumb as any).useMutation();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    if (user?.role === "Admin") return; // Admins are not tracked

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        logBreadcrumbMutate({
          latitude,
          longitude,
          accuracy,
        });
      },
      (error) => {
        // If high accuracy failed, try again with low accuracy
        if (error.code === error.TIMEOUT) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              logBreadcrumbMutate({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
            },
            (err) =>
              console.error(
                "Breadcrumb error (low accuracy fallback):",
                err.message,
              ),
            { enableHighAccuracy: false, timeout: 10000 },
          );
        } else {
          console.error("Breadcrumb error:", error.message);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 1000 * 60 * 5, // Accept cached location up to 5 mins old
      },
    );
  }, [user, logBreadcrumbMutate]);

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
  }, [user, captureLocation]);

  return null;
}
