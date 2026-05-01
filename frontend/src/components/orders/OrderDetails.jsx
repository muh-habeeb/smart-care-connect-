import { Calendar, CreditCard, User, Package, Pill } from 'lucide-react';
import { Button } from '../ui/Button';

export default function OrderDetails({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-5 rounded-2xl border border-slate-700/50">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1">
            <Calendar size={12} /> Ordered On
          </p>
          <p className="text-sm text-white font-medium">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="space-y-1 md:text-right">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1 md:justify-end">
            <CreditCard size={12} /> Payment Info
          </p>
          <p className="text-sm text-white font-medium">{order.paymentMethod} • {order.paymentStatus}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1">
            <User size={12} /> Junior Doctor
          </p>
          <p className="text-sm text-white font-medium">{order.juniorDoctorName}</p>
        </div>
        <div className="space-y-1 md:text-right">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1 md:justify-end">
            <Package size={12} /> Senior Doctor
          </p>
          <p className="text-sm text-white font-medium">{order.seniorDoctorName}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
          <Pill size={14} className="text-primary" /> Prescription / Items List
        </h3>
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-slate-700/50">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  <th className="px-4 py-3">Item Details</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {order.items?.map((item, i) => (
                  <tr key={i} className="text-sm">
                    <td className="px-4 py-4">
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.category}</p>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-300">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-slate-300">₹{item.price}</td>
                    <td className="px-4 py-4 text-right font-bold text-white">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grand Total Footer */}
      <div className="pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Delivery Personnel</p>
          <p className="text-sm text-primary font-bold">{order.deliveryPerson || 'Not Assigned Yet'}</p>
        </div>
        <div className="sm:text-right space-y-1">
          <p className="text-xs text-slate-400">Grand Total Payable</p>
          <p className="text-4xl font-black text-white tracking-tighter">₹{order.totalCost?.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 font-semibold transition-all" 
          onClick={onClose}
        >
          Close Review
        </Button>
        {/* <Button className="flex-1 h-12 font-bold shadow-lg shadow-primary/20" onClick={() => window.print()}>Print Invoice</Button> */}
      </div>
    </div>
  );
}
