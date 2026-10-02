import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import RaysBackground from '@/components/RaysBackground';
import logoAsset from '@/assets/core-studio-wordlogo-white.svg';

const schema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(6).max(100) });

const WorkLogin = () => {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      toast({ variant: 'destructive', title: isRTL ? 'راجع البيانات' : 'Check your details', description: isRTL ? 'اكتب بريد إلكتروني وكلمة سر صحيحين.' : 'Enter a valid email and password.' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: result.data.email.toLowerCase(), password: result.data.password });
    setIsLoading(false);
    if (error) toast({ variant: 'destructive', title: isRTL ? 'تسجيل الدخول فشل' : 'Sign in failed', description: isRTL ? 'راجع بيانات الدخول وحاول تاني.' : 'Check your credentials and try again.' });
  };

  return <main className={`min-h-screen bg-background relative isolate overflow-hidden flex items-center justify-center p-4 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
    <RaysBackground />
    <div className="absolute top-4 end-4"><LanguageSwitcher /></div>
    <section className="w-full max-w-md border border-border bg-card p-8">
      <img src={logoAsset} alt="Core Studios" className="h-9 w-auto mx-auto mb-8" />
      <div className="mb-8 text-center"><p className="font-mono text-xs uppercase text-muted-foreground mb-2">{isRTL ? 'وصول الفريق' : 'Team access'}</p><h1 className="text-2xl font-bold">{isRTL ? 'لوحة العمل' : 'Work Dashboard'}</h1></div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="work-email">{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label><Input id="work-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={isRTL ? 'text-right' : ''} required /></div>
        <div className="space-y-2"><Label htmlFor="work-password">{isRTL ? 'كلمة السر' : 'Password'}</Label><Input id="work-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={isRTL ? 'text-right' : ''} required /></div>
        <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? '...' : isRTL ? 'دخول' : 'Sign in'}</Button>
      </form>
    </section>
  </main>;
};

export default WorkLogin;
