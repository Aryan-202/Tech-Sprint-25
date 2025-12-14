"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserNav } from "./user-nav"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <Button variant="ghost" disabled>Loading...</Button>
  }

  return <UserNav />
}