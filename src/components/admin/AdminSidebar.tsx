import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LayoutDashboard, Building, Users, CreditCard, Brush, LifeBuoy, LogOut, ShieldCheck, ArrowLeft, Settings } from 'lucide-react';

const AdminSidebar: React.FC = () => {
    const location = usePathname();
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const getLinkClass = (path: string) => {
        const base = 'flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300';
        return pathname.startsWith(path)
          ? `${base} app-gradient text-white shadow-app`
          : `${base} text-text-secondary hover:text-text-primary hover:bg-app-bg`;
    };

    return (
        <aside className="w-64 h-screen app-surface text-text-primary flex flex-col flex-shrink-0">
            <div className="h-20 flex items-center justify-center border-b border-app-border">
                <h2 className="text-xl font-bold text-center flex items-center gap-2"><ShieldCheck className="text-brand-blue"/> Admin Panel</h2>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <Link to="/admin/dashboard" className={getLinkClass('/admin/dashboard')}><LayoutDashboard size={18}/> Dashboard</Link>
                <Link to="/admin/organizations" className={getLinkClass('/admin/organizations')}><Building size={18}/> Organizations</Link>
                <Link to="/admin/users" className={getLinkClass('/admin/users')}><Users size={18}/> Users</Link>
                <Link to="/admin/moderators" className={getLinkClass('/admin/moderators')}><Users size={18}/> Moderators</Link>
                <Link to="/admin/plans" className={getLinkClass('/admin/plans')}><CreditCard size={18}/> Manage Plans</Link>
                <Link to="/admin/site-editor" className={getLinkClass('/admin/site-editor')}><Brush size={18}/> Site Editor</Link>
                <Link to="/admin/billing" className={getLinkClass('/admin/billing')}><LifeBuoy size={18}/> Billing</Link>
                <Link to="/admin/settings" className={getLinkClass('/admin/settings')}><Settings size={18}/> Settings</Link>
            </nav>
            <div className="p-4 border-t border-app-border space-y-2">
                <Link to="/dashboard" className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 rounded-2xl font-medium text-text-secondary bg-app-bg hover:bg-app-border transition-colors">
                  <ArrowLeft size={16} /> Exit Admin
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 mt-2 font-medium rounded-2xl text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
