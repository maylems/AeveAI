import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeveAI",
  description: "Find the core. Build the MVP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
