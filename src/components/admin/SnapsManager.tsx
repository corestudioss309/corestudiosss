import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Trash2, Upload, Image, RefreshCw } from 'lucide-react';

interface Snap {
  id: string;
  title: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const SnapsManager = () => {
  const { isRTL } = useLanguage();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const replaceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchSnaps();
  }, []);

  const fetchSnaps = async () => {
    const { data, error } = await supabase
      .from('snaps')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error(isRTL ? 'فشل تحميل الصور' : 'Failed to load snaps');
    } else {
      setSnaps(data || []);
    }
    setIsLoading(false);
  };

  const uploadFileToStorage = async (file: Blob, fileName: string) => {
    const { error: uploadError } = await supabase.storage
      .from('snaps')
      .upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('snaps')
      .getPublicUrl(fileName);
    return publicUrl;
  };


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const publicUrl = await uploadFileToStorage(file, fileName);

        const { error } = await supabase.from('snaps').insert({
          title: '',
          image_url: publicUrl,
          display_order: snaps.length,
          is_active: true,
        });
        if (error) throw error;
      }
      toast.success(isRTL ? 'تم رفع العمل بنجاح' : 'Work uploaded successfully');
      fetchSnaps();
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'فشل رفع الصورة' : 'Failed to upload'));
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleReplace = async (snap: Snap, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Delete old file from storage
      const urlParts = snap.image_url.split('/snaps/');
      if (urlParts.length > 1) {
        await supabase.storage.from('snaps').remove([decodeURIComponent(urlParts[1])]);
      }

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const publicUrl = await uploadFileToStorage(file, fileName);

      const { error } = await supabase
        .from('snaps')
        .update({ image_url: publicUrl })
        .eq('id', snap.id);
      if (error) throw error;

      toast.success(isRTL ? 'تم تغيير الصورة' : 'Image replaced successfully');
      fetchSnaps();
    } catch (error: any) {
      toast.error(error.message || (isRTL ? 'فشل تغيير الصورة' : 'Failed to replace image'));
    }
    e.target.value = '';
  };

  const handleDelete = async (snap: Snap) => {
    const urlParts = snap.image_url.split('/snaps/');
    if (urlParts.length > 1) {
      await supabase.storage.from('snaps').remove([decodeURIComponent(urlParts[1])]);
    }

    const { error } = await supabase.from('snaps').delete().eq('id', snap.id);
    if (error) {
      toast.error(isRTL ? 'فشل حذف الصورة' : 'Failed to delete snap');
    } else {
      toast.success(isRTL ? 'تم حذف العمل' : 'Work deleted');
      fetchSnaps();
    }
  };

  const handleToggleActive = async (snap: Snap) => {
    const { error } = await supabase
      .from('snaps')
      .update({ is_active: !snap.is_active })
      .eq('id', snap.id);

    if (error) {
      toast.error(isRTL ? 'فشل التحديث' : 'Failed to update');
    } else {
      fetchSnaps();
    }
  };

  const handleTitleChange = async (snap: Snap, newTitle: string) => {
    const { error } = await supabase
      .from('snaps')
      .update({ title: newTitle })
      .eq('id', snap.id);
    if (error) {
      toast.error(isRTL ? 'فشل التحديث' : 'Failed to update');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? 'إدارة الأعمال' : 'Portfolio Manager'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'أضف وعدّل أعمالك' : 'Add and manage your portfolio'}
          </p>
        </div>
        <div className="flex gap-2">
          <Label htmlFor="snap-upload" className="cursor-pointer">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
              <Upload className="w-4 h-4" />
              {uploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'رفع عمل' : 'Upload Work')}
            </div>
          </Label>
          <Input
            id="snap-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      </div>

      {snaps.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <Image className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            {isRTL ? 'لا توجد أعمال بعد. ارفع أعمال جديدة.' : 'No work yet. Upload new work.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {snaps.map((snap) => (
            <Card key={snap.id} className="overflow-hidden">
              <div className="relative aspect-[4/5]">
                <img
                  src={snap.image_url}
                  alt={snap.title || 'Snap'}
                  className="w-full h-full object-cover"
                />
                {!snap.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium px-3 py-1 bg-black/50 rounded">
                      {isRTL ? 'مخفي' : 'Hidden'}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <Input
                  placeholder={isRTL ? 'عنوان (اختياري)' : 'Title (optional)'}
                  defaultValue={snap.title}
                  onBlur={(e) => handleTitleChange(snap, e.target.value)}
                />
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Switch
                      checked={snap.is_active}
                      onCheckedChange={() => handleToggleActive(snap)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {snap.is_active ? (isRTL ? 'ظاهر' : 'Visible') : (isRTL ? 'مخفي' : 'Hidden')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => replaceInputRefs.current[snap.id]?.click()}
                      title={isRTL ? 'تغيير الصورة' : 'Replace image'}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <input
                      ref={(el) => { replaceInputRefs.current[snap.id] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleReplace(snap, e)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(snap)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SnapsManager;
