import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Woyzeck · Montagewerkstatt",
  description: "Eine offene Lernwerkstatt zu Büchners Woyzeck: Szenen montieren, Deutungen am Text prüfen und eigene Lesarten überarbeiten.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        {children}
      </body>
    </html>
  );
}
