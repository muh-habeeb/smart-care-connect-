import { Calendar, CreditCard, User, Package, Pill } from 'lucide-react';
import { Button } from '../ui/Button';

export default function OrderDetails({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1">
            <Calendar size={12} /> Ordered On
          </p>
          <p className="text-sm text-slate-900 font-bold">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="space-y-1 md:text-right">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1 md:justify-end">
            <CreditCard size={12} /> Payment Info
          </p>
          <p className="text-sm text-slate-900 font-bold">{order.paymentMethod} • {order.paymentStatus}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1">
            <User size={12} /> Junior Doctor
          </p>
          <p className="text-sm text-slate-900 font-bold">{order.juniorDoctorName}</p>
        </div>
        <div className="space-y-1 md:text-right">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1 md:justify-end">
            <Package size={12} /> Senior Doctor
          </p>
          <p className="text-sm text-slate-900 font-bold">{order.seniorDoctorName}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
          <Pill size={14} className="text-primary" /> Prescription / Items List
        </h3>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {order.items?.map((item, i) => (
                  <tr key={i} className="text-sm hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-slate-600 font-medium">₹{item.price}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grand Total Footer */}
      <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Delivery Personnel</p>
          <p className="text-sm text-primary font-black">{order.deliveryPerson || 'Not Assigned Yet'}</p>
        </div>
        <div className="sm:text-right space-y-1">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Grand Total Payable</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{order.totalCost?.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline"
          className="w-full h-12 text-slate-500 border-slate-200" 
          onClick={onClose}
        >
          Close Review
        </Button>
      </div>
    </div>
  );
}
