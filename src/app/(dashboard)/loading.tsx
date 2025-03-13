
import Loader from "@/components/layout/loader"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Loading..."
}

export default function Loading() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-50">
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-40">
          <Loader />
        </div>
    </div>
  )
}
