import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Download, Eye } from "lucide-react";

export default function TermPapersPage({ params }: { params: { subject: string; term: string } }) {
  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1);
  
  // Mock data
  const papers = [
    { id: "2023-final", title: "2023 End of Term Final", year: 2023, duration: "2 Hours", marks: 100 },
    { id: "2022-final", title: "2022 End of Term Final", year: 2022, duration: "2 Hours", marks: 100 },
    { id: "2023-mid", title: "2023 Mid-Term Assessment", year: 2023, duration: "1 Hour", marks: 50 },
    { id: "2021-final", title: "2021 End of Term Final", year: 2021, duration: "2 Hours", marks: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/protected/student/papers" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">{subjectName} - Term {params.term} Papers</h2>
      </div>

      <div className="grid gap-4">
        {papers.map((paper) => (
          <Card key={paper.id} className="hover:border-purple-300 transition-colors">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-lg">
                    <FileText className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">{paper.title}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Year: {paper.year}</span>
                        <span>Duration: {paper.duration}</span>
                        <span>Total Marks: {paper.marks}</span>
                    </div>
                </div>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none">
                    <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Link href={`/protected/student/papers/${paper.id}`} className="flex-1 sm:flex-none">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Eye className="h-4 w-4 mr-2" /> View Paper
                    </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
