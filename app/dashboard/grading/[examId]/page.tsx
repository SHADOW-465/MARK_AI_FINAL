import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { ChevronLeft, ChevronRight, CheckCircle, FileText, AlertCircle, Search } from "lucide-react"
import Link from "next/link"
import { UploadSheetDialog } from "./upload-dialog"

export default async function ExamGradingRosterPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const supabase = await createClient()

  // 1. Fetch Exam Details
  const { data: exam } = await supabase.from("exams").select("*").eq("id", examId).single()

  if (!exam) return <div>Exam not found</div>

  // 2. Fetch All Students (We'll assume filtering by class logic happens here or we fetch all for now and match)
  // Ideally: .eq("class", exam.class) if columns match.
  // Based on previous findings, students table has a 'class' column.
  let studentQuery = supabase.from("students").select("*").order("roll_number")

  // Try to filter if exam has a class field.
  if (exam.class) {
      studentQuery = studentQuery.eq("class", exam.class)
  }

  const { data: students } = await studentQuery

  // 3. Fetch Existing Answer Sheets
  const { data: sheets } = await supabase
    .from("answer_sheets")
    .select("*")
    .eq("exam_id", examId)

  // 4. Merge Data
  const roster = students?.map(student => {
    const sheet = sheets?.find(s => s.student_id === student.id)
    return {
      ...student,
      sheet,
      status: sheet ? sheet.status : "missing"
    }
  }) || []

  // Stats
  const totalStudents = roster.length
  const submitted = roster.filter(r => r.status !== "missing").length
  const graded = roster.filter(r => r.status === "graded" || r.status === "approved").length

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
          <Link href="/dashboard/grading">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{exam.exam_name}</h1>
            <p className="text-muted-foreground">
              {exam.subject} • Class {exam.class} • Grading Roster
            </p>
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="p-4">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-slate-400">Total Students</span>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-white">{totalStudents}</div>
        </GlassCard>
        <GlassCard className="p-4">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-slate-400">Submissions</span>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-white">{submitted} / {totalStudents}</div>
        </GlassCard>
        <GlassCard className="p-4">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-slate-400">Graded</span>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-white">{graded}</div>
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
             <h3 className="text-lg font-semibold text-white">Student Roster</h3>
             <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    placeholder="Search students..."
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                />
             </div>
        </div>
        <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-white/5 text-xs uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {roster.map((student) => (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono">{student.roll_number}</td>
                      <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                      <td className="px-6 py-4">
                        <Badge
                            variant={
                              student.status === "approved" ? "default" :
                              student.status === "graded" ? "secondary" :
                              student.status === "processing" ? "outline" : "destructive"
                            }
                            className={student.status === "missing" ? "bg-slate-800 text-slate-400 border-slate-700" : ""}
                          >
                            {student.status === "missing" ? "Not Uploaded" : student.status}
                          </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono">
                         {student.sheet?.total_score !== undefined && student.sheet?.total_score !== null
                            ? `${student.sheet.total_score} / ${exam.total_marks}`
                            : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                         {student.status === "missing" ? (
                             <UploadSheetDialog
                                examId={examId}
                                studentId={student.id}
                                studentName={student.name}
                                onUploadComplete={() => {}} // Revalidation handled by router.refresh in component
                             />
                         ) : student.status === "processing" ? (
                             <span className="text-xs text-muted-foreground animate-pulse">Grading...</span>
                         ) : (
                             <Link href={`/dashboard/grading/${student.sheet.id}`}>
                                <Button size="sm" variant="outline" className="gap-2">
                                    Review <ChevronRight size={14} />
                                </Button>
                             </Link>
                         )}
                      </td>
                    </tr>
                  ))}
                  {roster.length === 0 && (
                      <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-500">
                              No students found for Class {exam.class}.
                          </td>
                      </tr>
                  )}
                </tbody>
             </table>
        </div>
      </GlassCard>
    </div>
  )
}
