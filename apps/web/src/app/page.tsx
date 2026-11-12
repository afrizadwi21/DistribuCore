import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LoginSection } from "@/components/landing/LoginSection";
import { ModulesSection } from "@/components/landing/ModulesSection";
import { WorkflowConveyor } from "@/components/landing/WorkflowConveyor";
import { PersonaDrum } from "@/components/landing/PersonaDrum";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ContactFooter } from "@/components/landing/ContactFooter";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] transition-colors">
      <Navbar />
      <main id="home">
        <Hero />
        <ScrollReveal>
          <LoginSection />
        </ScrollReveal>
        <ScrollReveal>
          <ModulesSection />
        </ScrollReveal>
        <WorkflowConveyor />
        <PersonaDrum />
        <ScrollReveal>
          <PricingSection />
        </ScrollReveal>
        <ScrollReveal>
          <FAQSection />
        </ScrollReveal>
        <ScrollReveal>
          <ContactFooter />
        </ScrollReveal>
      </main>
    </div>
  );
}
