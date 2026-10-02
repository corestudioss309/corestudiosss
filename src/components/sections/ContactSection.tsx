import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare } from 'lucide-react';
import ScrollReveal from '@/components/ui/scroll-reveal';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const contactSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  phone: z.string().trim().min(1, 'Phone is required').max(20),
  whatsapp: z.string().trim().min(1, 'WhatsApp is required').max(20),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

const ContactSection = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(formRef, { once: true, margin: '-100px' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0]?.message || 'Please check your inputs',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('leads').insert({
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      message: formData.message.trim(),
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: t('contact.error'),
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: t('contact.success'),
      });
      setFormData({ fullName: '', email: '', phone: '', whatsapp: '', message: '' });
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.05,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section id="contact" className="py-28 relative">


      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-gradient-purple/30 text-gradient-purple bg-gradient-purple/5">
              <MessageSquare className="w-3 h-3 mr-1" />
              {isRTL ? 'تواصل معنا' : 'Get In Touch'}
            </Badge>
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${isRTL ? 'font-cairo' : 'font-sans'}`}>
              <span className="gradient-text">{t('contact.title')}</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('contact.subtitle')}
            </p>
          </ScrollReveal>

          <div ref={formRef}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="glass rounded-3xl p-8 gradient-border hover:shadow-xl hover:shadow-gradient-purple/5 transition-shadow duration-500"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <motion.div 
                    custom={0} 
                    variants={inputVariants} 
                    initial="hidden" 
                    animate={isInView ? "visible" : "hidden"}
                    className="space-y-2"
                  >
                    <Label htmlFor="fullName" className={isRTL ? 'block text-right' : ''}>
                      {t('contact.fullName')} *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className={`bg-muted border-border focus:ring-2 focus:ring-gradient-purple/50 transition-all ${isRTL ? 'text-right' : ''}`}
                    />
                  </motion.div>

                  <motion.div 
                    custom={1} 
                    variants={inputVariants} 
                    initial="hidden" 
                    animate={isInView ? "visible" : "hidden"}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className={isRTL ? 'block text-right' : ''}>
                      {t('contact.email')} *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`bg-muted border-border focus:ring-2 focus:ring-gradient-purple/50 transition-all ${isRTL ? 'text-right' : ''}`}
                    />
                  </motion.div>

                  <motion.div 
                    custom={2} 
                    variants={inputVariants} 
                    initial="hidden" 
                    animate={isInView ? "visible" : "hidden"}
                    className="space-y-2"
                  >
                    <Label htmlFor="phone" className={isRTL ? 'block text-right' : ''}>
                      {t('contact.phone')} *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`bg-muted border-border focus:ring-2 focus:ring-gradient-purple/50 transition-all ${isRTL ? 'text-right' : ''}`}
                    />
                  </motion.div>

                  <motion.div 
                    custom={3} 
                    variants={inputVariants} 
                    initial="hidden" 
                    animate={isInView ? "visible" : "hidden"}
                    className="space-y-2"
                  >
                    <Label htmlFor="whatsapp" className={isRTL ? 'block text-right' : ''}>
                      {t('contact.whatsapp')} *
                    </Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      className={`bg-muted border-border focus:ring-2 focus:ring-gradient-purple/50 transition-all ${isRTL ? 'text-right' : ''}`}
                    />
                  </motion.div>
                </div>

                <motion.div 
                  custom={4} 
                  variants={inputVariants} 
                  initial="hidden" 
                  animate={isInView ? "visible" : "hidden"}
                  className="space-y-2"
                >
                  <Label htmlFor="message" className={isRTL ? 'block text-right' : ''}>
                    {t('contact.businessDesc')} *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className={`bg-muted border-border resize-none focus:ring-2 focus:ring-gradient-purple/50 transition-all ${isRTL ? 'text-right' : ''}`}
                  />
                </motion.div>

                <motion.div
                  custom={5}
                  variants={inputVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-bg hover:opacity-90 transition-all hover:scale-[1.02] py-6 shadow-lg shadow-gradient-purple/25"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isRTL ? 'جاري الإرسال...' : 'Sending...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {t('contact.submit')}
                        <Send className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
