import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star, Save, X } from 'lucide-react';

interface Review {
  id: string;
  name_en: string;
  name_ar: string;
  role_en: string;
  role_ar: string;
  review_en: string;
  review_ar: string;
  rating: number;
  display_order: number;
  is_active: boolean;
}

const emptyReview = {
  name_en: '', name_ar: '', role_en: '', role_ar: '',
  review_en: '', review_ar: '', rating: 5, display_order: 0, is_active: true,
};

const ReviewsManager = () => {
  const { isRTL } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyReview);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setReviews(data as unknown as Review[]);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSave = async () => {
    if (!form.name_en || !form.review_en) {
      toast.error(isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('reviews')
        .update(form as any)
        .eq('id', editingId);
      if (error) { toast.error(error.message); return; }
      toast.success(isRTL ? 'تم التعديل' : 'Review updated');
    } else {
      const { error } = await supabase
        .from('reviews')
        .insert({ ...form, display_order: reviews.length + 1 } as any);
      if (error) { toast.error(error.message); return; }
      toast.success(isRTL ? 'تمت الإضافة' : 'Review added');
    }

    setEditingId(null);
    setShowAdd(false);
    setForm(emptyReview);
    fetchReviews();
  };

  const handleEdit = (review: Review) => {
    setForm({
      name_en: review.name_en, name_ar: review.name_ar,
      role_en: review.role_en, role_ar: review.role_ar,
      review_en: review.review_en, review_ar: review.review_ar,
      rating: review.rating, display_order: review.display_order, is_active: review.is_active,
    });
    setEditingId(review.id);
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(isRTL ? 'تم الحذف' : 'Review deleted');
    fetchReviews();
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAdd(false);
    setForm(emptyReview);
  };

  const StarSelector = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star className={`w-6 h-6 cursor-pointer transition-colors ${s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
        </button>
      ))}
    </div>
  );

  if (loading) return <div className="text-center py-8">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'إدارة التقييمات' : 'Reviews Manager'}</h2>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'أضف وعدّل تقييمات العملاء' : 'Add and manage customer reviews'}
          </p>
        </div>
        {!showAdd && (
          <Button onClick={() => { setShowAdd(true); setForm(emptyReview); }}>
            <Plus className="w-4 h-4 mr-2" />
            {isRTL ? 'إضافة تقييم' : 'Add Review'}
          </Button>
        )}
      </div>

      {showAdd && (
        <Card className="p-6 space-y-4 border-primary/30">
          <h3 className="font-semibold text-lg">
            {editingId ? (isRTL ? 'تعديل التقييم' : 'Edit Review') : (isRTL ? 'تقييم جديد' : 'New Review')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Name (English) *</label>
              <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder="e.g. Ahmed Mansour" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم العميل (عربي) *</label>
              <Input dir="rtl" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="مثال: أحمد منصور" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role (English) *</label>
              <Input value={form.role_en} onChange={(e) => setForm({ ...form, role_en: e.target.value })} placeholder="e.g. CEO at Company" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">المنصب (عربي) *</label>
              <Input dir="rtl" value={form.role_ar} onChange={(e) => setForm({ ...form, role_ar: e.target.value })} placeholder="مثال: الرئيس التنفيذي" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Review (English) *</label>
              <Textarea value={form.review_en} onChange={(e) => setForm({ ...form, review_en: e.target.value })} placeholder="Write the review in English..." rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">التقييم (عربي) *</label>
              <Textarea dir="rtl" value={form.review_ar} onChange={(e) => setForm({ ...form, review_ar: e.target.value })} placeholder="اكتب التقييم بالعربي..." rows={3} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{isRTL ? 'التقييم بالنجوم' : 'Star Rating'}</label>
            <StarSelector value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{review.name_en}</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-semibold" dir="rtl">{review.name_ar}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{review.role_en} | {review.role_ar}</p>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">"{review.review_en}"</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="icon" variant="outline" onClick={() => handleEdit(review)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(review.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewsManager;
