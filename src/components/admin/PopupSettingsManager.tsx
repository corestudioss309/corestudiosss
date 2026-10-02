import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

const PopupSettingsManager = () => {
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [includeCoupon, setIncludeCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('popup_settings')
      .select('*')
      .limit(1)
      .single();

    if (data && !error) {
      setSettingsId(data.id);
      setIsActive(data.is_active);
      setTitleEn(data.title_en);
      setTitleAr(data.title_ar);
      setDescriptionEn(data.description_en);
      setDescriptionAr(data.description_ar);
      setIncludeCoupon(data.include_coupon);
      setCouponCode(data.coupon_code || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('popup_settings')
      .update({
        is_active: isActive,
        title_en: titleEn,
        title_ar: titleAr,
        description_en: descriptionEn,
        description_ar: descriptionAr,
        include_coupon: includeCoupon,
        coupon_code: includeCoupon ? couponCode || null : null,
      })
      .eq('id', settingsId);

    if (error) {
      toast.error(isRTL ? 'فشل في حفظ الإعدادات' : 'Failed to save settings');
    } else {
      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${isRTL ? 'font-cairo text-right' : ''}`}>
      <div>
        <h2 className="text-2xl font-bold">{isRTL ? 'إعدادات النافذة المنبثقة' : 'Popup Settings'}</h2>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'تحكم في النافذة المنبثقة الترحيبية للزوار' : 'Control the welcome popup shown to visitors'}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Active toggle */}
        <div className={`flex items-center justify-between p-4 rounded-lg border border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <Label className="text-base font-medium">{isRTL ? 'تفعيل النافذة المنبثقة' : 'Enable Popup'}</Label>
            <p className="text-sm text-muted-foreground">{isRTL ? 'إظهار النافذة للزوار الجدد' : 'Show popup to new visitors'}</p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        {/* Title EN */}
        <div className="space-y-2">
          <Label>{isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
          <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Welcome!" />
        </div>

        {/* Title AR */}
        <div className="space-y-2">
          <Label>{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
          <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="أهلاً وسهلاً!" dir="rtl" />
        </div>

        {/* Description EN */}
        <div className="space-y-2">
          <Label>{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
          <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Check out our latest offers" />
        </div>

        {/* Description AR */}
        <div className="space-y-2">
          <Label>{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
          <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} placeholder="تفقد أحدث عروضنا" dir="rtl" />
        </div>

        {/* Coupon toggle */}
        <div className={`flex items-center justify-between p-4 rounded-lg border border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <Label className="text-base font-medium">{isRTL ? 'تضمين كوبون' : 'Include Coupon'}</Label>
            <p className="text-sm text-muted-foreground">{isRTL ? 'عرض كود خصم مع زر نسخ' : 'Show a discount code with copy button'}</p>
          </div>
          <Switch checked={includeCoupon} onCheckedChange={setIncludeCoupon} />
        </div>

        {/* Coupon code input */}
        {includeCoupon && (
          <div className="space-y-2">
            <Label>{isRTL ? 'كود الكوبون' : 'Coupon Code'}</Label>
            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME20" />
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default PopupSettingsManager;
