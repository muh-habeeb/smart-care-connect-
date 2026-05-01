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
      .filter(([id, data]) => data.paymentStatus === 'Paid')
      .map(([id, data]) => ({ id, ...data }));
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
      deliveryStatus: 'Picked',
      status: 'In Transit'
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
        <h1 className="text-2xl font-semibold tracking-tight text-white">Logistics Management</h1>
        <p className="text-sm text-slate-200 mt-1">Assign personnel to paid orders and verify final completion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paid Orders</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black text-white">{stats.total}</div></CardContent>
        </Card>
        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ongoing Trips</CardTitle>
            <Truck className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black text-white">{stats.ongoing}</div></CardContent>
        </Card>
        <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Archived</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-black text-white">{stats.completed}</div></CardContent>
        </Card>
      </div>

      {deliveriesList.length === 0 ? (
        <EmptyState title="No active logistics" description="Paid orders ready for assignment will appear here." icon={Truck} />
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden shadow-2xl rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/80">
                  <th className="px-6 py-5 text-xs font-bold text-slate-200 uppercase tracking-wider">Order Details</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-200 uppercase tracking-wider">Personnel Assignment</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-200 uppercase tracking-wider">Trip Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-200 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {deliveriesList.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono font-bold text-primary">#{delivery.shortId}</p>
                      <p className="text-[11px] text-slate-400 font-medium">₹{delivery.totalCost?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {delivery.deliveryPersonId ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs text-primary font-black shadow-inner">
                            {delivery.deliveryPerson?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">{delivery.deliveryPerson}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Assigned Personnel</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select 
                            className="bg-slate-800 border border-slate-700 rounded-xl text-xs text-white px-3 py-2 outline-none focus:ring-2 ring-primary/50 transition-all min-w-[140px]"
                            onChange={(e) => setAssignments(prev => ({ ...prev, [delivery.id]: e.target.value }))}
                            value={assignments[delivery.id] || ""}
                          >
                            <option value="" disabled>Select Driver...</option>
                            {deliveryPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <Button 
                            size="sm" 
                            className="h-8 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all"
                            onClick={() => handleAssign(delivery.id)}
                            disabled={!assignments[delivery.id]}
                          >
                            Assign
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        delivery.deliveryStatus === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]' :
                        delivery.deliveryStatus === 'In Transit' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {delivery.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant={delivery.deliveryStatus === 'Delivered' ? 'default' : 'ghost'}
                        className={`h-8 font-bold ${delivery.status === 'Completed' ? 'opacity-50 pointer-events-none' : ''}`}
                        disabled={delivery.deliveryStatus !== 'Delivered' || delivery.status === 'Completed'}
                        onClick={() => handleComplete(delivery.id)}
                      >
                        {delivery.status === 'Completed' ? 'Locked' : 'Complete Order'}
                      </Button>
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
