
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Overview",
  description: "Overview",
}

interface LayoutProps {
  children: React.ReactNode
}

export default function OverviewLayout({ children }: LayoutProps) {
  
  return <>{children}</>
  
}