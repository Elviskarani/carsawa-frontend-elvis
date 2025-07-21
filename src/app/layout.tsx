import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carsawa",
  description: "Largest car marketplace in kenya",
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/carsawa.png', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/carsawa.png' },
  ],
  manifest: '/manifest.json'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header/>
        {children}
        <Analytics />
        <Footer/>
      </body>
    </html>
  );
}
