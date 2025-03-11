import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
    title: "Insights",
    description: "Insights",
}

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}