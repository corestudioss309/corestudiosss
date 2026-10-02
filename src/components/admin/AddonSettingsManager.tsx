import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Globe, Mail, DollarSign } from 'lucide-react';

interface AddonSettings {
  id: string;
  custom_domain_price: number;
  custom_domain_enabled: boolean;
  business_email_price: number;
  business_email_enabled: boolean;
}

const AddonSettingsManager = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AddonSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('addon_settings')
      .select('*')
      .single();

    if (!error && data) {
      setSettings(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('addon_settings')
      .update({
        custom_domain_price: settings.custom_domain_price,
        custom_domain_enabled: settings.custom_domain_enabled,
        business_email_price: settings.business_email_price,
        business_email_enabled: settings.business_email_enabled,
      })
      .eq('id', settings.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully',
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'إعدادات الإضافات' : 'Add-on Settings'}
          </h2>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'إدارة أسعار وتفعيل الإضافات' : 'Manage add-on prices and availability'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Custom Domain */}
        <div className="glass rounded-xl p-6 gradient-border">
          <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Globe className="w-6 h-6 text-gradient-purple" />
            <h3 className="font-semibold text-lg">
              {isRTL ? 'دومين مخصص' : 'Custom Domain'}
            </h3>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Label>{isRTL ? 'تفعيل' : 'Enabled'}</Label>
              <Switch
                checked={settings.custom_domain_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => prev ? { ...prev, custom_domain_enabled: checked } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'السعر (ج.م/سنوياً)' : 'Price (EGP/year)'}
              </Label>
              <div className="relative">
                <DollarSign className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  type="number"
                  value={settings.custom_domain_price}
                  onChange={(e) => 
                    setSettings(prev => prev ? { ...prev, custom_domain_price: parseInt(e.target.value) || 0 } : null)
                  }
                  className={isRTL ? 'pr-10 text-right' : 'pl-10'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Email */}
        <div className="glass rounded-xl p-6 gradient-border">
          <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Mail className="w-6 h-6 text-gradient-purple" />
            <h3 className="font-semibold text-lg">
              {isRTL ? 'بريد إلكتروني للأعمال' : 'Business Email'}
            </h3>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Label>{isRTL ? 'تفعيل' : 'Enabled'}</Label>
              <Switch
                checked={settings.business_email_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => prev ? { ...prev, business_email_enabled: checked } : null)
                }
              />
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'السعر (ج.م/سنوياً)' : 'Price (EGP/year)'}
              </Label>
              <div className="relative">
                <DollarSign className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  type="number"
                  value={settings.business_email_price}
                  onChange={(e) => 
                    setSettings(prev => prev ? { ...prev, business_email_price: parseInt(e.target.value) || 0 } : null)
                  }
                  className={isRTL ? 'pr-10 text-right' : 'pl-10'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className={`gradient-bg hover:opacity-90 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {isSaving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
      </Button>
    </div>
  );
};

export default AddonSettingsManager;
