import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mirror Moment: AI skin coach",
  description: "YouCam Skin AI + an agentic coach that tells you what to do next, what to buy and what to skip.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#faf7f5] text-stone-900 antialiased`}>{children}</body>
    </html>
  );
}
