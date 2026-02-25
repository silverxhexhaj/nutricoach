"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-[120px] pb-20 px-6 relative text-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184,240,74,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(184,240,74,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <Badge className="mb-7 relative z-10 animate-[fadeUp_0.6s_ease_both]">
        For Coaches & Their Clients · AI-Powered · Supplement-Agnostic
      </Badge>
      <h1 className="font-heading text-[clamp(3rem,8vw,6.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] relative z-10 animate-[fadeUp_0.6s_0.1s_ease_both]">
        Your Personal
        <br />
        <span className="text-green">AI Nutrition</span>
        <span className="block text-text-dim font-semibold">Coach, 24/7.</span>
      </h1>
      <p className="font-heading text-lg text-text-dim mt-4 relative z-10 animate-[fadeUp_0.6s_0.15s_ease_both]">
        Give every coach a superpower: create a fully personalised nutrition plan
        for any client in 60 seconds.
      </p>
      <p className="max-w-[540px] mt-4 mx-auto text-[1.05rem] leading-[1.65] text-text-dim relative z-10 animate-[fadeUp_0.6s_0.2s_ease_both]">
        Coaches: generate plans in 60 seconds. Clients: follow your plan, track
        progress, stay accountable. Works with Herbalife, whey protein, or any
        brand.
      </p>
      <div className="flex flex-wrap gap-4 mt-11 items-center justify-center relative z-10 animate-[fadeUp_0.6s_0.3s_ease_both]">
        <Button onClick={() => scrollTo("build")}>Build My Plan Free</Button>
        <Link
          href="/signup?coach=1"
          className="rounded-full font-heading font-bold cursor-pointer transition-all duration-150 bg-transparent text-text border border-white/15 px-7 py-4 text-[0.95rem] hover:border-green/30 no-underline"
        >
          I&apos;m a Coach
        </Link>
        <Button variant="ghost" onClick={() => scrollTo("features")}>
          See how it works ↓
        </Button>
      </div>
      <div className="flex flex-wrap gap-8 md:gap-12 mt-20 relative z-10 animate-[fadeUp_0.6s_0.4s_ease_both] justify-center">
        <div className="text-center">
          <div className="font-heading text-[2.2rem] font-extrabold text-green leading-none">
            7-day
          </div>
          <div className="text-[0.8rem] text-text-dim mt-1">Full meal plan</div>
        </div>
        <div className="text-center">
          <div className="font-heading text-[2.2rem] font-extrabold text-green leading-none">
            ~60s
          </div>
          <div className="text-[0.8rem] text-text-dim mt-1">Generation time</div>
        </div>
        <div className="text-center">
          <div className="font-heading text-[2.2rem] font-extrabold text-green leading-none">
            2–4 hrs
          </div>
          <div className="text-[0.8rem] text-text-dim mt-1">Saved per client/week</div>
        </div>
        <div className="text-center">
          <div className="font-heading text-[2.2rem] font-extrabold text-green leading-none">
            100%
          </div>
          <div className="text-[0.8rem] text-text-dim mt-1">
            Personalised to you
          </div>
        </div>
      </div>
    </section>
  );
}
