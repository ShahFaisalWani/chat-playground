import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/providers";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "SHAHPHOON CHAT PLAYGROUND",
  description: "Chat playground",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <link rel="shortcut icon" href="/logo.svg" />
      <body className="relative overflow-hidden md:min-h-screen bg-gradient">
        <Providers>
          <Navbar />
          <main className="h-[100dvh] md:h-[calc(100vh-8rem)] md:pt-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
