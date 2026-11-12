import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Orbitron, Rajdhani } from "next/font/google";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], weight: ["500", "700", "900"] });
const rajdhani = Rajdhani({ variable: "--font-rajdhani", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Cortex30", template: "%s · Cortex30" },
  description: "A 30-day AI-coached program for logic, analytical, critical and creative thinking.",
  applicationName: "Cortex30",
  appleWebApp: { capable: true, title: "Cortex30", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/png/180" },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${orbitron.variable} ${rajdhani.variable} h-full antialiased`}>
      <body className="min-h-full bg-ink">
        {children}
        <div aria-hidden className="scanlines" />
        <ServiceWorker />
      </body>
    </html>
  );
}
