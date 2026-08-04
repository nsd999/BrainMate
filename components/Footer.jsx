'use client';

import { Instagram, Globe, Heart, ArrowUpRight, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-card text-card-foreground transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-border/50">
          {/* Main Brand Section */}
          <div className="md:col-span-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <a
                href="https://tinyurl.com/nsd-creations"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 group"
              >
                <div className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                  NSD
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-wider text-foreground group-hover:text-muted-foreground transition-colors">
                    NSD CREATIONS
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase -mt-0.5">
                    CREATIVE TECH PARTNER
                  </span>
                </div>
              </a>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Bridging AI, custom websites, high-conversion visual storytelling, and operational automations to push startups, educational brands, and local businesses ahead of the curve.
            </p>

            {/* Social Links & Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Instagram */}
              <a
                href="https://instagram.com/nsd.creations.official"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-all hover:scale-[1.02]"
                title="Follow us on Instagram"
              >
                <Instagram className="h-4 w-4 text-pink-500" />
                <span>@nsd.creations.official</span>
              </a>

              {/* NSD Creations Website */}
              <a
                href="https://tinyurl.com/nsd-creations"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-all hover:scale-[1.02]"
                title="Visit NSD Creations Website"
              >
                <Globe className="h-4 w-4 text-indigo-500" />
                <span>Visit NSD Creations</span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>

            {/* Founder Info */}
            <div className="text-xs text-muted-foreground font-mono pt-2 space-y-0.5">
              <p>Founder: <span className="text-foreground font-semibold">Sai Dheeraj Nalkari</span></p>
              <p>Hyderabad, Telangana, India</p>
            </div>
          </div>

          {/* About BrainMate Section */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h4 className="text-sm font-bold text-foreground">Why BrainMate is Unique</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlike standard AI chatbots that output dense, textbook-style answers, BrainMate explains concepts like a smart senior sitting right next to you—using simple everyday words, real-life analogies, interactive pop quizzes, and step-by-step action roadmaps.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground">Target Audience Modes:</span>
              <p className="text-[11px]">
                • <strong className="text-foreground">Kid Mode:</strong> Playful 8-year-old simplicity <br />
                • <strong className="text-foreground">Student Mode:</strong> Clear conceptual & exam breakdown <br />
                • <strong className="text-foreground">Pro Mode:</strong> Concise engineering & practical depth
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar matching screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NSD Creations. All rights reserved.</p>
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>by <strong className="font-bold">Sai Dheeraj</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
