"use client"

import { SitesForm } from "./sites-form"
import { useSession } from "next-auth/react"

export default function SiteSettingsPage() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id || ""

  return (
    <div className="space-y-6">
      <SitesForm currentUserId={currentUserId} />
    </div>
  )
} 