"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 15, { animate: true, duration: 1 });
    }
  }, [center, map]);

  return null;
}
