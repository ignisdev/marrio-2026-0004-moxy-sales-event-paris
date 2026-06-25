import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";

// Brand display typeface (Knockout) is loaded via @font-face in globals.css from
// the woff2/woff build, which carries the full character set.

// Body copy faces. GillSans Light is the default paragraph font; SemiBold is
// used for emphasised intro paragraphs.
const gillSans = localFont({
  src: "../../../public/fonts/GillSans-Light.ttf",
  variable: "--font-gillsans",
  display: "swap",
});

const gillSansSemibold = localFont({
  src: "../../../public/fonts/GillSans-SemiBold.ttf",
  variable: "--font-gillsans-semibold",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Lock the scale so iOS Safari doesn't auto-zoom when focusing inputs whose
  // font-size is under 16px (the register form uses smaller, design-driven sizes).
  maximumScale: 1,
  userScalable: false,
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  // Absolute base so og/twitter image URLs resolve for external scrapers.
  metadataBase: new URL(appUrl),
  title: "Moxy Hotels - The Art Hunter",
  description: "Mobile-first QR-led gallery activation for Moxy events.",
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
  openGraph: {
    title: "Moxy Hotels - The Art Hunter",
    description: "CAN YOU HUNT DOWN ALL 5 ARTWORKS?",
    url: "/",
    siteName: "Moxy Hotels - The Art Hunter",
    images: [
      {
        url: "/images/og_image.png",
        width: 1200,
        height: 630,
        alt: "Moxy Hotels — The Art Hunter",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moxy Hotels - The Art Hunter",
    description: "Mobile-first QR-led gallery activation for Moxy events.",
    images: ["/images/og_image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function GuestRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${gillSans.variable} ${gillSansSemibold.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
