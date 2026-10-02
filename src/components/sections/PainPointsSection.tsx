import { useLanguage } from '@/contexts/LanguageContext';
import { PhoneOff, Globe, TrendingDown, DollarSign } from 'lucide-react';
import ScrollReveal from '@/components/ui/scroll-reveal';
import StaggerContainer, { StaggerItem } from '@/components/ui/stagger-container';

const PainPointsSection = () => {
  const { isRTL } = useLanguage();

  const painPoints = [
    {
      icon: PhoneOff,
      titleEn: 'Missed Calls & Messy Bookings',
      titleAr: 'مكالمات فايتة وحجوزات متلخبطة',
      descEn: "Customers call but you're busy. Messages get lost. Bookings fall through the cracks.",
      descAr: 'العملاء بيتصلوا وأنت مشغول. الرسائل بتتوه. والحجوزات بتروح عليك.',
    },
    {
      icon: Globe,
      titleEn: 'No Professional Online Presence',
      titleAr: 'مفيش تواجد أونلاين محترف',
      descEn: "Your competitors have websites. Your customers can't find you or trust you online.",
      descAr: 'منافسيك عندهم مواقع. عملاءك مش لاقينك ولا واثقين فيك أونلاين.',
    },
    {
      icon: TrendingDown,
      titleEn: 'Losing to Better-Looking Competitors',
      titleAr: 'بتخسر لمنافسين شكلهم أحسن',
      descEn: 'Customers choose the business that looks more professional — even if your service is better.',
      descAr: 'العملاء بيختاروا البيزنس اللي شكله احترافي أكتر — حتى لو خدمتك أحسن.',
    },
    {
      icon: DollarSign,
      titleEn: 'Agencies Are Too Expensive',
      titleAr: 'الشركات غالية والفريلانسرز بيختفوا',
      descEn: 'Freelancers ghost you. Agencies charge 40,000+ EGP upfront and take months to deliver.',
      descAr: 'الفريلانسرز بيوعدوا ويختفوا. والشركات بتاخد +٤٠,٠٠٠ ج.م مقدم وبتتأخر شهور.',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-purple/10 border border-gradient-purple/30 text-gradient-purple mb-6">
              {isRTL ? 'هل ده بيحصل معاك؟' : 'Sound Familiar?'}
            </span>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 gradient-text ${isRTL ? 'font-cairo' : ''}`}>
              {isRTL ? 'بتخسر عملاء من غير ما تاخد بالك' : 'Losing Customers Without Even Knowing It'}
            </h2>
            <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${isRTL ? 'font-cairo' : ''}`}>
              {isRTL ? 'المشاكل دي بتكلفك فلوس حقيقية كل يوم' : 'These problems cost you real money every single day'}
            </p>
          </div>
        </ScrollReveal>

        {/* Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {painPoints.map((point, i) => (
            <StaggerItem key={i}>
              <div className="gradient-border rounded-2xl">
                <div className={`p-6 flex flex-col gap-4 ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-foreground flex items-center justify-center shrink-0`}>
                      <point.icon className="w-6 h-6 text-background" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      {isRTL ? point.titleAr : point.titleEn}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {isRTL ? point.descAr : point.descEn}
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

export default PainPointsSection;
