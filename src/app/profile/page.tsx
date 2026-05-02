"use client";

import { DashboardLayout } from "../_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Shield, Briefcase, MapPin } from "lucide-react";

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
                  <span className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</span>
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
                      {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : "Direct Report / Admin"}
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
            <CardTitle className="text-lg">Account Permissions</CardTitle>
            <CardDescription>Based on your {user.role} role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Create Sales Records</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Request Product Replacements</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Approve/Reject Sales Status</span>
              {user.role === "Admin" || user.role === "Manager" ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Disabled</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
