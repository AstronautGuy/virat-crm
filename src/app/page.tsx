import { HydrateClient } from "@/trpc/server";
import { MockLocationPinger } from "./_components/dev/MockLocationPinger";
import { ChartAreaDefault } from "../../components/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function Home() {

  return (
    <HydrateClient>
      <SidebarInset>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        {/*<ChartAreaDefault />*/}
        <SidebarProvider className="flex-row-reverse" defaultOpen={ false}>


          {/* 2. Override the inset margins to hug the right side instead of the left */}
          <SidebarInset className="md:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:mr-0 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:mr-2">

              <div className="flex items-center gap-4">
                {/* You can put a logo or page title here */}


              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-4">
                  <SidebarTrigger />
                </div>


            {/* Your page content would go here, inside the inset! */}

          </SidebarInset>
        </SidebarProvider>
        <div className="w-full">
          {/* defaultValue sets which tab is open on initial load */}
          <Tabs defaultValue="overview" className="w-full">
            {/* TabsList contains the buttons. The grid class helps distribute them evenly */}
            <TabsList className="grid w-full grid-cols-3 ">
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
              <div className="grid grid-cols-4 gap-4">
                <Card className="sm:bg-red-200 md:bg-green-200">
                  <CardHeader>
                    <CardTitle>Card 1</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardContent>
                    <p>Card Content</p>
                  </CardContent>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Card 2</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardContent>
                    <p>Card Content</p>
                  </CardContent>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Card 3</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardContent>
                    <p>Card Content</p>
                  </CardContent>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Card 4</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                  </CardHeader>
                  <CardContent>
                    <p>Card Content</p>
                  </CardContent>
                  <CardFooter>
                    <p>Card Footer</p>
                  </CardFooter>
                </Card>
              </div>
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
        <div>
           <Card>
            <CardHeader>
              <CardTitle>Card 1</CardTitle>
              <CardDescription>Card Description</CardDescription>
              <CardAction>Card Action</CardAction>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        </div>
      </main>
        </SidebarInset>
    </HydrateClient>
  );
}
