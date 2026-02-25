"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FinalCta() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="py-[100px] px-6 text-center"
      style={{
        background:
          "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(184,240,74,0.08) 0%, transparent 70%)",
      }}
    >
      <h2 className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tracking-[-0.04em] leading-[1.05] mb-5">
        Stop guessing.
        <br />
        <span className="text-green">Start thriving.</span>
      </h2>
      <p className="text-text-dim max-w-[480px] mx-auto mb-10 leading-[1.65]">
        Get your personalised AI nutrition plan in under 2 minutes — completely
        free.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={() => scrollTo("build")}
          className="text-[1.1rem] px-10 py-[18px]"
        >
          Build My Plan Free →
        </Button>
        <Link
          href="/signup?coach=1"
          className="inline-block rounded-full font-heading font-bold cursor-pointer transition-all duration-150 bg-transparent text-text border border-white/15 px-7 py-4 text-[0.95rem] hover:border-green/30 no-underline"
        >
          I&apos;m a coach — start free
        </Link>
      </div>
    </section>
  );
}
