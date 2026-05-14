"use client";

import { useState } from "react";
import { DashboardLayout } from "../_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Shield, Briefcase, MapPin } from "lucide-react";
import { PushSettings } from "../_components/PushSettings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data: user, isLoading } = api.users.getMe.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">User not found. Please log in again.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        </div>

        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant="secondary" className="px-3 py-0.5">
                    {user.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">ID: {user.id?.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 mt-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Role</span>
                    <span className="font-medium">{user.role} Account</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Manager</span>
                    <span className="font-medium">
                      {user.managerId ? "Manager Assigned" : "Direct Report / Admin"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">Branch</span>
                    <span className="font-medium">Headquarters</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Settings</CardTitle>
            <CardDescription>Configure how you receive real-time alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <PushSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security Settings</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Account Session</CardTitle>
            <CardDescription>Manage your current access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">Sign Out</p>
                <p className="text-xs text-slate-500">End your current session on this device</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error", message: string } | null>(null);

  const mutation = api.users.updatePassword.useMutation({
    onSuccess: () => {
      setStatus({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      setStatus({ type: "error", message: err.message });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match" });
      return;
    }
    mutation.mutate({ currentPassword, newPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input 
          id="currentPassword" 
          type="password" 
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input 
          id="newPassword" 
          type="password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input 
          id="confirmPassword" 
          type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
        />
      </div>
      {status && (
        <p className={cn("text-sm", status.type === "success" ? "text-green-600" : "text-red-600")}>
          {status.message}
        </p>
      )}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
