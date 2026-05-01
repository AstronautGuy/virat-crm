import { HydrateClient } from "@/trpc/server";
import { MockLocationPinger } from "./_components/dev/MockLocationPinger";
import { ChartAreaDefault } from "../../components/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Home() {

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        {/*<ChartAreaDefault />*/}
        <div className="w-full max-w-2xl">
          {/* defaultValue sets which tab is open on initial load */}
          <Tabs defaultValue="overview" className="w-full">
            {/* TabsList contains the buttons. The grid class helps distribute them evenly */}
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* TabsContent holds what actually renders when a tab is active */}
            <TabsContent
              value="overview"
              className="mt-4 rounded-md border p-4"
            >
              <h2 className="text-lg font-semibold">Overview Dashboard</h2>
              <p className="text-muted-foreground mt-2">
                Here is your main overview content.
              </p>
            </TabsContent>

            <TabsContent
              value="settings"
              className="mt-4 rounded-md border p-4"
            >
              <h2 className="text-lg font-semibold">Settings</h2>
              <p className="text-muted-foreground mt-2">
                Manage your account settings and preferences here.
              </p>
              <ChartAreaDefault />
            </TabsContent>

            <TabsContent value="billing" className="mt-4 rounded-md border p-4">
              <h2 className="text-lg font-semibold">Billing details</h2>
              <p className="text-muted-foreground mt-2">
                View your current plan and payment history.
              </p>
            </TabsContent>
          </Tabs>
        </div>
        <MockLocationPinger />
      </main>
    </HydrateClient>
  );
}
