import { useState, useMemo } from 'react';
import useDataStore from '../../store/useDataStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShoppingCart, ArrowUpDown, ArrowUp, ArrowDown, User, Calendar, CreditCard, Package, Pill } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import OrderDetails from '../../components/orders/OrderDetails';

export default function ManagerOrders() {
  const { orders } = useDataStore();
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ordersList = useMemo(() => {
    let list = Object.entries(orders || {}).map(([id, data]) => ({ id, ...data }));
    
    if (sortConfig.key) {
      list.sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';
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

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-primary" /> : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  return (
    <div className="space-y-6 smooth-enter">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Master Order List</h1>
          <p className="text-sm text-slate-500 mt-1">Full audit trail and detailed insights for all hospital orders.</p>
        </div>
      </div>

      {ordersList.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders placed by doctors will appear here." icon={ShoppingCart} />
      ) : (
        <div className="bg-white border border-slate-100 overflow-hidden clay-shadow rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('shortId')}>ID <SortIcon columnKey="shortId" /></th>
                  <th className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('juniorDoctorName')}>Personnel <SortIcon columnKey="juniorDoctorName" /></th>
                  <th className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('totalCost')}>Cost <SortIcon columnKey="totalCost" /></th>
                  <th className="px-6 py-5">Payment</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersList.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-primary">#{order.shortId}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 font-semibold">{order.juniorDoctorName}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">Approved by {order.seniorDoctorName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">₹{order.totalCost?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border shadow-sm ${
                        order.paymentStatus === 'Paid' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 
                        order.paymentStatus === 'Refunded' ? 'border-blue-100 bg-blue-50 text-blue-600' :
                        'border-slate-100 bg-slate-50 text-slate-500'
                      }`}>
                        {order.paymentStatus || 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm border ${
                        order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        order.status === 'In Transit' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${
                          order.status === 'Completed' ? 'bg-emerald-500' :
                          order.status === 'In Transit' ? 'bg-amber-500' :
                          'bg-primary'
                        }`} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetails(order)} className="h-8 text-primary hover:bg-primary/5 hover:text-primary">Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detailed Order Invoice">
        <OrderDetails order={selectedOrder} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

