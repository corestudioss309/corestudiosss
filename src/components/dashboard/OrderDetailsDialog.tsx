import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Ticket, Package, CreditCard, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface OrderDetails {
  order_id: string;
  business_name: string;
  setup_fee: number;
  monthly_fee: number;
  addon_total: number;
  custom_domain_addon: boolean;
  business_email_addon: boolean;
  coupon_code: string | null;
  coupon_discount: number;
  payment_method: string | null;
  created_at: string;
  subscription_status: string;
}

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetails | null;
}

const OrderDetailsDialog = ({ open, onOpenChange, order }: OrderDetailsDialogProps) => {
  const { isRTL, language } = useLanguage();
  const dateLocale = language === 'ar' ? ar : enUS;

  if (!order) return null;

  const subtotal = order.setup_fee + order.addon_total;
  const finalTotal = subtotal - (order.coupon_discount || 0);

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
      active: { en: 'Active', ar: 'نشط' },
      renewed: { en: 'Renewed', ar: 'مجدد' },
      expired: { en: 'Expired', ar: 'منتهي' },
      suspended: { en: 'Suspended', ar: 'معلق' },
    };
    return labels[status] ? (isRTL ? labels[status].ar : labels[status].en) : status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Package className="w-5 h-5" />
            {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'رقم الطلب' : 'Order ID'}</span>
            <span className="font-mono font-medium">{order.order_id}</span>
          </div>
          
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'المشروع' : 'Project'}</span>
            <span className="font-medium">{order.business_name}</span>
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'التاريخ' : 'Date'}</span>
            <span>{format(new Date(order.created_at), 'PP', { locale: dateLocale })}</span>
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</span>
            <Badge variant="secondary">{getStatusLabel(order.subscription_status)}</Badge>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-3">
            <h4 className={`font-medium ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'تفاصيل السعر' : 'Price Breakdown'}
            </h4>

            <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-muted-foreground">{isRTL ? 'رسوم الإعداد' : 'Setup Fee'}</span>
              <span>{formatPrice(order.setup_fee)} EGP</span>
            </div>

            {order.custom_domain_addon && (
              <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{isRTL ? 'نطاق مخصص' : 'Custom Domain'}</span>
                <span>{isRTL ? 'مضاف' : 'Included'}</span>
              </div>
            )}

            {order.business_email_addon && (
              <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{isRTL ? 'بريد تجاري' : 'Business Email'}</span>
                <span>{isRTL ? 'مضاف' : 'Included'}</span>
              </div>
            )}

            {order.addon_total > 0 && (
              <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{isRTL ? 'إجمالي الإضافات' : 'Add-ons Total'}</span>
                <span>{formatPrice(order.addon_total)} EGP</span>
              </div>
            )}

            <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-muted-foreground">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{formatPrice(subtotal)} EGP</span>
            </div>

            {/* Coupon Section */}
            {order.coupon_code && order.coupon_discount > 0 && (
              <>
                <Separator />
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{isRTL ? 'كود الخصم' : 'Coupon Code'}</span>
                  </div>
                  <Badge variant="outline" className="font-mono">{order.coupon_code}</Badge>
                </div>
                <div className={`flex items-center justify-between text-sm text-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'الخصم' : 'Discount'}</span>
                  <span>-{formatPrice(order.coupon_discount)} EGP</span>
                </div>
              </>
            )}

            <Separator />

            {/* Final Total */}
            <div className={`flex items-center justify-between font-bold text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{isRTL ? 'الإجمالي النهائي' : 'Final Total'}</span>
              <span className="text-primary">{formatPrice(finalTotal)} EGP</span>
            </div>
          </div>

          <Separator />

          {/* Payment Info */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</span>
            </div>
            <span>{getPaymentMethodLabel(order.payment_method)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
