import { useMemo } from 'react';
import useDataStore from '../../store/useDataStore';
import useAuthStore from '../../store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { History, Calendar, CreditCard, User, IndianRupee } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export default function DeliveryHistory() {
  const { orders } = useDataStore();
  const { user } = useAuthStore();

  const historyList = useMemo(() => {
    return Object.entries(orders || {})
      .filter(([id, data]) => 
        data.deliveryPersonId === user.id && 
        ['Delivered', 'Completed'].includes(data.deliveryStatus)
      )
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => new Date(b.completedAt || b.deliveredAt || 0) - new Date(a.completedAt || a.deliveredAt || 0));
  }, [orders, user.id]);

  return (
    <div className="space-y-6 smooth-enter">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">My Deliveries</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">View your past successfully completed medical drops.</p>
      </div>

      {historyList.length === 0 ? (
        <EmptyState 
          title="No delivery history" 
          description="Completed deliveries will appear here once you finish your active tasks." 
          icon={History} 
        />
      ) : (
        <div className="bg-white border border-slate-100 overflow-hidden clay-shadow rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Date</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Ordered By</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Payment</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {historyList.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono font-bold text-primary">#{delivery.shortId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm text-slate-600 font-medium">
                          {new Date(delivery.completedAt || delivery.deliveredAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm text-slate-900 font-bold">{delivery.seniorDoctorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          delivery.paymentMethod === 'Razorpay' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {delivery.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-black text-slate-900">₹{delivery.totalCost?.toLocaleString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
