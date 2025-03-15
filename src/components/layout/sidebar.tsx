"use client"

import React, { memo } from "react"

import {
  AudioWaveform,
  Cable,
  Command,
  ChartColumnIncreasing,
  GalleryVerticalEnd,
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "../ui/separator"
import { NavSidebar } from "./nav-sidebar"
import Logo from "./logo"
import { TeamSwitcher } from "./team-switcher"

const navData = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
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

const AppSidebarComponent = (props: React.ComponentProps<typeof Sidebar>) => {
  // const sidebar = useSidebar();
  // const SidebarOpened = sidebar.state === "expanded";

  return (
    <Sidebar className="z-40" collapsible="icon" {...props}>
      <SidebarHeader className="p-2">
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex flex-row items-center justify-between py-2 px-2">
            <SidebarMenuButton
              size="lg"
              className="bg-transparent lg:w-0 active:bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-sidebar-accent-foreground cursor-default"
              asChild
            >
              <Logo size={24} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <TeamSwitcher teams={navData.teams} />
      </SidebarHeader>
      <SidebarContent className="pt-2 px-2">
        <NavSidebar items={navData.navMain} />
        <NavSidebar items={navData.navSettings} />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Separator />
        <NavSidebar className="p-0" items={navData.navFooter} />
      </SidebarFooter>
    </Sidebar>
  );
};

export const AppSidebar = memo(AppSidebarComponent);