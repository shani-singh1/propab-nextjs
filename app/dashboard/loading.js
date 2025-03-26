import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  )
} 