"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { api } from "@/trpc/react";
import {
  Users,
  UserPlus,
  List,
  Loader2,
  Key,
  XCircle,
  CheckCircle2,
  MapPin,
  BarChart3,
  Lock,
  Edit,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function UsersAdminPage() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <DashboardLayout>
      <FeatureGate featureKey="admin">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                <Users className="h-6 w-6 text-indigo-600" />
                User Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Create new employees, assign roles, and manage credentials.
              </p>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-4 flex items-center justify-between">
              <TabsList className="border border-slate-200 bg-slate-100/50 p-1">
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  Employee List
                </TabsTrigger>
                <TabsTrigger value="add" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add New Employee
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0">
              <UserList />
            </TabsContent>

            <TabsContent value="add" className="mx-auto mt-0 max-w-2xl">
              <AddUserForm onSuccess={() => setActiveTab("list")} />
            </TabsContent>
          </Tabs>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}

interface UserType {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  employeeCode: string | null;
  role: string | null;
  branchId: number | null;
  isActive: boolean;
  branch?: { id: number; name: string } | null;
  managers?:
    | {
        manager: {
          id: string;
          firstName: string | null;
          lastName: string | null;
        };
      }[]
    | null;
}

function UserList() {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: users, isLoading } = api.users.getAllUsers.useQuery();
  const { data: branches } = api.inventory.getBranches.useQuery();
  const { data: roles } = api.roles.getAll.useQuery();

  const [statusFilter, setStatusFilter] = useState<
    "Active" | "Inactive" | "All"
  >("Active");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    user: UserType;
  } | null>(null);
  const [resetUser, setResetUser] = useState<UserType | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const toggleActiveMutation = api.users.toggleActiveStatus.useMutation({
    onSuccess: () => {
      toast.success("User active status updated");
      void utils.users.getAllUsers.invalidate();
    },
    onError: (err) => {
      toast.error(`Error updating status: ${err.message}`);
    },
  });

  const resetPasswordMutation = api.users.resetUserPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully");
      setResetUser(null);
      setNewPassword("");
    },
    onError: (err) => {
      toast.error(`Error resetting password: ${err.message}`);
    },
  });

  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
    role: string;
    branchId: string;
    managerIds: string[];
  }>({
    firstName: "",
    lastName: "",
    email: "",
    employeeCode: "",
    role: "",
    branchId: "none",
    managerIds: [],
  });

  const updateUserMutation = api.users.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Employee details updated successfully");
      setEditUser(null);
      void utils.users.getAllUsers.invalidate();
    },
    onError: (err) => {
      toast.error(`Error updating details: ${err.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleContextMenu = (e: React.MouseEvent, user: UserType) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user,
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    resetPasswordMutation.mutate({
      userId: resetUser.id,
      newPassword,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (
      !editForm.firstName.trim() ||
      !editForm.lastName.trim() ||
      !editForm.email.trim() ||
      !editForm.employeeCode.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateUserMutation.mutate({
      userId: editUser.id,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      employeeCode: editForm.employeeCode,
      role: editForm.role,
      branchId:
        editForm.branchId === "none" ? null : parseInt(editForm.branchId, 10),
      managerIds: editForm.managerIds,
    });
  };

  const filteredUsers = users?.filter((user) => {
    // 1. Status Filter
    if (statusFilter === "Active" && !user.isActive) return false;
    if (statusFilter === "Inactive" && user.isActive) return false;

    // 2. Role Filter
    if (roleFilter !== "All" && user.role !== roleFilter) return false;

    // 3. Branch Filter
    if (branchFilter !== "All" && user.branchId?.toString() !== branchFilter)
      return false;

    // 4. Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const fullName =
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
      const code = (user.employeeCode ?? "").toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      return (
        fullName.includes(query) ||
        code.includes(query) ||
        email.includes(query)
      );
    }

    return true;
  });

  return (
    <>
      <Card className="overflow-hidden border border-slate-200/80 shadow-md">
        {/* Responsive Glassmorphic Category Filter Bar */}
        <div className="border-slate-150 grid grid-cols-1 items-end gap-4 border-b bg-slate-50/50 p-5 sm:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Search Employee
            </Label>
            <Input
              placeholder="Search by name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border-slate-200 bg-white focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Active Status
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(v: "Active" | "Inactive" | "All") =>
                setStatusFilter(v)
              }
            >
              <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Active" className="rounded-lg">
                  Active Only
                </SelectItem>
                <SelectItem value="Inactive" className="rounded-lg">
                  Inactive Only
                </SelectItem>
                <SelectItem value="All" className="rounded-lg">
                  All Employees
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Role Type
            </Label>
            <Select
              value={roleFilter}
              onValueChange={(v: string) => setRoleFilter(v)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="All" className="rounded-lg">
                  All Roles
                </SelectItem>
                {roles?.map((r) => (
                  <SelectItem
                    key={r.name}
                    value={r.name}
                    className="rounded-lg"
                  >
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              Branch Location
            </Label>
            <Select
              value={branchFilter}
              onValueChange={(v: string) => setBranchFilter(v)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="All" className="rounded-lg">
                  All Branches
                </SelectItem>
                {branches?.map((b) => (
                  <SelectItem
                    key={b.id}
                    value={b.id.toString()}
                    className="rounded-lg"
                  >
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-slate-100 bg-slate-50/70">
                <TableRow>
                  <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Code
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Role
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Branch
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Manager
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center font-medium text-slate-400 italic"
                    >
                      No employees match your selected categories.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-context-menu border-b border-slate-100/60 transition-colors select-none hover:bg-slate-50/50"
                      onContextMenu={(e) => handleContextMenu(e, user)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs font-normal text-slate-400">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="rounded-lg border border-slate-200/50 bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                          {user.employeeCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "Admin"
                              ? "default"
                              : user.role === "Manager"
                                ? "secondary"
                                : "outline"
                          }
                          className="rounded-lg px-2 py-0.5 text-[10px] font-bold"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">
                        {user.branch?.name ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-500">
                        {user.managers && user.managers.length > 0
                          ? user.managers
                              .map(
                                (m) =>
                                  `${m.manager.firstName} ${m.manager.lastName}`,
                              )
                              .join(", ")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-green-700 uppercase">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Absolute context menu overlay */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            className="animate-in fade-in slide-in-from-top-2 fixed z-50 min-w-[210px] rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md duration-100"
            style={{
              left: Math.min(
                contextMenu.x,
                typeof window !== "undefined"
                  ? window.innerWidth - 230
                  : contextMenu.x,
              ),
              top: Math.min(
                contextMenu.y,
                typeof window !== "undefined"
                  ? window.innerHeight - 200
                  : contextMenu.y,
              ),
            }}
          >
            <div className="mb-1 border-b border-slate-100 px-3 py-1.5">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Employee Options
              </p>
              <p className="truncate text-xs font-bold text-slate-700">
                {contextMenu.user.firstName} {contextMenu.user.lastName}
              </p>
            </div>

            <button
              onClick={() => {
                toggleActiveMutation.mutate({
                  userId: contextMenu.user.id,
                  isActive: !contextMenu.user.isActive,
                });
                setContextMenu(null);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors",
                contextMenu.user.isActive
                  ? "text-red-600 hover:bg-red-50"
                  : "text-green-600 hover:bg-green-50",
              )}
            >
              {contextMenu.user.isActive ? (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Set as Inactive</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Set as Active</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                router.push(`/admin/live-map?userId=${contextMenu.user.id}`);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>Locate on Map</span>
            </button>

            <button
              onClick={() => {
                router.push(`/admin/reports?userId=${contextMenu.user.id}`);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <BarChart3 className="h-4 w-4 text-slate-400" />
              <span>View Reports</span>
            </button>

            <button
              onClick={() => {
                setEditUser(contextMenu.user);
                setEditForm({
                  firstName: contextMenu.user.firstName ?? "",
                  lastName: contextMenu.user.lastName ?? "",
                  email: contextMenu.user.email ?? "",
                  employeeCode: contextMenu.user.employeeCode ?? "",
                  role: contextMenu.user.role ?? "",
                  branchId: contextMenu.user.branchId
                    ? contextMenu.user.branchId.toString()
                    : "none",
                  managerIds: contextMenu.user.managers
                    ? contextMenu.user.managers.map((m: any) => m.manager.id)
                    : [],
                });
                setContextMenu(null);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-slate-100 px-3 py-2 pt-1.5 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Edit className="h-4 w-4 text-slate-400" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => {
                setResetUser(contextMenu.user);
                setContextMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Lock className="h-4 w-4 text-slate-400" />
              <span>Reset Password</span>
            </button>
          </div>
        </>
      )}

      {/* Password reset modal overlay */}
      {resetUser && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl duration-200">
            <div className="mb-4 flex items-center gap-3 text-indigo-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <Lock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500">
                  For {resetUser.firstName} {resetUser.lastName}
                </p>
              </div>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl border-slate-200 bg-slate-50/50 pl-9 focus-visible:ring-indigo-500"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setResetUser(null);
                    setNewPassword("");
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="rounded-xl bg-indigo-600 px-4 font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  {resetPasswordMutation.isPending
                    ? "Saving..."
                    : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editUser && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm duration-200">
          <div className="animate-in zoom-in-95 my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl duration-200">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 text-indigo-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                <Edit className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Employee Details
                </h3>
                <p className="text-xs text-slate-500">
                  Update workspace info, branch, role, or manager settings.
                </p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    placeholder="First Name"
                    className="rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    placeholder="Last Name"
                    className="rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="email@company.com"
                    className="rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Employee Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={editForm.employeeCode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, employeeCode: e.target.value })
                    }
                    placeholder="EMP-12345"
                    className="rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Functional Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(v) => setEditForm({ ...editForm, role: v })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {roles?.map((r) => (
                        <SelectItem
                          key={r.name}
                          value={r.name}
                          className="rounded-lg"
                        >
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Office Branch
                  </Label>
                  <Select
                    value={editForm.branchId}
                    onValueChange={(v) =>
                      setEditForm({ ...editForm, branchId: v })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem
                        value="none"
                        className="rounded-lg text-slate-400 italic"
                      >
                        No Branch (N/A)
                      </SelectItem>
                      {branches?.map((b) => (
                        <SelectItem
                          key={b.id}
                          value={b.id.toString()}
                          className="rounded-lg"
                        >
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Reporting Managers
                  </Label>
                  <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    {users
                      ?.filter(
                        (u) => u.id !== editUser?.id && u.role !== "Employee",
                      ) // Exclude self & non-managers to keep hierarchy logical
                      ?.map((u) => (
                        <label
                          key={u.id}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={editForm.managerIds.includes(u.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditForm({
                                  ...editForm,
                                  managerIds: [...editForm.managerIds, u.id],
                                });
                              } else {
                                setEditForm({
                                  ...editForm,
                                  managerIds: editForm.managerIds.filter(
                                    (id) => id !== u.id,
                                  ),
                                });
                              }
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <span className="text-sm text-slate-700">
                            {u.firstName} {u.lastName} ({u.role})
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditUser(null)}
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="rounded-xl bg-indigo-600 px-6 font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function AddUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeCode: "",
    password: "",
    role: "Employee",
    branchId: undefined as number | undefined,
    managerIds: [] as string[],
  });

  const { data: branches } = api.inventory.getBranches.useQuery();
  const { data: managers } = api.hierarchy.getManagers.useQuery();
  const { data: roles } = api.roles.getAll.useQuery();

  const mutation = api.users.createUser.useMutation({
    onSuccess: () => {
      toast.success("Employee created successfully");
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.branchId === undefined) {
      toast.error("Please select a branch");
      return;
    }
    mutation.mutate({
      ...formData,
      branchId: formData.branchId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Details</CardTitle>
        <CardDescription>
          Enter information to create a new system user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Employee Code (Login ID)</Label>
              <Input
                value={formData.employeeCode}
                onChange={(e) =>
                  setFormData({ ...formData, employeeCode: e.target.value })
                }
                placeholder="EMP001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Initial Password</Label>
            <div className="relative">
              <Key className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                type="password"
                className="pl-9"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v: string) =>
                  setFormData({ ...formData, role: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((r) => (
                    <SelectItem key={r.name} value={r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                value={formData.branchId?.toString()}
                onValueChange={(v) =>
                  setFormData({ ...formData, branchId: parseInt(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reporting Managers</Label>
              <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                {managers?.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={formData.managerIds.includes(m.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            managerIds: [...formData.managerIds, m.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            managerIds: formData.managerIds.filter(
                              (id) => id !== m.id,
                            ),
                          });
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-sm text-slate-700">
                      {m.firstName} {m.lastName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Creating..." : "Create Employee Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
