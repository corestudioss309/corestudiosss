import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Ticket, Package, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface RenewalDetails {
  renewal_id: string;
  original_order_id: string;
  full_name: string;
  business_name: string;
  renewal_fee: number;
  coupon_code: string | null;
  coupon_discount: number;
  payment_method: string | null;
  created_at: string;
  status: string;
}

interface RenewalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewal: RenewalDetails | null;
}

const RenewalDetailsDialog = ({ open, onOpenChange, renewal }: RenewalDetailsDialogProps) => {
  const { isRTL, language } = useLanguage();
  const dateLocale = language === 'ar' ? ar : enUS;

  if (!renewal) return null;

  const finalTotal = renewal.renewal_fee - renewal.coupon_discount;
  const formatPrice = (price: number) => price.toLocaleString();

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return isRTL ? 'غير محدد' : 'Not specified';
    const labels: Record<string, { en: string; ar: string }> = {
      instapay: { en: 'InstaPay', ar: 'إنستاباي' },
      vodafone: { en: 'Vodafone Cash', ar: 'فودافون كاش' },
    };
    return labels[method] ? (isRTL ? labels[method].ar : labels[method].en) : method;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      confirmed: { en: 'Confirmed', ar: 'مؤكد' },
      rejected: { en: 'Rejected', ar: 'مرفوض' },
    };
    return labels[status] ? (isRTL ? labels[status].ar : labels[status].en) : status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Package className="w-5 h-5" />
            {isRTL ? 'تفاصيل التجديد' : 'Renewal Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'رقم التجديد' : 'Renewal ID'}</span>
            <span className="font-mono font-medium">{renewal.renewal_id}</span>
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'الطلب الأصلي' : 'Original Order'}</span>
            <span className="font-mono font-medium">{renewal.original_order_id}</span>
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'العميل' : 'Client'}</span>
            <span className="font-medium">{renewal.full_name}</span>
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'المشروع' : 'Project'}</span>
            <span className="font-medium">{renewal.business_name}</span>
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'التاريخ' : 'Date'}</span>
            <span>{format(new Date(renewal.created_at), 'PP', { locale: dateLocale })}</span>
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</span>
            <Badge variant="secondary">{getStatusLabel(renewal.status)}</Badge>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-3">
            <h4 className={`font-medium ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'تفاصيل السعر' : 'Price Breakdown'}
            </h4>

            <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-muted-foreground">{isRTL ? 'رسوم التجديد' : 'Renewal Fee'}</span>
              <span>{formatPrice(renewal.renewal_fee)} EGP</span>
            </div>

            {renewal.coupon_code && renewal.coupon_discount > 0 && (
              <>
                <Separator />
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{isRTL ? 'كود الخصم' : 'Coupon Code'}</span>
                  </div>
                  <Badge variant="outline" className="font-mono">{renewal.coupon_code}</Badge>
                </div>
                <div className={`flex items-center justify-between text-sm text-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'الخصم' : 'Discount'}</span>
                  <span>-{formatPrice(renewal.coupon_discount)} EGP</span>
                </div>
              </>
            )}

            <Separator />

            <div className={`flex items-center justify-between font-bold text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{isRTL ? 'الإجمالي النهائي' : 'Final Total'}</span>
              <span className="text-primary">{formatPrice(finalTotal)} EGP</span>
            </div>
          </div>

          <Separator />

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</span>
            </div>
            <span>{getPaymentMethodLabel(renewal.payment_method)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RenewalDetailsDialog;
