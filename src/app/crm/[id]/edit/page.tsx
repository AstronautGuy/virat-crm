"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { CustomerForm } from "@/app/_components/crm/CustomerForm";
import { api } from "@/trpc/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: customer, isLoading } = api.crm.getCustomerById.useQuery({ id });
  const { data: user } = api.users.getMe.useQuery();

  const isManager = user?.permissions.isManager || user?.permissions.isAdmin;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center">
          <h2 className="text-xl font-bold">Customer not found</h2>
          <Link href="/crm">
            <Button variant="link">Back to CRM</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FeatureGate featureKey="crm">
        <div className="mx-auto max-w-5xl space-y-6 p-8">
          <div className="flex items-center gap-4">
            <Link href="/crm">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Edit Customer: {customer.name}
            </h1>
          </div>

          <CustomerForm
            initialData={customer}
            isManager={isManager}
            onSuccess={() => {
              router.push("/crm");
            }}
          />
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
