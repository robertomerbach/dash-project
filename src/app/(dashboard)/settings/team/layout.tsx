import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Settings Team",
  description: "Settings Team",
}

export default function UsersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
} 