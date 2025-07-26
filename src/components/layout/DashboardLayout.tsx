import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import GlobalLanguageSwitcher from '@/components/common/GlobalLanguageSwitcher';
import LocalLanguageToggle from '@/components/common/LocalLanguageToggle';
import LanguageDropdown from '@/components/LanguageDropdown';
import { 
  Home, Building, Users, CreditCard, Shield, Settings, LogOut, 
  Wrench, FileText, DollarSign, Repeat, CheckSquare, Bell, 
  Globe, Sun, Moon, Menu, X, Brain 
} from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import BottomNavBar from './BottomNavBar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import RealTimeNotifications from '@/components/dashboard/RealTimeNotifications';
import EmailVerificationWarning from '@/components/dashboard/EmailVerificationWarning';
import LiveChatWidget from '@/components/chat/LiveChatWidget';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { lang, setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const getLinkClass = (path: string) => {
    const base = 'flex items-center space-x-3 px-4 py-3 font-medium rounded-2xl transition-all duration-300 border border-white/10';
    const isActive = path === '/dashboard/overview' 
      ? (pathname === '/dashboard' || pathname === '/dashboard/overview')
      : pathname.startsWith(path);
    return isActive 
      ? `${base} bg-gradient-to-r from-orange-400 to-blue-400 text-white shadow-lg border-white/20` 
      : `${base} text-white/80 hover:text-white hover:border-white/20`;
  };

  const getButtonStyle = (isActive: boolean) => {
    if (isActive) {
      return {
        background: 'linear-gradient(135deg, #FF8A65, #42A5F5)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      };
    }
    return {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px) saturate(180%)',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    };
  };

  // Use feature flags hook to control universal pages visibility
  const { flags, isUniversalPageEnabled } = useFeatureFlags();
  
  const mainNavLinks = [
    { href: "/dashboard/overview", icon: Brain, label: 'Smart Dashboard', roles: ['Landlord', 'Agent', 'Super Admin', 'Super Moderator'] },
    { href: "/dashboard/tenant", icon: Home, label: t('dashboard.tenant_portal'), roles: ['Tenant'] },
    { href: "/dashboard/properties", icon: Building, label: t('dashboard.properties'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/tenants", icon: Users, label: t('dashboard.tenants'), roles: ['Landlord', 'Agent'] },
    { href: isUniversalPageEnabled('payments') ? "/dashboard/payments-universal" : "/dashboard/payments", icon: CreditCard, label: t('dashboard.payments'), roles: ['Landlord', 'Agent'] },
    { href: isUniversalPageEnabled('receipts') ? "/dashboard/receipts-universal" : "/dashboard/receipts", icon: FileText, label: t('dashboard.receipts'), roles: ['Landlord', 'Agent'] },
    { href: isUniversalPageEnabled('expenses') ? "/dashboard/expenses-universal" : "/dashboard/expenses", icon: DollarSign, label: t('dashboard.expenses'), roles: ['Landlord', 'Agent'] },
    { href: isUniversalPageEnabled('maintenance') ? "/dashboard/maintenance-universal" : "/dashboard/maintenance", icon: Wrench, label: t('dashboard.maintenance'), roles: ['Landlord', 'Agent'] },
    { href: isUniversalPageEnabled('cashflow') ? "/dashboard/cashflow-universal" : "/dashboard/cashflow", icon: DollarSign, label: t('dashboard.cash_flow'), roles: ['Landlord', 'Agent'] },
    { href: isUniversalPageEnabled('reminders') ? "/dashboard/reminders-universal" : "/dashboard/reminders", icon: Repeat, label: t('dashboard.reminders'), roles: ['Landlord', 'Agent'] },
    { href: isUniversalPageEnabled('approvals') ? "/dashboard/approvals-universal" : "/dashboard/approvals", icon: CheckSquare, label: t('dashboard.approvals'), roles: ['Landlord', 'Agent'] },
    { href: isUniversalPageEnabled('users') ? "/dashboard/users-universal" : "/dashboard/users", icon: Users, label: t('dashboard.users_invites'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/billing", icon: CreditCard, label: t('dashboard.billing'), roles: ['Landlord', 'Agent'] },
    { href: "/dashboard/audit-log-universal", icon: FileText, label: t('dashboard.audit_log'), roles: ['Landlord', 'Agent'] },
  ];
  
  const adminLink = { href: "/admin", icon: Shield, label: t('dashboard.admin_panel'), roles: ['Super Admin', 'Super Moderator'] };

  const Sidebar = ({ isMobile = false }) => (
    <aside className={`${isMobile ? 'w-full max-w-sm' : 'w-72 xl:w-80'} flex-shrink-0 border border-white/10 flex flex-col h-full`} style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'}}>
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center space-x-3 text-xl font-bold text-white">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-blue-400 rounded-xl flex items-center justify-center">
            <Building size={20} className="text-white" />
          </div>
          <span className="truncate">
            {t('app_name_short')}
          </span>
        </Link>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-full text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {mainNavLinks.map(link => {
          const isActive = link.href === '/dashboard/overview' 
            ? (pathname === '/dashboard' || pathname === '/dashboard/overview')
            : pathname.startsWith(link.href);
          return (
            <RoleGuard key={link.href} allowed={link.roles}>
              <Link 
                to={link.href} 
                className={getLinkClass(link.href)}
                style={getButtonStyle(isActive)}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            </RoleGuard>
          );
        })}
        <RoleGuard allowed={adminLink.roles}>
          <hr className="my-4 border-white/10" />
          <Link 
            to={adminLink.href} 
            className={getLinkClass(adminLink.href)}
            style={getButtonStyle(pathname.startsWith(adminLink.href))}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <adminLink.icon size={20} />
            <span>{adminLink.label}</span>
          </Link>
        </RoleGuard>
      </nav>
      
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link 
          to="/dashboard/settings-universal" 
          className={getLinkClass('/dashboard/settings')}
          style={getButtonStyle(pathname.startsWith('/dashboard/settings'))}
          onClick={() => isMobile && setSidebarOpen(false)}
        >
          <Settings size={20} />
          <span>{t('dashboard.settings')}</span>
        </Link>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center space-x-3 px-4 py-3 font-medium rounded-2xl text-white/80 hover:text-white transition-all duration-300 border border-white/10"
          style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px) saturate(180%)'}} 
        >
          <LogOut size={20} />
          <span>{t('dashboard.logout')}</span>
        </button>
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen relative" style={{background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)', backgroundAttachment: 'fixed'}}>
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" 
            style={{backgroundColor: '#FF6B35', opacity: 0.4}}
          />
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" 
            style={{backgroundColor: '#1E88E5', opacity: 0.4}}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" 
            style={{backgroundColor: '#43A047', opacity: 0.3}}
          />
        </div>
        <MobileHeader onMenuToggle={() => setSidebarOpen(true)} showNotifications={true} />
        
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-80"
              >
                <Sidebar isMobile />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <main className="pt-16 pb-20 mobile-content scroll-container">
          <EmailVerificationWarning />
          <div className="max-w-7xl mx-auto px-4">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </div>
        </main>
        
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen relative" style={{background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)', backgroundAttachment: 'fixed'}}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" 
          style={{backgroundColor: '#FF6B35', opacity: 0.4}}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" 
          style={{backgroundColor: '#1E88E5', opacity: 0.4}}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" 
          style={{backgroundColor: '#43A047', opacity: 0.3}}
        />
      </div>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
            >
              <Sidebar isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 border border-white/10 flex-shrink-0 flex items-center justify-between px-4 lg:px-8 shadow-lg relative z-[100]" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'}}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden touch-target p-2 rounded-xl text-white/80 hover:text-white transition-colors border border-white/10"
              style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-white hidden lg:block">
              {t('nav.dashboard')}
            </h1>
          </div>

          {/* Center: Company Name - Always visible */}
          <div className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 max-w-xs lg:max-w-sm z-[90]">
            <span className="text-base lg:text-lg font-bold text-white text-center truncate">
              {t('app_name')}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative z-[110] ml-auto">
            {/* Language Controls - Grouped */}
            <div className="flex items-center gap-1 rounded-lg p-1 border border-white/10" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}>
              <div className="relative">
                <LocalLanguageToggle />
              </div>
              <div className="relative">
                <LanguageDropdown />
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="touch-target p-2 rounded-xl text-white/80 hover:text-white transition-colors border border-white/10"
              style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            {/* Notifications - Grouped */}
            <div className="flex items-center gap-1 rounded-lg p-1 border border-white/10" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}>
              <RealTimeNotifications />
              <NotificationsPanel />
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-2 rounded-lg p-1 pl-2 border border-white/10" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'}}>
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full flex items-center justify-center font-semibold text-white text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block pr-1">
                <p className="font-medium text-white text-sm leading-tight">{user?.name}</p>
                <p className="text-xs text-white/70 leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-4 lg:pb-8 scroll-container">
          <EmailVerificationWarning />
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <LiveChatWidget />
      <BottomNavBar />
    </div>
  );
};

export default DashboardLayout;// Trigger deployment
