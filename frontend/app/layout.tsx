import type { Metadata } from "next";
import { Fira_Sans, Fira_Mono } from "next/font/google";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-fira-sans",
  display: "swap",
});

const firaMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-fira-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TextAnalytica",
  description:
    "Topic Modeling and Author Network Visualization of Academic Papers using LDA and NetworkX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased ${firaSans.variable} ${firaMono.variable} ${firaSans.className}`}
      >
        {children}
      </body>
    </html>
  );
}
