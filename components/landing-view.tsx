"use client";

import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useMotionTemplate, 
  useMotionValue, 
  useInView,
  animate,
  Variants
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import React, { useState, useEffect, useRef, MouseEvent } from "react";

// --- Types & Interfaces ---
interface LandingViewProps {
  authSection: React.ReactNode;
  contentSection: React.ReactNode;
  deployButton: React.ReactNode; 
}

// --- Animation Variants (The "Smooth" Engine) ---
const fadeInUp: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 50, damping: 20 } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const scaleIn: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 60, damping: 15 }
  }
};

// --- Constants ---
const NAV_LINKS = [
  { name: "Home", href: "#home" },
  { name: "Syllabus", href: "#syllabus" },
  { name: "Questions", href: "#questions" },
  { name: "About Us", href: "#about" },
  { name: "Contact", href: "#contact" },
];

const GRADES = [
  { id: 6, label: "Grade 06", sub: "Foundation" },
  { id: 7, label: "Grade 07", sub: "Intermediate" },
  { id: 8, label: "Grade 08", sub: "Advanced" },
  { id: 9, label: "Grade 09", sub: "Pre-O/L" },
  { id: 10, label: "Grade 10", sub: "O/L Prep" },
  { id: 11, label: "Grade 11", sub: "O/L Final" },
];

const SUBJECTS = [
  { name: "Mathematics", icon: "M", desc: "Algebra, Geometry, Stats" },
  { name: "Science", icon: "S", desc: "Physics, Chem, Bio" },
  { name: "Sinhala", icon: "Si", desc: "Language & Lit" },
  { name: "English", icon: "E", desc: "Grammar & Comprehension" },
  { name: "History", icon: "H", desc: "Sri Lankan & World" },
  { name: "Religion", icon: "R", desc: "Buddhism / Ethics" },
];

const EQUATIONS = [
  { label: "E = mc^2", top: "20%", left: "15%", delay: 0 },
  { label: "a^2 + b^2 = c^2", top: "65%", left: "80%", delay: 2 },
  { label: "\\nabla \\cdot B = 0", top: "40%", left: "10%", delay: 4 },
  { label: "F = G \\frac{m_1 m_2}{r^2}", top: "15%", left: "75%", delay: 1 },
  { label: "e^{i\\pi} + 1 = 0", top: "80%", left: "25%", delay: 3 },
  { label: "\\int x^n dx", top: "50%", left: "85%", delay: 5 },
];

const FEATURES = [
  { id: 1, title: "AI Analysis", color: "bg-sky-500" },
  { id: 2, title: "Live Analytics", color: "bg-indigo-500" },
  { id: 3, title: "Secure Portal", color: "bg-emerald-500" }
];

const HISTORY = [
  { year: "2020", title: "Inception", desc: "Founded by educators and engineers." },
  { year: "2022", title: "Global Reach", desc: "Expanded to 500+ institutions." },
  { year: "2024", title: "AI Integration", desc: "Launched proprietary learning models." },
];

// --- Helper Components ---

const AnimatedCounter = ({ value, label }: { value: number; label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      animate(motionValue, value, { duration: 2.5, ease: "circOut" });
    }
  }, [isInView, value, motionValue]);

  return (
    <motion.div 
      variants={scaleIn}
      ref={ref} 
      className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-baseline text-4xl md:text-5xl font-black text-sky-600 tracking-tight">
        <motion.span>{rounded}</motion.span>
        <span className="text-sky-400 text-2xl ml-1">+</span>
      </div>
      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{label}</span>
    </motion.div>
  );
};

const PerspectiveGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 [perspective:1000px]">
        <motion.div
          animate={{ backgroundPositionY: [0, 80] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 origin-bottom"
          style={{
             transform: "rotateX(55deg) scale(2) translateY(-20%)",
             backgroundImage: `
               linear-gradient(to right, rgba(14, 165, 233, 0.25) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(14, 165, 233, 0.25) 1px, transparent 1px)
             `,
             backgroundSize: "60px 60px",
             maskImage: "linear-gradient(to bottom, transparent 10%, black 40%, black 80%, transparent 100%)"
          }}
        />
      </div>
    </div>
  );
};

const BarChartVisual = () => (
  <div className="flex items-end gap-3 h-48 w-64 mx-auto pb-4 border-b-2 border-slate-100">
    {[40, 75, 55, 90, 65].map((h, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${h}%` }}
        transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
        className="flex-1 w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-lg opacity-90"
      />
    ))}
  </div>
);

const LineChartVisual = () => (
  <div className="relative h-48 w-64 mx-auto flex items-center justify-center">
    <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 0 40 Q 25 10 50 25 T 100 15"
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.circle
        r="3"
        fill="#4f46e5"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        style={{ offsetPath: "path('M 0 40 Q 25 10 50 25 T 100 15')" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </svg>
    <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent rounded-xl" />
  </div>
);

const SecurityVisual = () => (
  <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
    {[1, 2, 3].map((r) => (
      <motion.div
        key={r}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: r * 0.4 }}
        className="absolute inset-0 rounded-full border-2 border-emerald-500"
      />
    ))}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring" }}
      className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10"
    >
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </motion.div>
  </div>
);

const SpotlightButton = ({ children }: { children: React.ReactNode }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className="group relative border border-sky-500/30 bg-sky-600/5 overflow-hidden rounded-full px-8 py-3 transition-colors hover:bg-sky-600/10 cursor-pointer"
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative font-bold text-sky-700 text-sm z-10">{children}</div>
    </div>
  );
};

// --- Syllabus Section Component (Redesigned) ---
const SyllabusSection = ({ onSubjectClick }: { onSubjectClick: (grade: number | null, subject: string) => void }) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  return (
    <section id="syllabus" className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Subtle Background Mesh to match Vibe */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
           animate={{ rotate: 360, scale: [1, 1.1, 1] }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-sky-100/30 rounded-full blur-[80px]" 
        />
        <motion.div 
           animate={{ rotate: -360, scale: [1, 1.2, 1] }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] bg-indigo-100/30 rounded-full blur-[80px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header - Matching 'About Us' Aesthetic */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-20 max-w-3xl"
        >
          <motion.h2 variants={fadeInUp} className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-4">
            Academic Structure
          </motion.h2>
          <motion.h3 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Your path to mastery. <span className="text-sky-400">Structured for success.</span>
          </motion.h3>
        </motion.div>

        {/* Grade Selector Grid - Tech/Dashboard Vibe */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {GRADES.map((grade) => (
            <motion.div
              key={grade.id}
              variants={fadeInUp}
              onClick={() => setSelectedGrade(selectedGrade === grade.id ? null : grade.id)}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`
                cursor-pointer rounded-xl p-5 border transition-all duration-300 relative group overflow-hidden
                ${selectedGrade === grade.id 
                  ? "bg-slate-900 border-slate-900 shadow-xl ring-2 ring-sky-500/20" 
                  : "bg-white border-slate-200 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100"}
              `}
            >
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className={`text-4xl font-black mb-2 tracking-tighter ${selectedGrade === grade.id ? "text-white" : "text-sky-200 group-hover:text-sky-300 transition-colors"}`}>
                   {grade.id < 10 ? `0${grade.id}` : grade.id}
                </div>
                <div>
                   <div className={`text-sm font-bold ${selectedGrade === grade.id ? "text-sky-400" : "text-slate-800"}`}>
                     {grade.label}
                   </div>
                   <div className={`text-[10px] font-medium uppercase tracking-wider mt-1 ${selectedGrade === grade.id ? "text-slate-400" : "text-sky-400"}`}>
                     {grade.sub}
                   </div>
                </div>
              </div>
              
              {/* Active State Background Decor */}
              {selectedGrade === grade.id && (
                 <motion.div 
                   layoutId="activeGlow"
                   className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-500/20 to-transparent blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" 
                 />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Subject Display Area - Glassmorphic Dashboard Panel */}
        <AnimatePresence mode="wait">
          {selectedGrade && (
            <motion.div
              key={selectedGrade}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="bg-white rounded-3xl p-1 border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="bg-slate-50/50 rounded-[20px] p-8 border border-slate-100 relative overflow-hidden">
                {/* Decorative Grid Background */}
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />
                
                <div className="relative z-10 flex items-center justify-between mb-8 border-b border-slate-200/60 pb-6">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg"
                    >
                      {selectedGrade}
                    </motion.div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">Curriculum Modules</h4>
                      <p className="text-sm text-slate-500">Core subjects for this academic level</p>
                    </div>
                  </div>
                  <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-sky-600 hover:border-sky-200 transition-colors shadow-sm">
                    <span>View Syllabus PDF</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                </div>

                <motion.div 
                   variants={staggerContainer}
                   initial="hidden"
                   animate="visible"
                   className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {SUBJECTS.map((subject, idx) => (
                    <motion.div
                      key={subject.name}
                      variants={scaleIn}
                      whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 1)", borderColor: "#bfdbfe" }}
                      onClick={() => onSubjectClick(selectedGrade, subject.name)}
                      className="group bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 transition-all cursor-pointer flex items-center gap-4 shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-sky-50 flex items-center justify-center text-lg font-bold text-slate-400 group-hover:text-sky-600 transition-colors">
                        {subject.icon}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-base">{subject.name}</h5>
                        <p className="text-xs text-slate-500 group-hover:text-slate-600">{subject.desc}</p>
                      </div>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                         <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF Modal */}
        {pdfUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-[90%] h-[90%] rounded-lg overflow-hidden shadow-xl relative">
              <button onClick={() => setPdfUrl(null)} className="absolute right-4 top-4 z-40 bg-white rounded-full p-2 shadow">
                <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <iframe src={pdfUrl} className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Snackbar */}
        {snackbar && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-md shadow">{snackbar}</div>
          </div>
        )}

        {!selectedGrade && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }}
             className="flex flex-col items-center justify-center py-12 text-center"
           >
             <div className="w-16 h-1 bg-slate-200 rounded-full mb-4" />
             <p className="text-sky-400 font-medium">Select a grade level to explore the curriculum</p>
           </motion.div>
        )}

      </div>
    </section>
  );
};


// --- About Section Component ---
const AboutSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start end", "end start"]
  });
  
  // Parallax drawing of the line
  const lineHeight = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);

  return (
    <section id="about" ref={containerRef} className="relative py-32 bg-slate-50 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-sky-100/40 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           variants={staggerContainer}
           className="mb-20 max-w-3xl"
        >
          <motion.h2 variants={fadeInUp} className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-4">
            Who We Are
          </motion.h2>
          <motion.h3 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8">
            Education is a relationship-based industry. <span className="text-sky-500">Trust is our currency.</span>
          </motion.h3>
          <motion.p variants={fadeInUp} className="text-lg text-slate-600 leading-relaxed">
            We are building the infrastructure for the next generation of learning. 
            Evalora isn't just a platform; it's a commitment to transparency, security, and academic excellence.
          </motion.p>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-50px" }}
           variants={staggerContainer}
           className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24"
        >
          <AnimatedCounter value={150} label="Partner Schools" />
          <AnimatedCounter value={12000} label="Active Students" />
          <AnimatedCounter value={98} label="Retention Rate" />
          <AnimatedCounter value={24} label="Countries" />
        </motion.div>

        {/* Bento Grid: Mission, Vision, History */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Mission Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="lg:col-span-2 bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mb-6 text-sky-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h4>
                <p className="text-slate-600 leading-relaxed">
                  To democratize access to elite-level educational analytics, empowering every teacher 
                  with the foresight of AI and every student with a personalized path to mastery.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
            className="bg-slate-900 rounded-[2rem] p-10 relative overflow-hidden text-white"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30" />
            <div className="relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
               </div>
               <h4 className="text-2xl font-bold mb-4">Our Vision</h4>
               <p className="text-slate-300 text-sm leading-relaxed">
                 A world where the "average student" concept ceases to exist, replaced by hyper-individualized learning ecosystems.
               </p>
            </div>
          </motion.div>

          {/* Interactive History Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-3 bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50"
          >
            <h4 className="text-xl font-bold text-slate-900 mb-8">The Journey</h4>
            <div className="relative">
              {/* Connecting Line - Draws on Scroll */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 hidden md:block">
                 <motion.div style={{ width: lineHeight }} className="h-full bg-sky-200 origin-left" />
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {HISTORY.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (idx * 0.2), type: "spring" }}
                    className="relative pt-6 md:pt-10 group"
                  >
                    <motion.div 
                       initial={{ scale: 0 }}
                       whileInView={{ scale: 1 }}
                       transition={{ delay: 0.5 + (idx * 0.2), type: "spring" }}
                       className="absolute top-5 left-0 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-sky-500 z-10 group-hover:scale-125 transition-transform" 
                    />
                    
                    {/* Fixed Year Text - Solid Visible Sky Blue */}
                    <div className="text-4xl font-black text-sky-300 absolute top-0 right-0 md:left-1/2 md:-translate-x-1/2 md:-top-6 -z-0 pointer-events-none select-none transition-colors group-hover:text-sky-400">
                      {item.year}
                    </div>

                    <h5 className="text-lg font-bold text-slate-900 mt-2">{item.title}</h5>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

const ContactSection = () => {
  // Contact form state (scoped to ContactSection)
  const [category, setCategory] = useState<string>("I can't log in to my account");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [sendingContact, setSendingContact] = useState<boolean>(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingContact) return;
    setSendingContact(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, email: contactEmail, category, message: contactMessage })
      });

      if (res.ok) {
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setCategory("I can't log in to my account");
        alert("Message sent — we'll get back to you shortly.");
      } else {
        const text = await res.text();
        alert('Failed to send message: ' + text);
      }
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSendingContact(false);
    }
  };

  return (
    <section id="contact" className="relative py-32 bg-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute bottom-0 left-0 w-full h-[600px] bg-gradient-to-t from-sky-50 to-transparent opacity-50" />
         <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" 
         />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

           <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={staggerContainer}
             className="flex flex-col gap-10"
           >
              <motion.div variants={fadeInUp}>
                <h2 className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-4">Support & Locations</h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                  We're here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">help you grow.</span>
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Whether you have a technical issue or just want to inquire about our programs, our team is ready to assist.
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-4">
                 <motion.a 
                   href="https://wa.me/+94740304576"
                   target="_blank"
                   rel="noopener noreferrer"
                   variants={scaleIn}
                   whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(14, 165, 233, 0.3)" }}
                   whileTap={{ scale: 0.98 }}
                   className="flex flex-col p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all group cursor-pointer"
                   aria-label="WhatsApp Support (opens in new tab)"
                 >
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 text-sky-500 group-hover:scale-110 transition-transform shadow-sm">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    </div>
                    <div className="font-bold text-slate-900">WhatsApp Support</div>
                    <div className="text-sm text-slate-500 mt-1">Chat with an agent 24/7</div>
                 </motion.a>

                 <motion.a 
                   href="#"
                   variants={scaleIn}
                   whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.3)" }}
                   whileTap={{ scale: 0.98 }}
                   className="flex flex-col p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                 >
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 text-indigo-500 group-hover:scale-110 transition-transform shadow-sm">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </div>
                    <div className="font-bold text-slate-900">Hotline & Sales</div>
                    <div className="text-sm text-slate-500 mt-1">011-234-5678</div>
                 </motion.a>
              </div>

              <motion.div 
                variants={scaleIn}
                className="w-full h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative group"
              >
                 <iframe 
                   src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.575840369592!2d80.03899797453987!3d6.821329093176258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2523b05555555%3A0x546c34cd99f6f488!2sNSBM%20Green%20University!5e0!3m2!1sen!2slk!4v1707765123456!5m2!1sen!2slk" 
                   width="100%" 
                   height="100%" 
                   style={{ border: 0, filter: "grayscale(20%) contrast(1.2) brightness(1.1)" }} 
                   allowFullScreen 
                   loading="lazy" 
                   referrerPolicy="no-referrer-when-downgrade"
                   className="group-hover:grayscale-0 transition-all duration-700"
                 />
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm pointer-events-none">
                    📍 NSBM Green University
                 </div>
              </motion.div>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
             className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-sky-100/50 relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-bl-[2.5rem] -mr-8 -mt-8 z-0" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 rounded-tr-[2.5rem] -ml-8 -mb-8 z-0" />

              <div className="relative z-10">
                 <h4 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h4>
                 
                  <form className="space-y-5" onSubmit={handleContactSubmit}>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">I need help with...</label>
                      <div className="relative">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer hover:border-sky-300">
                          <option>I can't log in to my account</option>
                          <option>Payment or subscription issue</option>
                          <option>Course content inquiry</option>
                          <option>Technical bug report</option>
                          <option>Other inquiry</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                        <input value={contactName} onChange={(e) => setContactName(e.target.value)} type="text" placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-300 hover:border-sky-300" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                        <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="john@example.com" className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-300 hover:border-sky-300" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message Details</label>
                      <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={4} placeholder="Describe your issue or question..." className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-300 resize-none hover:border-sky-300"></textarea>
                    </div>

                    <motion.button 
                     type="submit"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     disabled={sendingContact}
                     className="w-full bg-sky-500 text-white font-bold rounded-xl py-4 shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                    >
                      <span>{sendingContact ? "Sending..." : "Submit Ticket"}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    </motion.button>
                  </form>
              </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <motion.div 
           animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
           transition={{ duration: 8, repeat: Infinity }}
           className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-sky-500/20 rounded-full blur-[150px]"
         />
         <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          <div className="space-y-6">
             <div className="flex items-center gap-3">
               <div className="relative w-8 h-8">
                 <Image src="/logo.png" alt="Evalora Logo" fill className="object-contain" />
               </div>
               <span className="font-bold text-white text-xl tracking-tight">Evalora</span>
             </div>
             <p className="text-sm leading-relaxed text-slate-500">
               Empowering students and educators with next-gen analytics and seamless learning management. The future of education is here.
             </p>
             <div className="flex gap-4">
                <motion.a 
                  href="#" 
                  whileHover={{ y: -3, color: "#38bdf8" }}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors hover:border-sky-500/30 text-slate-400 hover:text-sky-400"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </motion.a>

                <motion.a 
                  href="#" 
                  whileHover={{ y: -3, color: "#38bdf8" }}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors hover:border-sky-500/30 text-slate-400 hover:text-sky-400"
                >
                  <span className="sr-only">GitHub</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
                </motion.a>

                <motion.a 
                  href="#" 
                  whileHover={{ y: -3, color: "#38bdf8" }}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center transition-colors hover:border-sky-500/30 text-slate-400 hover:text-sky-400"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </motion.a>
             </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm font-medium">
              {NAV_LINKS.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-sky-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-sky-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-sky-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Stay Updated</h4>
            <p className="text-xs text-slate-500 mb-4">
              Get the latest updates on features and releases.
            </p>
            <form className="flex flex-col gap-3">
               <div className="relative">
                 <input 
                   type="email" 
                   placeholder="Enter your email" 
                   className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-sky-500/50 transition-colors placeholder:text-slate-600"
                 />
               </div>
               <motion.button 
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 className="bg-sky-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-sky-500 transition-colors shadow-lg shadow-sky-900/20"
               >
                 Subscribe
               </motion.button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
           <p>© 2026 Evalora Inc. All rights reserved.</p>
           <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Cookies</a>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingView({ authSection, contentSection, deployButton }: LandingViewProps) {
  const [loading, setLoading] = useState(true);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  
  const { scrollY, scrollYProgress } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 100]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const resetTimer = () => {
      setNavVisible(true);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (window.innerWidth > 768) {
        idleTimerRef.current = setTimeout(() => {
          setNavVisible((prev) => mobileMenuOpen ? true : false); 
        }, 10000); 
      }
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeatureIndex((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Hide navbar while a PDF modal is open
  useEffect(() => {
    if (pdfUrl) setNavVisible(false);
    else setNavVisible(true);
  }, [pdfUrl]);

  // Handler invoked by SyllabusSection when a subject is clicked
  async function onSubjectClick(grade: number | null, subject: string) {
    if (!grade) return setSnackbar('Select a grade first');

    const name = subject.toLowerCase();
    if (name === 'history') {
      setLoadingPdf(true);
      setSnackbar(null);
      try {
        const res = await fetch(`/api/syllabus?grade=${grade}&subject=history`);
        if (res.ok) {
          const data = await res.json();
          if (data?.url) {
            setPdfUrl(data.url);
            setSnackbar(null);
            return;
          }
        }
        setSnackbar('Syllabus PDF not available');
      } catch (e) {
        setSnackbar('Failed to fetch PDF');
      } finally {
        setLoadingPdf(false);
        setTimeout(() => setSnackbar(null), 3000);
      }
    } else {
      setSnackbar('Coming soon');
      setTimeout(() => setSnackbar(null), 2000);
    }
  }

  return (
    <div 
      className="relative min-h-screen bg-[#F4F7FB] text-slate-900 overflow-x-hidden selection:bg-sky-200 selection:text-sky-900 font-sans"
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence>
        {loading && (
          <motion.div 
            className="fixed inset-0 z-[9999] bg-white flex items-center justify-center flex-col overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <motion.div 
               animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute w-[800px] h-[800px] bg-sky-50 rounded-full blur-[100px] opacity-50"
            />

            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-32 h-32 mb-10"
              >
                 <motion.div 
                   animate={{ boxShadow: ["0 0 20px rgba(14,165,233,0.2)", "0 0 60px rgba(14,165,233,0.6)", "0 0 20px rgba(14,165,233,0.2)"] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 rounded-full bg-white"
                 />
                 <Image src="/logo.png" alt="Evalora" fill className="object-contain relative z-10" priority />
              </motion.div>

              <div className="h-8 overflow-hidden flex flex-col items-center justify-start text-sm font-bold text-sky-950/40 uppercase tracking-[0.3em]">
                 <motion.span 
                   initial={{ y: 20, opacity: 0 }} 
                   animate={{ y: 0, opacity: 1 }} 
                   transition={{ delay: 0.5 }}
                 >
                   System Initializing
                 </motion.span>
              </div>

              <div className="w-48 h-[2px] bg-slate-100 mt-6 rounded-full overflow-hidden relative">
                 <motion.div 
                   initial={{ x: "-100%" }}
                   animate={{ x: "0%" }}
                   transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                   className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent w-full"
                 />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50">

        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-sky-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-200/30 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] bg-blue-100/40 rounded-full blur-[90px]" />

        <PerspectiveGrid />

        <motion.div style={{ y: parallaxY }} className="absolute inset-0 overflow-hidden">
          {EQUATIONS.map((eq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 0.1, 
                y: [0, -20, 0],
                x: [0, 10, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                delay: eq.delay,
                opacity: { duration: 2, delay: 2.5 }
              }}
              className="absolute font-serif text-slate-400 text-sm md:text-base italic pointer-events-none select-none"
              style={{ top: eq.top, left: eq.left }}
            >
              ${eq.label}$
            </motion.div>
          ))}
        </motion.div>

        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
      </div>

      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: navVisible ? 0 : -100 }} 
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 inset-x-0 z-50 flex justify-center pt-6 px-4 pointer-events-auto"
      >
        <div className="w-full max-w-[95%] lg:max-w-7xl bg-white/60 backdrop-blur-2xl border border-white/50 shadow-sm rounded-full px-4 py-2 relative flex justify-between items-center transition-all hover:bg-white/80 hover:shadow-md">

            <Link href="/" className="flex items-center gap-3 px-3 group min-w-fit">
               <motion.div whileHover={{ rotate: 15 }} className="relative w-8 h-8">
                 <Image src="/logo.png" alt="Logo" fill className="object-contain" />
               </motion.div>
               <span className="font-bold text-sky-950 tracking-tight text-lg hidden sm:block">Evalora</span>
            </Link>

            <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 bg-white/40 rounded-full px-1.5 py-1.5 border border-white/50 shadow-inner">
              {NAV_LINKS.map(link => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onMouseEnter={() => setHoveredNav(link.name)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="relative px-6 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-sky-700 z-10"
                >
                  {link.name}
                  {hoveredNav === link.name && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-100/50 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 pl-2">
              
              <div className="hidden md:block">
                <div className="flex items-center gap-3 bg-white/50 border border-white rounded-full px-1.5 py-1.5 pl-5 shadow-sm">
                  <div className="flex items-center gap-3 max-w-[420px]">
                    {authSection}
                  </div>
                </div>
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
              </button>
            </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-24 inset-x-4 md:hidden z-40"
            >
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl p-6 flex flex-col gap-2">
                {NAV_LINKS.map(link => (
                  <Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-700 py-3 px-4 hover:bg-slate-50 rounded-xl transition-colors">
                    {link.name}
                  </Link>
                ))}

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3">Account Access</div>
                  <div className="
                    flex flex-col gap-3 bg-slate-50/80 border border-slate-100 rounded-2xl p-4
                    [&_.flex]:flex-col [&_.flex]:gap-3 [&_.flex]:items-center
                    [&_form]:w-full [&_form]:flex [&_form]:justify-center
                    
                    /* Align Email */
                    [&_div]:!text-[13px] [&_div]:!font-bold [&_div]:!text-slate-600 [&_div]:!text-center
                    
                    /* Mobile Dashboard Button */
                    [&_a]:!w-full [&_a]:!bg-sky-500 [&_a]:!text-white [&_a]:!py-3 [&_a]:!rounded-xl 
                    [&_a]:!text-sm [&_a]:!font-bold [&_a]:!shadow-md [&_a]:!text-center [&_a]:!block
                    
                    /* Mobile Logout Button */
                    [&_form_button]:!w-full [&_form_button]:!bg-white [&_form_button]:!text-slate-500 
                    [&_form_button]:!py-3 [&_form_button]:!rounded-xl [&_form_button]:!text-sm 
                    [&_form_button]:!font-bold [&_form_button]:!border [&_form_button]:!border-slate-200
                  ">
                    {authSection}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main 
        id="home"
        className="relative pt-36 pb-12 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            initial="hidden" animate={!loading ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }}}
            className="text-center lg:text-left space-y-8 z-10"
          >
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}}
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]"
            >
              <span className="block text-slate-900">Master</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 animate-gradient-x">
                Your Future.
              </span>
            </motion.h1>

            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}} className="text-lg md:text-xl text-slate-500 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Experience the new standard in educational technology. 
              Evalora provides a seamless, intelligent workspace where students thrive and teachers inspire.
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 items-center">
              <motion.button 
                 whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                 className="h-14 px-8 rounded-full bg-sky-600 text-white font-bold text-base shadow-lg shadow-sky-600/30 flex items-center gap-2 hover:bg-sky-500 transition-colors"
                 onClick={async () => {
                   const supabase = createClient();
                   try {
                     const { data } = await supabase.auth.getSession();
                     const session = data?.session;
                     if (session) {
                       window.location.href = "/protected/student";
                     } else {
                       window.location.href = "/auth/login";
                     }
                   } catch (e) {
                     window.location.href = "/auth/login";
                   }
                 }}
              >
                 Get Started
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </motion.button>
              
              <SpotlightButton>
                Explore Features
              </SpotlightButton>
            </motion.div>

            <motion.div 
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="pt-8 flex items-center justify-center lg:justify-start gap-4"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white overflow-hidden bg-slate-100 relative z-[4-i]">
                    <Image 
                      src={`https://i.pravatar.cc/150?img=${i + 25}`} 
                      alt="Avatar" 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-500 font-medium text-left leading-tight">
                <strong className="block text-slate-900 text-base">Trusted by 10,000+</strong>
                educators worldwide
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={!loading ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="relative flex justify-center perspective-1000"
          >
             <motion.div 
               animate={{ rotateX: mousePos.y * -5, rotateY: mousePos.x * -5 }}
               transition={{ type: "spring", damping: 20, stiffness: 100 }}
               className="relative w-full max-w-[480px]"
             >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, y: [-10, 10, -10] }}
                  transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 0.6 } }}
                  className="absolute -left-20 top-10 z-40 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 hidden lg:block min-w-[180px]"
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Students</div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">1,240</span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold flex items-center gap-1.5 border border-blue-100">
                       Live
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, y: [10, -10, 10] }}
                  transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }, opacity: { delay: 0.8 } }}
                  className="absolute -right-20 bottom-12 z-40 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 hidden lg:block min-w-[180px]"
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Class Average</div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">92%</span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">+14%</span>
                  </div>
                </motion.div>

                <div className="absolute inset-8 bg-sky-500 rounded-[40px] blur-[60px] opacity-20 animate-pulse" />

                <div className="relative bg-white/20 backdrop-blur-2xl rounded-[36px] border border-white/60 shadow-2xl p-3">
                   <div className="bg-white/90 rounded-[28px] overflow-hidden min-h-[420px] flex flex-col relative shadow-inner">

                      <div className="h-12 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between px-6">
                         <div className="flex gap-2 opacity-80">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                         </div>
                         <div className="px-2 py-1 bg-green-100 rounded text-[10px] font-bold text-green-700 tracking-wider">ONLINE</div>
                      </div>

                      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />

                         <AnimatePresence mode="wait">
                           <motion.div
                             key={featureIndex}
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                             transition={{ duration: 0.4 }}
                             className="relative z-10 w-full"
                           >
                              <div className="mb-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white mb-4 ${FEATURES[featureIndex].color}`}>
                                  {FEATURES[featureIndex].title}
                                </span>
                              </div>

                              {featureIndex === 0 && <BarChartVisual />}
                              {featureIndex === 1 && <LineChartVisual />}
                              {featureIndex === 2 && <SecurityVisual />}
                              
                           </motion.div>
                         </AnimatePresence>

                         <div className="absolute bottom-8 flex gap-3">
                            {FEATURES.map((_, i) => (
                              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === featureIndex ? "bg-sky-500 w-8" : "bg-slate-200 w-1.5"}`} />
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="absolute inset-0 rounded-[36px] bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                </div>
             </motion.div>
          </motion.div>

        </div>
      </main>

      <SyllabusSection onSubjectClick={onSubjectClick} />

      {/* PDF Modal */}
      {pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[90%] h-[90%] rounded-lg overflow-hidden shadow-xl relative">
            <button onClick={() => setPdfUrl(null)} className="absolute right-4 top-4 z-40 bg-white rounded-full p-2 shadow">
              <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <iframe src={pdfUrl} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-md shadow">{snackbar}</div>
        </div>
      )}

      <AboutSection />

      <ContactSection />

      <Footer />
      
    </div>
  );
}