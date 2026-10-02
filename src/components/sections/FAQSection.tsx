import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const FAQSection = () => {
  const { t, isRTL } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
  ];

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-gradient-blue/30 text-gradient-blue bg-gradient-blue/5">
              <HelpCircle className="w-3 h-3 mr-1" />
              {isRTL ? 'أسئلة شائعة' : 'FAQ'}
            </Badge>
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
              <span className="gradient-text">{t('faq.title')}</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('faq.subtitle')}
            </p>
          </ScrollReveal>

          <div ref={containerRef}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="glass rounded-3xl p-6 md:p-8 gradient-border"
            >
              <Accordion type="single" collapsible className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                  >
                    <AccordionItem
                      value={`item-${index}`}
                      className="border-border/50 rounded-xl px-4 hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/50"
                    >
                      <AccordionTrigger className={`hover:no-underline py-5 ${isRTL ? 'text-right font-cairo' : 'text-left font-sans'}`}>
                        <span className="font-semibold text-lg">{faq.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className={`text-muted-foreground pb-5 leading-relaxed ${isRTL ? 'text-right font-cairo' : 'text-left font-sans'}`}>
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
