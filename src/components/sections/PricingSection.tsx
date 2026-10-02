import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { motion, useInView } from 'framer-motion';


interface Pricing {
  setup_fee: number;
  monthly_fee: number;
  discount_enabled: boolean;
  discount_percent: number;
}

const PricingSection = () => {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });

  useEffect(() => {
    const fetchPricing = async () => {
      const { data, error } = await supabase
        .from('pricing')
        .select('*')
        .single();
      
      if (!error && data) {
        setPricing(data);
      }
    };

    fetchPricing();
  }, []);

  const features = [
    { en: 'Complete business website', ar: 'موقع بيزنس كامل' },
    { en: 'Conversion-optimized design', ar: 'تصميم مُحسّن للتحويل' },
    { en: 'Works on all devices', ar: 'يعمل على كل الأجهزة' },
    { en: 'Hosting & maintenance included', ar: 'استضافة وصيانة مشمولة' },
    { en: 'Business dashboard', ar: 'لوحة تحكم للبيزنس' },
    { en: 'Ongoing support & updates', ar: 'دعم مستمر وتحديثات' },
    { en: 'Ready in 10–14 days', ar: 'جاهز خلال ١٠ لـ ١٤ يوم' },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(price);
  };

  const getDiscountedPrice = (price: number) => {
    if (pricing?.discount_enabled && pricing.discount_percent > 0) {
      return price - (price * pricing.discount_percent / 100);
    }
    return price;
  };

  return (
    <>
      <section id="pricing" className="py-28 relative">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-gradient-purple/30 text-gradient-purple bg-gradient-purple/5">
              <Star className="w-3 h-3 mr-1" />
              {isRTL ? 'أسعارنا' : 'Pricing'}
            </Badge>
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
              <span className="gradient-text">{t('pricing.title')}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </ScrollReveal>

          <div className="max-w-lg mx-auto" ref={cardRef}>
            <div className="gradient-border rounded-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-3xl p-8 relative overflow-hidden"
            >
              {/* Discount badge */}
              {pricing?.discount_enabled && pricing.discount_percent > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
                  animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute top-4 right-4 gradient-bg px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                  <span className="text-primary-foreground text-sm font-bold">
                    {pricing.discount_percent}% {t('pricing.discount')}
                  </span>
                </motion.div>
              )}

              <h3 className={`text-2xl font-bold mb-8 text-center pt-4 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
                {isRTL ? 'نظام Core Studios' : 'Core Studios System'}
              </h3>

              {/* Setup Fee */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 p-5 rounded-2xl bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
              >
                <div className={`flex items-baseline justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground font-medium">{t('pricing.setupFee')}</span>
                  <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {pricing?.discount_enabled && pricing.discount_percent > 0 && (
                      <span className="text-muted-foreground line-through text-lg">
                        {pricing ? formatPrice(pricing.setup_fee) : '1,500'} EGP
                      </span>
                    )}
                    <span className="text-3xl font-bold gradient-text">
                      {pricing ? formatPrice(Math.round(getDiscountedPrice(pricing.setup_fee))) : '1,500'} EGP
                    </span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">({t('pricing.oneTime')})</span>
              </motion.div>

              {/* Monthly Fee */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-8 p-5 rounded-2xl bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
              >
                <div className={`flex items-baseline justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground font-medium">{t('pricing.monthly')}</span>
                  <div className={`flex items-baseline gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {pricing?.discount_enabled && pricing.discount_percent > 0 && (
                      <span className="text-muted-foreground line-through text-lg">
                        {pricing ? formatPrice(pricing.monthly_fee) : '500'} EGP
                      </span>
                    )}
                    <span className="text-3xl font-bold gradient-text">
                      {pricing ? formatPrice(Math.round(getDiscountedPrice(pricing.monthly_fee))) : '500'} EGP
                    </span>
                    <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
                  </div>
                </div>
              </motion.div>


              {/* Features */}
              <div className="space-y-4 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
                {features.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center flex-shrink-0 shadow-md shadow-gradient-purple/20">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <span className={`${isRTL ? 'font-cairo' : 'font-sans'}`}>{isRTL ? feature.ar : feature.en}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Button
                  size="lg"
                  className="w-full gradient-bg hover:opacity-90 transition-all hover:scale-[1.02] text-lg py-6 shadow-lg shadow-gradient-purple/25"
                  onClick={() => navigate('/subscribe')}
                >
                  {t('pricing.subscribe')}
                </Button>
              </motion.div>
            </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PricingSection;
