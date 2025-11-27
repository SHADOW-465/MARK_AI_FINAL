import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { Sidebar } from "./sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check user role
  const { data: teacher } = await supabase.from("teachers").select("*").eq("id", user.id).single()
  const { data: parent } = await supabase.from("parents").select("*").eq("id", user.id).single()

  const isTeacher = !!teacher
  const userName = teacher?.name || parent?.name || "User"
  const userEmail = user.email || ""
  const userInitials = userEmail[0].toUpperCase()

  return (
    <div className="h-screen text-slate-200 overflow-hidden relative selection:bg-cyan-500/30">
      {/* Background FX */}
      <div className="absolute inset-0 grid-bg pointer-events-none z-0"></div>

      {/* RECTIFIED SIDEBAR */}
      <Sidebar isTeacher={isTeacher} userName={userName} userEmail={userEmail} userInitials={userInitials} />

      {/* Main Content */}
      <main className="lg:pl-28 h-full overflow-y-auto relative z-10 custom-scrollbar transition-all duration-300">
        <header className="p-6 flex justify-between items-center sticky top-0 z-40 bg-[#022c22]/80 backdrop-blur-xl lg:hidden border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">{userInitials}</div>
        </header>

        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
