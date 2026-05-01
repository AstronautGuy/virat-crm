import { HydrateClient } from "@/trpc/server";
import { DashboardLayout } from "./_components/layout/DashboardLayout";

export default async function Home() {

  return (
    <HydrateClient>
      <DashboardLayout>
        <div className="flex min-h-[80vh] flex-col items-center justify-center rounded-xl bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
          {/*<MockLocationPinger />*/}
        </div>
      </DashboardLayout>
    </HydrateClient>
  );
}
