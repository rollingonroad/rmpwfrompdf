import type { Metadata } from "next";
import "./globals.css";

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
  authors: [{ name: "rmpwfrompdf" }],
  openGraph: {
    title: "Remove PDF Password | Free PDF Unlocker",
    description: "Unlock password-protected PDF files instantly and for free. 100% secure - files never leave your device.",
    type: "website",
    locale: "en_US",
    siteName: "rmpwfrompdf",
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
    canonical: "https://rmpwfrompdf.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}