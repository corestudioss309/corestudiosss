import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Rocket } from 'lucide-react';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { motion } from 'framer-motion';

const FinalCTASection = () => {
  const { t, isRTL } = useLanguage();

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-28 relative">


      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-8 rounded-2xl gradient-bg flex items-center justify-center shadow-xl shadow-gradient-purple/30"
            >
              <Rocket className="w-10 h-10 text-primary-foreground" />
            </motion.div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-6 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
              <span className="gradient-text">{t('cta.title')}</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-xl text-muted-foreground mb-10">
              {t('cta.subtitle')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <Button
              size="lg"
              onClick={scrollToContact}
              className="gradient-bg hover:opacity-90 transition-all hover:scale-105 text-lg px-10 py-7 group shadow-xl shadow-gradient-purple/30"
            >
              {t('cta.button')}
              {isRTL ? (
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-2 transition-transform" />
              ) : (
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              )}
            </Button>
          </ScrollReveal>

          {/* Trust indicators */}
          <ScrollReveal delay={0.4}>
            <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>{isRTL ? 'جاهز خلال ١٠ لـ ١٤ يوم' : 'Ready in 10–14 Days'}</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <span>{isRTL ? 'بدون التزام' : 'No Commitment'}</span>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <span>{isRTL ? 'إلغاء في أي وقت' : 'Cancel Anytime'}</span>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
