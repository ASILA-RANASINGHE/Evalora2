// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuizProblem {
  topic: string;
  problemText: string;
  hintText: string;
  correctAnswer: string;
  solutionSteps: string;
}

// ─── Demo Problem Bank ───────────────────────────────────────────────────────

const problemBank: QuizProblem[] = [
  {
    topic: "Quadratic Equations",
    problemText:
      `### Challenge Problem\n\nSolve the following quadratic equation:\n\n$$2x^2 - 7x + 3 = 0$$\n\nFind **both** values of $x$. Use the whiteboard for rough work and type your final answer below.`,
    hintText:
      `Use the quadratic formula:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nHere $a = 2$, $b = -7$, $c = 3$. Start by computing the discriminant $b^2 - 4ac$.`,
    correctAnswer: "x = 3, x = 1/2",
    solutionSteps:
      `### Step-by-Step Solution\n\nGiven $2x^2 - 7x + 3 = 0$, with $a=2$, $b=-7$, $c=3$:\n\n**Step 1 — Discriminant:**\n$$\\Delta = b^2 - 4ac = (-7)^2 - 4(2)(3) = 49 - 24 = 25$$\n\n**Step 2 — Apply the formula:**\n$$x = \\frac{-(-7) \\pm \\sqrt{25}}{2 \\cdot 2} = \\frac{7 \\pm 5}{4}$$\n\n**Step 3 — Two solutions:**\n\n| Branch | Calculation | Result |\n|--------|-------------|--------|\n| $x_1$ | $(7 + 5) / 4$ | $3$ |\n| $x_2$ | $(7 - 5) / 4$ | $\\frac{1}{2}$ |\n\n> **Common Mistake:** Forgetting to divide by $2a$ (not just $2$). With $a=2$, the denominator is $4$, not $2$.`,
  },
  {
    topic: "Integration",
    problemText:
      `### Challenge Problem\n\nEvaluate the definite integral:\n\n$$\\int_0^2 (3x^2 + 4x - 1) \\, dx$$\n\nShow your working on the whiteboard and type the final numeric answer below.`,
    hintText:
      `Use the power rule for integration: $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$.\n\nIntegrate each term separately, then evaluate from $0$ to $2$.`,
    correctAnswer: "14",
    solutionSteps:
      `### Step-by-Step Solution\n\n**Step 1 — Integrate term by term:**\n$$\\int (3x^2 + 4x - 1) \\, dx = x^3 + 2x^2 - x + C$$\n\n**Step 2 — Evaluate at the bounds:**\n$$\\Big[x^3 + 2x^2 - x\\Big]_0^2$$\n\n**Step 3 — Substitute $x = 2$:**\n$$= (8 + 8 - 2) - (0 + 0 - 0) = 14$$\n\n> **Common Mistake:** Forgetting the coefficient when integrating — $\\int 3x^2 \\, dx = x^3$, not $\\frac{3x^3}{3} = x^3$. In this case it works out, but always check!`,
  },
  {
    topic: "Derivatives",
    problemText:
      `### Challenge Problem\n\nFind the derivative of:\n\n$$f(x) = x^3 \\sin(x)$$\n\nApply the appropriate rule and simplify. Type your final answer below.`,
    hintText:
      `This is a product of two functions: $u = x^3$ and $v = \\sin(x)$.\n\nUse the **product rule**: $(uv)' = u'v + uv'$.`,
    correctAnswer: "f'(x) = 3x^2 sin(x) + x^3 cos(x)",
    solutionSteps:
      `### Step-by-Step Solution\n\nLet $u = x^3$ and $v = \\sin(x)$.\n\n**Step 1 — Find the individual derivatives:**\n$$u' = 3x^2, \\quad v' = \\cos(x)$$\n\n**Step 2 — Apply the product rule:**\n$$f'(x) = u'v + uv' = 3x^2 \\sin(x) + x^3 \\cos(x)$$\n\n> **Common Mistake:** Using the chain rule instead of the product rule. The chain rule applies to compositions $f(g(x))$, not products $f(x) \\cdot g(x)$.`,
  },
  {
    topic: "Factoring",
    problemText:
      `### Challenge Problem\n\nFactor completely:\n\n$$6x^2 + 11x - 10$$\n\nExpress your answer in the form $(ax + b)(cx + d)$.`,
    hintText:
      `Find two numbers that multiply to $6 \\times (-10) = -60$ and add to $11$.\n\nThose numbers are $15$ and $-4$. Then use **factor by grouping**.`,
    correctAnswer: "(2x + 5)(3x - 2)",
    solutionSteps:
      `### Step-by-Step Solution\n\n**Step 1 — Find the product-sum pair:**\nWe need two numbers that multiply to $ac = 6 \\times (-10) = -60$ and add to $b = 11$.\n$$15 \\times (-4) = -60, \\quad 15 + (-4) = 11 \\checkmark$$\n\n**Step 2 — Split the middle term:**\n$$6x^2 + 15x - 4x - 10$$\n\n**Step 3 — Factor by grouping:**\n$$3x(2x + 5) - 2(2x + 5) = (2x + 5)(3x - 2)$$\n\n> **Common Mistake:** Sign errors when splitting the middle term. Always verify that the split terms add back to the original middle term.`,
  },
  {
    topic: "Trigonometry",
    problemText:
      `### Challenge Problem\n\nIn a right triangle, $\\sin\\theta = \\frac{3}{5}$.\n\nFind the exact values of $\\cos\\theta$ and $\\tan\\theta$. Assume $\\theta$ is in the first quadrant.`,
    hintText:
      `Use the Pythagorean identity: $\\sin^2\\theta + \\cos^2\\theta = 1$.\n\nFrom $\\sin\\theta = \\frac{3}{5}$, find $\\cos\\theta$, then compute $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$.`,
    correctAnswer: "cos(θ) = 4/5, tan(θ) = 3/4",
    solutionSteps:
      `### Step-by-Step Solution\n\n**Step 1 — Use the Pythagorean identity:**\n$$\\cos^2\\theta = 1 - \\sin^2\\theta = 1 - \\frac{9}{25} = \\frac{16}{25}$$\n\n**Step 2 — Take the square root** (first quadrant, so positive):\n$$\\cos\\theta = \\frac{4}{5}$$\n\n**Step 3 — Compute tangent:**\n$$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = \\frac{3/5}{4/5} = \\frac{3}{4}$$\n\n> **Common Mistake:** Forgetting to consider the sign. In the first quadrant all trig ratios are positive, but in Q2/Q3/Q4 some are negative.`,
  },
  {
    topic: "Polynomial Division",
    problemText:
      `### Challenge Problem\n\nPerform polynomial long division:\n\n$$\\frac{x^3 + 2x^2 - 5x + 1}{x - 2}$$\n\nFind the quotient and remainder.`,
    hintText:
      `Use synthetic division with $c = 2$ (from $x - 2$).\n\nCoefficients: $1, 2, -5, 1$. Bring down the first, multiply and add repeatedly.`,
    correctAnswer: "x^2 + 4x + 3, remainder 7",
    solutionSteps:
      `### Step-by-Step Solution\n\nUsing synthetic division with $c = 2$:\n\n| Step | Bring down / Add | Multiply by 2 |\n|------|-------------------|---------------|\n| Start | $1$ | — |\n| | $2 + 2 = 4$ | $1 \\times 2 = 2$ |\n| | $-5 + 8 = 3$ | $4 \\times 2 = 8$ |\n| | $1 + 6 = 7$ | $3 \\times 2 = 6$ |\n\n**Result:** Quotient $= x^2 + 4x + 3$, Remainder $= 7$\n\n$$\\frac{x^3 + 2x^2 - 5x + 1}{x - 2} = x^2 + 4x + 3 + \\frac{7}{x-2}$$\n\n> **Common Mistake:** Sign error — when dividing by $(x - 2)$, use $c = +2$ in synthetic division, not $-2$.`,
  },
  {
    topic: "Systems of Equations",
    problemText:
      `### Challenge Problem\n\nSolve the system of equations:\n\n$$\\begin{cases} 2x + 3y = 7 \\\\ x - y = 1 \\end{cases}$$\n\nFind the values of $x$ and $y$.`,
    hintText:
      `From the second equation: $x = y + 1$.\n\nSubstitute into the first equation and solve for $y$, then back-substitute.`,
    correctAnswer: "x = 2, y = 1",
    solutionSteps:
      `### Step-by-Step Solution\n\n**Step 1 — Solve for $x$ from equation 2:**\n$$x = y + 1$$\n\n**Step 2 — Substitute into equation 1:**\n$$2(y + 1) + 3y = 7$$\n$$2y + 2 + 3y = 7$$\n$$5y = 5 \\implies y = 1$$\n\n**Step 3 — Back-substitute:**\n$$x = 1 + 1 = 2$$\n\n**Verification:**\n$$2(2) + 3(1) = 7 \\checkmark, \\quad 2 - 1 = 1 \\checkmark$$\n\n> **Common Mistake:** Substituting into the same equation you solved from, which gives a tautology ($0 = 0$) instead of a value.`,
  },
  {
    topic: "Simplification",
    problemText:
      `### Challenge Problem\n\nSimplify the rational expression:\n\n$$\\frac{x^2 - 9}{x^2 - x - 6}$$\n\nState any restrictions on $x$.`,
    hintText:
      `Factor both the numerator and denominator.\n\n- Numerator: difference of squares $a^2 - b^2 = (a+b)(a-b)$\n- Denominator: find two numbers that multiply to $-6$ and add to $-1$`,
    correctAnswer: "(x + 3)/(x + 2), x ≠ 3, x ≠ -2",
    solutionSteps:
      `### Step-by-Step Solution\n\n**Step 1 — Factor the numerator** (difference of squares):\n$$x^2 - 9 = (x+3)(x-3)$$\n\n**Step 2 — Factor the denominator:**\n$$x^2 - x - 6 = (x-3)(x+2)$$\n\n**Step 3 — Cancel common factor:**\n$$\\frac{(x+3)\\cancel{(x-3)}}{\\cancel{(x-3)}(x+2)} = \\frac{x+3}{x+2}$$\n\n**Restrictions:** $x \\neq 3$ and $x \\neq -2$ (values that make the original denominator zero).\n\n> **Common Mistake:** Forgetting to state restrictions. Even though $(x-3)$ cancels, the original expression is still undefined at $x = 3$.`,
  },
];

// ─── Topic keyword map ───────────────────────────────────────────────────────

const topicKeywords: [string[], number][] = [
  [["quadratic", "quadratics", "ax^2", "x²", "formula"], 0],
  [["integral", "integrate", "integration", "antiderivative", "area under"], 1],
  [["derivative", "differentiate", "differentiation", "d/dx", "rate of change"], 2],
  [["factor", "factoring", "factorise", "factorize"], 3],
  [["trig", "trigonometry", "sin", "cos", "tan", "triangle"], 4],
  [["polynomial", "division", "long division", "synthetic"], 5],
  [["system", "simultaneous", "equations", "linear system"], 6],
  [["simplif", "rational", "expression", "cancel"], 7],
];

// ─── Generators ──────────────────────────────────────────────────────────────

export function generateQuizProblem(
  recentMessages: string[],
  syllabusName: string | null
): QuizProblem {
  const combined = recentMessages.join(" ").toLowerCase();

  // Find the first matching topic from the recent conversation context
  let matchIndex = -1;
  for (const [keywords, idx] of topicKeywords) {
    if (keywords.some((kw) => combined.includes(kw))) {
      matchIndex = idx;
      break;
    }
  }

  // Fallback to a random problem if no topic matched
  const problem =
    matchIndex >= 0
      ? problemBank[matchIndex]
      : problemBank[Math.floor(Math.random() * problemBank.length)];

  // Append syllabus reference to the problem text if available
  if (syllabusName) {
    return {
      ...problem,
      problemText:
        problem.problemText +
        `\n\n> *Based on concepts from your uploaded syllabus (${syllabusName}).*`,
    };
  }

  return problem;
}

export function generateGradingResponse(
  problem: QuizProblem,
  userAnswer: string,
  syllabusName: string | null
): string {
  const syllabusNote = syllabusName
    ? `\n\nAs covered in your ${syllabusName}, make sure to practice similar problems from the relevant chapter.`
    : "";

  return (
    `### Grading Your Answer\n\n` +
    `**Your answer:** ${userAnswer}\n\n` +
    `**Expected answer:** $${problem.correctAnswer}$\n\n---\n\n` +
    problem.solutionSteps +
    syllabusNote +
    `\n\n---\n\n` +
    `Ready for another challenge? Click **"Try another problem"** below, or ask me to explain any step in more detail.`
  );
}
