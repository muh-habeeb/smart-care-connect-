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
        ['Assigned', 'In Transit'].includes(order.deliveryStatus)
      );
  }, [orders, user]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    setUpdatingId(orderId);
    try {
      if (currentStatus === 'Assigned') {
        await updateDeliveryStatus(orderId, 'In Transit');
        toast.success('Trip started! Order picked up.');
      } else {
        await updateDeliveryStatus(orderId, 'Delivered');
        toast.success('Order officially delivered.');
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Active Deliveries</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your current trips and update delivery statuses.</p>
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
            <div key={order.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row transition-all hover:shadow-md">
              {/* Status Side Bar */}
              <div className={`w-2 ${
                order.deliveryStatus === 'In Transit' ? 'bg-amber-500' : 'bg-primary'
              }`} />
              
              <div className="flex-1 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</span>
                    <p className="text-lg font-mono font-bold text-slate-900">#{order.shortId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                    <p className={`text-sm font-black uppercase tracking-wider ${order.deliveryStatus === 'In Transit' ? 'text-amber-600' : 'text-primary'}`}>
                      {order.deliveryStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Delivery Address</p>
                      <p className="text-sm text-slate-900 font-bold">Main Hospital Wing, Floor 3, Room 302</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contact Personnel</p>
                      <p className="text-sm text-slate-900 font-bold">Dr. {order.juniorDoctorName}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-slate-300" />
                    <span className="text-xs text-slate-500 font-medium">{(order.items || []).length} Medical Items</span>
                  </div>
                  <Button 
                    className={`flex-1 sm:flex-none gap-2 font-black text-xs uppercase tracking-widest shadow-md ${
                      order.deliveryStatus === 'Assigned' ? 'bg-primary hover:bg-primary/90 shadow-primary/10' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                    }`}
                    onClick={() => handleUpdateStatus(order.id, order.deliveryStatus)}
                    disabled={updatingId === order.id}
                  >
                    {order.deliveryStatus === 'Assigned' ? (
                      <><Truck size={16} /> Picked Up</>
                    ) : (
                      <><CheckCircle2 size={16} /> Delivered</>
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
