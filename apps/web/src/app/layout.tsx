import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TenantProvider } from "@zundenova/ui";
import Navigation from "../components/Navigation";
import ErrorBoundary from "../components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZundeNova - Smart Care for Land, Livestock & Life",
  description: "AI-powered agricultural platform empowering African farmers with diagnostics, marketplace, and expert consultations",
  keywords: "agriculture, AI, farming, Africa, livestock, diagnostics, marketplace, NDVI, satellite",
  authors: [{ name: 'ZundeNova Team' }],
  openGraph: {
    title: 'ZundeNova - Smart Care for Land, Livestock & Life',
    description: 'AI-powered agricultural platform empowering African farmers',
    url: 'https://zundenova.com',
    siteName: 'ZundeNova',
    images: [
      {
        url: '/zundenova-logo.png',
        width: 1200,
        height: 630,
        alt: 'ZundeNova Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <TenantProvider>
            <Navigation />
            {children}
          </TenantProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
