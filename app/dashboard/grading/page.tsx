import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import Link from "next/link"
import { CheckCircle, Clock, FileText, ChevronRight } from "lucide-react"

export default async function GradingQueuePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    // Fetch all exams created by this teacher
    const { data: exams } = await supabase
        .from("exams")
        .select("id")
        .eq("teacher_id", user.id)

    const examIds = exams?.map(e => e.id) || []

    // Fetch answer sheets for these exams that are NOT approved yet
    const { data: sheets } = await supabase
        .from("answer_sheets")
        .select(`
      *,
      students (name, roll_number),
      exams (exam_name, subject)
    `)
        .in("exam_id", examIds)
        .neq("status", "approved")
        .order("created_at", { ascending: false })

    const pendingCount = sheets?.filter(s => s.status === "uploaded").length || 0
    const gradedCount = sheets?.filter(s => s.status === "graded").length || 0

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Grading Queue
                </h1>
                <p className="text-slate-400 mt-2">
                    Review and finalize student submissions.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Pending AI Grading</p>
                            <h3 className="text-2xl font-bold text-white">{pendingCount}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Ready for Review</p>
                            <h3 className="text-2xl font-bold text-white">{gradedCount}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total In Queue</p>
                            <h3 className="text-2xl font-bold text-white">{sheets?.length || 0}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Submissions</h2>
                <div className="grid gap-4">
                    {sheets?.map((sheet) => (
                        <GlassCard key={sheet.id} className="p-4 flex items-center justify-between group hover:border-cyan-500/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                                    {sheet.students?.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{sheet.students?.name}</h4>
                                    <p className="text-xs text-slate-400">
                                        {sheet.exams?.subject} • {sheet.exams?.exam_name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <Badge variant={sheet.status === "graded" ? "secondary" : "outline"} className="capitalize">
                                    {sheet.status === "graded" ? "Needs Review" : "Processing"}
                                </Badge>

                                <div className="text-right hidden md:block">
                                    <p className="text-sm text-slate-300">
                                        {sheet.total_score ? `${sheet.total_score} marks` : "--"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(sheet.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                <Link href={`/dashboard/grading/${sheet.id}`}>
                                    <Button size="icon" variant="ghost" className="hover:bg-cyan-500/20 hover:text-cyan-400">
                                        <ChevronRight />
                                    </Button>
                                </Link>
                            </div>
                        </GlassCard>
                    ))}

                    {sheets?.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No submissions pending review.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
