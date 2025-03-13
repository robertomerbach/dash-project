"use client"

import { TeamNameForm } from "./team-name-form"
import { TeamMemberForm } from "./team-member-form"
import { useSession } from "next-auth/react"

export default function TeamSettingsPage() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id || ""

  return (
    <div className="space-y-6">
      <TeamNameForm />
      <TeamMemberForm currentUserId={currentUserId} />
    </div>
  )
} 