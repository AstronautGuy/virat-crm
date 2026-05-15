import { api, HydrateClient } from "@/trpc/server";
import { DashboardLayout } from "./_components/layout/DashboardLayout";
import { DashboardView } from "./_components/dashboard/DashboardView";

export default async function Home() {
  const user = await api.users.getMe();
  
  const isManager = !!user?.permissions?.isManager || !!user?.permissions?.isAdmin;

  let salesSummary = { revenue: 0, count: 0, quantity: 0 };
  let workforceSummary = { activeToday: 0, pendingLeaves: 0 };

  if (isManager) {
    try {
      const [sales, workforce] = await Promise.all([
        api.analytics.getSalesSummary({ preset: "today" }),
        api.analytics.getWorkforceSummary({}),
      ]);
      salesSummary = sales;
      workforceSummary = workforce;
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  }

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const metrics = [
    { label: "Daily Sales", value: currencyFormatter.format(salesSummary.revenue), trend: `${salesSummary.count} Sales`, hide: !isManager },
    { label: "Active Staff", value: `${workforceSummary.activeToday}`, trend: "Today", hide: !isManager },
    { label: "Pending Leaves", value: `${workforceSummary.pendingLeaves}`, trend: "Review", hide: !isManager },
    { label: "Daily Volume", value: `${salesSummary.quantity}`, trend: "Units", hide: !isManager },
  ].filter(m => !m.hide);

  return (
    <HydrateClient>
      <DashboardLayout>
        <DashboardView 
          user={user} 
          metrics={metrics} 
          isManager={isManager} 
        />
      </DashboardLayout>
    </HydrateClient>
  );
}
