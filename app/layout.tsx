import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#CBAB70",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "nrv.studio";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = new URL("/og-v2.png", origin).toString();

  return {
    title: "NRV — Software, resolved",
    description:
      "NRV designs and builds custom software for teams whose work has outgrown generic tools.",
    applicationName: "NRV",
    keywords: [
      "software studio",
      "custom software",
      "web platforms",
      "mobile apps",
      "product design",
    ],
    openGraph: {
      title: "NRV — Software, resolved",
      description: "Rough ideas shaped into thoughtful, working software.",
      type: "website",
      siteName: "NRV",
      url: origin,
      images: [
        {
          url: socialImage,
          width: 1731,
          height: 909,
          alt: "NRV — Software built around the way you work.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "NRV — Software, resolved",
      description: "Rough ideas shaped into thoughtful, working software.",
      images: [socialImage],
    },
    icons: {
      icon: "/nrv-mark.svg",
      shortcut: "/nrv-mark.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
