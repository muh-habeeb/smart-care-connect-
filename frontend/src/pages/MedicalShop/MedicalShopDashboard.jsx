import { useMemo } from 'react';
import useDataStore from '../../store/useDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ShoppingBag, Clock, Package, TrendingUp } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export default function MedicalShopDashboard() {
  const { orders, products } = useDataStore();

  const ordersList = useMemo(() => {
    return Object.entries(orders || {}).map(([id, data]) => ({ id, ...data }));
  }, [orders]);

  const totalOrders = ordersList.length;
  const pendingOrders = ordersList.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const totalProducts = Object.keys(products || {}).length;

  const recentOrders = useMemo(() => {
    return [...ordersList]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [ordersList]);

  const stats = [
    { title: 'Total Hospital Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Requests', value: pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Inventory Items', value: totalProducts, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Order Growth', value: '+12%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 smooth-enter">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Medical Shop Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Supply overview and order fulfillment tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none clay-shadow overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} shadow-inner`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border border-slate-100 clay-shadow overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <CardTitle className="text-slate-900 flex items-center gap-2 text-base font-black uppercase tracking-wider">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Recent Hospital Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <EmptyState title="No orders yet" description="Orders from the hospital will appear here." icon={ShoppingBag} />
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Order #{order.shortId}</p>
                        <p className="text-[10px] text-slate-500 font-medium">By {order.juniorDoctorName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">₹{order.totalCost?.toLocaleString()}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-100 clay-shadow overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <CardTitle className="text-slate-900 flex items-center gap-2 text-base font-black uppercase tracking-wider">
              <Package className="w-5 h-5 text-primary" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="space-y-4">
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  The medical shop is currently linked with the hospital's central pharmacy database. You can manage and update medicine stock levels in the <b>Manage Products</b> section.
                </p>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Supply Alert</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Ensure all product prices match the current market rates as they are shared across all medical departments.
                  </p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
