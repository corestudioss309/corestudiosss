import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, UserPlus, Clock, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface AnalyticsData {
  totalSubscribers: number;
  activeSubscribers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalLeads: number;
  convertedLeads: number;
  recentOrders: { date: string; count: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
}

const AnalyticsDashboard = () => {
  const { isRTL, language } = useLanguage();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dateLocale = language === 'ar' ? ar : enUS;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);

    // Fetch orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*');

    // Fetch leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*');

    // Fetch confirmed renewals
    const { data: renewals } = await supabase
      .from('renewals')
      .select('*')
      .eq('status', 'confirmed');

    if (orders && leads) {
      const confirmedRenewals = renewals || [];
      
      // Calculate metrics
      const totalSubscribers = orders.length;
      const activeSubscribers = orders.filter(o => 
        o.subscription_status === 'active' || o.subscription_status === 'renewed'
      ).length;
      
      // Revenue calculation: orders (setup + addons - coupon) + renewals (fee - coupon)
      const orderRevenue = orders.reduce((sum, o) => {
        const setupFee = o.setup_fee || 0;
        const addonTotal = o.addon_total || 0;
        const couponDiscount = o.coupon_discount || 0;
        return sum + setupFee + addonTotal - couponDiscount;
      }, 0);

      const renewalRevenue = confirmedRenewals.reduce((sum, r) => {
        return sum + (r.renewal_fee || 0) - (r.coupon_discount || 0);
      }, 0);

      const totalRevenue = orderRevenue + renewalRevenue;

      // Monthly revenue: for each active/renewed subscriber, use their latest renewal amount if exists, otherwise monthly_fee
      const monthlyRevenue = orders
        .filter(o => o.subscription_status === 'active' || o.subscription_status === 'renewed')
        .reduce((sum, o) => {
          // Check if there's a confirmed renewal for this order
          const latestRenewal = confirmedRenewals
            .filter(r => r.original_order_id === o.order_id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          
          if (latestRenewal) {
            return sum + (latestRenewal.renewal_fee - latestRenewal.coupon_discount);
          }
          return sum + (o.monthly_fee || 0);
        }, 0);

      // Lead metrics
      const totalLeads = leads.length;
      const convertedLeads = leads.filter(l => l.status === 'contacted').length;

      // Orders by day (last 14 days)
      const last14Days = eachDayOfInterval({
        start: subDays(new Date(), 13),
        end: new Date(),
      });

      const recentOrders = last14Days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const count = orders.filter(o => 
          format(parseISO(o.created_at), 'yyyy-MM-dd') === dateStr
        ).length;
        return {
          date: format(day, 'MMM dd', { locale: dateLocale }),
          count,
        };
      });

      // Status breakdown
      const statusCounts: Record<string, number> = {};
      orders.forEach(o => {
        statusCounts[o.subscription_status] = (statusCounts[o.subscription_status] || 0) + 1;
      });

      const statusColors: Record<string, string> = {
        active: 'hsl(var(--primary))',
        renewed: 'hsl(var(--mono-300))',
        pending: 'hsl(var(--mono-400))',
        expired: 'hsl(var(--mono-600))',
        suspended: 'hsl(var(--mono-700))',
        didnt_renew: 'hsl(var(--mono-500))',
        fake_order: 'hsl(var(--mono-800))',
      };

      const statusBreakdown = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || 'hsl(var(--muted))',
      }));

      setAnalytics({
        totalSubscribers,
        activeSubscribers,
        totalRevenue,
        monthlyRevenue,
        totalLeads,
        convertedLeads,
        recentOrders,
        statusBreakdown,
      });
    }

    setIsLoading(false);
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      active: { en: 'Active', ar: 'نشط' },
      suspended: { en: 'Suspended', ar: 'معلق' },
      expired: { en: 'Expired', ar: 'منتهي' },
      renewed: { en: 'Renewed', ar: 'مجدد' },
      didnt_renew: { en: "Didn't Renew", ar: 'لم يجدد' },
      fake_order: { en: 'Fake Order', ar: 'طلب وهمي' },
    };
    return labels[status] ? (language === 'ar' ? labels[status].ar : labels[status].en) : status;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                  <div className="h-8 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const conversionRate = analytics.totalLeads > 0 
    ? ((analytics.convertedLeads / analytics.totalLeads) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className={isRTL ? 'text-right' : ''}>
        <h2 className="text-2xl font-bold">
          {isRTL ? 'لوحة التحليلات' : 'Analytics Dashboard'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL ? 'نظرة عامة على أداء المنصة' : 'Overview of platform performance'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي المشتركين' : 'Total Subscribers'}
                </p>
                <p className="text-3xl font-bold">{analytics.totalSubscribers}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                {analytics.activeSubscribers} {isRTL ? 'نشط' : 'active'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                </p>
                <p className="text-3xl font-bold">{analytics.totalRevenue.toLocaleString()} <span className="text-sm">EGP</span></p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TrendingUp className="w-4 h-4" />
              {analytics.monthlyRevenue.toLocaleString()} EGP {isRTL ? 'شهرياً' : 'monthly'}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'العملاء المحتملين' : 'Total Leads'}
                </p>
                <p className="text-3xl font-bold">{analytics.totalLeads}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <UserPlus className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                {analytics.convertedLeads} {isRTL ? 'تم التواصل' : 'contacted'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'معدل التحويل' : 'Conversion Rate'}
                </p>
                <p className="text-3xl font-bold">{conversionRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <CheckCircle className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className={`mt-4 text-sm text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'من العملاء المحتملين للمشتركين' : 'Leads to subscribers'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'الطلبات خلال آخر 14 يوم' : 'Orders (Last 14 Days)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.recentOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  reversed={isRTL}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  orientation={isRTL ? 'right' : 'left'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" fillOpacity={0.12} 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Status Breakdown */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'توزيع حالات الاشتراك' : 'Subscription Status Breakdown'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [value, getStatusLabel(name as string)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className={`flex flex-wrap justify-center gap-4 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {analytics.statusBreakdown.map((status) => (
                <div key={status.name} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {getStatusLabel(status.name)} ({status.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
