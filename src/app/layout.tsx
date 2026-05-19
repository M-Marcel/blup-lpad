import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/providers/AppProvider";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ShellLayout } from "@/components/layout/ShellLayout";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlessUP Launchpad | Genesis Founder NFT & ACTX Presale",
  description:
    "Join the BlessUP Network as a Genesis Founder. Purchase your Founder NFT, complete the Sprint, and access the ACTX token presale at founder pricing.",
  keywords: ["BlessUP", "ACTX", "NFT", "presale", "genesis", "founder", "Base", "Web3"],
  openGraph: {
    title: "BlessUP Launchpad",
    description: "Genesis Founder NFT & ACTX Token Presale on Base.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <AppProvider>
          <ErrorBoundary>
            <div className="relative flex min-h-screen flex-col">
              <div
                className="pointer-events-none fixed inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgb(255 255 255 / 0.03) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.03) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
                aria-hidden
              />
              <ShellLayout>{children}</ShellLayout>
            </div>
          </ErrorBoundary>
        </AppProvider>
      </body>
    </html>
  );
}
