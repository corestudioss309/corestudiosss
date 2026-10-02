import { useState, useEffect, forwardRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import RaysBackground from '@/components/RaysBackground';
import { useLanguage } from '@/contexts/LanguageContext';

const Admin = forwardRef<HTMLDivElement>((_, ref) => {
  const { isRTL } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin role after state update
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!error && !!data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div ref={ref} className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !session) {
    return (
      <div ref={ref}>
        <AdminLogin />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        ref={ref}
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`relative min-h-screen bg-background overflow-hidden flex items-center justify-center ${isRTL ? 'font-cairo' : ''}`}
      >
        {/* backdrop */}
        <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
          <RaysBackground />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* square mark */}
          <div className="relative h-16 w-16 border border-border mb-10" aria-hidden="true">
            <span className="absolute inset-[18px] border border-muted-foreground/40" />
          </div>

          <p className="font-mono text-[11px] tracking-[0.35em] text-muted-foreground uppercase mb-4">
            {isRTL ? 'خطأ ٤٠٤' : 'Error 404'}
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            {isRTL ? 'الصفحة غير متوفرة' : 'Page not found'}
          </h1>

          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-10">
            {isRTL
              ? 'الصفحة اللي بتدوّر عليها مش موجودة أو مش متاحة ليك.'
              : "The page you're looking for doesn't exist or isn't available to you."}
          </p>

          <button
            onClick={() => supabase.auth.signOut()}
            className="border border-border px-8 py-3 font-mono text-xs tracking-[0.2em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
});

Admin.displayName = 'Admin';

export default Admin;
