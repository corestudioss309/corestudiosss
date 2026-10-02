import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut, Users, DollarSign, Menu, X, ShoppingCart, CreditCard, Settings, Home, BarChart3, Ticket, RefreshCw, Camera } from 'lucide-react';
import LeadsTable from './LeadsTable';
import PricingManager from './PricingManager';
import SubscribersTable from './SubscribersTable';
import RenewalsTable from './RenewalsTable';
import PaymentSettingsManager from './PaymentSettingsManager';
import AddonSettingsManager from './AddonSettingsManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import CouponManager from './CouponManager';
import SnapsManager from './SnapsManager';
import ReviewsManager from './ReviewsManager';
import PopupSettingsManager from './PopupSettingsManager';
import logoAsset from '@/assets/core-studio-wordlogo-white.svg';
import { MessageSquare, Megaphone } from 'lucide-react';

type Tab = 'analytics' | 'leads' | 'subscribers' | 'renewals' | 'pricing' | 'payment' | 'addons' | 'coupons' | 'snaps' | 'reviews' | 'popup';

const AdminDashboard = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const tabs = [
    { id: 'analytics' as Tab, label: isRTL ? 'التحليلات' : 'Analytics', icon: BarChart3 },
    { id: 'subscribers' as Tab, label: isRTL ? 'المشتركين' : 'Subscribers', icon: ShoppingCart },
    { id: 'renewals' as Tab, label: isRTL ? 'التجديدات' : 'Renewals', icon: RefreshCw },
    { id: 'leads' as Tab, label: t('admin.leads'), icon: Users },
    { id: 'pricing' as Tab, label: t('admin.pricing'), icon: DollarSign },
    { id: 'coupons' as Tab, label: isRTL ? 'الكوبونات' : 'Coupons', icon: Ticket },
    { id: 'payment' as Tab, label: isRTL ? 'إعدادات الدفع' : 'Payment Settings', icon: CreditCard },
    { id: 'addons' as Tab, label: isRTL ? 'الإضافات' : 'Add-ons', icon: Settings },
    { id: 'snaps' as Tab, label: isRTL ? 'الأعمال' : 'Portfolio', icon: Camera },
    { id: 'reviews' as Tab, label: isRTL ? 'التقييمات' : 'Reviews', icon: MessageSquare },
    { id: 'popup' as Tab, label: isRTL ? 'النافذة المنبثقة' : 'Popup', icon: Megaphone },
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'font-cairo' : 'font-sans'}`}>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <img src={logoAsset} alt="Core Studios" className="h-7 w-auto" />
          <LanguageSwitcher />
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-64 bg-sidebar border-${isRTL ? 'l' : 'r'} border-sidebar-border z-40 transform transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <img src={logoAsset} alt="Core Studios" className="h-8 w-auto" />
            <p className="text-sm text-sidebar-foreground/60 mt-1">
              {t('admin.dashboard')}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isRTL ? 'flex-row-reverse text-right' : ''
                } ${
                  activeTab === tab.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-4">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className={`w-full justify-start ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Home className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'العودة للموقع' : 'Back to Website'}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className={`w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <LogOut className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('admin.signOut')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={`${isRTL ? 'lg:mr-64' : 'lg:ml-64'} min-h-screen pt-16 lg:pt-0`}>
        <div className="p-6 lg:p-8">
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'subscribers' && <SubscribersTable />}
          {activeTab === 'renewals' && <RenewalsTable />}
          {activeTab === 'leads' && <LeadsTable />}
          {activeTab === 'pricing' && <PricingManager />}
          {activeTab === 'coupons' && <CouponManager />}
          {activeTab === 'payment' && <PaymentSettingsManager />}
          {activeTab === 'addons' && <AddonSettingsManager />}
          {activeTab === 'snaps' && <SnapsManager />}
          {activeTab === 'reviews' && <ReviewsManager />}
          {activeTab === 'popup' && <PopupSettingsManager />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
