import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Plus, Trash2, Percent, DollarSign, Copy, Settings2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  is_active: boolean;
  usage_count: number;
  max_uses: number | null;
  applies_to: 'setup_fee' | 'monthly_fee' | 'both';
  created_at: string;
}

const CouponManager = () => {
  const { isRTL } = useLanguage();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [appliesTo, setAppliesTo] = useState<'setup_fee' | 'monthly_fee' | 'both'>('setup_fee');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCoupons(data as Coupon[]);
    }
    setLoading(false);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCode.trim() || !discountValue) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const value = parseInt(discountValue);
    if (discountType === 'percentage' && (value < 1 || value > 100)) {
      toast.error(isRTL ? 'النسبة يجب أن تكون بين 1 و 100' : 'Percentage must be between 1 and 100');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('coupons')
      .insert({
        code: newCode.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: value,
        max_uses: maxUses ? parseInt(maxUses) : null,
        applies_to: appliesTo,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error(isRTL ? 'كود الكوبون موجود بالفعل' : 'Coupon code already exists');
      } else {
        toast.error(isRTL ? 'حدث خطأ أثناء إنشاء الكوبون' : 'Error creating coupon');
      }
    } else {
      toast.success(isRTL ? 'تم إنشاء الكوبون بنجاح' : 'Coupon created successfully');
      setNewCode('');
      setDiscountValue('');
      setMaxUses('');
      setAppliesTo('setup_fee');
      fetchCoupons();
    }
    setSaving(false);
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (!error) {
      toast.success(isRTL ? 'تم تحديث حالة الكوبون' : 'Coupon status updated');
      fetchCoupons();
    }
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponToDelete.id);

    if (!error) {
      toast.success(isRTL ? 'تم حذف الكوبون' : 'Coupon deleted');
      fetchCoupons();
    }
    setDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-EG').format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'إدارة الكوبونات' : 'Coupon Management'}
          </h2>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'إنشاء وإدارة أكواد الخصم' : 'Create and manage discount codes'}
          </p>
        </div>
      </div>

      {/* Create Coupon Form */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Plus className="w-5 h-5" />
            {isRTL ? 'إنشاء كوبون جديد' : 'Create New Coupon'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCoupon} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'كود الكوبون' : 'Coupon Code'}
                </Label>
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder={isRTL ? 'مثال: SAVE20' : 'e.g., SAVE20'}
                  className={`uppercase ${isRTL ? 'text-right' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'الحد الأقصى للاستخدام (اختياري)' : 'Max Uses (Optional)'}
                </Label>
                <Input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder={isRTL ? 'غير محدود' : 'Unlimited'}
                  min="1"
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'نوع الخصم' : 'Discount Type'}
              </Label>
              <RadioGroup
                value={discountType}
                onValueChange={(val) => setDiscountType(val as 'fixed' | 'percentage')}
                className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label htmlFor="percentage" className={`flex items-center gap-1 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Percent className="w-4 h-4" />
                    {isRTL ? 'نسبة مئوية' : 'Percentage'}
                  </Label>
                </div>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className={`flex items-center gap-1 cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <DollarSign className="w-4 h-4" />
                    {isRTL ? 'مبلغ ثابت' : 'Fixed Amount'}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {discountType === 'percentage' 
                  ? (isRTL ? 'نسبة الخصم (%)' : 'Discount Percentage (%)')
                  : (isRTL ? 'مبلغ الخصم (EGP)' : 'Discount Amount (EGP)')
                }
              </Label>
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '20' : '200'}
                min="1"
                max={discountType === 'percentage' ? '100' : undefined}
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'يُطبق على' : 'Applies To'}
              </Label>
              <Select value={appliesTo} onValueChange={(val) => setAppliesTo(val as 'setup_fee' | 'monthly_fee' | 'both')}>
                <SelectTrigger className={isRTL ? 'text-right' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="setup_fee">{isRTL ? 'رسوم التأسيس فقط' : 'Setup Fee Only'}</SelectItem>
                  <SelectItem value="monthly_fee">{isRTL ? 'الاشتراك الشهري فقط' : 'Monthly Subscription Only'}</SelectItem>
                  <SelectItem value="both">{isRTL ? 'الاثنين' : 'Both'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={saving} className="gradient-bg w-full md:w-auto">
              {saving 
                ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') 
                : (isRTL ? 'إنشاء الكوبون' : 'Create Coupon')
              }
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'الكوبونات الحالية' : 'Existing Coupons'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? 'لا توجد كوبونات بعد' : 'No coupons yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الكود' : 'Code'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الخصم' : 'Discount'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'يُطبق على' : 'Applies To'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاستخدام' : 'Usage'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className={`font-mono font-bold ${isRTL ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {coupon.code}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              toast.success(isRTL ? 'تم نسخ الكود' : 'Code copied');
                            }}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <Badge variant="outline" className={`${isRTL ? 'flex-row-reverse' : ''}`}>
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}%`
                            : `${formatPrice(coupon.discount_value)} EGP`
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <Badge variant="secondary" className="text-xs">
                          {coupon.applies_to === 'setup_fee' 
                            ? (isRTL ? 'رسوم التأسيس' : 'Setup Fee')
                            : coupon.applies_to === 'monthly_fee'
                            ? (isRTL ? 'الاشتراك الشهري' : 'Monthly')
                            : (isRTL ? 'الاثنين' : 'Both')
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {coupon.usage_count}
                        {coupon.max_uses && ` / ${coupon.max_uses}`}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={() => toggleCouponStatus(coupon)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(coupon)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription className={isRTL ? 'text-right' : ''}>
              {isRTL 
                ? `هل أنت متأكد من حذف الكوبون "${couponToDelete?.code}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the coupon "${couponToDelete?.code}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRTL ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CouponManager;
