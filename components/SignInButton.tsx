"use client"

import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface SignInButtonProps {
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  showArrow?: boolean
}

export function SignInButton({ 
  size = "default", 
  variant = "default",
  className,
  showArrow = true 
}: SignInButtonProps) {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button size={size} variant={variant} className={className} asChild>
        <Link href="/dashboard">
          Go to Dashboard
          {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
        </Link>
      </Button>
    )
  }

  return (
    <Button 
      size={size} 
      variant={variant}
      className={className}
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      Start Building Free
      {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  )
} 