import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Reset your password",
    description: "Reset your password",
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}