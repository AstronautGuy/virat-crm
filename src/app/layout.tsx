import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { SkeletonProvider } from "@/components/ui/skeleton-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Virat CRM",
  description: "CRM for workforce and sales management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Virat CRM",
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`light ${inter.variable}`}>
      <body className="bg-background text-foreground selection:bg-primary/10 selection:text-primary min-h-screen antialiased">
        <TRPCReactProvider>
          <SkeletonProvider>
            {children}
            <Toaster />
          </SkeletonProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
