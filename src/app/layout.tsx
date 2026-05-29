import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Remove PDF Password | Free PDF Unlocker",
  description: "Unlock password-protected PDF files instantly and for free. No server upload required - your files stay secure on your device. Supports AES-256 and RC4 encryption.",
  keywords: [
    "remove PDF password",
    "unlock PDF",
    "PDF password remover",
    "remove password from PDF",
    "free PDF unlocker",
    "PDF unlocker online",
    "decrypt PDF",
    "PDF password bypass"
  ],
  authors: [{ name: "pdf.yun.info" }],
  openGraph: {
    title: "Remove PDF Password | Free PDF Unlocker",
    description: "Unlock password-protected PDF files instantly and for free. 100% secure - files never leave your device.",
    type: "website",
    locale: "en_US",
    siteName: "pdf.yun.info",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove PDF Password | Free PDF Unlocker",
    description: "Unlock password-protected PDF files instantly and for free.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://pdf.yun.info",
  },
  verification: {
    google: "1s3oFrO2-fC0xbA5BLrAegF8fJdD-pZyp0UtkzMAjiM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">{children}<Analytics /></body>
    </html>
  );
}