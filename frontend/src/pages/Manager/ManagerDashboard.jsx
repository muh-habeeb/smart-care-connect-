import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useDataStore from '../../store/useDataStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingCart, Box, IndianRupee } from 'lucide-react';

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
    
    // Generate the last 6 months array
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleString('default', { month: 'short' });
    });

    // Initialize counts to 0
    const grouped = last6Months.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});

    // Count actual orders
    ordersList.forEach(order => {
      if (order.createdAt) {
        try {
          const orderDate = new Date(order.createdAt);
          const month = orderDate.toLocaleString('default', { month: 'short' });
          if (grouped[month] !== undefined) {
            grouped[month] += 1;
          }
        } catch (e) {
          // skip invalid dates
        }
      }
    });

    return Object.keys(grouped).map(month => ({
      name: month,
      orders: grouped[month]
    }));
  }, [orders]);

  return (
    <div className="space-y-6 smooth-enter">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Manager Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your hospital inventory and orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
            <Users className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Products</CardTitle>
            <Box className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
            <IndianRupee className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalCost.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
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
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-primary group-hover:underline">#{id.substring(1, 8)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          order.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                        ₹{order.totalCost || 0}
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
