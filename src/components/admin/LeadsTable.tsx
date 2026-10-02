import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, Phone, Trash2, CheckCircle, Archive } from 'lucide-react';
import { downloadCSV } from '@/lib/csv-export';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  message: string;
  status: string;
  created_at: string;
}

const LeadsTable = () => {
  const { t, isRTL, language } = useLanguage();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive',
      });
    } else {
      setLeads(data || []);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } else {
      setLeads(leads.map(lead => 
        lead.id === id ? { ...lead, status } : lead
      ));
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    }
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
    } else {
      setLeads(leads.filter(lead => lead.id !== id));
      toast({
        title: 'Success',
        description: 'Lead deleted successfully',
      });
    }
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  const deleteSelectedLeads = async () => {
    if (selectedLeads.size === 0) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', Array.from(selectedLeads));

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
          ? `تم حذف ${selectedLeads.size} عميل(ات) محتمل` 
          : `${selectedLeads.size} lead(s) deleted`,
      });
      setSelectedLeads(new Set());
      fetchLeads();
    }
    setIsDeleting(false);
  };

  const exportToCSV = () => {
    const exportData = leads.map(lead => ({
      [t('admin.name')]: lead.full_name,
      [t('admin.email')]: lead.email,
      [t('admin.phone')]: lead.phone,
      [t('admin.whatsapp')]: lead.whatsapp,
      [t('admin.message')]: lead.message,
      [t('admin.status')]: lead.status,
      [t('admin.date')]: new Date(lead.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
    }));

    downloadCSV(exportData, `leads_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredLeads = leads.filter(lead =>
    lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.phone.includes(searchQuery) ||
    lead.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      new: 'default',
      contacted: 'secondary',
      archived: 'outline',
    };
    const labels: Record<string, string> = {
      new: t('admin.new'),
      contacted: t('admin.contacted'),
      archived: t('admin.archived'),
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isRTL ? 'font-cairo' : 'font-sans'}`}>
            {t('admin.leads')}
          </h1>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'إدارة الطلبات الواردة من الموقع' : 'Manage incoming requests from the site'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={isRTL ? 'بحث...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full sm:w-64 border-border ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          <Button onClick={exportToCSV} className="gradient-bg hover:opacity-90">
            <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('admin.exportExcel')}
          </Button>
          
          {selectedLeads.size > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                  {isRTL ? `حذف (${selectedLeads.size})` : `Delete (${selectedLeads.size})`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL 
                      ? `هل أنت متأكد من حذف ${selectedLeads.size} عميل(ات) محتمل؟ لا يمكن التراجع عن هذا الإجراء.`
                      : `Are you sure you want to delete ${selectedLeads.size} lead(s)? This action cannot be undone.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                  <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteSelectedLeads} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isRTL ? 'حذف' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="glass rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{t('admin.name')}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{t('admin.email')}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{t('admin.phone')}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{t('admin.whatsapp')}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{t('admin.message')}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{t('admin.status')}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{t('admin.date')}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow 
                  key={lead.id}
                  className={selectedLeads.has(lead.id) ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={() => toggleSelectLead(lead.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{lead.full_name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>
                    <a
                      href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-500 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {lead.whatsapp}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={lead.message}>
                    {lead.message}
                  </TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell>{formatDate(lead.created_at)}</TableCell>
                  <TableCell>
                    <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {lead.status !== 'contacted' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatus(lead.id, 'contacted')}
                          title={t('admin.markContacted')}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {lead.status !== 'archived' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatus(lead.id, 'archived')}
                          title={t('admin.archive')}
                        >
                          <Archive className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLead(lead.id)}
                        title={t('admin.delete')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeadsTable;
