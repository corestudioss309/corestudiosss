import { useState, useEffect } from 'react';
import RaysBackground from '@/components/RaysBackground';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateId } from '@/lib/ids';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import StepIndicator from '@/components/subscribe/StepIndicator';
import PaymentStep from '@/components/subscribe/PaymentStep';
import DetailsStep from '@/components/subscribe/DetailsStep';
import ConfirmationStep from '@/components/subscribe/ConfirmationStep';

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

interface PricingData {
  setup_fee: number;
  monthly_fee: number;
  discount_enabled: boolean;
  discount_percent: number;
}

const Renew = () => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    whatsapp: '',
    websiteRequirements: '',
    originalOrderId: '',
  });

  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [pricing, setPricing] = useState<PricingData | null>(null);

  const basePrice = pricing
    ? (pricing.discount_enabled ? Math.round(pricing.monthly_fee * (1 - pricing.discount_percent / 100)) : pricing.monthly_fee)
    : 0;

  const discount = couponData?.discountAmount || 0;
  const totalAmount = basePrice - discount;

  useEffect(() => {
    const fetchSettings = async () => {
      const [{ data: paymentData }, { data: pricingData }] = await Promise.all([
        supabase.from('payment_settings').select('*').single(),
        supabase.from('pricing').select('*').single(),
      ]);
      if (paymentData) setPaymentSettings(paymentData);
      if (pricingData) setPricing(pricingData);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!receiptFile) {
        toast({ variant: 'destructive', title: isRTL ? 'يرجى رفع إيصال الدفع' : 'Please upload payment receipt' });
        setIsSubmitting(false);
        return;
      }

      const fileName = `${Date.now()}-${crypto.randomUUID()}.${receiptFile.name.split('.').pop() || 'jpg'}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, receiptFile);
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const publicUrl = fileName;

      const { data: orderCheck } = await supabase.rpc('order_exists', {
        _order_id: formData.originalOrderId.trim().toUpperCase(),
      });

      if (!orderCheck) {
        toast({ variant: 'destructive', title: isRTL ? 'رقم الطلب غير موجود' : 'Order ID not found' });
        setIsSubmitting(false);
        return;
      }

      const newId = generateId('CSR-');
      const { error } = await supabase
        .from('renewals')
        .insert([{
          renewal_id: newId,
          original_order_id: formData.originalOrderId.trim().toUpperCase(),
          full_name: formData.fullName.trim(),
          business_name: formData.businessName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim(),
          renewal_fee: basePrice,
          payment_method: selectedPayment,
          receipt_url: publicUrl,
          status: 'pending',
          coupon_code: couponData?.code || null,
          coupon_discount: discount,
        }]);

      if (error) throw new Error(`Renewal failed: ${error.message}`);
      setSubmittedId(newId);
      setCurrentStep(3);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        variant: 'destructive',
        title: isRTL ? 'حدث خطأ' : 'Error occurred',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = [
    isRTL ? 'الدفع' : 'Payment',
    isRTL ? 'البيانات' : 'Details',
    isRTL ? 'تم' : 'Done',
  ];

  return (
    <div className={`min-h-screen bg-background isolate ${isRTL ? 'font-cairo' : 'font-sans'}`}>
      <RaysBackground fixed />
      <Navbar />
      <main className="pt-20 sm:pt-24 pb-10 sm:pb-16">
        <div className="container mx-auto max-w-2xl px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden border border-border bg-card/90 backdrop-blur-xl"
          >
            <div className={`border-b border-border px-4 py-5 sm:px-8 sm:py-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">
                {isRTL ? 'كور ستوديوز / تجديد' : 'Core Studios / Renewal'}
              </p>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {isRTL ? 'تجديد الاشتراك' : 'Renew Subscription'}
              </h1>
            </div>

            <div className="p-4 sm:p-8">
              {currentStep < 3 && (
                <StepIndicator currentStep={currentStep} totalSteps={3} stepLabels={stepLabels} isRTL={isRTL} />
              )}

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <PaymentStep
                    key="payment"
                    paymentSettings={paymentSettings}
                    totalAmount={totalAmount}
                    basePrice={basePrice}
                    selectedPayment={selectedPayment}
                    setSelectedPayment={setSelectedPayment}
                    receiptFile={receiptFile}
                    setReceiptFile={setReceiptFile}
                    couponData={couponData}
                    setCouponData={setCouponData}
                    onNext={() => setCurrentStep(2)}
                    onBack={() => window.history.back()}
                    isRenewal={true}
                  />
                )}
                {currentStep === 2 && (
                  <DetailsStep
                    key="details"
                    formData={formData}
                    setFormData={setFormData}
                    isRenewal={true}
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                    onBack={() => setCurrentStep(1)}
                  />
                )}
                {currentStep === 3 && (
                  <ConfirmationStep key="confirmation" orderId={submittedId} isRenewal={true} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Renew;
