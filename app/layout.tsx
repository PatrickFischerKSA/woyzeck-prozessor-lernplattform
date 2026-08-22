import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Woyzeck-Prozessor",
  description: "Interaktive Montage- und Interpretationsumgebung zu Georg Büchners Woyzeck.",
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
