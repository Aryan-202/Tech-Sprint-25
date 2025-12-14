import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-lg font-medium">Loading resume builder...</p>
      </div>
    </div>
  )
}