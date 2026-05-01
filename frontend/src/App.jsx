import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import ManagerUsers from './pages/Manager/ManagerUsers';
import ManagerProducts from './pages/Manager/ManagerProducts';
import ManagerOrders from './pages/Manager/ManagerOrders';
import ManagerDeliveries from './pages/Manager/ManagerDeliveries';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorOrders from './pages/Doctor/DoctorOrders';
import DeliveryDashboard from './pages/Delivery/DeliveryDashboard';
import ActiveDeliveries from './pages/Delivery/ActiveDeliveries';

function BackgroundManager() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Default Medical Background
  let bgImage = "url('https://images.unsplash.com/photo-1551076805-e1869033e561?w=1920&q=80')";

  // Keyword-based Dynamic Backgrounds
  if (path.includes('users')) {
    bgImage = "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&q=80')"; // Professionals
  } else if (path.includes('products')) {
    bgImage = "url('https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=1920&q=80')"; // Inventory
  } else if (path.includes('orders')) {
    bgImage = "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80')"; // Orders - Clinical Records
  } else if (path.includes('delivery') || path.includes('active')) {
    bgImage = "url('https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=1920&q=80')"; // Logistics
  } else if (path.startsWith('/manager')) {
    bgImage = "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80')"; // Hospital Lobby
  } else if (path.startsWith('/doctor')) {
    bgImage = "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80')"; // Stethoscope
  } else if (path.startsWith('/delivery')) {
    bgImage = "url('https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1920&q=80')"; // Courier
  }

  return (
    <div 
      className="fixed inset-0 z-[-1] transition-all duration-1000 ease-in-out bg-cover bg-center"
      style={{ backgroundImage: bgImage }}
    >
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[8px]"></div>
    </div>
  );
}

export default function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isLoading = useAuthStore(state => state.isLoading);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <BackgroundManager />
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 text-white shadow-2xl rounded-2xl text-sm font-medium p-4',
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
          <Route path="/doctor/orders" element={<DoctorOrders mode="pending" />} />
          <Route path="/doctor/history" element={<DoctorOrders mode="history" />} />
        </Route>

        {/* Delivery Routes */}
        <Route element={<DashboardLayout allowedRoles={['Delivery Person']} />}>
          <Route path="/delivery" element={<DeliveryDashboard />} />
          <Route path="/delivery/active" element={<ActiveDeliveries />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
