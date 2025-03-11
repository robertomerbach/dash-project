import { ReactNode } from "react"
import { Metadata } from "next"
import { SettingsNav } from "../../../components/layout/nav-settings"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your settings",
}

interface LayoutProps {
  children: ReactNode
}

export default async function SettingsLayout({ children }: LayoutProps) {
  
  return (
    <div className="flex flex-col">
      <div className="pb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <div className="flex flex-col gap-3 md:gap-6">
        <SettingsNav />
        {children}
      </div>
    </div>
  )
}
