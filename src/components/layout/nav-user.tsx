"use client"

import React, { memo, useCallback } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"
import { Skeleton } from "../ui/skeleton"

import { LogOut, Monitor, Moon, Sun, User } from "lucide-react"
import { AvatarWrapper } from "./avatar-wrapper"

export interface UserData {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

interface NavUserProps {
  user?: UserData | null;
}

const UserSkeleton = memo(function UserSkeleton() {
  return (
    <div className="relative">
      <div className="w-full rounded-full p-1 -mr-1">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
});

const ThemeSelector = memo(function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <DropdownMenuItem
      className="cursor-default bg-transparent hover:bg-transparent focus:bg-transparent"
      asChild
    >
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Theme</span>
        <RadioGroup
          className="flex items-center flex-row border rounded-full"
          defaultValue={theme}
          onValueChange={setTheme}
        >
          {themeOptions.map(({ value, icon: Icon, label }) => (
            <div key={value} className="flex items-center">
              <RadioGroupItem value={value} id={value} className="sr-only" />
              <Label
                htmlFor={value}
                className={`flex items-center justify-center p-1 rounded-full ${
                  theme === value ? "bg-card border" : ""
                } hover:bg-secondary cursor-pointer`}
              >
                <Icon
                  className={`size-3 ${
                    theme === value ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="sr-only">{label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </DropdownMenuItem>
  );
});

const SignOutItem = memo(function SignOutItem() {
  const handleSignOut = useCallback((event: Event) => {
    event.preventDefault();
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <DropdownMenuItem
      className="cursor-pointer text-muted-foreground"
      onSelect={handleSignOut}
    >
      <span>Sign out</span>
      <DropdownMenuShortcut>
        <LogOut className="size-4" />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  );
});

export const NavUser = memo(function NavUser({ user }: NavUserProps) {
  if (!user) {
    return <UserSkeleton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="rounded-full p-1 -mr-1 cursor-pointer">
          <AvatarWrapper name={user.name || "User avatar"} image={user.image || undefined} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[239px]" align="end" side="bottom" sideOffset={6}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/profile" className="cursor-pointer text-muted-foreground">
            <span>Profile</span>
            <DropdownMenuShortcut>
              <User className="size-4" />
            </DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <ThemeSelector />
        <DropdownMenuSeparator />
        <SignOutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
