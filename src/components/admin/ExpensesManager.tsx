import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  notes: string | null;
}

const CATEGORIES = [
  { id: 'subscription', en: 'Subscription / Tools', ar: 'اشتراكات وأدوات' },
  { id: 'ads', en: 'Ads', ar: 'إعلانات' },
  { id: 'salary', en: 'Salaries', ar: 'مرتبات' },
  { id: 'other', en: 'Other', ar: 'أخرى' },
];

const ExpensesManager = () => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<Expense[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('subscription');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
    setItems((data as Expense[]) || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    const value = parseInt(amount, 10);
    if (!title.trim() || !value || value <= 0) {
      toast({ title: isRTL ? 'اكتب اسم المصروف والمبلغ' : 'Enter a name and amount', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('expenses').insert({
      title: title.trim(), category, amount: value, expense_date: date, notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: isRTL ? 'حصل خطأ' : 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setTitle(''); setAmount(''); setNotes('');
    toast({ title: isRTL ? 'تم إضافة المصروف' : 'Expense added' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(isRTL ? 'متأكد إنك عايز تحذف المصروف؟' : 'Delete this expense?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    toast({ title: isRTL ? 'تم حذف المصروف' : 'Expense deleted' });
    load();
  };

  const catLabel = (id: string) => {
    const c = CATEGORIES.find((x) => x.id === id);
    return c ? (isRTL ? c.ar : c.en) : id;
  };
  const total = items.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-2xl font-bold">{isRTL ? 'المصروفات' : 'Expenses'}</h2>
        <p className="text-muted-foreground">
          {isRTL ? 'سجّل أي حاجة دفعت فيها: اشتراكات، أدوات، إعلانات وغيرها' : 'Track everything you pay for: subscriptions, tools, ads and more'}
        </p>
      </div>

      <Card className="glass border-border">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder={isRTL ? 'اسم المصروف (مثلاً Claude)' : 'Name (e.g. Claude)'} value={title} onChange={(e) => setTitle(e.target.value)} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{isRTL ? c.ar : c.en}</option>)}
          </select>
          <Input type="number" min={1} placeholder={isRTL ? 'المبلغ (جنيه)' : 'Amount (EGP)'} value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button onClick={add} disabled={saving} className="gradient-bg hover:opacity-90">
            <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة' : 'Add'}
          </Button>
          <Input className="md:col-span-5" placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        {isRTL ? 'إجمالي المصروفات:' : 'Total expenses:'} <span className="text-foreground font-bold">{total.toLocaleString()} EGP</span>
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="p-3 text-start">{isRTL ? 'التاريخ' : 'Date'}</th>
              <th className="p-3 text-start">{isRTL ? 'الاسم' : 'Name'}</th>
              <th className="p-3 text-start">{isRTL ? 'النوع' : 'Category'}</th>
              <th className="p-3 text-start">{isRTL ? 'المبلغ' : 'Amount'}</th>
              <th className="p-3 text-start">{isRTL ? 'ملاحظات' : 'Notes'}</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">{isRTL ? 'لا توجد مصروفات بعد.' : 'No expenses yet.'}</td></tr>
            )}
            {items.map((e) => (
              <tr key={e.id} className="border-b border-border">
                <td className="p-3">{e.expense_date}</td>
                <td className="p-3">{e.title}</td>
                <td className="p-3">{catLabel(e.category)}</td>
                <td className="p-3 font-bold">{e.amount.toLocaleString()} EGP</td>
                <td className="p-3 text-muted-foreground">{e.notes}</td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" onClick={() => remove(e.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesManager;
