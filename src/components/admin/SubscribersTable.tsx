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
import { Search, Download, MessageCircle, Eye, AlertTriangle, RefreshCw, Calendar, Trash2, FileText, Ticket } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, differenceInDays } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { downloadCSV } from '@/lib/csv-export';

interface Order {
  id: string;
  order_id: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  subscription_status: string;
  project_status: string;
  website_status: string;
  start_date: string | null;
  renewal_date: string | null;
  receipt_url: string | null;
  created_at: string;
  payment_method: string | null;
  setup_fee: number;
  monthly_fee: number;
  custom_domain_addon: boolean;
  business_email_addon: boolean;
  addon_total: number;
  coupon_code: string | null;
  coupon_discount: number;
  website_requirements: string | null;
}

const SubscribersTable = () => {
  const { isRTL, language } = useLanguage();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [websiteFilter, setWebsiteFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  const dateLocale = language === 'ar' ? ar : enUS;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, field: string, value: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ [field]: value })
      .eq('id', orderId);

    if (error) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: isRTL ? 'تم التحديث' : 'Updated',
      });
      fetchOrders();
    }
  };

  const updateStartDate = async (orderId: string, date: Date | undefined) => {
    if (!date) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ start_date: date.toISOString() })
      .eq('id', orderId);

    if (error) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: isRTL ? 'تم تحديث تاريخ البدء' : 'Start date updated',
        description: isRTL ? 'سيتم حساب تاريخ التجديد تلقائياً' : 'Renewal date will be auto-calculated',
      });
      fetchOrders();
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
    }
  };

  const deleteSelectedOrders = async () => {
    if (selectedOrders.size === 0) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('orders')
      .delete()
      .in('id', Array.from(selectedOrders));

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
          ? `تم حذف ${selectedOrders.size} طلب(ات)` 
          : `${selectedOrders.size} order(s) deleted`,
      });
      setSelectedOrders(new Set());
      fetchOrders();
    }
    setIsDeleting(false);
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
      case 'renewed':
      case 'live':
      case 'delivered':
        return 'default';
      case 'pending':
      case 'received':
      case 'in_progress':
      case 'maintenance':
        return 'secondary';
      case 'expired':
      case 'suspended':
      case 'didnt_renew':
      case 'disabled':
      case 'paused':
      case 'fake_order':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      active: { en: 'Active', ar: 'نشط' },
      suspended: { en: 'Suspended', ar: 'معلق' },
      expired: { en: 'Expired', ar: 'منتهي' },
      renewed: { en: 'Renewed', ar: 'مجدد' },
      didnt_renew: { en: "Didn't Renew", ar: 'لم يجدد' },
      fake_order: { en: 'Fake Order', ar: 'طلب وهمي' },
      received: { en: 'Received', ar: 'مستلم' },
      in_progress: { en: 'In Progress', ar: 'قيد التنفيذ' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' },
      live: { en: 'Live', ar: 'مباشر' },
      disabled: { en: 'Disabled', ar: 'معطل' },
      maintenance: { en: 'Maintenance', ar: 'صيانة' },
      paused: { en: 'Paused', ar: 'متوقف' },
    };
    return labels[status] ? (language === 'ar' ? labels[status].ar : labels[status].en) : status;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.business_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubscription = subscriptionFilter === 'all' || order.subscription_status === subscriptionFilter;
    const matchesProject = projectFilter === 'all' || order.project_status === projectFilter;
    const matchesWebsite = websiteFilter === 'all' || order.website_status === websiteFilter;
    return matchesSearch && matchesSubscription && matchesProject && matchesWebsite;
  });

  const handleExport = () => {
    const exportData = filteredOrders.map(order => ({
      'Order ID': order.order_id,
      'Full Name': order.full_name,
      'Business Name': order.business_name,
      'Email': order.email,
      'Phone': order.phone,
      'WhatsApp': order.whatsapp,
      'Subscription Status': order.subscription_status,
      'Project Status': order.project_status,
      'Website Status': order.website_status,
      'Start Date': order.start_date ? format(new Date(order.start_date), 'PP') : '',
      'Renewal Date': order.renewal_date ? format(new Date(order.renewal_date), 'PP') : '',
      'Payment Method': order.payment_method || '',
      'Setup Fee': order.setup_fee,
      'Monthly Fee': order.monthly_fee,
      'Add-ons Total': order.addon_total,
    }));
    downloadCSV(exportData, 'subscribers');
  };

  const isRenewalSoon = (renewalDate: string | null): boolean => {
    if (!renewalDate) return false;
    const days = differenceInDays(new Date(renewalDate), new Date());
    return days <= 7 && days >= 0;
  };

  const isExpired = (renewalDate: string | null): boolean => {
    if (!renewalDate) return false;
    return differenceInDays(new Date(renewalDate), new Date()) < 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'المشتركين' : 'Subscribers'}
          </h2>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'إدارة جميع الاشتراكات' : 'Manage all subscriptions'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
        {isRTL && (
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم أو رقم الطلب..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-64 border-border pr-10 text-right" dir="rtl" />
          </div>
        )}
        <Button onClick={handleExport} className="gradient-bg hover:opacity-90">
          <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'التصدير إلى Excel' : 'Export Excel'}
        </Button>
        {selectedOrders.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isRTL ? `حذف (${selectedOrders.size})` : `Delete (${selectedOrders.size})`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
                <AlertDialogDescription>
                  {isRTL 
                    ? `هل أنت متأكد من حذف ${selectedOrders.size} طلب(ات)؟ لا يمكن التراجع عن هذا الإجراء.`
                    : `Are you sure you want to delete ${selectedOrders.size} order(s)? This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                <AlertDialogAction onClick={deleteSelectedOrders} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
            placeholder={isRTL ? 'بحث بالاسم أو رقم الطلب...' : 'Search by name or order ID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? 'pr-10 text-right' : 'pl-10'}
          />
        </div>}
        
        <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={isRTL ? 'حالة الاشتراك' : 'Subscription'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="pending">{getStatusLabel('pending')}</SelectItem>
            <SelectItem value="active">{getStatusLabel('active')}</SelectItem>
            <SelectItem value="renewed">{getStatusLabel('renewed')}</SelectItem>
            <SelectItem value="expired">{getStatusLabel('expired')}</SelectItem>
            <SelectItem value="didnt_renew">{getStatusLabel('didnt_renew')}</SelectItem>
            <SelectItem value="suspended">{getStatusLabel('suspended')}</SelectItem>
            <SelectItem value="fake_order">{getStatusLabel('fake_order')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={isRTL ? 'حالة المشروع' : 'Project'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="received">{getStatusLabel('received')}</SelectItem>
            <SelectItem value="in_progress">{getStatusLabel('in_progress')}</SelectItem>
            <SelectItem value="delivered">{getStatusLabel('delivered')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={isRTL ? 'حالة الموقع' : 'Website'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="live">{getStatusLabel('live')}</SelectItem>
            <SelectItem value="disabled">{getStatusLabel('disabled')}</SelectItem>
            <SelectItem value="maintenance">{getStatusLabel('maintenance')}</SelectItem>
            <SelectItem value="paused">{getStatusLabel('paused')}</SelectItem>
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
                  checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رقم الطلب' : 'Order ID'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'العميل' : 'Client'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النشاط' : 'Business'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ الطلب' : 'Order Date'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاشتراك' : 'Subscription'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المشروع' : 'Project'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموقع' : 'Website'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ البدء' : 'Start Date'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التجديد' : 'Renewal'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  <div className="animate-pulse">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  {isRTL ? 'لا توجد نتائج' : 'No results found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  className={`${selectedOrders.has(order.id) ? 'bg-muted/50' : ''} ${isRenewalSoon(order.renewal_date) ? 'bg-yellow-500/10' : ''} ${isExpired(order.renewal_date) ? 'bg-destructive/10' : ''}`}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => toggleSelectOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{order.order_id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.business_name}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(order.created_at), 'PP', { locale: dateLocale })}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.subscription_status}
                      onValueChange={(value) => updateOrderStatus(order.id, 'subscription_status', value)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <Badge variant={getStatusVariant(order.subscription_status)} className="text-xs">
                          {getStatusLabel(order.subscription_status)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{getStatusLabel('pending')}</SelectItem>
                        <SelectItem value="active">{getStatusLabel('active')}</SelectItem>
                        <SelectItem value="renewed">{getStatusLabel('renewed')}</SelectItem>
                        <SelectItem value="expired">{getStatusLabel('expired')}</SelectItem>
                        <SelectItem value="didnt_renew">{getStatusLabel('didnt_renew')}</SelectItem>
                        <SelectItem value="suspended">{getStatusLabel('suspended')}</SelectItem>
                        <SelectItem value="fake_order">{getStatusLabel('fake_order')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.project_status}
                      onValueChange={(value) => updateOrderStatus(order.id, 'project_status', value)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <Badge variant={getStatusVariant(order.project_status)} className="text-xs">
                          {getStatusLabel(order.project_status)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">{getStatusLabel('received')}</SelectItem>
                        <SelectItem value="in_progress">{getStatusLabel('in_progress')}</SelectItem>
                        <SelectItem value="delivered">{getStatusLabel('delivered')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.website_status}
                      onValueChange={(value) => updateOrderStatus(order.id, 'website_status', value)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <Badge variant={getStatusVariant(order.website_status)} className="text-xs">
                          {getStatusLabel(order.website_status)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">{getStatusLabel('live')}</SelectItem>
                        <SelectItem value="disabled">{getStatusLabel('disabled')}</SelectItem>
                        <SelectItem value="maintenance">{getStatusLabel('maintenance')}</SelectItem>
                        <SelectItem value="paused">{getStatusLabel('paused')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 justify-start text-left font-normal ${!order.start_date ? 'text-muted-foreground' : ''}`}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {order.start_date 
                            ? format(new Date(order.start_date), 'PP', { locale: dateLocale })
                            : (isRTL ? 'تحديد التاريخ' : 'Set date')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={order.start_date ? new Date(order.start_date) : undefined}
                          onSelect={(date) => updateStartDate(order.id, date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    {order.renewal_date ? (
                      <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {isRenewalSoon(order.renewal_date) && <RefreshCw className="w-4 h-4 text-yellow-500" />}
                        {isExpired(order.renewal_date) && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        <span className="text-sm">
                          {format(new Date(order.renewal_date), 'PP', { locale: dateLocale })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrderDetails(order)}
                        title={isRTL ? 'تفاصيل الطلب' : 'Order Details'}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {order.receipt_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReceipt(order.receipt_url)}
                          title={isRTL ? 'الإيصال' : 'Receipt'}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`https://wa.me/${order.whatsapp.replace(/\D/g, '')}`, '_blank')}
                        title={isRTL ? 'واتساب' : 'WhatsApp'}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Receipt Preview Modal */}
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

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrderDetails} onOpenChange={() => setSelectedOrderDetails(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FileText className="w-5 h-5" />
              {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedOrderDetails && (
            <div className="space-y-4">
              {/* Order Info */}
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{isRTL ? 'رقم الطلب' : 'Order ID'}</span>
                <span className="font-mono font-medium">{selectedOrderDetails.order_id}</span>
              </div>
              
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{isRTL ? 'العميل' : 'Client'}</span>
                <span className="font-medium">{selectedOrderDetails.full_name}</span>
              </div>

              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{isRTL ? 'المشروع' : 'Business'}</span>
                <span>{selectedOrderDetails.business_name}</span>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className={`font-medium ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'تفاصيل السعر' : 'Price Breakdown'}
                </h4>

                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">{isRTL ? 'رسوم الإعداد' : 'Setup Fee'}</span>
                  <span>{selectedOrderDetails.setup_fee.toLocaleString()} EGP</span>
                </div>

                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">{isRTL ? 'الرسوم الشهرية' : 'Monthly Fee'}</span>
                  <span>{selectedOrderDetails.monthly_fee.toLocaleString()} EGP</span>
                </div>

                {selectedOrderDetails.addon_total > 0 && (
                  <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-muted-foreground">{isRTL ? 'الإضافات' : 'Add-ons'}</span>
                    <span>{selectedOrderDetails.addon_total.toLocaleString()} EGP</span>
                  </div>
                )}

                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span>{(selectedOrderDetails.setup_fee + selectedOrderDetails.addon_total).toLocaleString()} EGP</span>
                </div>

                {/* Coupon Section */}
                {selectedOrderDetails.coupon_code && selectedOrderDetails.coupon_discount > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Ticket className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">{isRTL ? 'كود الخصم' : 'Coupon'}</span>
                        </div>
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedOrderDetails.coupon_code}</span>
                      </div>
                      <div className={`flex items-center justify-between text-sm text-primary mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span>{isRTL ? 'الخصم' : 'Discount'}</span>
                        <span>-{selectedOrderDetails.coupon_discount.toLocaleString()} EGP</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="border-t pt-3">
                  <div className={`flex items-center justify-between font-bold text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{isRTL ? 'الإجمالي النهائي' : 'Final Total'}</span>
                    <span className="text-primary">
                      {(selectedOrderDetails.setup_fee + selectedOrderDetails.addon_total - (selectedOrderDetails.coupon_discount || 0)).toLocaleString()} EGP
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className={`flex items-center justify-between pt-2 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{isRTL ? 'طريقة الدفع' : 'Payment'}</span>
                <span>{selectedOrderDetails.payment_method || (isRTL ? 'غير محدد' : 'Not specified')}</span>
              </div>

              {/* Website Requirements */}
              {selectedOrderDetails.website_requirements && (
                <div className="pt-4 border-t space-y-2">
                  <h4 className={`font-medium ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'تعديلات / متطلبات الموقع' : 'Website Edits / Requirements'}
                  </h4>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                    {selectedOrderDetails.website_requirements}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscribersTable;
