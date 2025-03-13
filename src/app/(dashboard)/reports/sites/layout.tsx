import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
    title: "Sites",
    description: "Sites",
  }

export default function SitesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}