import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { supabase } from '@/integrations/supabase/client';

interface Snap {
  id: string;
  title: string;
  image_url: string;
}

const OurSnapsSection = () => {
  const { isRTL } = useLanguage();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const fetchSnaps = async () => {
      const { data } = await supabase
        .from('snaps')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setSnaps(data);
      }
    };
    fetchSnaps();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (snaps.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % snaps.length);
    }, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [snaps.length]);

  const goTo = (index: number) => {
    clearInterval(autoPlayRef.current);
    setActiveIndex(index);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % snaps.length);
    }, 4000);
  };

  const prev = () => goTo((activeIndex - 1 + snaps.length) % snaps.length);
  const next = () => goTo((activeIndex + 1) % snaps.length);

  if (snaps.length === 0) return null;

  // Show 3 cards: previous, active, next
  const getVisibleIndices = () => {
    const len = snaps.length;
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
    left: {
      x: '-65%',
      scale: 0.75,
      opacity: 0.5,
      zIndex: 1,
      rotateY: 15,
    },
    center: {
      x: '0%',
      scale: 1,
      opacity: 1,
      zIndex: 10,
      rotateY: 0,
    },
    right: {
      x: '65%',
      scale: 0.75,
      opacity: 0.5,
      zIndex: 1,
      rotateY: -15,
    },
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
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {isRTL ? 'أعمالنا' : 'Our Work'}
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              {isRTL ? 'أحدث أعمالنا' : 'Selected Work'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? 'شوف بعض من أحدث المواقع اللي بنيناها لعملائنا'
                : 'Check out some of the latest websites we built for our clients'}
            </p>
          </div>
        </ScrollReveal>

        {/* 3D Carousel */}
        <div className="relative" style={{ perspective: '1200px' }}>
          <div className="relative h-[420px] sm:h-[500px] md:h-[580px] flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {getVisibleIndices().map(({ index, position }) => (
                <motion.div
                  key={`${snaps[index].id}-${position}`}
                  className="absolute w-[260px] sm:w-[300px] md:w-[360px] cursor-pointer"
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
                    if (position === 'center') {
                      setSelectedImage(snaps[index].image_url);
                    } else {
                      goTo(index);
                    }
                  }}
                >
                  <div className={`rounded-2xl overflow-hidden border-2 transition-colors duration-300 shadow-2xl ${
                    position === 'center' ? 'border-primary/40 shadow-primary/20' : 'border-border/30'
                  }`}>
                    <div className="aspect-[4/5]">
                      <img
                        src={snaps[index].image_url}
                        alt={snaps[index].title || 'Core Studios project'}
                        className="w-full h-full object-cover grayscale-0"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                    {snaps[index].title && position === 'center' && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/70">
                        <p className="text-white font-semibold text-sm text-center">
                          {snaps[index].title}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {snaps.length > 1 && (
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
        {snaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {snaps.map((_, i) => (
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
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedImage}
              alt="Project preview"
              className="max-w-full max-h-[90vh] object-contain grayscale-0 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default OurSnapsSection;
