import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign up | Arena",
  description: "Create an account to start using Arena",
}

export default function registerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

