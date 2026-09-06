"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Key, MapPin, Briefcase, FileText, Download, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, use } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { data: user, isLoading } = api.users.getUserById.useQuery({ id });
  
  const [newPassword, setNewPassword] = useState("");
  const updatePasswordMutation = api.users.updateUserPassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated successfully");
      setNewPassword("");
    },
    onError: (err) => {
      toast.error(`Failed to update password: ${err.message}`);
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-slate-500">
          <User className="h-12 w-12 opacity-50" />
          <p>Employee not found</p>
          <Button variant="outline" onClick={() => router.push("/admin/users")}>Back to Employees</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    updatePasswordMutation.mutate({ userId: user.id, newPassword });
  };

  return (
    <DashboardLayout>
      <FeatureGate featureKey="admin">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/users")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                Employee Profile
                <Badge variant={user.isActive ? "default" : "destructive"} className={user.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Basic Info & Actions */}
            <div className="space-y-6">
              <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />
                <CardContent className="pt-0 relative px-6 pb-6">
                  <div className="absolute -top-12 left-6 border-4 border-white rounded-full bg-white shadow-md">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                        <User className="h-10 w-10 text-slate-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-14 space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">{user.firstName} {user.lastName}</h2>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="font-mono bg-slate-50">{user.employeeCode}</Badge>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">{user.role}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password Card */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                    <Key className="h-4 w-4 text-amber-500" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">New Password</Label>
                      <Input
                        type="password"
                        placeholder="Min. 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-xl bg-slate-50/50"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={updatePasswordMutation.isPending} className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                      {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Details & Documents */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 mb-4">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                    <Briefcase className="h-4 w-4 text-indigo-500" />
                    Employment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch Location</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {user.branch?.name ?? "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Managers</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">
                        {user.managers && user.managers.length > 0
                          ? user.managers.map((m: any) => `${m.manager.firstName} ${m.manager.lastName}`).join(", ")
                          : "None"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joining Date</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">
                        {user.joiningDate ? format(new Date(user.joiningDate), 'MMMM d, yyyy') : "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Father's Name</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">
                        {user.fatherName ?? "N/A"}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 mb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!user.documents || user.documents.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No documents uploaded for this employee.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-medium text-slate-900 truncate" title={doc.name}>{doc.name}</p>
                              <p className="text-xs text-slate-500">Document</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" asChild className="shrink-0 text-slate-400 hover:text-indigo-600">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 mb-4">
                  <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Devices where this user is currently logged in.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-6 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-600 font-medium">Session tracking is simulated</p>
                    <p className="text-xs mt-1">This user currently has no active sessions tracked.</p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
