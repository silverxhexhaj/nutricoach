"use client";

import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";

export function Pricing() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="pricing"
      className="py-20 px-6 bg-mid border-t border-[var(--green-08)]"
    >
      <div className="max-w-[1100px] mx-auto">
        <SectionLabel>Pricing</SectionLabel>
        <SectionTitle>Start free. Scale when ready.</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {/* Free */}
          <div className="bg-card border border-[var(--green-10)] rounded-3xl p-9">
            <div className="font-heading font-bold text-[1.1rem]">Free</div>
            <div className="font-heading text-[3.2rem] font-extrabold leading-none text-green mt-4 mb-1">
              €0
              <span className="text-base text-text-dim font-normal"> / month</span>
            </div>
            <div className="text-text-dim text-[0.87rem] mb-7">
              1 free plan, no card needed. Try the full AI nutrition experience.
            </div>
            <ul className="list-none flex flex-col gap-2.5 mb-8">
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                1 AI meal plan generation
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                7-day plan, supplement schedule, shopping list
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem] text-muted">
                <span className="text-muted flex-shrink-0">–</span>
                Daily check-in tracker
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem] text-muted">
                <span className="text-muted flex-shrink-0">–</span>
                Unlimited regeneration
              </li>
            </ul>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => scrollTo("build")}
            >
              Get Started Free
            </Button>
          </div>

          {/* Individual Pro */}
          <div className="bg-card border border-[var(--green-10)] rounded-3xl p-9">
            <div className="font-heading font-bold text-[1.1rem]">
              Individual Pro
            </div>
            <div className="font-heading text-[3.2rem] font-extrabold leading-none text-green mt-4 mb-1">
              €12
              <span className="text-base text-text-dim font-normal"> / month</span>
            </div>
            <div className="text-text-dim text-[0.87rem] mb-7">
              Self-serve. No coach. Full nutrition OS for anyone serious about
              results.
            </div>
            <ul className="list-none flex flex-col gap-2.5 mb-8">
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Unlimited plan generation
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Daily check-in & progress charts
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Supplement schedule, PDF export
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Meal prep & workout guides
              </li>
            </ul>
            <Link
              href="/signup"
              className="block w-full text-center rounded-full font-heading font-bold py-4 text-base bg-green text-dark hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(184,240,74,0.4)] no-underline"
            >
              Start 7-Day Free Trial
            </Link>
          </div>

          {/* Coach Starter */}
          <div className="bg-card border-2 border-green rounded-3xl p-9 relative bg-gradient-to-br from-[rgba(184,240,74,0.06)] to-card">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green text-dark font-heading font-bold text-[0.72rem] px-4 py-1.5 rounded-full whitespace-nowrap">
              Most Popular
            </div>
            <div className="font-heading font-bold text-[1.1rem]">
              Coach Starter
            </div>
            <div className="font-heading text-[3.2rem] font-extrabold leading-none text-green mt-4 mb-1">
              €39
              <span className="text-base text-text-dim font-normal"> / month</span>
            </div>
            <div className="text-text-dim text-[0.87rem] mb-7">
              Up to 15 clients. Client management, AI plans, branded exports.
            </div>
            <ul className="list-none flex flex-col gap-2.5 mb-8">
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Client roster & invite system
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                AI plan generation per client
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Client check-in visibility
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Branded PDF exports
              </li>
            </ul>
            <Link
              href="/signup?coach=1"
              className="block w-full text-center rounded-full font-heading font-bold py-4 text-base bg-green text-dark hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(184,240,74,0.4)] no-underline"
            >
              Start as Coach
            </Link>
          </div>

          {/* Coach Pro */}
          <div className="bg-card border border-[var(--green-10)] rounded-3xl p-9">
            <div className="font-heading font-bold text-[1.1rem]">Coach Pro</div>
            <div className="font-heading text-[3.2rem] font-extrabold leading-none text-green mt-4 mb-1">
              €69
              <span className="text-base text-text-dim font-normal"> / month</span>
            </div>
            <div className="text-text-dim text-[0.87rem] mb-7">
              Up to 40 clients. Advanced analytics for growing coaches.
            </div>
            <ul className="list-none flex flex-col gap-2.5 mb-8">
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Everything in Coach Starter
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Advanced analytics
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Up to 40 clients
              </li>
            </ul>
            <Link
              href="/signup?coach=1"
              className="block w-full text-center rounded-full font-heading font-bold py-4 text-[0.95rem] bg-transparent text-text border border-white/15 hover:border-green/30 no-underline"
            >
              Start as Coach
            </Link>
          </div>

          {/* Coach Agency */}
          <div className="bg-card border border-[var(--green-10)] rounded-3xl p-9">
            <div className="font-heading font-bold text-[1.1rem]">
              Coach Agency
            </div>
            <div className="font-heading text-[3.2rem] font-extrabold leading-none text-green mt-4 mb-1">
              €119
              <span className="text-base text-text-dim font-normal"> / month</span>
            </div>
            <div className="text-text-dim text-[0.87rem] mb-7">
              Unlimited clients. White-label branding for gyms & agencies.
            </div>
            <ul className="list-none flex flex-col gap-2.5 mb-8">
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Everything in Coach Pro
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                Unlimited clients
              </li>
              <li className="flex items-center gap-2.5 text-[0.88rem]">
                <span className="text-green font-bold flex-shrink-0">✓</span>
                White-label branding & custom subdomain
              </li>
            </ul>
            <Link
              href="/signup?coach=1"
              className="block w-full text-center rounded-full font-heading font-bold py-4 text-[0.95rem] bg-transparent text-text border border-white/15 hover:border-green/30 no-underline"
            >
              Start as Coach
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
