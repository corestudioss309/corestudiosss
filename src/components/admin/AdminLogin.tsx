import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RaysBackground from '@/components/RaysBackground';
import logoAsset from '@/assets/core-studio-wordlogo-white.svg';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

const AdminLogin = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0]?.message || 'Please check your inputs',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative isolate overflow-hidden">
      <RaysBackground />
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 gradient-border">
          <div className="text-center mb-8">
            <img src={logoAsset} alt="Core Studios" className="h-9 w-auto mx-auto mb-6" />
            <h1 className={`text-2xl font-bold gradient-text ${isRTL ? 'font-cairo' : 'font-sans'}`}>
              {t('admin.login')}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className={isRTL ? 'block text-right' : ''}>
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={isRTL ? 'block text-right' : ''}>
                {t('admin.password')}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className={`bg-muted border-border ${isRTL ? 'text-right' : ''}`}
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-bg hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? '...' : t('admin.signIn')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
