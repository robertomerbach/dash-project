import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard",
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}