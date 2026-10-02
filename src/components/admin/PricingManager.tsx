import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface Pricing {
  id: string;
  setup_fee: number;
  monthly_fee: number;
  discount_enabled: boolean;
  discount_percent: number;
}

const PricingManager = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    const { data, error } = await supabase
      .from('pricing')
      .select('*')
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pricing',
        variant: 'destructive',
      });
    } else {
      setPricing(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!pricing) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('pricing')
      .update({
        setup_fee: pricing.setup_fee,
        monthly_fee: pricing.monthly_fee,
        discount_enabled: pricing.discount_enabled,
        discount_percent: pricing.discount_percent,
      })
      .eq('id', pricing.id);

    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save pricing',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Pricing updated successfully',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pricing) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pricing data found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isRTL ? 'font-cairo' : 'font-sans'}`}>
          {t('admin.pricing')}
        </h1>
        <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'إدارة رسوم الإعداد والاشتراك الشهري' : 'Manage your setup and monthly fees'}
        </p>
      </div>

      <div className="max-w-lg">
        <div className="glass rounded-3xl p-8 gradient-border space-y-6">
          <div className="space-y-2">
            <Label htmlFor="setupFee" className={isRTL ? 'block text-right' : ''}>
              {t('admin.setupFee')}
            </Label>
            <Input
              id="setupFee"
              type="number"
              value={pricing.setup_fee}
              onChange={(e) => setPricing({ ...pricing, setup_fee: parseInt(e.target.value) || 0 })}
              className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyFee" className={isRTL ? 'block text-right' : ''}>
              {t('admin.monthlyFee')}
            </Label>
            <Input
              id="monthlyFee"
              type="number"
              value={pricing.monthly_fee}
              onChange={(e) => setPricing({ ...pricing, monthly_fee: parseInt(e.target.value) || 0 })}
              className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Label htmlFor="discountEnabled" className={isRTL ? 'font-cairo' : 'font-sans'}>
              {t('admin.enableDiscount')}
            </Label>
            <Switch
              id="discountEnabled"
              checked={pricing.discount_enabled}
              onCheckedChange={(checked) => setPricing({ ...pricing, discount_enabled: checked })}
            />
          </div>

          {pricing.discount_enabled && (
            <div className="space-y-2">
              <Label htmlFor="discountPercent" className={isRTL ? 'block text-right' : ''}>
                {t('admin.discountPercent')} (%)
              </Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                value={pricing.discount_percent}
                onChange={(e) => setPricing({ ...pricing, discount_percent: parseInt(e.target.value) || 0 })}
                className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
              />
            </div>
          )}

          <Button
            onClick={handleSave}
            className="w-full gradient-bg hover:opacity-90 transition-opacity"
            disabled={isSaving}
          >
            <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isSaving ? '...' : t('admin.save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingManager;
