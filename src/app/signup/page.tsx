"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, User, Mail, Lock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeCode: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signup = api.users.signup.useMutation({
    onSuccess: () => {
      router.push("/login?signup=success");
    },
    onError: (err) => {
      setError(err.message || "Signup failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    signup.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 mb-4 shadow-lg shadow-emerald-200">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Join Virat ERP</h1>
              <p className="text-slate-500 text-sm mt-2">Create your employee account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="h-11 rounded-xl border-slate-200 focus:ring-emerald-500"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="h-11 rounded-xl border-slate-200 focus:ring-emerald-500"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@viraterp.com"
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-emerald-500"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCode">Employee Code</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="employeeCode"
                    placeholder="EMP-123456"
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-emerald-500"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-emerald-500"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] mt-2"
                disabled={signup.isPending}
              >
                {signup.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
