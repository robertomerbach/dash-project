import "@/styles/globals.css"

import { ReactNode } from "react"
import { Metadata } from "next"
import { Providers } from "@/components/provider/providers"

export const metadata: Metadata = {
  icons: "/favicon.png",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}