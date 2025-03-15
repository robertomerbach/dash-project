"use client";

import React, { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SubItem[];
}

interface NavSidebarProps {
  menuName?: string;
  className?: string;
  items: NavItem[];
}

const SimpleNavItem = memo(
  ({
    item,
    pathname,
    className,
  }: {
    item: NavItem;
    pathname: string;
    className?: string;
  }) => {
    const isActive = pathname === item.url;
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={item.title}
          className={cn(
            isActive ? "bg-accent text-sidebar-accent-foreground" : "",
            "rounded-md",
            className,
          )}
          asChild
        >
          <Link href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
);

const CollapsibleNavItem = memo(
  ({
    item,
    pathname,
  }: {
    item: NavItem;
    pathname: string;
  }) => {
    const isActive = pathname === item.url;
    return (
      <Collapsible asChild defaultOpen={isActive} className="cursor-pointer group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={item.title}
              className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items?.map((subItem) => {
                const isSubItemActive = pathname === subItem.url;
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      className={isSubItemActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <Link href={subItem.url}>
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }
);

function NavSidebarComponent({ menuName, className, items }: NavSidebarProps) {
  const pathname = usePathname();

  const renderedItems = useMemo(() => {
    return items.map((item: NavItem) => {
      if (item.items && item.items.length > 0) {
        return <CollapsibleNavItem key={item.title} item={item} pathname={pathname} />;
      }
      return <SimpleNavItem key={item.title} item={item} pathname={pathname} />;
    });
  }, [items, pathname]);

  return (
    <SidebarGroup className={className}>
      {menuName && <SidebarGroupLabel>{menuName}</SidebarGroupLabel>}
      <SidebarMenu>{renderedItems}</SidebarMenu>
    </SidebarGroup>
  );
}

export const NavSidebar = memo(NavSidebarComponent);
