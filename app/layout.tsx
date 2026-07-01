import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDBI WealthLens",
  description: "Your autonomous predictive wealth co-pilot.",
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
