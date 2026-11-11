import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DistribuCore — Distribution Management System",
  description: "Cloud-native multi-tenant B2B distribution management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
