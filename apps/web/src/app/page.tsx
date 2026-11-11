import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { DemoLoginSection } from "@/components/landing/DemoLoginSection";
import { ModulesSection } from "@/components/landing/ModulesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { PersonasSection } from "@/components/landing/PersonasSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ContactFooter } from "@/components/landing/ContactFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] transition-colors">
      <Navbar />
      <main id="home">
        <Hero />
        <DemoLoginSection />
        <ModulesSection />
        <WorkflowSection />
        <PersonasSection />
        <PricingSection />
        <FAQSection />
        <ContactFooter />
      </main>
    </div>
  );
}
