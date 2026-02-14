import type { Metadata, Viewport } from "next";

import { Inter, JetBrains_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";



import "./globals.css";



const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });



export const metadata: Metadata = {

  title: "ReturnHub - Intelligent Return & Exchange Management",

  description:

    "Smart return and exchange management for fashion D2C brands. AI-powered analysis, QR drop-box returns, and automated workflows.",

};



export const viewport: Viewport = {

  themeColor: "#2563eb",

  width: "device-width",

  initialScale: 1,

};



export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {

  return (

    <html lang="en" suppressHydrationWarning>

      <body className="font-sans antialiased min-h-screen">

        {children}

        <Toaster />

      </body>

    </html>

  );

}

