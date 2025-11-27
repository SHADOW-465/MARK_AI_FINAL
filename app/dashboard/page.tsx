import { createClient } from "@/lib/supabase/server"
import { FileText, Users, CheckCircle, Clock, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch real stats
  const { count: examCount } = await supabase.from("exams").select("*", { count: "exact", head: true })
  const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true })
  const { count: gradedCount } = await supabase
    .from("answer_sheets")
    .select("*", { count: "exact", head: true })
    .eq("status", "graded")
  const { count: pendingCount } = await supabase
    .from("answer_sheets")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  // Fetch recent activity (latest exams)
  const { data: recentExams } = await supabase
    .from("exams")
    .select("exam_name, created_at")
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="space-y-8 pb-24 lg:pb-0">
      <div>
        <h2 className="text-xl text-slate-400 font-light">Welcome back! Here's an overview of your grading activity.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Exams", val: examCount || 0, sub: "Created so far", col: "text-blue-300", icon: FileText, gradient: "from-blue-500/30 to-transparent" },
          { label: "Active Students", val: studentCount || 0, sub: "Enrolled students", col: "text-purple-300", icon: Users, gradient: "from-purple-500/30 to-transparent" },
          { label: "Pending Review", val: pendingCount || 0, sub: "Requires attention", col: "text-amber-300", icon: Clock, gradient: "from-amber-500/30 to-transparent" },
          { label: "Graded Sheets", val: gradedCount || 0, sub: "Processed successfully", col: "text-emerald-300", icon: CheckCircle, gradient: "from-emerald-500/30 to-transparent" },
        ].map((s, i) => (
          <GlassCard key={i} className="p-6 overflow-hidden group hover:border-white/30">
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${s.gradient} blur-[40px] rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-700`}></div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-slate-300 text-xs font-bold tracking-widest mb-1 font-display uppercase">{s.label}</h3>
                <p className="text-5xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-lg">{s.val}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/10 border border-white/10 ${s.col} shadow-lg shadow-black/20 backdrop-blur-md`}>
                <s.icon size={20} />
              </div>
            </div>
            <div className={`relative z-10 text-xs font-mono flex items-center gap-2 mt-4 text-slate-400`}>
              {s.sub}
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4">
          <GlassCard className="p-6">
            <h3 className="text-xl font-display font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentExams && recentExams.length > 0 ? (
                recentExams.map((exam, i) => (
                  <div className="flex items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors" key={i}>
                    <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <FileText className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-bold text-white">New Exam Created</p>
                      <p className="text-xs text-slate-400 font-mono">{exam.exam_name}</p>
                    </div>
                    <div className="ml-auto font-mono text-xs text-slate-500">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 font-mono">No recent activity</div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-3">
          <GlassCard className="p-6">
            <h3 className="text-xl font-display font-bold text-white mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/exams/create" className="block group">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Create New Exam</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </Link>
              <Link href="/dashboard/students/add" className="block group">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Add Student</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </Link>
              <Link href="/dashboard/exams" className="block group">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Review Pending Grades</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
