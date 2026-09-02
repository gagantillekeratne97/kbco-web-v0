"use client";

import { useState, type FormEvent } from "react";
import { Space_Grotesk, Inter } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

// Build-grid visual: a 6x6 field of cells that fill in on a staggered loop,
// standing in for work-in-progress rather than a literal percentage.
const GRID_SIZE = 6;
const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

function BuildGrid() {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {cells.map((i) => {
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;
        const delay = (row + col) * 0.12;
        return (
          <div
            key={i}
            className="build-cell h-9 w-9 rounded-[3px] border border-[#3A4A55]"
            style={{ animationDelay: `${delay}s` }}
          />
        );
      })}
    </div>
  );
}

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    // Wire this up to your email provider / API route.
    setStatus("submitted");
  }

  return (
    <main
      className={`${display.variable} ${body.variable} min-h-screen w-full bg-[#10151B] text-[#EDEAE2]`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <style>{`
        @keyframes fillCell {
          0%, 40% { background-color: transparent; border-color: #3A4A55; }
          55%, 85% { background-color: #E3A62F; border-color: #E3A62F; }
          100% { background-color: transparent; border-color: #3A4A55; }
        }
        .build-cell {
          animation: fillCell 5.5s ease-in-out infinite;
        }
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(340%); }
        }
        .progress-sweep {
          animation: sweep 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .build-cell, .progress-sweep { animation: none; }
        }
      `}</style>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row md:items-center">
        {/* Left: content */}
        <section className="flex w-full flex-col justify-center px-6 py-20 sm:px-10 md:w-[56%] md:px-16">
          <div className="mb-10 flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#E3A62F]" />
            <span className="text-sm text-[#9AA7B0]">
              In active development
            </span>
          </div>

          <h1
            className="text-4xl leading-[1.08] sm:text-5xl md:text-[3.4rem]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            We&apos;re building
            <br />
            something new here.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-[#B8C0C6] sm:text-lg">
            This page isn&apos;t live yet — we&apos;re still putting the
            pieces together. Leave your email and we&apos;ll write to you the
            day it opens.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="notify-email" className="sr-only">
              Email address
            </label>
            <input
              id="notify-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full flex-1 rounded-md border border-[#2B3640] bg-[#151C24] px-4 py-3 text-sm text-[#EDEAE2] placeholder:text-[#6C7982] outline-none focus:border-[#E3A62F] focus-visible:ring-2 focus-visible:ring-[#E3A62F]"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-[#E3A62F] px-6 py-3 text-sm font-medium text-[#10151B] transition-colors hover:bg-[#F0B846] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E3A62F]"
            >
              Notify me
            </button>
          </form>

          {status === "submitted" && (
            <p className="mt-3 text-sm text-[#8FBF8F]" role="status">
              You&apos;re on the list — we&apos;ll email you when it&apos;s ready.
            </p>
          )}

          <div className="mt-14 max-w-md">
            <div className="mb-2 flex items-baseline justify-between text-sm text-[#9AA7B0]">
              <span>Build progress</span>
              <span>62%</span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#232D36]">
              <div
                className="h-full rounded-full bg-[#E3A62F]"
                style={{ width: "62%" }}
              />
              <div className="progress-sweep absolute inset-y-0 left-0 w-1/4 bg-white/10" />
            </div>
          </div>
        </section>

        {/* Right: build-grid visual */}
        <section className="hidden w-full items-center justify-center border-t border-[#1E2830] py-16 md:flex md:w-[44%] md:border-l md:border-t-0 md:py-0">
          <BuildGrid />
        </section>
      </div>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-6 pb-10 text-xs text-[#6C7982] sm:px-10 sm:flex-row sm:items-center sm:justify-between md:px-16">
        <span>&copy; {new Date().getFullYear()} Your Company</span>
        <span>Questions? hello@yourcompany.com</span>
      </footer>
    </main>
  );
}