
import { ReactNode } from "react"
import { AppSidebar } from "@/components/layout/sidebar"
import { AppHeader } from "@/components/layout/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: ReactNode }) {
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <NotificationProvider> */}
          <AppHeader />
          <div className="flex flex-1 flex-col space-y-5 mx-auto w-full max-w-full md:max-w-6xl p-8">
            {children}
          </div>
        {/* </NotificationProvider> */}
      </SidebarInset>
    </SidebarProvider>  
  )
}