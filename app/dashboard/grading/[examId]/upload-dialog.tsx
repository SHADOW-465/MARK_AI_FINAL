"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UploadCloud } from "lucide-react"
import { useRouter } from "next/navigation"

interface UploadSheetDialogProps {
  examId: string
  studentId: string
  studentName: string
  onUploadComplete: () => void
}

export function UploadSheetDialog({ examId, studentId, studentName, onUploadComplete }: UploadSheetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${examId}/${studentId}-${Date.now()}.${fileExt}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("answer-sheets")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from("answer-sheets").getPublicUrl(fileName)

      // 2. Create answer_sheet record
      const { data: sheetData, error: dbError } = await supabase
        .from("answer_sheets")
        .insert({
          exam_id: examId,
          student_id: studentId,
          file_url: publicUrl,
          status: "processing",
        })
        .select()
        .single()

      if (dbError) throw dbError

      // 3. Trigger AI Grading
      const response = await fetch("/api/gemini/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId: sheetData.id,
          fileUrl: publicUrl,
          examId: examId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to trigger grading")
      }

      setOpen(false)
      onUploadComplete()
      router.refresh()
    } catch (error) {
      console.error("Error uploading:", error)
      alert("Failed to upload. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
            <UploadCloud size={14} />
            Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Answer Sheet</DialogTitle>
          <DialogDescription>
            Upload answer sheet for {studentName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Answer Sheet (Image/PDF)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
              <Input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                id={`file-upload-${studentId}`}
                onChange={handleFileChange}
              />
              <Label htmlFor={`file-upload-${studentId}`} className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <span className="text-sm font-medium">{file ? file.name : "Click to select file"}</span>
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={isLoading || !file}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Upload & Grade"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
