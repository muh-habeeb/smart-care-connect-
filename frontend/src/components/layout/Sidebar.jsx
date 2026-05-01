import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { LayoutDashboard, Users, Box, ShoppingCart, Truck, LogOut, Lock, User,Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

export default function Sidebar({ role }) {
  const { logout, user, changePassword } = useAuthStore();
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await changePassword(passData.current, passData.new);
      toast.success('Password changed successfully');
      setIsPassModalOpen(false);
      setPassData({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      const docLinks = [
        { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { path: '/doctor/orders', label: role === 'Senior Doctor' ? 'Approve Orders' : 'My Orders', icon: ShoppingCart },
      ];

      if (role === 'Senior Doctor') {
        docLinks.push({ path: '/doctor/history', label: 'Order History', icon: Clock });
      }

      return docLinks;
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
    <aside className="w-64 bg-slate-900/40 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
          </div>
          <span className="font-semibold text-white">SmartCareConnect</span>
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
                  ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.1)]" 
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Settings Section */}
      <div className="p-4 border-t border-slate-700/50 space-y-2">
        <div className="p-2 rounded-xl border border-transparent hover:border-slate-700/50 hover:bg-white/5 transition-all group">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-[0_0_15px_rgba(var(--primary),0.2)]">
              {user?.name?.charAt(0) || <User size={18} />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-1">
            {role !== 'Manager' && (
              <button 
                onClick={() => setIsPassModalOpen(true)}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Lock className="w-4 h-4 opacity-70" />
                Change Password
              </button>
            )}
            <button 
              onClick={logout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4 opacity-70" />
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} title="Change Password">
        <form onSubmit={handlePassChange} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 ml-1">Current Password</label>
            <PasswordInput 
              value={passData.current} 
              onChange={e => setPassData({...passData, current: e.target.value})}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 ml-1">New Password</label>
            <PasswordInput 
              value={passData.new} 
              onChange={e => setPassData({...passData, new: e.target.value})}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 ml-1">Confirm New Password</label>
            <PasswordInput 
              value={passData.confirm} 
              onChange={e => setPassData({...passData, confirm: e.target.value})}
              className="h-11"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsPassModalOpen(false)} className="flex-1 text-slate-300">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}

