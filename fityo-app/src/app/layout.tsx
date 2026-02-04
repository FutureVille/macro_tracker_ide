import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fityo | Premium Macro Tracker",
  description: "Luxury minimalist macro and weight tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen selection:bg-primary/20 selection:text-primary`}
      >
        <AuthProvider>
          <main className="max-w-md mx-auto min-h-screen bg-background relative overflow-hidden shadow-2xl shadow-black">
            {/* Background ambient glow */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 h-full">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
