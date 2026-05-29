import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remove PDF Password",
  description: "Upload password-protected PDF files and remove their passwords instantly and securely.",
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