import { useLanguage } from '@/contexts/LanguageContext';
import { CreditCard, Package, Calendar, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';


const SubscriptionExplanationSection = () => {
  const { t, isRTL } = useLanguage();
  const timelineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(timelineRef, { once: true, margin: '-100px' });

  const steps = [
    {
      icon: CreditCard,
      title: t('subscription.step1.title'),
      desc: t('subscription.step1.desc'),
      iconBg: 'bg-foreground',
    },
    {
      icon: Package,
      title: t('subscription.step2.title'),
      desc: t('subscription.step2.desc'),
      iconBg: 'bg-foreground',
    },
    {
      icon: Calendar,
      title: t('subscription.step3.title'),
      desc: t('subscription.step3.desc'),
      iconBg: 'bg-foreground',
    },
    {
      icon: XCircle,
      title: t('subscription.step4.title'),
      desc: t('subscription.step4.desc'),
      iconBg: 'bg-foreground',
    },
  ];

  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-gradient-purple/30 text-gradient-purple bg-gradient-purple/5">
            <RefreshCw className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            {isRTL ? 'كيف يعمل الاشتراك' : 'How Subscription Works'}
          </Badge>
          <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
            <span className="gradient-text">{t('subscription.title')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('subscription.subtitle')}
          </p>
        </ScrollReveal>

        <div ref={timelineRef} className="max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="relative flex flex-col items-center">
            {steps.map((step, index) => (
              <div key={index} className="w-full flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                  className="w-full relative"
                >
                  <div className="gradient-border rounded-2xl w-full">
                    <div className={`p-6 md:p-8 flex items-center gap-5 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <h3 className={`text-xl font-bold mb-2 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-muted-foreground leading-relaxed ${isRTL ? 'font-cairo' : ''}`}>
                          {step.desc}
                        </p>
                      </div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{
                          duration: 0.4,
                          delay: 0.3 + index * 0.15,
                          type: 'spring',
                          stiffness: 200,
                        }}
                        className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}
                      >
                        <step.icon className="w-7 h-7 text-background" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.15 }}
                    style={{ transformOrigin: 'top' }}
                    className="w-0.5 h-12 bg-border"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionExplanationSection;
