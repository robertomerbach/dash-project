import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Confirm your account",
    description: "Confirm your account",
}

export default function ConfirmAccountLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}