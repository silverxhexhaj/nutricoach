"use client";

import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function ForClients() {
  return (
    <section className="py-16 px-6 border-t border-[var(--green-08)]">
      <div className="max-w-[900px] mx-auto">
        <SectionLabel>For Clients</SectionLabel>
        <SectionTitle>Your coach gives you access. You get everything free.</SectionTitle>
        <p className="text-text-dim text-[1.05rem] leading-[1.65] mb-8 max-w-[640px]">
          My Plan view, daily check-in, progress dashboard, supplement schedule —
          all included. No subscription. Just follow your plan and stay
          accountable.
        </p>
        <Link
          href="/invite/accept"
          className="inline-block text-green font-heading font-bold text-[0.95rem] hover:underline"
        >
          Got an invite? Accept here →
        </Link>
      </div>
    </section>
  );
}
