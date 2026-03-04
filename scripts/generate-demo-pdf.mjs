import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync, mkdirSync } from "fs";

async function main() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const W = 612, H = 792; // US Letter
  const margin = 60;
  const lineH = 18;

  function addPage(lines) {
    const page = doc.addPage([W, H]);
    let y = H - margin;
    for (const line of lines) {
      if (y < margin) break;
      const f = line.bold ? bold : line.mono ? mono : font;
      const size = line.size || 12;
      page.drawText(line.text, { x: margin, y, font: f, size, color: rgb(0.1, 0.1, 0.1) });
      y -= line.gap || lineH;
    }
    return page;
  }

  // Page 1 — Title / Syllabus Overview
  addPage([
    { text: "CS201 — Data Structures & Algorithms", bold: true, size: 18, gap: 28 },
    { text: "Fall 2024 Syllabus", bold: true, size: 14, gap: 24 },
    { text: "", gap: 10 },
    { text: "Instructor: Dr. Sarah Chen", size: 12 },
    { text: "Office Hours: MW 2:00–4:00 PM, Room 312", size: 12 },
    { text: "Email: s.chen@university.edu", size: 12 },
    { text: "", gap: 24 },
    { text: "Course Description:", bold: true, size: 13, gap: 20 },
    { text: "This course covers fundamental data structures and algorithmic", size: 12 },
    { text: "techniques. Topics include arrays, linked lists, trees, graphs,", size: 12 },
    { text: "sorting algorithms, searching algorithms, and complexity analysis.", size: 12 },
    { text: "", gap: 24 },
    { text: "Prerequisites:", bold: true, size: 13, gap: 20 },
    { text: "CS101 Introduction to Programming (Grade B or higher)", size: 12 },
    { text: "MATH201 Discrete Mathematics", size: 12 },
    { text: "", gap: 24 },
    { text: "Required Textbook:", bold: true, size: 13, gap: 20 },
    { text: "Introduction to Algorithms, 4th Edition", size: 12 },
    { text: "by Cormen, Leiserson, Rivest, and Stein (CLRS)", size: 12 },
  ]);

  // Page 2 — Course Schedule Overview
  addPage([
    { text: "Course Schedule Overview", bold: true, size: 16, gap: 26 },
    { text: "", gap: 10 },
    { text: "Week 1-2:   Introduction & Review of Programming Basics", size: 11 },
    { text: "Week 3-4:   Arrays, Linked Lists, Stacks, Queues", size: 11 },
    { text: "Week 5-6:   Trees (Binary, BST, AVL, Heaps)", size: 11 },
    { text: "Week 7:     Midterm Review & Exam", size: 11 },
    { text: "Week 8-9:   Hash Tables & Graphs", size: 11 },
    { text: "Week 10-11: Sorting Algorithms", size: 11 },
    { text: "Week 12-13: Graph Algorithms (BFS, DFS, Dijkstra)", size: 11 },
    { text: "Week 14:    Dynamic Programming Introduction", size: 11 },
    { text: "Week 15:    Final Review", size: 11 },
    { text: "Week 16:    Final Examination", size: 11 },
  ]);

  // Page 3 — Chapter 1 Intro
  addPage([
    { text: "Chapter 1 — Introduction to Algorithm Analysis", bold: true, size: 16, gap: 26 },
    { text: "", gap: 10 },
    { text: "1.1 What is an Algorithm?", bold: true, size: 13, gap: 20 },
    { text: "An algorithm is a well-defined computational procedure that takes", size: 12 },
    { text: "some value, or set of values, as input and produces some value,", size: 12 },
    { text: "or set of values, as output.", size: 12 },
    { text: "", gap: 20 },
    { text: "1.2 Big-O Notation", bold: true, size: 13, gap: 20 },
    { text: "Big-O notation describes the upper bound of the growth rate", size: 12 },
    { text: "of a function. For example, f(n) = O(n^2) means f grows", size: 12 },
    { text: "no faster than quadratic.", size: 12 },
    { text: "", gap: 20 },
    { text: "Common complexities (fastest to slowest):", bold: true, size: 12, gap: 18 },
    { text: "  O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)", mono: true, size: 11 },
  ]);

  // Page 4 — Section 2.1 Arrays & Linked Lists
  addPage([
    { text: "Section 2.1 — Arrays & Linked Lists", bold: true, size: 16, gap: 26 },
    { text: "", gap: 10 },
    { text: "An array is a contiguous block of memory that stores elements", size: 12 },
    { text: "of the same type. Access time is O(1) for indexed access.", size: 12 },
    { text: "", gap: 20 },
    { text: "A linked list is a linear data structure where each element", size: 12 },
    { text: "(node) contains a value and a pointer to the next node.", size: 12 },
    { text: "", gap: 20 },
    { text: "Key differences:", bold: true, size: 13, gap: 20 },
    { text: "  Arrays:       O(1) access, O(n) insertion/deletion", size: 12 },
    { text: "  Linked Lists: O(n) access, O(1) insertion/deletion", size: 12 },
    { text: "", gap: 20 },
    { text: "When to use Arrays:", bold: true, size: 12, gap: 18 },
    { text: "- Random access is frequently needed", size: 12 },
    { text: "- Cache performance matters (spatial locality)", size: 12 },
    { text: "- Size is known in advance", size: 12 },
    { text: "", gap: 20 },
    { text: "When to use Linked Lists:", bold: true, size: 12, gap: 18 },
    { text: "- Frequent insertions/deletions at arbitrary positions", size: 12 },
    { text: "- Size varies dramatically", size: 12 },
    { text: "- Memory allocation must be flexible", size: 12 },
  ]);

  // Pages 5-11 — filler pages for realistic page count
  const fillerTopics = [
    "Section 2.2 — Stacks and Queues",
    "Section 2.3 — Doubly Linked Lists",
    "Chapter 3 — Trees and Binary Search Trees",
    "Section 3.1 — Tree Traversals",
    "Section 3.2 — AVL Trees and Balancing",
    "Chapter 4 — Hash Tables",
    "Section 4.1 — Collision Resolution",
  ];
  for (const title of fillerTopics) {
    addPage([
      { text: title, bold: true, size: 16, gap: 26 },
      { text: "", gap: 10 },
      { text: "This section covers the theory and practical applications of the", size: 12 },
      { text: "data structure described above. Students should review the relevant", size: 12 },
      { text: "chapters in CLRS and complete the assigned practice problems.", size: 12 },
      { text: "", gap: 20 },
      { text: "Key Concepts:", bold: true, size: 13, gap: 20 },
      { text: "- Time and space complexity analysis", size: 12 },
      { text: "- Implementation in pseudocode and Python/Java", size: 12 },
      { text: "- Applications in real-world systems", size: 12 },
    ]);
  }

  // Page 12 — Chapter 5 Sorting Algorithms
  addPage([
    { text: "Chapter 5 — Sorting Algorithms", bold: true, size: 16, gap: 26 },
    { text: "", gap: 10 },
    { text: "5.1 Comparison-Based Sorting", bold: true, size: 13, gap: 20 },
    { text: "", gap: 8 },
    { text: "The quadratic formula can be applied to analyze the average-case", size: 12 },
    { text: "behavior of certain recursive sorting algorithms.", size: 12 },
    { text: "", gap: 20 },
    { text: "For QuickSort, the recurrence relation:", bold: true, size: 12, gap: 18 },
    { text: "  T(n) = 2T(n/2) + O(n)", mono: true, size: 11 },
    { text: "", gap: 18 },
    { text: "Yields an average-case complexity of O(n log n).", size: 12 },
    { text: "Worst case remains O(n^2) without randomization.", size: 12 },
    { text: "", gap: 20 },
    { text: "5.2 Non-Comparison Sorting", bold: true, size: 13, gap: 20 },
    { text: "Counting Sort, Radix Sort, and Bucket Sort can achieve O(n)", size: 12 },
    { text: "time complexity under specific conditions.", size: 12 },
  ]);

  // Pages 13-14 — More sorting content
  addPage([
    { text: "Section 5.3 — MergeSort Analysis", bold: true, size: 16, gap: 26 },
    { text: "", gap: 10 },
    { text: "MergeSort divides the array into two halves, recursively sorts", size: 12 },
    { text: "each half, and then merges the sorted halves together.", size: 12 },
    { text: "", gap: 20 },
    { text: "Time complexity: O(n log n) in all cases.", size: 12 },
    { text: "Space complexity: O(n) auxiliary space.", size: 12 },
  ]);

  addPage([
    { text: "Section 5.4 — HeapSort", bold: true, size: 16, gap: 26 },
    { text: "", gap: 10 },
    { text: "HeapSort uses a binary heap data structure to sort elements.", size: 12 },
    { text: "It provides O(n log n) worst-case time and O(1) auxiliary space.", size: 12 },
  ]);

  // Page 15 — Grading Criteria
  addPage([
    { text: "Grading Criteria", bold: true, size: 16, gap: 26 },
    { text: "", gap: 10 },
    { text: "Midterm Exam .................. 25%", size: 12 },
    { text: "Final Exam .................... 30%", size: 12 },
    { text: "Programming Assignments ....... 25%", size: 12 },
    { text: "Quizzes ....................... 10%", size: 12 },
    { text: "Class Participation ........... 10%", size: 12 },
    { text: "", gap: 24 },
    { text: "Late Policy:", bold: true, size: 13, gap: 20 },
    { text: "Assignments lose 10% per day late.", size: 12 },
    { text: "Maximum 3 days late accepted.", size: 12 },
    { text: "No extensions without prior approval.", size: 12 },
    { text: "", gap: 24 },
    { text: "Academic Integrity:", bold: true, size: 13, gap: 20 },
    { text: "All work submitted must be your own. Collaboration is", size: 12 },
    { text: "encouraged for understanding concepts but all code and", size: 12 },
    { text: "written work must be individually authored.", size: 12 },
  ]);

  // Pages 16-24 — Additional filler for 24 total pages
  const additionalTopics = [
    "Chapter 6 — Graph Representations",
    "Section 6.1 — Breadth-First Search (BFS)",
    "Section 6.2 — Depth-First Search (DFS)",
    "Section 6.3 — Dijkstra's Shortest Path",
    "Chapter 7 — Dynamic Programming",
    "Section 7.1 — Memoization vs Tabulation",
    "Section 7.2 — Classic DP Problems",
    "Chapter 8 — Review & Practice Problems",
    "Appendix — Reference Sheet",
  ];
  for (const title of additionalTopics) {
    addPage([
      { text: title, bold: true, size: 16, gap: 26 },
      { text: "", gap: 10 },
      { text: "Detailed content for this section is covered in lectures", size: 12 },
      { text: "and the assigned readings from the CLRS textbook.", size: 12 },
      { text: "", gap: 20 },
      { text: "Practice problems are available on the course portal.", size: 12 },
    ]);
  }

  const bytes = await doc.save();
  mkdirSync("public/demo", { recursive: true });
  writeFileSync("public/demo/CS201_Syllabus.pdf", bytes);
  console.log(`Generated CS201_Syllabus.pdf (${doc.getPageCount()} pages, ${bytes.length} bytes)`);
}

main().catch(console.error);
