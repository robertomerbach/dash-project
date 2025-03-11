import type { DefaultSession } from "next-auth"
import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/prisma"
import { UserRole, UserStatus } from "@prisma/client"
import { createTeamWithOwner } from "@/lib/team"

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
    teamId?: string
    role?: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return user
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          if (!user.email) {
            return false
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
              teamMembers: {
                include: { team: true }
              }
            }
          })

          if (!existingUser) {
            const team = await createTeamWithOwner({
              name: user.name || "",
              userId: user.id,
              email: user.email
            })

            await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                image: user.image,
                emailVerified: new Date(),
                teamMembers: {
                  create: {
                    teamId: team.id,
                    role: "OWNER" as UserRole,
                    status: "ACTIVE" as UserStatus
                  }
                }
              }
            })
          } else if (user.image && user.image !== existingUser.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                image: user.image,
                emailVerified: new Date()
              }
            })
          }
        }

        return true
      } catch (error) {
        console.error("Error on signIn:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.teamId = token.teamId
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            teamMembers: {
              where: { status: "ACTIVE" },
              take: 1
            }
          }
        })

        if (dbUser?.teamMembers[0]) {
          token.teamId = dbUser.teamMembers[0].teamId
          token.role = dbUser.teamMembers[0].role as UserRole
        }
      }
      return token
    }
  }
}

export default authOptions
