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
  Edit
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                User Management
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Create new employees, assign roles, and manage credentials.
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-slate-100/50 p-1 border border-slate-200">
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  Employee List
                </TabsTrigger>
                <TabsTrigger value="add" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add New Employee
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0">
              <UserList />
            </TabsContent>

            <TabsContent value="add" className="mt-0 max-w-2xl mx-auto">
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
  managerId: string | null;
  isActive: boolean;
  branch?: { id: number; name: string } | null;
  manager?: { id: string; firstName: string | null; lastName: string | null } | null;
}

function UserList() {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: users, isLoading } = api.users.getAllUsers.useQuery();
  const { data: branches } = api.inventory.getBranches.useQuery();
  const { data: roles } = api.roles.getAll.useQuery();

  const [statusFilter, setStatusFilter] = useState<"Active" | "Inactive" | "All">("Active");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; user: UserType } | null>(null);
  const [resetUser, setResetUser] = useState<UserType | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const toggleActiveMutation = api.users.toggleActiveStatus.useMutation({
    onSuccess: () => {
      toast.success("User active status updated");
      void utils.users.getAllUsers.invalidate();
    },
    onError: (err) => {
      toast.error(`Error updating status: ${err.message}`);
    }
  });

  const resetPasswordMutation = api.users.resetUserPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully");
      setResetUser(null);
      setNewPassword("");
    },
    onError: (err) => {
      toast.error(`Error resetting password: ${err.message}`);
    }
  });

  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeCode: "",
    role: "",
    branchId: "none",
    managerId: "none"
  });

  const updateUserMutation = api.users.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Employee details updated successfully");
      setEditUser(null);
      void utils.users.getAllUsers.invalidate();
    },
    onError: (err) => {
      toast.error(`Error updating details: ${err.message}`);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleContextMenu = (e: React.MouseEvent, user: UserType) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user
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
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim() || !editForm.employeeCode.trim()) {
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
      branchId: editForm.branchId === "none" ? null : parseInt(editForm.branchId, 10),
      managerId: editForm.managerId === "none" ? null : editForm.managerId,
    });
  };

  const filteredUsers = users?.filter((user) => {
    // 1. Status Filter
    if (statusFilter === "Active" && !user.isActive) return false;
    if (statusFilter === "Inactive" && user.isActive) return false;

    // 2. Role Filter
    if (roleFilter !== "All" && user.role !== roleFilter) return false;

    // 3. Branch Filter
    if (branchFilter !== "All" && user.branchId?.toString() !== branchFilter) return false;

    // 4. Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
      const code = (user.employeeCode ?? "").toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      return fullName.includes(query) || code.includes(query) || email.includes(query);
    }

    return true;
  });

  return (
    <>
      <Card className="overflow-hidden border border-slate-200/80 shadow-md">
        {/* Responsive Glassmorphic Category Filter Bar */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-150 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Search Employee</Label>
            <Input 
              placeholder="Search by name, code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Status</Label>
            <Select value={statusFilter} onValueChange={(v: "Active" | "Inactive" | "All") => setStatusFilter(v)}>
              <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Active" className="rounded-lg">Active Only</SelectItem>
                <SelectItem value="Inactive" className="rounded-lg">Inactive Only</SelectItem>
                <SelectItem value="All" className="rounded-lg">All Employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Role Type</Label>
            <Select value={roleFilter} onValueChange={(v: string) => setRoleFilter(v)}>
              <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="All" className="rounded-lg">All Roles</SelectItem>
                {roles?.map((r) => (
                  <SelectItem key={r.name} value={r.name} className="rounded-lg">{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Branch Location</Label>
            <Select value={branchFilter} onValueChange={(v: string) => setBranchFilter(v)}>
              <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="All" className="rounded-lg">All Branches</SelectItem>
                {branches?.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()} className="rounded-lg">{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70 border-b border-slate-100">
                <TableRow>
                  <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs">Name</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs">Code</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs">Role</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs">Branch</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs">Manager</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-medium italic">
                      No employees match your selected categories.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-context-menu select-none hover:bg-slate-50/50 transition-colors border-b border-slate-100/60"
                      onContextMenu={(e) => handleContextMenu(e, user)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-semibold">{user.firstName} {user.lastName}</span>
                          <span className="text-xs text-slate-400 font-normal">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/50">
                          {user.employeeCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === "Admin" ? "default" : user.role === "Manager" ? "secondary" : "outline"}
                          className="rounded-lg font-bold px-2 py-0.5 text-[10px]"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm font-medium">{user.branch?.name ?? "N/A"}</TableCell>
                      <TableCell className="text-slate-500 text-sm font-medium">
                        {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : "-"}
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
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
            className="fixed z-50 min-w-[210px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-100"
            style={{ 
              left: Math.min(contextMenu.x, typeof window !== "undefined" ? window.innerWidth - 230 : contextMenu.x), 
              top: Math.min(contextMenu.y, typeof window !== "undefined" ? window.innerHeight - 200 : contextMenu.y) 
            }}
          >
            <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Options</p>
              <p className="text-xs font-bold text-slate-700 truncate">{contextMenu.user.firstName} {contextMenu.user.lastName}</p>
            </div>

            <button
              onClick={() => {
                toggleActiveMutation.mutate({
                  userId: contextMenu.user.id,
                  isActive: !contextMenu.user.isActive
                });
                setContextMenu(null);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors",
                contextMenu.user.isActive 
                  ? "text-red-600 hover:bg-red-50" 
                  : "text-green-600 hover:bg-green-50"
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
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>Locate on Map</span>
            </button>

            <button
              onClick={() => {
                router.push(`/admin/reports?userId=${contextMenu.user.id}`);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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
                  branchId: contextMenu.user.branchId ? contextMenu.user.branchId.toString() : "none",
                  managerId: contextMenu.user.managerId ?? "none"
                });
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100 mt-1 pt-1.5"
            >
              <Edit className="h-4 w-4 text-slate-400" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => {
                setResetUser(contextMenu.user);
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Lock className="h-4 w-4 text-slate-400" />
              <span>Reset Password</span>
            </button>
          </div>
        </>
      )}

      {/* Password reset modal overlay */}
      {resetUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Lock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500">For {resetUser.firstName} {resetUser.lastName}</p>
              </div>
            </div>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-xs">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-semibold px-4"
                >
                  {resetPasswordMutation.isPending ? "Saving..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-2xl my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-indigo-600 mb-6 border-b border-slate-100 pb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <Edit className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Edit Employee Details</h3>
                <p className="text-xs text-slate-500">Update workspace info, branch, role, or manager settings.</p>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-xs">First Name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    placeholder="First Name"
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-xs">Last Name <span className="text-red-500">*</span></Label>
                  <Input 
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-xs">Email Address <span className="text-red-500">*</span></Label>
                  <Input 
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="email@company.com"
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-xs">Employee Code <span className="text-red-500">*</span></Label>
                  <Input 
                    value={editForm.employeeCode}
                    onChange={(e) => setEditForm({ ...editForm, employeeCode: e.target.value })}
                    placeholder="EMP-12345"
                    className="bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-xs">Functional Role <span className="text-red-500">*</span></Label>
                  <Select 
                    value={editForm.role} 
                    onValueChange={(v) => setEditForm({ ...editForm, role: v })}
                  >
                    <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {roles?.map((r) => (
                        <SelectItem key={r.name} value={r.name} className="rounded-lg">{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-xs">Office Branch</Label>
                  <Select 
                    value={editForm.branchId} 
                    onValueChange={(v) => setEditForm({ ...editForm, branchId: v })}
                  >
                    <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none" className="rounded-lg text-slate-400 italic">No Branch (N/A)</SelectItem>
                      {branches?.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()} className="rounded-lg">{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-xs">Reporting Manager</Label>
                  <Select 
                    value={editForm.managerId} 
                    onValueChange={(v) => setEditForm({ ...editForm, managerId: v })}
                  >
                    <SelectTrigger className="bg-slate-50/50 border-slate-200 rounded-xl">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none" className="rounded-lg text-slate-400 italic">No Manager (N/A)</SelectItem>
                      {users
                        ?.filter((u) => u.id !== editUser?.id && u.role !== "Employee") // Exclude self & non-managers to keep hierarchy logical
                        ?.map((u) => (
                          <SelectItem key={u.id} value={u.id} className="rounded-lg">
                            {u.firstName} {u.lastName} ({u.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-semibold px-6"
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
    managerId: undefined as string | undefined,
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
        <CardDescription>Enter information to create a new system user</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})}
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
                onChange={e => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Employee Code (Login ID)</Label>
              <Input 
                value={formData.employeeCode} 
                onChange={e => setFormData({...formData, employeeCode: e.target.value})}
                placeholder="EMP001"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Initial Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                type="password"
                className="pl-9"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(v: string) => setFormData({...formData, role: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((r) => (
                    <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Select 
                value={formData.branchId?.toString()} 
                onValueChange={(v) => setFormData({...formData, branchId: parseInt(v)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reports To</Label>
              <Select 
                value={formData.managerId} 
                onValueChange={(v) => setFormData({...formData, managerId: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {managers?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Employee Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
