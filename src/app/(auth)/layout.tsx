import Link from "next/link"
import { ReactNode } from "react"
import Logo from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <Button variant="ghost" className="fixed top-4 left-2 bg-background/0 backdrop-blur" asChild>
        <Link className="flex items-center" href="/">
          <ChevronLeft size={14} />
          Home
        </Link>
      </Button>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-3 self-center md:self-start">
            <Logo size={32} />
        </div>
        <div className="flex flex-col gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}
