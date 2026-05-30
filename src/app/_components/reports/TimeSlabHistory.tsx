"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Clock, MapPin, Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface TimeSlabHistoryProps {
  userId: string;
  date: Date;
}

export function TimeSlabHistory({ userId, date }: TimeSlabHistoryProps) {
  const { data, isLoading } = api.location.getHistory.useQuery({
    userId,
    date,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Navigation className="mb-3 h-10 w-10 text-slate-300" />
        <p className="font-semibold text-slate-700">No location logs found.</p>
        <p className="text-sm text-slate-500">
          The employee has no location history for this date.
        </p>
      </div>
    );
  }

  // Group by slab for presentation
  const slabs = data.reduce((acc, log) => {
    const slabKey = log.slab || "Unknown Time";
    if (!acc[slabKey]) acc[slabKey] = [];
    acc[slabKey]!.push(log);
    return acc;
  }, {} as Record<string, typeof data>);

  return (
    <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
      {Object.entries(slabs).map(([slab, logs]) => (
        <div key={slab} className="relative rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <h4 className="font-bold text-slate-800">Time Slab: {slab}</h4>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
              {logs.length} Pings
            </Badge>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-tight text-slate-700">
                    {log.locationName || `${parseFloat(log.latitude).toFixed(4)}, ${parseFloat(log.longitude).toFixed(4)}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    Recorded at {format(new Date(log.recordedAt), "hh:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
