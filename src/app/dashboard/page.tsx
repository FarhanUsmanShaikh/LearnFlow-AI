import DashboardClient from './DashboardClient'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const user = await auth()

  if (!user) {
    redirect("/auth/signin")
  }

  return <DashboardClient user={user} />
}