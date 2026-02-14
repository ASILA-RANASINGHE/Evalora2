import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Clock, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

export default async function PaperViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/protected/student/papers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Papers
      </Link>

      <div className="text-center space-y-4">
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 text-sm">Mathematics • Term 1 • 2023</Badge>
        <h1 className="text-4xl font-bold tracking-tight">End of Term Final Examination</h1>
        <p className="text-xl text-muted-foreground">Please read the instructions carefully before starting.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <Clock className="h-8 w-8 text-blue-500 mb-2" />
                <span className="font-bold text-lg">2 Hours</span>
                <span className="text-sm text-muted-foreground">Duration</span>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <FileText className="h-8 w-8 text-purple-500 mb-2" />
                <span className="font-bold text-lg">4 Sections</span>
                <span className="text-sm text-muted-foreground">Structure</span>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                <span className="font-bold text-lg">100 Marks</span>
                <span className="text-sm text-muted-foreground">Total Score</span>
            </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-yellow-500">
        <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-2 text-yellow-600 font-bold text-lg mb-2">
                <AlertCircle className="h-5 w-5" />
                Instructions
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Answer all questions in Section A and any 3 questions from Section B.</li>
                <li>Write your answers clearly and show all working for calculation questions.</li>
                <li>Electronic calculators are permitted.</li>
                <li>Do not leave the exam page once started, as this may be flagged as suspicious activity.</li>
                <li>Click "Submit" only when you have completed the entire paper.</li>
            </ul>
        </CardContent>
      </Card>

      <div className="text-center pt-4">
        <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all">
            Start Examination via PDF Viewer
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">Opens in a secure, interactive viewing environment</p>
      </div>
    </div>
  );
}
