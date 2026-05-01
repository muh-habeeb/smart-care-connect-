import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { LayoutDashboard, Users, Box, ShoppingCart, Truck, LogOut, Lock, User, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PasswordInput } from '../ui/PasswordInput';

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
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">SmartCareConnect</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-1">Navigation</p>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.exact}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )
            }
          >
            <link.icon className="w-4 h-4 flex-shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Profile */}
      <div className="p-3 border-t border-gray-100">
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.charAt(0) || <User size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 font-medium truncate">{user?.role}</p>
            </div>
          </div>
          <div className="space-y-0.5">
            {role !== 'Manager' && (
              <button
                onClick={() => setIsPassModalOpen(true)}
                className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-700 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Change Password
              </button>
            )}
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={isPassModalOpen} onClose={() => setIsPassModalOpen(false)} title="Change Password">
        <form onSubmit={handlePassChange} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Current Password</label>
            <PasswordInput
              value={passData.current}
              onChange={e => setPassData({...passData, current: e.target.value})}
              className="h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">New Password</label>
            <PasswordInput
              value={passData.new}
              onChange={e => setPassData({...passData, new: e.target.value})}
              className="h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Confirm New Password</label>
            <PasswordInput
              value={passData.confirm}
              onChange={e => setPassData({...passData, confirm: e.target.value})}
              className="h-10"
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsPassModalOpen(false)} className="flex-1 text-gray-500">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}
