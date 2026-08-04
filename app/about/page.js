'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Instagram,
  Globe,
  Heart,
  Brain,
  CheckCircle2,
  GraduationCap,
  Baby,
  Briefcase,
  ArrowUpRight,
  Zap
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tutor
          </Link>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl overflow-hidden border border-border">
              <img src="/logo.png" alt="BrainMate Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">BrainMate</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 flex-1 space-y-10 animate-in fade-in duration-200">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3.5 py-1 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>Built by Sai Dheeraj Nalkari</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Understand any concept in 2 minutes.
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            Standard AI chatbots dump dense, textbook-style answers. BrainMate is designed like a smart friend sitting right next to you—explaining ideas simply, using everyday analogies, quick pop quizzes, and practical 3-step action plans.
          </p>
        </section>

        {/* Why BrainMate Section */}
        <section id="why-brainmate" className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
              <Brain className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">Why BrainMate works better</h2>
              <p className="text-xs text-muted-foreground">Focused on real understanding, not AI fluff.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                <span>Plain Language</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No jargon or dry definitions. Concepts are broken down into words anyone can grasp right away.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span>Real-Life Analogies</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Relates abstract ideas to familiar experiences—making difficult concepts instantly intuitive.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-foreground">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span>Action Roadmaps</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provides 10-min, 1-hour, and 1-day steps so you don't just learn in theory, but put it to practice.
              </p>
            </div>
          </div>

          {/* Explanation Depths */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Tailored Explanation Depths</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3">
                <Baby className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-foreground">Explain like I'm 8</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Playful, simple story for beginners.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3">
                <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-foreground">Standard & Clear</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Educational depth for study & exams.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-background p-3">
                <Briefcase className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-foreground">Technical & Deep</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Concise engineering & practical detail.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NSD Creations & Founder Info Section */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
                NSD
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">NSD CREATIONS</h2>
                <p className="text-xs font-medium text-muted-foreground">
                  Creative Tech Partner
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/nsd.creations.official"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-all"
              >
                <Instagram className="h-3.5 w-3.5 text-pink-500" />
                <span>Instagram</span>
              </a>

              <a
                href="https://tinyurl.com/nsd-creations"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-all"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Website</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
            NSD Creations works with startups, educators, and creators to build custom web applications, visual storytelling platforms, and operational AI tools that help people work and learn smarter.
          </p>

          {/* Founder Profile Card */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CREATOR</span>
              <h3 className="text-sm font-bold text-foreground">Sai Dheeraj Nalkari</h3>
              <p className="text-xs text-muted-foreground">Hyderabad, Telangana, India</p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs"
            >
              Back to Learning
            </Link>
          </div>
        </section>
      </main>

      {/* Footer Strip */}
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} NSD Creations. All rights reserved.</p>
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>by <strong className="font-semibold">Sai Dheeraj</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
