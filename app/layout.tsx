import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceAlertToast from "./components/ServiceAlertToast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tubod Seventh-day Adventist Church",
  description: "Official website and worship portal for Tubod SDA Church",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* Floating Worship Reminder Popup in bottom right corner */}
        <ServiceAlertToast />
      </body>
    </html>
  );
}