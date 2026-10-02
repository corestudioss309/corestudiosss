import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ConfirmationStepProps {
  orderId: string;
  isRenewal: boolean;
}

const ConfirmationStep = ({ orderId, isRenewal }: ConfirmationStepProps) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyOrderId = async () => {
    await navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast({
      title: isRTL ? 'تم النسخ!' : 'Copied!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4 sm:space-y-6"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mx-auto flex h-20 w-20 items-center justify-center border border-primary bg-primary sm:h-24 sm:w-24"
      >
        <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {isRTL ? 'مبروك 🎉!' : 'Congratulations 🎉!'}
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground">
          {isRenewal
            ? (isRTL 
                ? 'تم استلام طلب التجديد بنجاح. فريقنا هيتواصل معاك خلال 24 ساعة.'
                : 'Your renewal request has been received. Our team will contact you within 24 hours.')
            : (isRTL 
                ? 'تم استلام طلبك بنجاح. فريقنا هيتواصل معاك خلال 24 ساعة.'
                : 'Your request has been received. Our team will contact you within 24 hours.')
          }
        </p>
      </motion.div>

      {/* Order ID Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="inline-block"
      >
        <div className="border border-border bg-muted p-4">
          <p className="text-sm text-muted-foreground mb-1">
            {isRenewal 
              ? (isRTL ? 'رقم التجديد' : 'Renewal ID')
              : (isRTL ? 'رقم الطلب' : 'Order ID')
            }
          </p>
          <div className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p className="text-xl sm:text-2xl font-bold font-mono gradient-text">{orderId}</p>
            <Button variant="ghost" size="icon" onClick={copyOrderId}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="border border-primary/30 bg-primary/5 p-4 text-left"
      >
        <h3 className={`font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'الخطوات التالية' : 'What happens next?'}
        </h3>
        <ul className={`space-y-2 text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
          <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-primary">1.</span>
            {isRTL ? 'سنراجع إيصال الدفع الخاص بك' : "We'll review your payment receipt"}
          </li>
          <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-primary">2.</span>
            {isRTL ? 'سنتواصل معك عبر الواتساب' : "We'll contact you via WhatsApp"}
          </li>
          <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-primary">3.</span>
            {isRenewal
              ? (isRTL ? 'سنجدد اشتراكك فوراً' : "We'll renew your subscription immediately")
              : (isRTL ? 'سنبدأ العمل على موقعك' : "We'll start working on your website")
            }
          </li>
        </ul>
      </motion.div>

      {/* Home Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className={`flex items-center gap-2 mx-auto ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Home className="w-4 h-4" />
          {isRTL ? 'الصفحة الرئيسية' : 'Go Home'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationStep;
