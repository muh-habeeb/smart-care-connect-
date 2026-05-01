import { useState, useMemo } from 'react';
import useDataStore from '../../store/useDataStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShoppingCart, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ManagerOrders() {
  const { orders } = useDataStore();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const ordersList = useMemo(() => {
    let list = Object.entries(orders || {}).map(([id, data]) => ({ id, ...data }));
    
    if (sortConfig.key) {
      list.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [orders, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-primary" /> : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">Review and manage doctor orders and delivery assignments.</p>
      </div>

      {ordersList.length === 0 ? (
        <EmptyState 
          title="No orders yet" 
          description="Orders placed by doctors will appear here."
          icon={ShoppingCart}
        />
      ) : (
        <div className="bg-white/60 backdrop-blur-xl border border-slate-200/50 overflow-hidden shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  {['shortId', 'juniorDoctorName', 'seniorDoctorName', 'totalCost', 'paymentMethod', 'deliveryPerson', 'status'].map((col) => (
                    <th 
                      key={col} 
                      className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 group transition-colors select-none"
                      onClick={() => handleSort(col)}
                    >
                      <div className="flex items-center">
                        {col.replace(/([A-Z])/g, ' $1').trim()}
                        <SortIcon columnKey={col} />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersList.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 text-sm font-mono text-slate-900">#{order.shortId}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.juniorDoctorName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.seniorDoctorName || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">₹{(order.totalCost || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.paymentMethod || 'COD'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.deliveryPerson || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8">Details</Button>
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
