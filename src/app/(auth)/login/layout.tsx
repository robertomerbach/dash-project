import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Arena",
  description: "Login to your account",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

