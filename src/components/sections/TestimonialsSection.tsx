import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  name_en: string;
  name_ar: string;
  role_en: string;
  role_ar: string;
  review_en: string;
  review_ar: string;
  rating: number;
  display_order: number;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
    ))}
  </div>
);

const getInitials = (name: string) => {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
};

const TestimonialsSection = () => {
  const { isRTL, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data) setReviews(data as unknown as Review[]);
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, [reviews.length]);

  const goTo = (index: number) => {
    clearInterval(autoPlayRef.current);
    setActiveIndex(index);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
  };

  const prev = () => goTo((activeIndex - 1 + reviews.length) % reviews.length);
  const next = () => goTo((activeIndex + 1) % reviews.length);

  if (reviews.length === 0) return null;

  const getVisibleIndices = () => {
    const len = reviews.length;
    if (len === 1) return [{ index: 0, position: 'center' as const }];
    if (len === 2) return [
      { index: activeIndex, position: 'center' as const },
      { index: (activeIndex + 1) % len, position: 'right' as const },
    ];
    return [
      { index: (activeIndex - 1 + len) % len, position: 'left' as const },
      { index: activeIndex, position: 'center' as const },
      { index: (activeIndex + 1) % len, position: 'right' as const },
    ];
  };

  const positionStyles = {
    left: { x: '-65%', scale: 0.8, opacity: 0.5, zIndex: 1, rotateY: 15 },
    center: { x: '0%', scale: 1, opacity: 1, zIndex: 10, rotateY: 0 },
    right: { x: '65%', scale: 0.8, opacity: 0.5, zIndex: 1, rotateY: -15 },
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">


      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-primary">
                {isRTL ? 'آراء عملائنا' : 'Client Reviews'}
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 pb-1 text-foreground">
              {isRTL ? 'كلام الناس عننا' : 'What Our Clients Say'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? 'انضم لمئات العملاء السعداء الذين حوّلوا أعمالهم مع Core Studios'
                : 'Join hundreds of happy clients who transformed their business with Core Studios'}
            </p>
          </div>
        </ScrollReveal>

        {/* 3D Carousel */}
        <div className="relative" style={{ perspective: '1200px' }}>
          <div className="relative h-[320px] sm:h-[340px] md:h-[360px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {getVisibleIndices().map(({ index, position }) => {
                const review = reviews[index];
                const name = language === 'ar' ? review.name_ar : review.name_en;
                const role = language === 'ar' ? review.role_ar : review.role_en;
                const text = language === 'ar' ? review.review_ar : review.review_en;
                const initials = getInitials(review.name_en);

                return (
                  <motion.div
                    key={`${review.id}-${position}`}
                    className="absolute w-[280px] sm:w-[340px] md:w-[400px]"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{
                      x: positionStyles[position].x,
                      scale: positionStyles[position].scale,
                      opacity: positionStyles[position].opacity,
                      zIndex: positionStyles[position].zIndex,
                      rotateY: positionStyles[position].rotateY,
                    }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ transformStyle: 'preserve-3d' }}
                    onClick={() => {
                      if (position !== 'center') goTo(index);
                    }}
                  >
                    <div className={`p-6 rounded-2xl bg-card/80 backdrop-blur-sm border-2 transition-colors duration-300 shadow-2xl relative group cursor-default ${
                      position === 'center' ? 'border-primary/40 shadow-primary/20' : 'border-border/30 cursor-pointer'
                    }`}>
                      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Quote className="w-10 h-10 text-primary" />
                      </div>

                      <div className="mb-3">
                        <StarRating rating={review.rating} />
                      </div>

                      <p className="text-muted-foreground mb-5 leading-relaxed text-sm md:text-base line-clamp-4">"{text}"</p>

                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-primary">
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{name}</h4>
                          <p className="text-xs text-muted-foreground">{role}</p>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {reviews.length > 1 && (
            <>
              <button
                onClick={prev}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-0 md:right-4' : 'left-0 md:left-4'} z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary/40 transition-all`}
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <button
                onClick={next}
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-0 md:left-4' : 'right-0 md:right-4'} z-20 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-primary/20 hover:border-primary/40 transition-all`}
              >
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>

        {/* Dots indicator */}
        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}

        <ScrollReveal delay={0.3}>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="flex -space-x-2">
                {reviews.slice(0, 4).map((r, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground border-2 border-background">
                    {getInitials(r.name_en)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {isRTL ? `تقييم ٤.٩ من ٥ من أكثر من ${reviews.length} عميل` : `4.9/5 rating from ${reviews.length}+ clients`}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TestimonialsSection;
