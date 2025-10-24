import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copilot at Work - PR Tracker",
  description: "Track merged Copilot PRs over time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
