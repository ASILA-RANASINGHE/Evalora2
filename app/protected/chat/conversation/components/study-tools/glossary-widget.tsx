"use client";

import { BookOpen } from "lucide-react";

interface GlossaryTerm {
  term: string;
  definition: string;
}

const sampleTerms: GlossaryTerm[] = [
  {
    term: "Quadratic Equation",
    definition:
      "A polynomial equation of degree 2, in the form ax² + bx + c = 0.",
  },
  {
    term: "Discriminant",
    definition:
      "The expression b² − 4ac that determines the nature of the roots.",
  },
  {
    term: "Factoring",
    definition:
      "Breaking down an expression into a product of simpler expressions.",
  },
  {
    term: "Vertex Form",
    definition: "A quadratic written as a(x − h)² + k, where (h, k) is the vertex.",
  },
  {
    term: "Polynomial",
    definition:
      "An expression consisting of variables and coefficients with non-negative integer exponents.",
  },
];

export function GlossaryWidget() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-800">
          Session Glossary
        </h3>
        <span className="ml-auto text-[10px] text-slate-400 font-medium">
          {sampleTerms.length} terms
        </span>
      </div>

      <div className="space-y-2">
        {sampleTerms.map((item) => (
          <div
            key={item.term}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
          >
            <p className="text-xs font-semibold text-blue-600">{item.term}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              {item.definition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
