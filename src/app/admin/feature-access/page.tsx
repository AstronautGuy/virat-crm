"use client";

import { api } from "@/trpc/react";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  RefreshCcw,
  LayoutDashboard,
  ShoppingBag,
  Users,
  MapPin,
  BarChart3,
  FileText,
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FEATURES = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Main overview and summary stats" },
  { key: "sales", label: "Sales Register", icon: ShoppingBag, description: "Log and view sales transactions" },
  { key: "workforce", label: "Workforce", icon: Users, description: "Attendance, leave, and field visit logs" },
  { key: "live-map", label: "Live Field View", icon: MapPin, description: "Real-time location tracking for managers" },
  { key: "reports", label: "Intelligence Reports", icon: BarChart3, description: "Exportable XLSX performance reports" },
  { key: "documents", label: "Documents", icon: FileText, description: "Staff document storage and viewing" },
  { key: "org-chart", label: "Org Chart", icon: Network, description: "Visual team hierarchy and reporting lines" },
];

const ROLES = ["Admin", "Manager", "Employee"] as const;

export default function FeatureAccessPage() {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const { data: permissions, refetch } = api.permissions.getAll.useQuery();
  const toggleMutation = api.permissions.toggle.useMutation({
    onSuccess: () => {
      refetch();
      setIsUpdating(null);
    }
  });

  const getPermission = (role: string, featureKey: string) => {
    // If not found, default to enabled for Admins, disabled for others?
    // User request said "enable or disable each and every feature", so let's check if it exists
    const p = permissions?.find(p => p.role === role && p.featureKey === featureKey);
    if (p) return p.isEnabled;
    return role === "Admin"; // Default: Admins have everything, others don't
  };

  const handleToggle = async (role: typeof ROLES[number], featureKey: string, currentStatus: boolean) => {
    const id = `${role}-${featureKey}`;
    setIsUpdating(id);
    await toggleMutation.mutateAsync({
      role,
      featureKey,
      isEnabled: !currentStatus,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <span>Feature Access Control</span>
            </h1>
            <p className="mt-2 text-lg text-gray-500">Enable or disable core modules for specific user roles.</p>
          </div>
          <button 
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all w-fit"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-8 py-6 text-sm font-bold text-gray-900 w-1/3">Feature Module</th>
                  {ROLES.map(role => (
                    <th key={role} className="px-6 py-6 text-center text-sm font-bold text-gray-900">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {FEATURES.map((feature) => (
                  <tr key={feature.key} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                          <feature.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{feature.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </td>
                    {ROLES.map(role => {
                      const isEnabled = getPermission(role, feature.key);
                      const id = `${role}-${feature.key}`;
                      const updating = isUpdating === id;
                      
                      return (
                        <td key={role} className="px-6 py-6 text-center">
                          <button
                            onClick={() => handleToggle(role, feature.key, isEnabled)}
                            disabled={updating || (role === "Admin" && feature.key === "dashboard")} // Prevent disabling dashboard for Admin
                            className={cn(
                              "relative inline-flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                              isEnabled ? "bg-green-500 shadow-sm" : "bg-gray-200",
                              updating && "opacity-50 cursor-wait"
                            )}
                          >
                            <span 
                              className={cn(
                                "absolute left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 flex items-center justify-center",
                                isEnabled ? "translate-x-6" : "translate-x-0"
                              )}
                            >
                              {updating ? (
                                <RefreshCcw className="w-3 h-3 animate-spin text-gray-400" />
                              ) : isEnabled ? (
                                <Unlock className="w-3 h-3 text-green-600" />
                              ) : (
                                <Lock className="w-3 h-3 text-gray-400" />
                              )}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend / Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-start space-x-4">
            <Lock className="w-6 h-6 text-amber-600 mt-1" />
            <div>
              <h4 className="font-bold text-amber-900">Security Warning</h4>
              <p className="text-sm text-amber-700 mt-1">Disabling a feature will hide it from the sidebar and block its core API routes for that specific role. Be careful when modifying Admin permissions.</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex items-start space-x-4">
            <RefreshCcw className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-bold text-blue-900">Instant Activation</h4>
              <p className="text-sm text-blue-700 mt-1">Changes take effect immediately. Users may need to refresh their browser to see the updated navigation menu.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
