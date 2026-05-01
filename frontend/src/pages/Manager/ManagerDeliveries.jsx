import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import useDataStore from '../../store/useDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Truck, CheckCircle, Package } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export default function ManagerDeliveries() {
  const { orders, updateDeliveryStatus, users, updateOrder } = useDataStore();
  const [assignments, setAssignments] = useState({}); // { orderId: personId }
  
  const deliveriesList = useMemo(() => {
    return Object.entries(orders || {})
      .filter(([id, data]) => {
        const isPaid = data.paymentStatus === 'Paid';
        const isCODWaiting = data.paymentMethod === 'COD' && (data.paymentStatus === 'To be Paid' || data.paymentStatus === 'Unpaid');
        return isPaid || isCODWaiting;
      })
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  const deliveryPersons = useMemo(() => {
    return Object.entries(users || {})
      .filter(([id, u]) => u.role === 'Delivery Person')
      .map(([id, u]) => ({ id, ...u }));
  }, [users]);

  const handleAssign = async (orderId) => {
    const personId = assignments[orderId];
    if (!personId) return toast.error('Please select a driver first');
    
    const person = users[personId];
    await updateOrder(orderId, {
      deliveryPersonId: personId,
      deliveryPerson: person.name,
      deliveryStatus: 'Assigned',
      status: 'Awaiting Pickup'
    });
    toast.success(`Assigned to ${person.name}`);
    setAssignments(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  };

  const stats = useMemo(() => {
    let ongoing = 0;
    let completed = 0;
    deliveriesList.forEach(d => {
      if (d.status === 'Completed') completed++;
      else ongoing++;
    });
    return { total: deliveriesList.length, ongoing, completed };
  }, [deliveriesList]);

  const handleComplete = async (id) => {
    try {
      await updateDeliveryStatus(id, 'Completed');
      toast.success('Order officially closed');
    } catch (e) {
      toast.error('Failed to complete order');
    }
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Logistics Management</h1>
        <p className="text-sm text-slate-500 mt-1">Assign personnel to paid orders and verify final completion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-slate-100 clay-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paid Orders</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black text-slate-900">{stats.total}</div></CardContent>
        </Card>
        <Card className="bg-white border border-slate-100 clay-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ongoing Trips</CardTitle>
            <Truck className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black text-slate-900">{stats.ongoing}</div></CardContent>
        </Card>
        <Card className="bg-white border border-slate-100 clay-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Archived</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black text-slate-900">{stats.completed}</div></CardContent>
        </Card>
      </div>

      {deliveriesList.length === 0 ? (
        <EmptyState title="No active logistics" description="Paid orders ready for assignment will appear here." icon={Truck} />
      ) : (
        <div className="bg-white border border-slate-100 overflow-hidden clay-shadow rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Details</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Personnel Assignment</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Trip Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveriesList.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono font-bold text-primary">#{delivery.shortId}</p>
                      <p className="text-[11px] text-slate-500 font-medium">₹{delivery.totalCost?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {delivery.deliveryPersonId ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-black">
                            {delivery.deliveryPerson?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{delivery.deliveryPerson}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Assigned Personnel</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select 
                            className="bg-white border border-slate-200 rounded-xl text-xs text-slate-900 px-3 py-2 outline-none focus:ring-2 ring-primary/20 transition-all min-w-[140px]"
                            onChange={(e) => setAssignments(prev => ({ ...prev, [delivery.id]: e.target.value }))}
                            value={assignments[delivery.id] || ""}
                          >
                            <option value="" disabled>Select Driver...</option>
                            {deliveryPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <Button 
                            size="sm" 
                            className="h-8 px-4 font-bold rounded-lg shadow-sm"
                            onClick={() => handleAssign(delivery.id)}
                            disabled={!assignments[delivery.id]}
                          >
                            Assign
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm border ${
                        delivery.deliveryStatus === 'Delivered' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                        delivery.deliveryStatus === 'In Transit' ? 'border-amber-100 bg-amber-50 text-amber-600' :
                        'border-slate-100 bg-slate-50 text-slate-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          delivery.deliveryStatus === 'Delivered' ? 'bg-emerald-500' :
                          delivery.deliveryStatus === 'In Transit' ? 'bg-amber-500 animate-pulse' :
                          'bg-slate-400'
                        }`} />
                        {delivery.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {delivery.status === 'Completed' ? (
                        <div className="flex items-center justify-end gap-2 text-emerald-500/60">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Archived</span>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="default"
                          className={`h-9 px-4 font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-md ${
                            delivery.deliveryStatus === 'Delivered' 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10 scale-105' 
                              : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                          }`}
                          disabled={delivery.deliveryStatus !== 'Delivered'}
                          onClick={() => handleComplete(delivery.id)}
                        >
                          {delivery.deliveryStatus === 'Delivered' ? 'Finalize & Close' : 'Awaiting Delivery'}
                        </Button>
                      )}
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
