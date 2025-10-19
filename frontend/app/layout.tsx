import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { ModalProvider } from "@/lib/context/ModalContext";
import { UserIdProvider } from "@/lib/context/UserContext";
import UserNameCheck from "@/components/UserNameCheck";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3D Model Viewer",
  description: "Collaborative 3D model viewing and annotation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>
          <UserIdProvider>
            <ModalProvider>
              <UserNameCheck />
              {children}
            </ModalProvider>
          </UserIdProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
