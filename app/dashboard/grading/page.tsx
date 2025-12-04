import { createClient } from "@/lib/supabase/server"
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
        .select("*, answer_sheets(id, status)")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false })

    if (!exams) return <div>No exams found</div>

    // Calculate aggregated stats
    const totalExams = exams.length
    const totalSubmissions = exams.reduce((acc, exam) => acc + (exam.answer_sheets?.length || 0), 0)
    const pendingReview = exams.reduce((acc, exam) =>
        acc + (exam.answer_sheets?.filter((s: any) => s.status === 'graded').length || 0), 0
    )

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Grading
                </h1>
                <p className="text-slate-400 mt-2">
                    Select an exam to manage submissions and grading.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Active Exams</p>
                            <h3 className="text-2xl font-bold text-white">{totalExams}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Submissions</p>
                            <h3 className="text-2xl font-bold text-white">{totalSubmissions}</h3>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Pending Review</p>
                            <h3 className="text-2xl font-bold text-white">{pendingReview}</h3>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Your Exams</h2>
                <div className="grid gap-4">
                    {exams.map((exam) => {
                        const submittedCount = exam.answer_sheets?.length || 0
                        const needsReviewCount = exam.answer_sheets?.filter((s: any) => s.status === 'graded').length || 0

                        return (
                            <Link key={exam.id} href={`/dashboard/grading/${exam.id}`}>
                                <GlassCard className="p-6 flex items-center justify-between group hover:border-cyan-500/50 transition-colors cursor-pointer">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-medium text-white text-lg">{exam.exam_name}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <span>{exam.subject}</span>
                                            <span>•</span>
                                            <span>Class {exam.class}</span>
                                            <span>•</span>
                                            <span>{new Date(exam.exam_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <div className="flex items-center gap-2 justify-end">
                                                 <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                                                    {submittedCount} Submissions
                                                </Badge>
                                                {needsReviewCount > 0 && (
                                                    <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/20 hover:bg-amber-500/30">
                                                        {needsReviewCount} Review Needed
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <Button size="icon" variant="ghost" className="hover:bg-cyan-500/20 hover:text-cyan-400">
                                            <ChevronRight />
                                        </Button>
                                    </div>
                                </GlassCard>
                            </Link>
                        )
                    })}

                    {exams.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No exams found. Create an exam to start grading.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
