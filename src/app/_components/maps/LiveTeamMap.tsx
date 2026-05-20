"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { api } from "@/trpc/react";
import { User } from "lucide-react";
import { renderToString } from "react-dom/server";

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

import type * as Leaflet from "leaflet";

export default function LiveTeamMap() {
  const [L, setL] = useState<typeof Leaflet | null>(null);
  const searchParams = useSearchParams();
  const queryUserId = searchParams ? searchParams.get("userId") : null;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(queryUserId);
  const [playbackDate, setPlaybackDate] = useState<string>(new Date().toISOString().split("T")[0]!);


  const { data: teamLocations, isLoading, refetch } = api.location.getLiveTeam.useQuery({}, {
    refetchInterval: 30000,
  });

  const { data: playbackPath } = api.location.getRoutePlayback.useQuery(
    { userId: selectedUserId!, date: playbackDate },
    { enabled: !!selectedUserId }
  );

  useEffect(() => {
    void import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  if (isLoading || !L) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Initializing Map Engine...</p>
        </div>
      </div>
    );
  }

  // Create a custom div icon using Lucide
  const createIcon = (_name: string, isOnline: boolean) => {
    const ringColor = isOnline ? "ring-blue-400 bg-blue-600" : "ring-gray-300 bg-gray-400";
    const pulseElement = isOnline ? (
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
      </span>
    ) : null;

    const html = renderToString(
      <div className={`relative flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white ${ringColor}`}>
        <User className="h-5 w-5" />
        {pulseElement}
      </div>
    );
    return L.divIcon({
      html,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm relative">
      <MapContainer
        center={[20.5937, 78.9629]} // Default to India center
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {teamLocations?.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={createIcon(`${loc.user.firstName} ${loc.user.lastName}`, loc.isOnline)}
            eventHandlers={{
              click: () => setSelectedUserId(loc.userId),
            }}
          >
            <Popup className="premium-popup">
              <div className="p-2">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${loc.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                  <p className="font-bold text-gray-900">{loc.user.firstName} {loc.user.lastName}</p>
                </div>
                
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2.5">Status</p>
                <p className={`text-xs font-bold ${loc.isOnline ? "text-green-600" : "text-gray-500"}`}>
                  {loc.isOnline ? "ONLINE (Active Now)" : "OFFLINE"}
                </p>

                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">Last Seen</p>
                <p className="text-xs font-medium text-gray-700">
                  {new Date(loc.createdAt).toLocaleString()}
                </p>
                <div className="mt-3.5">
                  <button 
                    onClick={() => setSelectedUserId(loc.userId)}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-lg shadow-sm"
                  >
                    View Today&apos;s Route
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {playbackPath && playbackPath.length > 1 && (
          <Polyline 
            positions={playbackPath.map(p => [p.latitude, p.longitude])} 
            color="#2563eb"
            weight={5}
            opacity={0.9}
          />
        )}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 items-end">
        <button 
          onClick={() => void refetch()}
          className="bg-white/90 backdrop-blur-md border border-gray-100 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-600 shadow-sm active:scale-95 transition-all"
        >
          Live Update
        </button>

        {selectedUserId && (
          <button 
            onClick={() => setSelectedUserId(null)}
            className="bg-gray-900/90 backdrop-blur-md border border-gray-800 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm active:scale-95 transition-all"
          >
            Clear Route
          </button>
        )}
      </div>

      {selectedUserId && playbackPath && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/90 backdrop-blur-md border border-gray-100 p-3 rounded-2xl shadow-xl md:w-64">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-900">Route Playback</p>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
              {playbackPath.length} Points
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Showing historical path for today.</p>
        </div>
      )}
    </div>
  );
}
