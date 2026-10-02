import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, CreditCard, Copy, Check, Upload, ArrowRight, ArrowLeft, Ticket, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import instapayQRDefault from '@/assets/instapay-qr.jpeg';
import vodafoneQRDefault from '@/assets/vodafone-qr.jpeg';

interface PaymentSettings {
  instapay_account_number: string;
  instapay_username: string;
  instapay_link: string;
  instapay_qr_url: string | null;
  vodafone_number: string;
  vodafone_link: string;
  vodafone_qr_url: string | null;
}

interface CouponData {
  code: string;
  discount_type: string;
  discount_value: number;
  discountAmount: number;
  applies_to: string;
}

interface PaymentStepProps {
  paymentSettings: PaymentSettings | null;
  totalAmount: number;
  basePrice: number;
  selectedPayment: string;
  setSelectedPayment: (method: string) => void;
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
  couponData: CouponData | null;
  setCouponData: (data: CouponData | null) => void;
  onNext: () => void;
  onBack: () => void;
  isRenewal: boolean;
}

const PaymentStep = ({
  paymentSettings,
  totalAmount,
  basePrice,
  selectedPayment,
  setSelectedPayment,
  receiptFile,
  setReceiptFile,
  couponData,
  setCouponData,
  onNext,
  onBack,
  isRenewal,
}: PaymentStepProps) => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState('');
  const [couponCode, setCouponCode] = useState(couponData?.code || '');
  const [isValidating, setIsValidating] = useState(false);

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

    // Check if coupon applies to this flow
    const appliesTo = (data as any).applies_to || 'setup_fee';
    if (isRenewal && appliesTo === 'setup_fee') {
      toast({
        variant: 'destructive',
        title: isRTL ? 'كود غير صالح' : 'Invalid code',
        description: isRTL ? 'هذا الكود يُطبق على رسوم التأسيس فقط' : 'This code applies to setup fee only',
      });
      setCouponData(null);
      setIsValidating(false);
      return;
    }
    if (!isRenewal && appliesTo === 'monthly_fee') {
      toast({
        variant: 'destructive',
        title: isRTL ? 'كود غير صالح' : 'Invalid code',
        description: isRTL ? 'هذا الكود يُطبق على الاشتراك الشهري فقط' : 'This code applies to monthly subscription only',
      });
      setCouponData(null);
      setIsValidating(false);
      return;
    }

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

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: isRTL ? 'تم النسخ!' : 'Copied!',
    });
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: isRTL ? 'الملف كبير جداً' : 'File too large',
          description: isRTL ? 'الحد الأقصى 5 ميجابايت' : 'Maximum size is 5MB',
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleNext = () => {
    if (!selectedPayment) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'اختر طريقة الدفع' : 'Select payment method',
      });
      return;
    }

    if (!receiptFile) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'ارفع إيصال الدفع' : 'Upload payment receipt',
      });
      return;
    }

    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Amount Display */}
      <div className={`border border-border bg-background p-4 sm:p-5 ${isRTL ? 'text-right' : 'text-left'}`}>
        <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">
          {isRTL ? 'المبلغ المطلوب' : 'Amount Due'}
        </p>
        <p className="text-3xl font-bold text-foreground sm:text-4xl">
          {totalAmount.toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}
        </p>
        {isRenewal && couponData && (
          <p className="text-sm text-muted-foreground mt-1 line-through">
            {(totalAmount + couponData.discountAmount).toLocaleString()} {isRTL ? 'جنيه' : 'EGP'}
          </p>
        )}
      </div>

      {/* Coupon Section - for renewals */}
      {isRenewal && (
        <div className="space-y-3">
          <Label className={isRTL ? 'text-right block' : ''}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Ticket className="w-4 h-4" />
              {isRTL ? 'كود الخصم' : 'Coupon Code'}
            </div>
          </Label>
          
          {couponData ? (
            <div className={`flex items-center justify-between border border-primary bg-primary/10 p-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
      )}

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className={isRTL ? 'text-right block' : ''}>
          {isRTL ? 'طريقة الدفع' : 'Payment Method'} *
        </Label>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedPayment('instapay')}
            className={`h-auto min-h-24 flex-col border p-4 transition-all ${
              selectedPayment === 'instapay' 
                ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'border-border bg-background hover:border-primary'
            }`}
          >
            <Smartphone className="mb-1 h-6 w-6" />
            <span className="font-medium">Instapay</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedPayment('vodafone')}
            className={`h-auto min-h-24 flex-col border p-4 transition-all ${
              selectedPayment === 'vodafone' 
                ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'border-border bg-background hover:border-primary'
            }`}
          >
            <CreditCard className="mb-1 h-6 w-6" />
            <span className="font-medium">Vodafone Cash</span>
          </Button>
        </div>
      </div>

      {/* Payment Details */}
      {selectedPayment && paymentSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 border border-border bg-muted/50 p-4"
        >
          <div className="flex justify-center">
            <img 
              src={selectedPayment === 'instapay' 
                ? (paymentSettings.instapay_qr_url || instapayQRDefault)
                : (paymentSettings.vodafone_qr_url || vodafoneQRDefault)
              } 
              alt="QR Code" 
              className="h-40 w-40 border border-border object-cover"
            />
          </div>
          
          <div className={`flex items-center justify-between p-3 bg-background rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-xs text-muted-foreground">
                {selectedPayment === 'instapay' 
                  ? (isRTL ? 'رقم الحساب' : 'Account Number')
                  : (isRTL ? 'رقم المحفظة' : 'Wallet Number')
                }
              </p>
              <p className="font-mono font-medium">
                {selectedPayment === 'instapay' 
                  ? paymentSettings.instapay_account_number 
                  : paymentSettings.vodafone_number
                }
              </p>
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              onClick={() => copyToClipboard(
                selectedPayment === 'instapay' 
                  ? paymentSettings.instapay_account_number 
                  : paymentSettings.vodafone_number,
                'number'
              )}
            >
              {copiedField === 'number' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => window.open(
              selectedPayment === 'instapay' 
                ? paymentSettings.instapay_link 
                : paymentSettings.vodafone_link, 
              '_blank'
            )}
          >
            {isRTL ? 'فتح رابط الدفع' : 'Open Payment Link'}
          </Button>
        </motion.div>
      )}

      {/* Receipt Upload */}
      <div className="space-y-2">
        <Label className={isRTL ? 'text-right block' : ''}>
          {isRTL ? 'إيصال الدفع' : 'Payment Receipt'} *
        </Label>
        <div className="relative">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="receipt-upload"
          />
          <label
            htmlFor="receipt-upload"
            className={`flex min-h-20 cursor-pointer items-center justify-center gap-2 border border-dashed p-4 transition-colors ${
              receiptFile 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-background hover:border-primary'
            } ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {receiptFile ? (
              <>
                <Check className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium truncate max-w-[200px]">{receiptFile.name}</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {isRTL ? 'اختر صورة الإيصال' : 'Choose receipt image'}
                </span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {!isRenewal && (
          <Button onClick={onBack} variant="outline" className="flex-1">
            <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              {isRTL ? 'السابق' : 'Back'}
            </span>
          </Button>
        )}
        <Button onClick={handleNext} className={`gradient-bg ${isRenewal ? 'w-full' : 'flex-1'}`}>
          <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isRTL ? 'التالي' : 'Next'}
            {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </span>
        </Button>
      </div>
    </motion.div>
  );
};

export default PaymentStep;
