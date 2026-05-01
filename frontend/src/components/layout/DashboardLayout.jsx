import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useDataStore from '../../store/useDataStore';
import Sidebar from './Sidebar';

export default function DashboardLayout({ allowedRoles }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { initListeners, isLoading: dataLoading } = useDataStore();

  useEffect(() => {
    if (isAuthenticated) {
      initListeners();
    }
  }, [isAuthenticated, initListeners]);

  if (authLoading || (isAuthenticated && dataLoading)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500">Loading your dashboard...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on actual role
    if (user.role === 'Manager') return <Navigate to="/manager" replace />;
    if (user.role === 'Junior Doctor' || user.role === 'Senior Doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'Delivery Person') return <Navigate to="/delivery" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={user.role} />
      <main className="flex-1 overflow-y-auto p-8 relative z-0">
        <Outlet />
      </main>
    </div>
  );
}
