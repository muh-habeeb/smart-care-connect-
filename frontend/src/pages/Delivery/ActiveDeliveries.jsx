import { useMemo, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useDataStore from '../../store/useDataStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { Truck, MapPin, Phone, Package, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function ActiveDeliveries() {
  const { user } = useAuthStore();
  const { orders, updateDeliveryStatus } = useDataStore();
  const [updatingId, setUpdatingId] = useState(null);

  const activeOrders = useMemo(() => {
    return Object.entries(orders || {})
      .map(([id, data]) => ({ id, ...data }))
      .filter(order => 
        order.deliveryPersonId === user?.id && 
        ['Picked', 'In Transit'].includes(order.deliveryStatus)
      );
  }, [orders, user]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    setUpdatingId(orderId);
    try {
      const nextStatus = currentStatus === 'Picked' ? 'In Transit' : 'Delivered';
      await updateDeliveryStatus(orderId, nextStatus);
      toast.success(`Order status: ${nextStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Active Deliveries</h1>
        <p className="text-sm text-slate-300 mt-1">Manage your current trips and update delivery statuses.</p>
      </div>

      {activeOrders.length === 0 ? (
        <EmptyState 
          title="No active deliveries" 
          description="You don't have any orders in transit right now. Check your dashboard for new assignments."
          icon={Truck}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {activeOrders.map((order) => (
            <div key={order.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col sm:flex-row">
              {/* Status Side Bar */}
              <div className={`w-2 shadow-lg ${
                order.deliveryStatus === 'In Transit' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-primary shadow-primary/20'
              }`} />
              
              <div className="flex-1 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Order ID</span>
                    <p className="text-lg font-mono font-bold text-white">#{order.shortId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</span>
                    <p className={`text-sm font-bold ${order.deliveryStatus === 'In Transit' ? 'text-amber-400' : 'text-primary'}`}>
                      {order.deliveryStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Delivery Address</p>
                      <p className="text-sm text-white font-medium">Main Hospital Wing, Floor 3, Room 302</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Contact Personnel</p>
                      <p className="text-sm text-white font-medium">Dr. {order.juniorDoctorName}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-slate-500" />
                    <span className="text-xs text-slate-300">{order.items?.length || 0} Medical Items</span>
                  </div>
                  <Button 
                    className={`flex-1 sm:flex-none gap-2 shadow-lg ${
                      order.deliveryStatus === 'Picked' ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                    }`}
                    onClick={() => handleUpdateStatus(order.id, order.deliveryStatus)}
                    disabled={updatingId === order.id}
                  >
                    {order.deliveryStatus === 'Picked' ? (
                      <><Truck size={18} /> Start Trip</>
                    ) : (
                      <><CheckCircle2 size={18} /> Confirm Delivery</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
