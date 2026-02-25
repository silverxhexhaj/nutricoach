import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { ForCoaches } from "@/components/landing/ForCoaches";
import { ForClients } from "@/components/landing/ForClients";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCta } from "@/components/landing/FinalCta";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ForCoaches />
        <OnboardingForm />
        <ForClients />
        <Features />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
