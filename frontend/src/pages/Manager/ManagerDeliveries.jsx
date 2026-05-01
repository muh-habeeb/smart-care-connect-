import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import useDataStore from '../../store/useDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Truck, CheckCircle, Package } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export default function ManagerDeliveries() {
  const { orders, updateDeliveryStatus } = useDataStore();
  
  const deliveriesList = useMemo(() => {
    return Object.entries(orders || {})
      .filter(([id, data]) => ['Picked', 'In Transit', 'Delivered', 'Completed'].includes(data.deliveryStatus))
      .map(([id, data]) => ({ id, ...data }));
  }, [orders]);

  const stats = useMemo(() => {
    let ongoing = 0;
    let completed = 0;
    deliveriesList.forEach(d => {
      if (d.deliveryStatus === 'Completed') completed++;
      else ongoing++;
    });
    return { total: deliveriesList.length, ongoing, completed };
  }, [deliveriesList]);

  const handleComplete = async (id) => {
    try {
      await updateDeliveryStatus(id, 'Completed');
      toast.success('Order marked as Completed!');
    } catch (e) {
      toast.error('Failed to complete order');
    }
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Deliveries</h1>
        <p className="text-sm text-slate-500 mt-1">Track ongoing deliveries and manage their status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Deliveries</CardTitle>
            <Package className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ongoing</CardTitle>
            <Truck className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.ongoing}</div></CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.completed}</div></CardContent>
        </Card>
      </div>

      {deliveriesList.length === 0 ? (
        <EmptyState 
          title="No deliveries" 
          description="Assigned deliveries will appear here."
          icon={Truck}
        />
      ) : (
        <div className="bg-white/60 backdrop-blur-xl border border-slate-200/50 overflow-hidden shadow-sm rounded-xl">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Delivery Person</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Delivery Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveriesList.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-900">#{delivery.shortId}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{delivery.deliveryPerson}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      delivery.deliveryStatus === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      delivery.deliveryStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {delivery.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      size="sm" 
                      className="h-8"
                      disabled={delivery.deliveryStatus !== 'Delivered'}
                      onClick={() => handleComplete(delivery.id)}
                    >
                      Complete Order
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
