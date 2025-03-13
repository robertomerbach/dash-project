import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile settings and preferences.",
}

interface LayoutProps {
  children: React.ReactNode
}

export default function ProfileLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile settings and preferences.
        </p>
      </div>

      {children}
    </div>
  )
}