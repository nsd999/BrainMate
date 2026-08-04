'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-purple-200/50 dark:border-purple-900/40 bg-background/95 backdrop-blur-md px-4 py-3.5 sm:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-500/5 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to BrainMate Tutor
          </Link>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-md">
              <img src="/logo.png" alt="BrainMate Logo" className="h-full w-full object-cover rounded-[10px]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">BrainMate</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 flex-1 space-y-10 animate-in fade-in duration-300">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 px-4 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-xs">
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>Discover the Story Behind BrainMate</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Empowering Everyone to <br className="hidden sm:inline" />
            <span className="text-gradient-brand">Understand Faster & Learn Smarter</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            BrainMate was built to solve a fundamental problem: standard AI chatbots often dump dense, textbook-style answers. BrainMate acts like a smart senior sitting right next to you—explaining concepts simply, using real-life analogies, interactive pop quizzes, and step-by-step action roadmaps.
          </p>
        </section>

        {/* Why BrainMate Section */}
        <section id="why-brainmate" className="rounded-3xl border border-purple-200/60 dark:border-purple-900/50 bg-card p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold shadow-xs">
              <Brain className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Why BrainMate is Unique</h2>
              <p className="text-xs text-muted-foreground">Designed for clarity, engagement, and actionable retention.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-700 dark:text-purple-300">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                <span>Everyday Words</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No jargon or dry definitions. Concepts are broken down into simple, digestible language anyone can grasp immediately.
              </p>
            </div>

            <div className="rounded-2xl border border-pink-100 dark:border-pink-900/40 bg-pink-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-pink-700 dark:text-pink-300">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span>Real-Life Analogies</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Relates abstract concepts to familiar everyday experiences—making difficult ideas instantly memorable.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span>Action Roadmaps</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gives concrete 15-min to 1-week action steps so you don't just learn in theory, but apply what you learn immediately.
              </p>
            </div>
          </div>

          {/* Audience Modes */}
          <div className="pt-4 border-t border-border/50">
            <h3 className="text-sm font-bold text-foreground mb-3">Tailored Audience Modes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-500/5 p-3.5">
                <Baby className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-amber-700 dark:text-amber-300">Kid Mode</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Playful, story-driven explanation tailored for an 8-year-old.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-500/5 p-3.5">
                <GraduationCap className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-purple-700 dark:text-purple-300">Student Mode</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Balanced educational depth with key takeaways & exam clarity.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-500/5 p-3.5">
                <Briefcase className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300">Pro Mode</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Concise, engineering-grade precision and industry applications.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NSD Creations & Founder Info Section */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-lg tracking-wider shadow-md">
                NSD
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">NSD CREATIONS</h2>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                  Creative Tech Partner
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/nsd.creations.official"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-500/10 px-3.5 py-2 text-xs font-bold text-pink-600 dark:text-pink-300 hover:scale-105 transition-all"
              >
                <Instagram className="h-4 w-4 text-pink-500" />
                <span>Instagram</span>
              </a>

              <a
                href="https://tinyurl.com/nsd-creations"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition-all"
              >
                <Globe className="h-4 w-4 text-white" />
                <span>Official Website</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            NSD Creations bridges AI innovations, custom web platforms, high-conversion visual storytelling, and operational automation to propel startups, educational brands, and local businesses ahead of the curve.
          </p>

          {/* Founder Profile Card */}
          <div className="rounded-2xl border border-purple-200/50 dark:border-purple-900/40 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">FOUNDER & CREATIVE DIRECTOR</span>
              <h3 className="text-base font-extrabold text-foreground">Sai Dheeraj Nalkari</h3>
              <p className="text-xs text-muted-foreground">Hyderabad, Telangana, India</p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-bold shadow-sm hover:opacity-90 transition-all"
            >
              Start Learning with BrainMate
            </Link>
          </div>
        </section>
      </main>

      {/* Footer Strip */}
      <footer className="border-t border-border/60 bg-card py-4 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} NSD Creations. All rights reserved.</p>
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>by <strong className="font-bold">Sai Dheeraj</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
