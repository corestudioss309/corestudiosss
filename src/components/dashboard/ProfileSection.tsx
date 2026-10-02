import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  whatsapp: string | null;
}

interface ProfileSectionProps {
  userId: string;
  userEmail: string;
}

const ProfileSection = ({ userId, userEmail }: ProfileSectionProps) => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    whatsapp: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
      });
    } else if (!error) {
      // Profile doesn't exist, create one
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ id: userId })
        .select()
        .single();
      
      if (newProfile) {
        setProfile(newProfile);
      }
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: isRTL ? 'تم الحفظ' : 'Saved',
        description: isRTL ? 'تم تحديث معلوماتك بنجاح' : 'Your profile has been updated',
      });
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <Card className="glass border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass border-border">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <User className="w-5 h-5" />
            {isRTL ? 'معلومات الحساب' : 'Profile Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Mail className="w-4 h-4" />
              {isRTL ? 'البريد الإلكتروني' : 'Email'}
            </Label>
            <Input 
              value={userEmail} 
              disabled 
              className={`bg-muted ${isRTL ? 'text-right' : ''}`}
            />
            <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <User className="w-4 h-4" />
              {isRTL ? 'الاسم الكامل' : 'Full Name'}
            </Label>
            <Input 
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className="w-4 h-4" />
              {isRTL ? 'رقم الهاتف' : 'Phone Number'}
            </Label>
            <Input 
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
              className={isRTL ? 'text-right' : ''}
              dir="ltr"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Phone className="w-4 h-4" />
              {isRTL ? 'رقم الواتساب' : 'WhatsApp Number'}
            </Label>
            <Input 
              value={formData.whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              placeholder={isRTL ? 'أدخل رقم الواتساب' : 'Enter your WhatsApp number'}
              className={isRTL ? 'text-right' : ''}
              dir="ltr"
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`w-full gradient-bg hover:opacity-90 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {isSaving ? (
              <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
            ) : (
              <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileSection;
