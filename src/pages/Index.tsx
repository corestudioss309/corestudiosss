import { forwardRef, lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import PainPointsSection from '@/components/sections/PainPointsSection';
import WelcomePopup from '@/components/WelcomePopup';

const ServicesBentoSection = lazy(() => import('@/components/sections/ServicesBentoSection'));
const WhyUsSection = lazy(() => import('@/components/sections/WhyUsSection'));
const PricingSection = lazy(() => import('@/components/sections/PricingSection'));
const SubscriptionExplanationSection = lazy(() => import('@/components/sections/SubscriptionExplanationSection'));
const OurSnapsSection = lazy(() => import('@/components/sections/OurSnapsSection'));
const TestimonialsSection = lazy(() => import('@/components/sections/TestimonialsSection'));
const ContactSection = lazy(() => import('@/components/sections/ContactSection'));
const FAQSection = lazy(() => import('@/components/sections/FAQSection'));
const FinalCTASection = lazy(() => import('@/components/sections/FinalCTASection'));
const Footer = lazy(() => import('@/components/Footer'));

const Index = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="min-h-screen bg-background [&_section]:bg-background [&_footer]:bg-background">
      <WelcomePopup />
      <Navbar />
      <main>
        <HeroSection />
        <PainPointsSection />
        <Suspense fallback={null}>
          <ServicesBentoSection />
          <SubscriptionExplanationSection />
          <WhyUsSection />
          <OurSnapsSection />
          <TestimonialsSection />
          <PricingSection />
          <FAQSection />
          <FinalCTASection />
          <ContactSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
