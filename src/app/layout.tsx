import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { UploadThingSSR } from "@/components/providers/uploadthing-ssr";
import { LEGAL_DISCLAIMER } from "@/lib/constants";
import { getAppBaseUrl } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ServerClips — MMORPG Server Discovery",
    template: "%s | ServerClips",
  },
  description:
    "Swipe through promo videos to discover MMORPG private servers. Promotional listings only.",
  metadataBase: new URL(getAppBaseUrl()),
  openGraph: {
    title: "ServerClips",
    description: LEGAL_DISCLAIMER,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${cinzel.variable} ${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <UploadThingSSR />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
