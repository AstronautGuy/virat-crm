"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { 
  ShieldAlert, 
  Users, 
  Lock, 
  Unlock, 
  EyeOff, 
  Server, 
  AlertTriangle, 
  Trash2,
  RefreshCw,
  Sliders,
  Power,
  AppWindow
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AVAILABLE_FEATURES = [
  { key: "dashboard", name: "Dashboard Overview" },
  { key: "crm", name: "CRM / Customers" },
  { key: "sales", name: "Sales / Orders" },
  { key: "inventory", name: "Inventory Management" },
  { key: "workforce", name: "Workforce / Team" },
  { key: "documents", name: "Documents Vault" },
  { key: "replacements", name: "Replacements" },
  { key: "performance", name: "Performance Audits" },
];

export default function DeveloperPage() {
  const { data: user, isLoading: isUserLoading } = api.users.getMe.useQuery();
  const utils = api.useUtils();

  const { data: settings, isLoading: isSettingsLoading } = api.developer.getSettings.useQuery(undefined, {
    enabled: user?.role === "Developer",
  });

  const { data: allUsers, isLoading: isUsersLoading } = api.users.getAllUsers.useQuery(undefined, {
    enabled: user?.role === "Developer",
  });

  const updateSettingsMutation = api.developer.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Developer settings updated successfully");
      void utils.developer.getSettings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteAccountMutation = api.developer.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("User account permanently purged from database");
      void utils.users.getAllUsers.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const [maxUsersInput, setMaxUsersInput] = useState<string>("");

  if (isUserLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (user?.role !== "Developer") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
          <div className="bg-red-50 p-4 rounded-full text-red-600 mb-6 animate-bounce">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sovereign Restriction</h1>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            This space is cryptographically bound to the sovereign **System Developer** role. Other credentials, including Administrator roles, are strictly forbidden.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const activeSettings = settings ?? {
    maxUsers: 50,
    isSystemLocked: false,
    isReadOnly: false,
    disabledFeaturesGlobal: [] as string[],
  };

  const handleToggleLock = () => {
    updateSettingsMutation.mutate({
      ...activeSettings,
      isSystemLocked: !activeSettings.isSystemLocked,
    });
  };

  const handleToggleReadOnly = () => {
    updateSettingsMutation.mutate({
      ...activeSettings,
      isReadOnly: !activeSettings.isReadOnly,
    });
  };

  const handleFeatureToggle = (featureKey: string) => {
    const isCurrentlyDisabled = activeSettings.disabledFeaturesGlobal.includes(featureKey);
    const newDisabled = isCurrentlyDisabled
      ? activeSettings.disabledFeaturesGlobal.filter(f => f !== featureKey)
      : [...activeSettings.disabledFeaturesGlobal, featureKey];

    updateSettingsMutation.mutate({
      ...activeSettings,
      disabledFeaturesGlobal: newDisabled,
    });
  };

  const handleUpdateMaxUsers = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(maxUsersInput);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid active user count");
      return;
    }
    updateSettingsMutation.mutate({
      ...activeSettings,
      maxUsers: val,
    });
    setMaxUsersInput("");
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`CRITICAL WARNING: You are about to PERMANENTLY DELETE the user "${name}" from the database. This action completely bypasses standard deactivation safety controls and cannot be undone. Do you proceed?`)) {
      deleteAccountMutation.mutate({ userId: id });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8 max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="z-10">
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-extrabold uppercase px-3 py-1 text-[10px] tracking-widest rounded-full mb-3 shadow-md">
              Sovereign Console
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Sliders className="w-8 h-8 text-red-500 animate-pulse" />
              Developer Omnipotence Panel
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              Global system control station. Enforce license user limits, trigger total lockouts, toggle maintenance mode, and globally disable system operations instantly.
            </p>
          </div>
        </div>

        {/* Global Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls Card */}
          <Card className="border-slate-100 shadow-xl overflow-hidden rounded-2xl lg:col-span-2">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Power className="w-5 h-5 text-indigo-500" />
                Global Status Killswitches
              </CardTitle>
              <CardDescription>Activate high-level constraints instantly across all clients</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8 divide-y divide-slate-100">
              {/* Killswitch 1: System Lockout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">Suspension Killswitch (Lock System)</span>
                    {activeSettings.isSystemLocked ? (
                      <Badge variant="destructive" className="font-bold">LOCKED</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold border-emerald-100">ACTIVE</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Instantly freeze the entire platform. Standard clients (web and mobile) are instantly locked out with a warning overlay. All queries and mutations are blocked, except for the Developer.
                  </p>
                </div>
                <div className="flex items-center">
                  <Switch 
                    checked={activeSettings.isSystemLocked} 
                    onCheckedChange={handleToggleLock}
                    disabled={updateSettingsMutation.isPending}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
              </div>

              {/* Killswitch 2: Read-Only Freeze */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">Read-Only Maintenance Freeze</span>
                    {activeSettings.isReadOnly ? (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold border-amber-200">READ-ONLY</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold border-emerald-100">MUTABLE</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Place the platform under maintenance. Standard users can browse data, but all database edits, sales inputs, and attendance logs are rejected. Developer is unaffected.
                  </p>
                </div>
                <div className="flex items-center">
                  <Switch 
                    checked={activeSettings.isReadOnly} 
                    onCheckedChange={handleToggleReadOnly}
                    disabled={updateSettingsMutation.isPending}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>
              </div>

              {/* User Cap */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6">
                <div className="space-y-1.5 max-w-xl">
                  <span className="font-extrabold text-slate-800 text-sm block">Active User Account License Cap</span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set the strict maximum number of active accounts allowed on this instance. Once reached, all self-signups and admin creations are immediately rejected.
                  </p>
                  <div className="flex items-center gap-2 pt-1.5">
                    <Badge variant="outline" className="text-slate-600 bg-slate-50">
                      Current Cap: {activeSettings.maxUsers} Accounts
                    </Badge>
                    {allUsers && (
                      <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-100">
                        Active Accounts: {allUsers.filter(u => u.isActive).length} / {activeSettings.maxUsers}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <form onSubmit={handleUpdateMaxUsers} className="flex gap-2">
                    <Input 
                      type="number"
                      placeholder="New Cap"
                      className="w-28 rounded-xl"
                      value={maxUsersInput}
                      onChange={(e) => setMaxUsersInput(e.target.value)}
                    />
                    <Button type="submit" disabled={updateSettingsMutation.isPending} className="rounded-xl">
                      Update
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Gate Controller */}
          <Card className="border-slate-100 shadow-xl overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <AppWindow className="w-5 h-5 text-indigo-500" />
                Global Feature Gating
              </CardTitle>
              <CardDescription>Disable specific modules across all roles immediately</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-[11px] text-slate-600 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-indigo-500 inline mr-1 mb-0.5" />
                Disabling a module here removes its access for all standard users (including Admins) at the network API route level.
              </div>
              <div className="space-y-3 pt-2">
                {AVAILABLE_FEATURES.map((feature) => {
                  const isDisabled = activeSettings.disabledFeaturesGlobal.includes(feature.key);
                  return (
                    <div 
                      key={feature.key}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isDisabled 
                          ? "bg-red-50/30 border-red-100 text-red-700" 
                          : "bg-white border-slate-100 text-slate-700 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{feature.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{feature.key} module</span>
                      </div>
                      <Switch 
                        checked={!isDisabled} 
                        onCheckedChange={() => handleFeatureToggle(feature.key)}
                        disabled={updateSettingsMutation.isPending}
                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database User Wipeout Area */}
        <Card className="border-slate-100 shadow-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Trash2 className="w-5 h-5 text-red-500" />
                Permanent Database User Purge
              </CardTitle>
              <CardDescription>Completely and permanently delete user records directly from the database.</CardDescription>
            </div>
            <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50 w-max">
              Extreme Security Hazard
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {isUsersLoading ? (
              <div className="flex justify-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <th className="p-4 pl-6">Employee</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Branch</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right font-bold text-red-500">Purge Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {allUsers?.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-800">{u.firstName} {u.lastName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{u.employeeCode}</span>
                          </div>
                        </td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">
                          <Badge variant={u.role === "Developer" ? "destructive" : "secondary"}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-500">{u.branch?.name ?? "N/A"}</td>
                        <td className="p-4">
                          {u.isActive ? (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">Inactive</Badge>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            disabled={u.role === "Developer" || deleteAccountMutation.isPending}
                            onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" /> Purge Account
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
