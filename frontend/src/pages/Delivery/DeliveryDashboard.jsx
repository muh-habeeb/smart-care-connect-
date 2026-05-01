import { useMemo } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useDataStore from '../../store/useDataStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Truck, Package, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export default function DeliveryDashboard() {
  const { user } = useAuthStore();
  const { orders } = useDataStore();

  const myOrders = useMemo(() => {
    return Object.entries(orders || {})
      .map(([id, data]) => ({ id, ...data }))
      .filter(order => order.deliveryPersonId === user?.id);
  }, [orders, user]);

  const stats = [
    { label: 'Assigned Orders', value: myOrders.length, icon: Package, color: 'text-primary' },
    { label: 'In Transit', value: myOrders.filter(o => o.deliveryStatus === 'In Transit').length, icon: Truck, color: 'text-amber-500' },
    { label: 'Delivered Today', value: myOrders.filter(o => o.deliveryStatus === 'Delivered').length, icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  const insights = useMemo(() => {
    const delivered = myOrders.filter(o => o.deliveryStatus === 'Delivered');
    const total = myOrders.length;
    
    // 1. Efficiency Rate
    const efficiency = total > 0 ? Math.round((delivered.length / total) * 100) : 0;
    
    // 2. Today's Earnings (5% commission on delivered orders)
    const today = new Date().toDateString();
    const earnings = delivered
      .filter(o => new Date(o.deliveredAt).toDateString() === today)
      .reduce((sum, o) => sum + (o.totalCost * 0.05), 0);
      
    // 3. Avg Delivery Time (minutes)
    const times = delivered
      .filter(o => o.deliveredAt && o.dispatchedAt)
      .map(o => (new Date(o.deliveredAt) - new Date(o.dispatchedAt)) / (1000 * 60));
    const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    return { efficiency, earnings, avgTime };
  }, [myOrders]);

  const recentOrders = myOrders.slice(0, 5).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-8 smooth-enter">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Delivery Hub
        </h1>
        <p className="text-slate-500 font-medium">
          Welcome back, {user?.name} • Managing your active logistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white border border-slate-100 clay-shadow overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50">
            <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-primary" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-12">
                <EmptyState 
                  title="No assignments" 
                  description="New delivery assignments from the manager will appear here."
                  icon={Truck}
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-mono font-bold text-primary">#{order.shortId}</p>
                        <p className="text-xs text-slate-500 font-medium">{order.items?.length || 0} items • ₹{order.totalCost}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      order.deliveryStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      order.deliveryStatus === 'In Transit' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                      {order.deliveryStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-100 clay-shadow overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50">
            <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-primary" />
              Live Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Efficiency Rate</span>
                  <span className="text-emerald-600 font-black">{insights.efficiency}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${insights.efficiency}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Avg. Delivery</p>
                  <p className="text-xl font-black text-slate-900">{insights.avgTime || '--'} min</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Today's Earnings</p>
                  <p className="text-xl font-black text-slate-900">₹{insights.earnings.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-2">Driver Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm text-emerald-700 font-bold">Online & Accepting Orders</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
