import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Messages
        </h1>
        <p className="text-muted-foreground">Communicate with students and parents.</p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
          <p>No new messages.</p>
          <p className="text-sm">Start a conversation by selecting a student or parent.</p>
        </CardContent>
      </Card>
    </div>
  )
}
