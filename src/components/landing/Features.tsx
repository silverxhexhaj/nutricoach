import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: "🤖",
    title: "AI Meal Plan Engine",
    description:
      "Generates structured, personalised weekly meal plans based on your exact stats, goals, and preferences — not a generic template.",
    tag: "Live",
  },
  {
    icon: "💊",
    title: "Smart Supplement Matching",
    description:
      "Supplements recommended by relevance to your goal and schedule. Works with Herbalife, whey protein, or any brand — fully supplement-agnostic.",
    tag: "Live",
  },
  {
    icon: "🛒",
    title: "Auto Shopping List",
    description:
      "Every plan includes a ready-to-use shopping list organised by category, with quantities for your exact week.",
    tag: "Live",
  },
  {
    icon: "🏋️",
    title: "Training-Synced Nutrition",
    description:
      "Meals timed around your training days. Pre/post-workout fuel automatically optimised for your goal.",
    tag: "Live",
  },
  {
    icon: "📊",
    title: "Daily Check-In Tracker",
    description:
      "Log weight, water, calories and workouts. Stay accountable with streaks and progress visualisation.",
    tag: "Live",
  },
  {
    icon: "👥",
    title: "Coach Dashboard",
    description:
      "Manage clients, generate plans, track progress, branded exports — all from one dashboard. Built for personal trainers and nutrition coaches.",
    tag: "Live",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-20 px-6 max-w-[1100px] mx-auto"
    >
      <SectionLabel>Why NutriCoach AI</SectionLabel>
      <SectionTitle>Everything in one place.</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
        {features.map((feat) => (
          <Card
            key={feat.title}
            className="transition-all duration-250 hover:border-[var(--green-25)] hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-[14px] bg-[var(--green-10)] flex items-center justify-center text-[1.3rem] mb-[18px]">
              {feat.icon}
            </div>
            <h3 className="font-heading font-bold text-[1.05rem] mb-2">
              {feat.title}
            </h3>
            <p className="text-text-dim text-[0.87rem] leading-[1.6]">
              {feat.description}
            </p>
            <span className="inline-block mt-3.5 bg-[var(--green-10)] border border-[var(--green-15)] rounded-full px-3 py-1 text-[0.72rem] text-green font-semibold">
              {feat.tag}
            </span>
          </Card>
        ))}
      </div>
    </section>
  );
}
