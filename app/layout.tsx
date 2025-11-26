import type { Metadata } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Owlister - Blog & Webtoon",
  description: "A professional blog and webtoon platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${orbitron.variable} ${inter.variable} antialiased bg-raisin-black text-ghost-white font-inter`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
