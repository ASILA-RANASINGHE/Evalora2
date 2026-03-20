import type { Metadata } from "next";
import { Geist, Space_Grotesk, Source_Sans_3, Merriweather } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import FloatingChatButton from "@/components/floating-chat-button";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Evalora",
  description: "Educational platform for students, teachers, and parents",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  display: "swap",
  subsets: ["latin"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans",
  display: "swap",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${spaceGrotesk.variable} ${sourceSans3.variable} ${merriweather.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <FloatingChatButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
