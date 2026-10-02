import ReceiptImage from '@/components/ReceiptImage';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, MessageCircle, Eye, Check, X, Trash2, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { downloadCSV } from '@/lib/csv-export';
import RenewalDetailsDialog from './RenewalDetailsDialog';

interface Renewal {
  id: string;
  renewal_id: string;
  original_order_id: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  renewal_fee: number;
  payment_method: string | null;
  receipt_url: string | null;
  coupon_code: string | null;
  coupon_discount: number;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

const RenewalsTable = () => {
  const { isRTL, language } = useLanguage();
  const { toast } = useToast();
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [selectedRenewals, setSelectedRenewals] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRenewalDetails, setSelectedRenewalDetails] = useState<Renewal | null>(null);

  const dateLocale = language === 'ar' ? ar : enUS;

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('renewals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRenewals(data as Renewal[]);
    }
    setIsLoading(false);
  };

  const updateRenewalStatus = async (renewalId: string, status: 'confirmed' | 'rejected') => {
    const { error } = await supabase
      .from('renewals')
      .update({ status })
      .eq('id', renewalId);

    if (error) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: isRTL ? 'تم التحديث' : 'Updated',
        description: status === 'confirmed' 
          ? (isRTL ? 'تم تأكيد التجديد' : 'Renewal confirmed')
          : (isRTL ? 'تم رفض التجديد' : 'Renewal rejected'),
      });
      fetchRenewals();
    }
  };

  const toggleSelectRenewal = (renewalId: string) => {
    setSelectedRenewals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(renewalId)) {
        newSet.delete(renewalId);
      } else {
        newSet.add(renewalId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRenewals.size === filteredRenewals.length && filteredRenewals.length > 0) {
      setSelectedRenewals(new Set());
    } else {
      setSelectedRenewals(new Set(filteredRenewals.map(r => r.id)));
    }
  };

  const deleteSelectedRenewals = async () => {
    if (selectedRenewals.size === 0) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('renewals')
      .delete()
      .in('id', Array.from(selectedRenewals));

    if (error) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'خطأ في الحذف' : 'Delete Error',
        description: error.message,
      });
    } else {
      toast({
        title: isRTL ? 'تم الحذف' : 'Deleted',
        description: isRTL 
          ? `تم حذف ${selectedRenewals.size} تجديد(ات)` 
          : `${selectedRenewals.size} renewal(s) deleted`,
      });
      setSelectedRenewals(new Set());
      fetchRenewals();
    }
    setIsDeleting(false);
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      confirmed: { en: 'Confirmed', ar: 'مؤكد' },
      rejected: { en: 'Rejected', ar: 'مرفوض' },
    };
    return labels[status] ? (language === 'ar' ? labels[status].ar : labels[status].en) : status;
  };

  const filteredRenewals = renewals.filter(renewal => {
    const matchesSearch = renewal.renewal_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          renewal.original_order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          renewal.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          renewal.business_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || renewal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(price);
  };

  const handleExport = () => {
    const exportData = filteredRenewals.map(renewal => ({
      'Renewal ID': renewal.renewal_id,
      'Original Order ID': renewal.original_order_id,
      'Full Name': renewal.full_name,
      'Business Name': renewal.business_name,
      'Email': renewal.email,
      'Phone': renewal.phone,
      'WhatsApp': renewal.whatsapp,
      'Renewal Fee': renewal.renewal_fee,
      'Payment Method': renewal.payment_method || '',
      'Coupon Code': renewal.coupon_code || '',
      'Coupon Discount': renewal.coupon_discount,
      'Status': renewal.status,
      'Date': format(new Date(renewal.created_at), 'PP'),
    }));
    downloadCSV(exportData, 'renewals');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'التجديدات' : 'Renewals'}
          </h2>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'إدارة طلبات التجديد' : 'Manage renewal requests'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
        {isRTL && (
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم أو رقم التجديد..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-64 border-border pr-10 text-right" dir="rtl" />
          </div>
        )}
        <Button onClick={handleExport} className="gradient-bg hover:opacity-90">
          <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'التصدير إلى Excel' : 'Export Excel'}
        </Button>
        {selectedRenewals.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isRTL ? `حذف (${selectedRenewals.size})` : `Delete (${selectedRenewals.size})`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {isRTL 
                    ? `هل أنت متأكد من حذف ${selectedRenewals.size} تجديد(ات)؟ لا يمكن التراجع عن هذا الإجراء.`
                    : `Are you sure you want to delete ${selectedRenewals.size} renewal(s)? This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                <AlertDialogAction onClick={deleteSelectedRenewals} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isRTL ? 'حذف' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        </div>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {!isRTL && <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            placeholder={isRTL ? 'بحث بالاسم أو رقم التجديد...' : 'Search by name or renewal ID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? 'pr-10 text-right' : 'pl-10'}
          />
        </div>}
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="pending">{getStatusLabel('pending')}</SelectItem>
            <SelectItem value="confirmed">{getStatusLabel('confirmed')}</SelectItem>
            <SelectItem value="rejected">{getStatusLabel('rejected')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={filteredRenewals.length > 0 && selectedRenewals.size === filteredRenewals.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رقم التجديد' : 'Renewal ID'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الطلب الأصلي' : 'Original Order'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'العميل' : 'Client'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="animate-pulse">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
                </TableCell>
              </TableRow>
            ) : filteredRenewals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {isRTL ? 'لا توجد نتائج' : 'No results found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRenewals.map((renewal) => (
                <TableRow 
                  key={renewal.id}
                  className={selectedRenewals.has(renewal.id) ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedRenewals.has(renewal.id)}
                      onCheckedChange={() => toggleSelectRenewal(renewal.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{renewal.renewal_id}</TableCell>
                  <TableCell className="font-mono text-sm">{renewal.original_order_id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{renewal.full_name}</p>
                      <p className="text-sm text-muted-foreground">{renewal.business_name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(renewal.created_at), 'PP', { locale: dateLocale })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(renewal.status)}>
                      {getStatusLabel(renewal.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRenewalDetails(renewal)}
                        title={isRTL ? 'تفاصيل الطلب' : 'Order Details'}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {renewal.receipt_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReceipt(renewal.receipt_url)}
                          title={isRTL ? 'عرض الإيصال' : 'View Receipt'}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <a
                        href={`https://wa.me/${renewal.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" title="WhatsApp">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </Button>
                      </a>
                      {renewal.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateRenewalStatus(renewal.id, 'confirmed')}
                            title={isRTL ? 'تأكيد' : 'Confirm'}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateRenewalStatus(renewal.id, 'rejected')}
                            title={isRTL ? 'رفض' : 'Reject'}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Renewal Details Dialog */}
      <RenewalDetailsDialog
        open={!!selectedRenewalDetails}
        onOpenChange={() => setSelectedRenewalDetails(null)}
        renewal={selectedRenewalDetails}
      />

      {/* Receipt Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إيصال الدفع' : 'Payment Receipt'}</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <ReceiptImage value={selectedReceipt} className="w-full max-h-[65vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RenewalsTable;
