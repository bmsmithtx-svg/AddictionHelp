import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AddictionHelp",
  description: "A supportive streak tracker with Ironhorn, the bison guardian.",
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
