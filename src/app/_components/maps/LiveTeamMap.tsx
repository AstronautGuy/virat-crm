"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { env } from "@/env";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { api } from "@/trpc/react";
import { User, Search } from "lucide-react";
import { renderToString } from "react-dom/server";
import { Input } from "@/components/ui/input";

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);
const MarkerClusterGroup = dynamic(() => import("react-leaflet-cluster"), {
  ssr: false,
});
const MapFlyTo = dynamic(() => import("./MapFlyTo"), { ssr: false });

import type * as Leaflet from "leaflet";

export default function LiveTeamMap() {
  const [L, setL] = useState<typeof Leaflet | null>(null);
  const searchParams = useSearchParams();
  const queryUserId = searchParams ? searchParams.get("userId") : null;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    queryUserId,
  );
  const [playbackDate, setPlaybackDate] = useState<string>(
    new Date().toISOString().split("T")[0]!,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const {
    data: teamLocations,
    isLoading,
    refetch,
  } = api.location.getLiveTeam.useQuery(
    {},
    {
      refetchInterval: 30000,
    },
  );

  const { data: playbackPath } = api.location.getRoutePlayback.useQuery(
    { userId: selectedUserId!, date: playbackDate },
    { enabled: !!selectedUserId },
  );

  useEffect(() => {
    void import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (isLoading || !L) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-gray-100 bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-gray-500">
            Initializing Map Engine...
          </p>
        </div>
      </div>
    );
  }

  // Create a custom div icon using Lucide
  const createIcon = (_name: string, isOnline: boolean) => {
    const ringColor = isOnline
      ? "ring-blue-400 bg-blue-600"
      : "ring-gray-300 bg-gray-400";
    const pulseElement = isOnline ? (
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-500"></span>
      </span>
    ) : null;

    const html = renderToString(
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white ${ringColor}`}
      >
        <User className="h-5 w-5" />
        {pulseElement}
      </div>,
    );
    return L.divIcon({
      html,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const filteredTeam =
    teamLocations?.filter((loc) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        loc.user.firstName.toLowerCase().includes(q) ||
        loc.user.lastName.toLowerCase().includes(q) ||
        loc.user.employeeCode?.toLowerCase().includes(q)
      );
    }) ?? [];

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      <MapContainer
        center={[20.5937, 78.9629]} // Default to India center
        zoom={5}
        scrollWheelZoom={true}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution={env.NEXT_PUBLIC_MAP_ATTRIBUTION}
          url={env.NEXT_PUBLIC_MAP_TILE_URL}
        />
        {selectedUserId &&
          teamLocations?.find((l) => l.userId === selectedUserId) && (
            <MapFlyTo
              center={[
                teamLocations.find((l) => l.userId === selectedUserId)!
                  .latitude,
                teamLocations.find((l) => l.userId === selectedUserId)!
                  .longitude,
              ]}
            />
          )}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
        >
          {teamLocations?.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createIcon(
                `${loc.user.firstName} ${loc.user.lastName}`,
                loc.isOnline,
              )}
              eventHandlers={{
                click: () => setSelectedUserId(loc.userId),
              }}
            >
              <Popup className="premium-popup">
                <div className="p-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${loc.isOnline ? "animate-pulse bg-green-500" : "bg-gray-400"}`}
                    />
                    <p className="font-bold text-gray-900">
                      {loc.user.firstName} {loc.user.lastName}
                    </p>
                  </div>

                  <p className="mt-2.5 text-[10px] tracking-widest text-gray-400 uppercase">
                    Status
                  </p>
                  <p
                    className={`text-xs font-bold ${loc.isOnline ? "text-green-600" : "text-gray-500"}`}
                  >
                    {loc.isOnline ? "ONLINE (Active Now)" : "OFFLINE"}
                  </p>

                  <p className="mt-2 text-[10px] tracking-widest text-gray-400 uppercase">
                    Last Seen
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {format(new Date(loc.createdAt), "hh:mm a, MMM do")}
                  </p>
                  <div className="mt-3.5">
                    <button
                      onClick={() => setSelectedUserId(loc.userId)}
                      className="w-full rounded-lg bg-blue-600 py-1.5 text-[10px] font-bold tracking-widest text-white uppercase shadow-sm transition-colors hover:bg-blue-700"
                    >
                      View Today&apos;s Route
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {playbackPath && playbackPath.length > 1 && (
          <Polyline
            positions={playbackPath.map(
              (p: { latitude: number; longitude: number }) => [
                p.latitude,
                p.longitude,
              ],
            )}
            color="#2563eb"
            weight={5}
            opacity={0.9}
          />
        )}
      </MapContainer>

      {/* Search Overlay */}
      <div className="absolute top-4 left-4 z-[1000] w-72">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search employee or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="h-10 w-full rounded-xl border border-gray-100 bg-white/90 pr-4 pl-10 text-sm font-medium shadow-sm backdrop-blur-md transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>

        {isSearchFocused && searchQuery && filteredTeam.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
            {filteredTeam.map((loc) => (
              <button
                key={loc.userId}
                onClick={() => {
                  setSelectedUserId(loc.userId);
                  setSearchQuery("");
                }}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ${loc.isOnline ? "animate-pulse bg-green-500" : "bg-gray-400"}`}
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {loc.user.firstName} {loc.user.lastName}
                  </p>
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase">
                    {loc.user.employeeCode}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        <button
          onClick={() => void refetch()}
          className="rounded-full border border-gray-100 bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-widest text-blue-600 uppercase shadow-sm backdrop-blur-md transition-all active:scale-95"
        >
          Live Update
        </button>

        {selectedUserId && (
          <button
            onClick={() => setSelectedUserId(null)}
            className="rounded-full border border-gray-800 bg-gray-900/90 px-3 py-1.5 text-[10px] font-bold tracking-widest text-white uppercase shadow-sm backdrop-blur-md transition-all active:scale-95"
          >
            Clear Route
          </button>
        )}
      </div>

      {selectedUserId && playbackPath && (
        <div className="absolute right-4 bottom-4 left-4 z-[1000] rounded-2xl border border-gray-100 bg-white/90 p-3 shadow-xl backdrop-blur-md md:w-64">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-900">Route Playback</p>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">
              {playbackPath.length} Points
            </span>
          </div>
          <p className="mt-1 text-[10px] text-gray-500">
            Showing historical path for today.
          </p>
        </div>
      )}
    </div>
  );
}
