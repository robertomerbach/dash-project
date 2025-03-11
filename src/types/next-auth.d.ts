import { UserRole } from "@prisma/client"
import type { DefaultSession } from "next-auth"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      teamId?: string
      role?: UserRole
    } & DefaultSession["user"]
  }

  interface User {
    teamId?: string
    role?: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    teamId?: string
    role?: UserRole
  }
}

const { auth, handlers } = NextAuth(authConfig)

export { auth, handlers, auth as default }