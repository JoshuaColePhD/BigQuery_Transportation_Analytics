import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BigQuery Transportation Analytics",
  description: "Executive dashboard for NYC yellow taxi SQL analysis in BigQuery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
