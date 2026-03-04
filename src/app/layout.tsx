import type { Metadata, Viewport } from "next";
import "./globals.css";

// Providers
import { DatabaseProvider } from "@/providers/database-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { SoundProvider } from "@/providers/sound-provider";
import { CelebrationProvider } from "@/providers/celebration-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { RootLayoutWrapper } from "@/components/layout/root-layout-wrapper";

export const metadata: Metadata = {
  title: "Dream & Design Companion",
  description: "Stay Goated 🐐 — Your creative journey companion",
  manifest: "/manifest.json",
  icons: {
    icon: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Ctext%20y='.9em'%20font-size='90'%3E👑%3C/text%3E%3C/svg%3E",
    apple: "/icons/apple-touch-icon.png",
  }
};

export const viewport: Viewport = {
  themeColor: "#FF69B4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground custom-cursor">
        <DatabaseProvider>
          <ThemeProvider>
            <SoundProvider>
              <CelebrationProvider>
                <NotificationProvider>
                  <RootLayoutWrapper>
                    {children}
                  </RootLayoutWrapper>
                </NotificationProvider>
              </CelebrationProvider>
            </SoundProvider>
          </ThemeProvider>
        </DatabaseProvider>
      </body>
    </html>
  );
}
