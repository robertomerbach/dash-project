"use client"

import React, { memo, useMemo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"

interface NavSettingsItem {
  title: string;
  href: string;
}

const SettingsItems: NavSettingsItem[] = [
  { title: "General", href: "/app/settings/general" },
  { title: "Team", href: "/app/settings/team" },
  { title: "Sites", href: "/app/settings/sites" },
  { title: "Billing", href: "/app/settings/billing" },
  { title: "Integrations", href: "/app/settings/integrations" },
];

function SettingsNavComponent() {
  const pathname = usePathname();

  const navItems = useMemo(
    () =>
      SettingsItems.map((item) => {
        const isActive = pathname === item.href;
        const buttonClass = cn(
          buttonVariants({ variant: "ghost" }),
          isActive
            ? "bg-muted hover:bg-muted"
            : "text-muted-foreground hover:text-foreground"
        );
        return (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            asChild
            className={buttonClass}
          >
            <Link href={item.href}>{item.title}</Link>
          </Button>
        );
      }),
    [pathname]
  );

  return (
    <nav className="flex flex-row space-x-1 md:space-x-2 mb-4">
      {navItems}
    </nav>
  );
}

export const SettingsNav = memo(SettingsNavComponent);