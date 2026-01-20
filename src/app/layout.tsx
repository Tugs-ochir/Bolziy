import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolziy - Болзооны урилга",
  description: "Болзооны урилга үүсгэж, илгээж, хариу хянах веб апп.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-dvh bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
          <header className="backdrop-blur-sm bg-white/80 border-b border-rose-100 shadow-sm sticky top-0 z-50">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">❤️</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Boilzy
                </span>
              </Link>
              <nav className="flex items-center gap-2 text-sm font-medium">
                <Link
                  href="/create"
                  className="rounded-lg px-4 py-2 text-gray-700 hover:bg-rose-100 hover:text-rose-700 transition-all"
                >
                  Урилга үүсгэх
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-2 text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-all"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
