import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerUsers from './pages/Manager/ManagerUsers';
import ManagerProducts from './pages/Manager/ManagerProducts';
import ManagerOrders from './pages/Manager/ManagerOrders';
import ManagerDeliveries from './pages/Manager/ManagerDeliveries';

// Placeholder Pages
const DoctorDashboard = () => <div className="text-2xl font-semibold smooth-enter">Doctor Dashboard</div>;
const DeliveryDashboard = () => <div className="text-2xl font-semibold smooth-enter">Delivery Dashboard</div>;

export default function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isLoading = useAuthStore(state => state.isLoading);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'bg-white/90 backdrop-blur-xl border border-slate-200 text-slate-900 shadow-xl rounded-xl text-sm font-medium',
          duration: 4000,
          style: { zIndex: 99999 }
        }}
      />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/manager" /> : <Login />} />
        
        {/* Manager Routes */}
        <Route element={<DashboardLayout allowedRoles={['Manager']} />}>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/users" element={<ManagerUsers />} />
          <Route path="/manager/products" element={<ManagerProducts />} />
          <Route path="/manager/orders" element={<ManagerOrders />} />
          <Route path="/manager/delivery" element={<ManagerDeliveries />} />
        </Route>

        {/* Doctor Routes */}
        <Route element={<DashboardLayout allowedRoles={['Junior Doctor', 'Senior Doctor']} />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/orders" element={<div>Doctor Orders</div>} />
        </Route>

        {/* Delivery Routes */}
        <Route element={<DashboardLayout allowedRoles={['Delivery Person']} />}>
          <Route path="/delivery" element={<DeliveryDashboard />} />
          <Route path="/delivery/active" element={<div>Active Deliveries</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
