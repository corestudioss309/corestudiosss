import { motion } from 'framer-motion';
import { Globe, Workflow, PenTool, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ServicesBentoSection = () => {
  const { isRTL } = useLanguage();
  const font = isRTL ? 'font-cairo' : 'font-sans';

  const services = [
    { icon: Globe, tag: '01 / WaaS', span: 'md:col-span-2',
      title: isRTL ? 'مواقع بنظام الاشتراك' : 'Web-as-a-Service',
      desc: isRTL ? 'مواقع متبرمجة مخصوص، تعديلات كل شهر، ومن غير أي صداع في الاستضافة.' : 'Custom-coded websites, monthly iterations, zero hosting headaches.' },
    { icon: Workflow, tag: '02 / n8n', span: '',
      title: isRTL ? 'أتمتة سير العمل' : 'Workflow Automation',
      desc: isRTL ? 'بنحوّل مهامك اليومية المتكررة لشغل أوتوماتيك ونظام بسيط يشتغل بدالك.' : 'Automating your repetitive daily tasks into one simple, self-running system.' },
    { icon: PenTool, tag: '03 / Design', span: 'md:col-span-3',
      title: isRTL ? 'تصميم جرافيك' : 'Graphic Design',
      desc: isRTL ? 'هوية بصرية، تصميم UI/UX، ومواد تسويقية.' : 'Brand identity, UI/UX design, and marketing collateral.' },
  ];

  return (
    <section id="services" className="py-28 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }} className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">{isRTL ? '// خدماتنا' : '// Services'}</p>
          <h2 className={`text-3xl md:text-5xl font-bold tracking-tight text-foreground ${font}`}>
            {isRTL ? 'ثلاث ركايز. محرك واحد.' : 'Three pillars. One engine.'}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <motion.div key={s.tag}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`group relative rounded-2xl border border-border/40 bg-card/40 p-8 min-h-[240px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-muted-foreground/50 hover:bg-card ${s.span}`}>
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl border border-border/60 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="font-mono text-xs text-muted-foreground" dir="ltr">{s.tag}</span>
              </div>
              <div className="mt-10">
                <h3 className={`text-xl md:text-2xl font-semibold text-foreground mb-2 ${font}`}>{s.title}</h3>
                <p className={`text-muted-foreground leading-relaxed ${font}`}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesBentoSection;
