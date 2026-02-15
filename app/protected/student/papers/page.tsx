import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CalendarDays } from "lucide-react";

export default function PapersPage() {
  const subjects = [
    { name: "History", terms: [1, 2, 3] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Past Papers</h2>
        <p className="text-muted-foreground mt-1">Practice with previous term papers and exams</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="bg-gray-50 border-b pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                {subject.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {subject.terms.map((term) => (
                  <Link
                    key={term}
                    href={`/protected/student/papers/subject/${subject.name.toLowerCase()}/term/${term}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-purple-50 hover:border-purple-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded group-hover:bg-white text-gray-500 group-hover:text-purple-600 transition-colors">
                            <CalendarDays className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Term {term}</span>
                    </div>
                    <Badge variant="secondary" className="group-hover:bg-white">View Papers</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
