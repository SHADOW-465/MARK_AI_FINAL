import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function ExamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch exam details
  const { data: exam } = await supabase.from("exams").select("*").eq("id", id).single()

  if (!exam) {
    return <div>Exam not found</div>
  }

  // Fetch answer sheets
  const { data: sheets } = await supabase
    .from("answer_sheets")
    .select("*, students(name, roll_number)")
    .eq("exam_id", id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.exam_name}</h1>
          <p className="text-muted-foreground">
            {exam.subject} • Class {exam.class} • {new Date(exam.exam_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/exams/${id}/upload`}>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Answer Sheets
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sheets?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sheets?.filter((s) => s.status === "graded" || s.status === "approved").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sheets?.filter((s) => s.status === "graded").length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sheets && sheets.length > 0 ? (
                sheets.map((sheet) => (
                  <TableRow key={sheet.id}>
                    <TableCell>{sheet.students?.roll_number}</TableCell>
                    <TableCell>{sheet.students?.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sheet.status === "approved" ? "default" : sheet.status === "graded" ? "secondary" : "outline"
                        }
                      >
                        {sheet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sheet.total_score !== null ? `${sheet.total_score} / ${exam.total_marks}` : "-"}
                    </TableCell>
                    <TableCell>{sheet.confidence ? `${Math.round(sheet.confidence * 100)}%` : "-"}</TableCell>
                    <TableCell className="text-right">
                      {sheet.status === "graded" || sheet.status === "approved" ? (
                        <Link href={`/dashboard/grading/${sheet.id}`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-sm">Processing...</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No submissions yet. Upload answer sheets to start grading.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
