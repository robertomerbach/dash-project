"use client"

import React, { memo } from "react"

import {
  Cable,
  ChartColumnIncreasing,
  Globe,
  HelpCircle,
  House,
  Settings,
  Zap,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "../ui/separator"
import { NavSidebar } from "./nav-sidebar"
import Logo from "./logo"

const navData = {
  navMain: [
    { title: "Dashboard", url: "/overview", icon: House },
    { title: "Insights", url: "/insights", icon: Zap },
    {
      title: "Reports",
      url: "#",
      icon: ChartColumnIncreasing,
      items: [
        { title: "By Sites", url: "/reports/sites" },
        { title: "By Sources", url: "/reports/sources" },
        { title: "By Countries", url: "/reports/countries" },
        { title: "By Campaigns", url: "/reports/campaigns" },
        { title: "By Users", url: "/reports/users" },
      ],
    },
  ],
  navSettings: [
    { title: "Sites", url: "/sites", icon: Globe },
    { title: "Integrations", url: "/integrations", icon: Cable },
  ],
  navFooter: [
    { title: "Help", url: "#", icon: HelpCircle },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
};

const AppSidebarComponent = (props: React.ComponentProps<typeof Sidebar>) => (
  <Sidebar className="z-40 group/sidebar" collapsible="icon" {...props}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="flex flex-row items-center justify-between">
          <SidebarMenuButton
            size="lg"
            className="bg-transparent active:bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-sidebar-accent-foreground cursor-default"
            asChild
          >
            <Logo size={24} />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent className="pt-2">
      <NavSidebar items={navData.navMain} />
      <NavSidebar items={navData.navSettings} />
    </SidebarContent>
    <SidebarFooter>
      <Separator />
      <NavSidebar className="p-0" items={navData.navFooter} />
    </SidebarFooter>
  </Sidebar>
);

export const AppSidebar = memo(AppSidebarComponent);