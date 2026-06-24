import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "../globals.css";

// Brand display typeface for titles and buttons. Exposed as a CSS variable so
// globals.css / Tailwind's `font-title` token can reference it.
const knockout = localFont({
  src: "../../../public/fonts/Knockout-HTF49-Liteweight.otf",
  variable: "--font-knockout",
  display: "swap",
});

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

export const metadata: Metadata = {
  title: "Moxy Gallery Quest",
  description: "Mobile-first QR-led gallery activation for Moxy events.",
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
      lang="en"
      className={`${knockout.variable} ${gillSans.variable} ${gillSansSemibold.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
