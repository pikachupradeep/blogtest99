//layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header/Header";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meaningful Reads, Revived Minds, Welcoming Community",
  description:
    "FountBeyond.com delivers mindful essays, mental wellness guidance, and restorative ideas designed to refresh the mind and nurture emotional well-being. Join a supportive community devoted to balance, clarity, and inner revival",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <Header />
        {children}
        <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
