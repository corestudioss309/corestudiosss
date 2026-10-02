import { forwardRef, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import WorkLogin from '@/components/work/WorkLogin';
import WorkDashboard from '@/components/work/WorkDashboard';
import { useLanguage } from '@/contexts/LanguageContext';

type AccessRole = 'admin' | 'viewer' | null;

const Work = forwardRef<HTMLDivElement>((_, ref) => {
  const { isRTL } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AccessRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const checkRole = async (userId: string) => {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).in('role', ['admin', 'viewer']);
      if (!active) return;
      const roles = data?.map((item) => item.role) ?? [];
      setRole(roles.includes('admin') ? 'admin' : roles.includes('viewer') ? 'viewer' : null);
      setLoading(false);
    };

    const applySession = (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) void checkRole(nextSession.user.id);
      else { setRole(null); setLoading(false); }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => applySession(nextSession), 0);
    });
    void supabase.auth.getSession().then(({ data }) => applySession(data.session));
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  if (loading) return <div ref={ref} className="min-h-screen bg-background flex items-center justify-center"><div className="size-8 animate-spin border-2 border-muted border-t-foreground" /></div>;
  if (!user || !session) return <div ref={ref}><WorkLogin /></div>;
  if (!role) return <div ref={ref} className={`min-h-screen bg-background flex items-center justify-center p-6 ${isRTL ? 'font-cairo' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}><div className="max-w-md text-center"><p className="mb-2 font-mono text-xs uppercase text-muted-foreground">403</p><h1 className="mb-3 text-2xl font-bold">{isRTL ? 'الدخول غير متاح' : 'Access Denied'}</h1><p className="mb-6 text-muted-foreground">{isRTL ? 'الحساب ده مش مضاف لفريق العمل.' : 'This account has not been added to the work team.'}</p><Button variant="outline" onClick={() => supabase.auth.signOut()}>{isRTL ? 'تسجيل الخروج' : 'Sign Out'}</Button></div></div>;
  return <div ref={ref}><WorkDashboard /></div>;
});

Work.displayName = 'Work';
export default Work;
