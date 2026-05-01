import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useDataStore from '../../store/useDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Brush, Legend } from 'recharts';
import { Users, ShoppingCart, Box, IndianRupee, Clock } from 'lucide-react';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { orders, users, products } = useDataStore();

  const stats = useMemo(() => {
    const ordersList = Object.values(orders);
    const totalCost = ordersList.reduce((sum, order) => sum + (order.totalCost || 0), 0);
    return {
      totalOrders: ordersList.length,
      totalUsers: Object.keys(users).length,
      totalProducts: Object.keys(products).length,
      totalCost
    };
  }, [orders, users, products]);

  const chartData = useMemo(() => {
    const ordersList = Object.values(orders || {});
    
    // Start from Jan 2025
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date();
    const months = [];
    
    let current = new Date(startDate);
    while (current <= endDate) {
      months.push({
        key: `${current.getFullYear()}-${current.getMonth()}`,
        label: current.toLocaleString('default', { month: 'short', year: '2-digit' }),
        orders: 0,
        revenue: 0
      });
      current.setMonth(current.getMonth() + 1);
    }

    ordersList.forEach(order => {
      if (order.createdAt) {
        try {
          const d = new Date(order.createdAt);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const monthData = months.find(m => m.key === key);
          if (monthData) {
            monthData.orders += 1;
            monthData.revenue += (order.totalCost || 0);
          }
        } catch (e) {}
      }
    });

    return months.map(m => ({
      name: m.label,
      orders: m.orders,
      revenue: m.revenue
    }));
  }, [orders]);

  return (
    <div className="space-y-6 smooth-enter">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Manager Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your hospital inventory and orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
            <Users className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Products</CardTitle>
            <Box className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover bg-white border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <IndianRupee className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{stats.totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/50">
          <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
            <Clock className="w-5 h-5 text-primary" />
            Performance Insights (Since Jan 2025)
          </CardTitle>
          <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
            <span className="flex items-center gap-1.5 text-primary"><div className="w-2 h-2 rounded-full bg-primary" /> Orders</span>
            <span className="flex items-center gap-1.5 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-600" /> Revenue</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  dy={10} 
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  tickFormatter={(val) => `₹${val.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                  labelStyle={{ color: '#0f172a', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                  animationDuration={1500}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  strokeDasharray="5 5"
                />
                <Brush 
                  dataKey="name" 
                  height={30} 
                  stroke="#cbd5e1" 
                  fill="#f8fafc"
                  travellerWidth={10}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card className="bg-white border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="text-slate-900 text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(orders || {})
                  .sort(([, a], [, b]) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                  .slice(0, 5)
                  .map(([id, order]) => (
                    <tr 
                      key={id} 
                      onClick={() => navigate(`/manager/orders?highlight=${id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 text-sm font-mono font-bold text-primary group-hover:text-primary transition-colors">#{order.shortId || id.substring(1, 8)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                          order.status === 'Waiting Approval' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                          'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">
                        ₹{(order.totalCost || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
