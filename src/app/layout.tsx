import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "to-do | simple task management",
  description: "A minimal to-do app with AI task enhancement and WhatsApp integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
