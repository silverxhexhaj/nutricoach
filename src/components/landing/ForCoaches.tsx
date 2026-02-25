"use client";

import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionTitle } from "@/components/ui/SectionTitle";

const coachBenefits = [
  "Client roster with status, goals, and progress at a glance",
  "AI plan generation in 60 seconds — no more Word docs or spreadsheets",
  "Client progress visibility: weight trends, check-in streaks, calories logged",
  "Branded PDF export with your name, logo, and contact",
  "Supplement scheduling matched to training days",
  "Invite system: add clients by email, they get a link to join",
];

export function ForCoaches() {
  return (
    <section
      id="for-coaches"
      className="py-20 px-6 bg-mid border-t border-[var(--green-08)]"
    >
      <div className="max-w-[900px] mx-auto">
        <SectionLabel>For Coaches</SectionLabel>
        <SectionTitle>
          Stop spending 2–4 hours per client per week on meal plans.
        </SectionTitle>
        <p className="text-text-dim text-[1.05rem] leading-[1.65] mb-12 max-w-[640px]">
          Personal trainers, nutrition coaches, Herbalife distributors — manage
          more clients without the admin overload. One dashboard. One click per
          plan.
        </p>
        <ul className="list-none flex flex-col gap-3 mb-12">
          {coachBenefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-3 text-[0.95rem] text-text-dim"
            >
              <span className="text-green font-bold flex-shrink-0 mt-0.5">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>
        <Link
          href="/signup?coach=1"
          className="inline-block rounded-full font-heading font-bold cursor-pointer transition-all duration-150 bg-green text-dark px-8 py-4 text-base hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(184,240,74,0.4)] no-underline"
        >
          Start as Coach
        </Link>
      </div>
    </section>
  );
}
