import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Building, Mail, Phone, MessageSquare, Hash, Send, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';

interface FormData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  websiteRequirements: string;
  originalOrderId: string;
}

interface DetailsStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  isRenewal: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const formSchema = z.object({
  fullName: z.string().trim().min(2, 'Name is required'),
  businessName: z.string().trim().min(2, 'Business name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().min(10, 'Phone is required'),
  whatsapp: z.string().trim().min(10, 'WhatsApp is required'),
});

const DetailsStep = ({
  formData,
  setFormData,
  isRenewal,
  isSubmitting,
  onSubmit,
  onBack,
}: DetailsStepProps) => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = formSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'خطأ في البيانات' : 'Invalid data',
        description: validation.error.errors[0]?.message || (isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'),
      });
      return;
    }

    if (isRenewal && !formData.originalOrderId.trim()) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'أدخل رقم الطلب الأصلي' : 'Enter original order ID',
      });
      return;
    }

    if (!isRenewal && !formData.websiteRequirements.trim()) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'أدخل متطلبات الموقع' : 'Enter website requirements',
        description: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
      });
      return;
    }

    onSubmit();
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 sm:space-y-6"
      onSubmit={handleSubmit}
    >
      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الاسم الكامل' : 'Full Name'} *</Label>
          <div className="relative">
            <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={isRTL ? 'pr-10 text-right' : 'pl-10'}
              placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'اسم النشاط' : 'Business Name'} *</Label>
          <div className="relative">
            <Building className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className={isRTL ? 'pr-10 text-right' : 'pl-10'}
              placeholder={isRTL ? 'اسم النشاط التجاري' : 'Your business name'}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'البريد الإلكتروني' : 'Email'} *</Label>
        <div className="relative">
          <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={isRTL ? 'pr-10 text-right' : 'pl-10'}
            placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your email'}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'رقم الهاتف' : 'Phone'} *</Label>
          <div className="relative">
            <Phone className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={isRTL ? 'pr-10 text-right' : 'pl-10'}
              placeholder={isRTL ? 'رقم الهاتف' : 'Phone number'}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'واتساب' : 'WhatsApp'} *</Label>
          <div className="relative">
            <MessageSquare className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className={isRTL ? 'pr-10 text-right' : 'pl-10'}
              placeholder={isRTL ? 'رقم الواتساب' : 'WhatsApp number'}
              required
            />
          </div>
        </div>
      </div>

      {isRenewal ? (
        <div className="space-y-2">
          <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'رقم الطلب الأصلي' : 'Original Order ID'} *</Label>
          <div className="relative">
            <Hash className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              value={formData.originalOrderId}
              onChange={(e) => setFormData({ ...formData, originalOrderId: e.target.value.toUpperCase() })}
              className={`uppercase font-mono ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
              placeholder="CS-XXXXXX"
              required
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تعديلات / متطلبات الموقع' : 'Website Edits / Requirements'} *</Label>
          <Textarea
            value={formData.websiteRequirements}
            onChange={(e) => setFormData({ ...formData, websiteRequirements: e.target.value })}
            className={isRTL ? 'text-right' : ''}
            placeholder={isRTL ? 'أخبرنا عن متطلبات موقعك وأي تعديلات تريدها...' : 'Tell us about your website requirements and any edits you need...'}
            rows={4}
            required
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button type="button" onClick={onBack} variant="outline" className="flex-1">
          <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            {isRTL ? 'السابق' : 'Back'}
          </span>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1 gradient-bg">
          <span className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isRTL ? 'جاري الإرسال...' : 'Submitting...'}
              </>
            ) : (
              <>
                {isRTL ? 'إرسال الطلب' : 'Submit Order'}
                <Send className="w-5 h-5" />
              </>
            )}
          </span>
        </Button>
      </div>
    </motion.form>
  );
};

export default DetailsStep;
