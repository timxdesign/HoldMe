import type { Metadata, Viewport } from "next"
import { Instrument_Serif, Geist } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "HoldMe — Stay Consistent Together",
    template: "%s | HoldMe",
  },
  description:
    "A modern accountability platform where you stay consistent through trusted human support.",
  manifest: "/manifest.json",
  icons: {
    icon: "/brand-asset/favicon.svg",
    apple: "/brand-asset/app-icon.svg",
  },
  openGraph: {
    title: "HoldMe — Stay Consistent Together",
    description:
      "A modern accountability platform where you stay consistent through trusted human support.",
    images: [{ url: "/brand-asset/holdme-opengraph-image.png", width: 1200, height: 630 }],
    siteName: "HoldMe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HoldMe — Stay Consistent Together",
    description:
      "A modern accountability platform where you stay consistent through trusted human support.",
    images: ["/brand-asset/holdme-opengraph-image.png"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1E96FC",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
