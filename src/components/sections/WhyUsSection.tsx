import { useLanguage } from '@/contexts/LanguageContext';
import { Zap, Wallet, Target, Headphones, TrendingUp, ShieldCheck } from 'lucide-react';
import ScrollReveal from '@/components/ui/scroll-reveal';
import StaggerContainer, { StaggerItem } from '@/components/ui/stagger-container';

const WhyUsSection = () => {
  const { isRTL } = useLanguage();

  const features = [
    {
      icon: Zap,
      titleEn: 'Ready in 10–14 Days, Not Months',
      titleAr: 'جاهز خلال ١٠ لـ ١٤ يوم مش شهور',
      descEn: 'While agencies take months, your system is live and getting you customers in 10–14 days',
      descAr: 'بينما الشركات بتاخد شهور، نظامك بيكون شغّال وبيجيبلك عملاء خلال ١٠ لـ ١٤ يوم',
    },
    {
      icon: Wallet,
      titleEn: 'No Huge Upfront Cost',
      titleAr: 'من غير تكاليف ضخمة مقدماً',
      descEn: 'Start with a small setup fee instead of paying 40,000+ EGP upfront to an agency',
      descAr: 'ابدأ برسوم إعداد بسيطة بدل ما تدفع +٤٠,٠٠٠ ج.م مقدم لشركة',
    },
    {
      icon: Target,
      titleEn: 'Built to Get You Customers',
      titleAr: 'مصممة عشان تجيبلك عملاء',
      descEn: 'Every page, every button is designed to convert visitors into paying customers',
      descAr: 'كل صفحة وكل زر مصمم لتحويل الزوار لعملاء يدفعوا',
    },
    {
      icon: Headphones,
      titleEn: 'Ongoing Support Included',
      titleAr: 'دعم مستمر معاك',
      descEn: 'Updates, fixes, and improvements — we handle everything so you focus on your business',
      descAr: 'تحديثات وإصلاحات وتحسينات — بنتولى كل حاجة عشان تركز على شغلك بس!',
    },
    {
      icon: TrendingUp,
      titleEn: 'Designed to Convert',
      titleAr: 'مصمم للنتائج',
      descEn: 'Not just a pretty website — a system engineered for real business results',
      descAr: 'مش مجرد موقع حلو — نظام متهندس لنتائج بيزنس حقيقية',
    },
    {
      icon: ShieldCheck,
      titleEn: 'Secure & Reliable',
      titleAr: 'آمن وموثوق',
      descEn: 'We ensure your website and data are protected with the latest security standards',
      descAr: 'بنتأكد إن موقعك وبياناتك محمية بأحدث معايير الأمان',
    },
  ];

  return (
    <section id="why-us" className="py-28 relative">
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-purple/10 border border-gradient-purple/30 text-gradient-purple mb-6">
            {isRTL ? 'ليه Core Studios' : 'Why Core Studios'}
          </span>
          <h2 className={`text-3xl md:text-5xl font-bold mb-4 gradient-text ${isRTL ? 'font-cairo' : ''}`}>
            {isRTL ? 'إيه اللي يميّزنا' : 'What Sets Us Apart'}
          </h2>
          <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${isRTL ? 'font-cairo' : ''}`}>
            {isRTL ? 'مصمم للنتائج، مش بس الشكل' : 'Built for results, not just aesthetics'}
          </p>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.08} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <StaggerItem key={index} className="h-full">
              <div className="gradient-border rounded-2xl h-full">
                <div className={`p-6 h-full ${isRTL ? 'font-cairo text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-foreground flex items-center justify-center shrink-0 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-background" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {isRTL ? feature.titleAr : feature.titleEn}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {isRTL ? feature.descAr : feature.descEn}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default WhyUsSection;
