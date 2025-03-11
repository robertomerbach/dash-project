"use client"

import React, { memo } from "react"
import Link from "next/link"

import {
  Cable,
  ChartColumnIncreasing,
  Globe,
  HelpCircle,
  House,
  Settings,
  Users,
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
    { title: "Dashboard", url: "/app", icon: House },
    { title: "Insights", url: "/app/insights", icon: Zap },
    {
      title: "Reports",
      url: "#",
      icon: ChartColumnIncreasing,
      items: [
        { title: "By Sites", url: "/app/reports/sites" },
        { title: "By Sources", url: "/app/reports/sources" },
        { title: "By Countries", url: "/app/reports/countries" },
        { title: "By Campaigns", url: "/app/reports/campaigns" },
        { title: "By Users", url: "/app/reports/users" },
      ],
    },
    { title: "Team", url: "/app/settings/team", icon: Users },
    { title: "Sites", url: "/app/settings/sites", icon: Globe },
    { title: "Integrations", url: "/app/settings/integrations", icon: Cable },
  ],
  navFooter: [
    { title: "Help", url: "#", icon: HelpCircle },
    { title: "Settings", url: "/app/settings/general", icon: Settings },
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
    </SidebarContent>
    <SidebarFooter>
      <Separator />
      <NavSidebar items={navData.navFooter} />
    </SidebarFooter>
  </Sidebar>
);

export const AppSidebar = memo(AppSidebarComponent);