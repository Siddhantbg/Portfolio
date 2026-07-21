import type { Metadata } from "next";
import { Amatic_SC, Barlow_Condensed, Press_Start_2P } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pixel",
});

const amatic = Amatic_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-hand",
});

export const metadata: Metadata = {
  title: "Siddhant Bhagat | Portfolio",
  description:
    "FIFA 14-inspired portfolio showcasing AI/ML engineering, full-stack development, and research projects.",
  openGraph: {
    title: "Siddhant Bhagat | Portfolio",
    description: "AI/ML Engineer · Full-Stack Developer",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${barlow.variable} ${pressStart.variable} ${amatic.variable} antialiased overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
