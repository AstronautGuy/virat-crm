import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import LiveTeamMap from "@/app/_components/maps/LiveTeamMap";
import { Users, MapPin, Activity } from "lucide-react";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
export default function LiveMapPage() {

  return (
    <DashboardLayout>
      <FeatureGate featureKey="live-map">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Live Field View</h1>
              <p className="text-sm text-gray-500">Real-time GPS tracking of active team members.</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Tracking Active</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">On Field</p>
                  <p className="text-xl font-bold text-gray-900">12 Agents</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Visits</p>
                  <p className="text-xl font-bold text-gray-900">48 Points</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hidden md:block">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">System Pulse</p>
                  <p className="text-xl font-bold text-gray-900">Healthy</p>
                </div>
              </div>
            </div>
          </div>

          <LiveTeamMap />

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Tracking Privacy Notice</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Location data is collected exclusively during active "Checked-In" hours. 
              Background tracking is battery-optimized and only visible to assigned managers.
              Historical data is purged after 30 days per company data retention policies.
            </p>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
