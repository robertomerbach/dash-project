
import { ReactNode } from "react"
import { AppSidebar } from "@/components/layout/sidebar"
import { AppHeader } from "@/components/layout/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cookies } from "next/headers"

export default async function Layout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        {/* <NotificationProvider> */}
          <AppHeader />
          <div className="flex flex-1 flex-col space-y-5 mx-auto w-full max-w-full p-8">
            {children}
          </div>
        {/* </NotificationProvider> */}
      </SidebarInset>
    </SidebarProvider>  
  )
}