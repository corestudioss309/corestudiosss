import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Globe, Mail, Ticket, Check, X, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddonSettings {
  custom_domain_enabled: boolean;
  custom_domain_price: number;
  business_email_enabled: boolean;
  business_email_price: number;
}

interface CouponData {
  code: string;
  discount_type: string;
  discount_value: number;
  discountAmount: number;
  applies_to: string;
}

interface AddonsStepProps {
  addonSettings: AddonSettings | null;
  basePrice: number;
  selectedAddons: {
    customDomain: boolean;
    businessEmail: boolean;
  };
  setSelectedAddons: (addons: { customDomain: boolean; businessEmail: boolean }) => void;
  couponData: CouponData | null;
  setCouponData: (data: CouponData | null) => void;
  onNext: () => void;
}

const AddonsStep = ({
  addonSettings,
  basePrice,
  selectedAddons,
  setSelectedAddons,
  couponData,
  setCouponData,
  onNext,
}: AddonsStepProps) => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState(couponData?.code || '');
  const [isValidating, setIsValidating] = useState(false);

  const addonTotal = 
    (selectedAddons.customDomain && addonSettings?.custom_domain_enabled ? addonSettings.custom_domain_price : 0) +
    (selectedAddons.businessEmail && addonSettings?.business_email_enabled ? addonSettings.business_email_price : 0);

  const subtotal = basePrice + addonTotal;
  const discount = couponData?.discountAmount || 0;
  const finalTotal = subtotal - discount;

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'أدخل كود الخصم' : 'Enter coupon code',
      });
      return;
    }

    setIsValidating(true);
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'كود غير صالح' : 'Invalid code',
        description: isRTL ? 'هذا الكود غير موجود أو منتهي' : 'This code does not exist or has expired',
      });
      setCouponData(null);
      setIsValidating(false);
      return;
    }

    // Check usage limit
    if (data.max_uses !== null && data.usage_count >= data.max_uses) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'كود منتهي الصلاحية' : 'Code expired',
        description: isRTL ? 'وصل هذا الكود للحد الأقصى من الاستخدام' : 'This code has reached its usage limit',
      });
      setCouponData(null);
      setIsValidating(false);
      return;
    }

    // Check if coupon applies to setup fee
    const appliesTo = (data as any).applies_to || 'setup_fee';
    if (appliesTo === 'monthly_fee') {
      toast({
        variant: 'destructive',
        title: isRTL ? 'كود غير صالح' : 'Invalid code',
        description: isRTL ? 'هذا الكود يُطبق على الاشتراك الشهري فقط' : 'This code applies to monthly subscription only',
      });
      setCouponData(null);
      setIsValidating(false);
      return;
    }

    // Calculate discount on base price only
    const discountAmount = data.discount_type === 'percentage'
      ? Math.round(basePrice * data.discount_value / 100)
      : Math.min(data.discount_value, basePrice);

    setCouponData({
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      discountAmount,
      applies_to: appliesTo,
    });

    toast({
      title: isRTL ? 'تم تطبيق الخصم!' : 'Discount applied!',
      description: isRTL 
        ? `وفرت ${discountAmount.toLocaleString()} جنيه`
        : `You saved ${discountAmount.toLocaleString()} EGP`,
    });

    setIsValidating(false);
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponData(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Add-ons Section */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'الإضافات المتاحة' : 'Available Add-ons'}
        </h3>

        {/* Custom Domain */}
        {addonSettings?.custom_domain_enabled && (
          <div 
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedAddons.customDomain 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedAddons({ ...selectedAddons, customDomain: !selectedAddons.customDomain })}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
              <div className={`flex items-center gap-3`}>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedAddons.customDomain ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-medium text-sm sm:text-base">{isRTL ? 'دومين مخصص' : 'Custom Domain'}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isRTL ? 'بدلاً من .corestudioss.com' : 'Instead of .corestudioss.com'}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-3 ms-12 sm:ms-0`}>
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {addonSettings.custom_domain_price.toLocaleString()} {isRTL ? 'جنيه/سنة' : 'EGP/year'}
                </Badge>
                <Switch 
                  checked={selectedAddons.customDomain}
                  onCheckedChange={(checked) => setSelectedAddons({ ...selectedAddons, customDomain: checked })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Business Email */}
        {addonSettings?.business_email_enabled && (
          <div 
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedAddons.businessEmail 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedAddons({ ...selectedAddons, businessEmail: !selectedAddons.businessEmail })}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
              <div className={`flex items-center gap-3`}>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedAddons.businessEmail ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-medium text-sm sm:text-base">{isRTL ? 'بريد الكتروني للأعمال' : 'Business Email'}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {isRTL ? 'بريد احترافي باسم نشاطك' : 'Professional email with your domain'}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-3 ms-12 sm:ms-0`}>
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {addonSettings.business_email_price.toLocaleString()} {isRTL ? 'جنيه/سنة' : 'EGP/year'}
                </Badge>
                <Switch 
                  checked={selectedAddons.businessEmail}
                  onCheckedChange={(checked) => setSelectedAddons({ ...selectedAddons, businessEmail: checked })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coupon Section */}
      <div className="space-y-3">
        <Label className={isRTL ? 'text-right block' : ''}>
          <div className={`flex items-center gap-2`}>
            <Ticket className="w-4 h-4" />
            {isRTL ? 'كود الخصم' : 'Coupon Code'}
          </div>
        </Label>
        
        {couponData ? (
          <div className={`p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between`}>
            <div className={`flex items-center gap-2`}>
              <Check className="w-5 h-5 text-primary" />
              <span className="font-mono font-medium">{couponData.code}</span>
              <Badge variant="outline" className="text-primary">
                -{couponData.discountAmount.toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={removeCoupon}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className={`flex gap-2`}>
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={isRTL ? 'أدخل كود الخصم' : 'Enter coupon code'}
              className={`flex-1 font-mono uppercase ${isRTL ? 'text-right' : ''}`}
            />
            <Button onClick={validateCoupon} disabled={isValidating} variant="outline">
              {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRTL ? 'تطبيق' : 'Apply')}
            </Button>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
        <h4 className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'ملخص السعر' : 'Price Summary'}
        </h4>
        
        <div className={`flex justify-between text-sm`}>
          <span className="text-muted-foreground">{isRTL ? 'رسوم الإعداد' : 'Setup Fee'}</span>
          <span>{basePrice.toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}</span>
        </div>

        {addonTotal > 0 && (
          <div className={`flex justify-between text-sm`}>
            <span className="text-muted-foreground">{isRTL ? 'الإضافات' : 'Add-ons'}</span>
            <span>+{addonTotal.toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}</span>
          </div>
        )}

        {discount > 0 && (
          <div className={`flex justify-between text-sm text-primary`}>
            <span>{isRTL ? 'الخصم' : 'Discount'}</span>
            <span>-{discount.toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}</span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className={`flex justify-between font-bold text-lg`}>
            <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
            <span className="text-primary">{finalTotal.toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}</span>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <Button onClick={onNext} className="w-full gradient-bg text-base sm:text-lg py-5 sm:py-6">
        <span className={`flex items-center gap-2`}>
          {isRTL ? 'التالي' : 'Next'}
          {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </span>
      </Button>
    </motion.div>
  );
};

export default AddonsStep;
