import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { LayoutDashboard, Users, Box, ShoppingCart, Truck, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Sidebar({ role }) {
  const logout = useAuthStore(state => state.logout);

  const getLinks = () => {
    if (role === 'Manager') {
      return [
        { path: '/manager', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/manager/users', label: 'Users', icon: Users },
        { path: '/manager/products', label: 'Products', icon: Box },
        { path: '/manager/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/manager/delivery', label: 'Deliveries', icon: Truck },
      ];
    }
    if (role === 'Junior Doctor' || role === 'Senior Doctor') {
      return [
        { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/doctor/orders', label: 'Orders', icon: ShoppingCart },
      ];
    }
    if (role === 'Delivery Person') {
      return [
        { path: '/delivery', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/delivery/active', label: 'Active Deliveries', icon: Truck },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white/40 backdrop-blur-xl border-r border-slate-200/50 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
          </div>
          <span className="font-semibold text-slate-900">Pharmacy</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.exact}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors btn-scale",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors btn-scale"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
