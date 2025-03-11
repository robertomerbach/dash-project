"use client"

import { TeamNameForm } from "./team-name-form"
import { TeamMemberForm } from "./team-member-form"
import { TeamDelete } from "./team-delete"

export default function TeamSettingsPage() {
  
  return (
    <div className="space-y-6">
      <TeamNameForm />
      <TeamMemberForm />
      <TeamDelete />
    </div>
  )
} 