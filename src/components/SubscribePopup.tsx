import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

interface SubscribePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const subscribeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  phone: z.string().trim().min(1, 'Phone is required').max(20),
  whatsapp: z.string().trim().min(1, 'WhatsApp is required').max(20),
  businessType: z.string().trim().min(1, 'Business type is required').max(200),
});

const SubscribePopup = ({ isOpen, onClose }: SubscribePopupProps) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    businessType: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = subscribeSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0]?.message || 'Please check your inputs',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('interested_leads').insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      business_type: formData.businessType.trim(),
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: t('popup.success'),
      });
      setFormData({ name: '', email: '', phone: '', whatsapp: '', businessType: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-border max-w-md">
        <DialogHeader>
          <DialogTitle className={`text-2xl gradient-text ${isRTL ? 'font-cairo text-right' : 'font-sans'}`}>
            {t('popup.title')}
          </DialogTitle>
          <DialogDescription className={isRTL ? 'text-right' : ''}>
            {t('popup.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={isRTL ? 'block text-right' : ''}>
              {t('popup.name')} *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={isRTL ? 'block text-right' : ''}>
              {t('popup.email')} *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className={isRTL ? 'block text-right' : ''}>
              {t('popup.phone')} *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className={isRTL ? 'block text-right' : ''}>
              {t('popup.whatsapp')} *
            </Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={handleChange}
              required
              className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType" className={isRTL ? 'block text-right' : ''}>
              {t('popup.businessType')} *
            </Label>
            <Input
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-bg hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? '...' : t('popup.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscribePopup;
