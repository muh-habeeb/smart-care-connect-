import { useMemo } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useDataStore from '../../store/useDataStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, ShoppingCart, Clock, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const { users, orders } = useDataStore();

  const usersList = Object.entries(users || {}).map(([id, data]) => ({ id, ...data }));
  const ordersList = Object.entries(orders || {}).map(([id, data]) => ({ id, ...data }));

  // 1. Get Junior Doctors under this Senior Doctor
  const myJuniorDoctors = useMemo(() => {
    if (user?.role !== 'Senior Doctor') return [];
    return usersList.filter(u => u.role === 'Junior Doctor' && u.seniorDoctorId === user.id);
  }, [usersList, user]);

  // 2. Get Orders related to this Doctor
  const myOrders = useMemo(() => {
    const myJuniorIds = myJuniorDoctors.map(j => j.id);
    
    return ordersList.filter(order => {
      if (user?.role === 'Senior Doctor') {
        return (
          order.seniorDoctorId === user?.id || 
          order.status === 'Waiting Approval' || 
          myJuniorIds.includes(order.juniorDoctorId)
        );
      }
      return order.juniorDoctorId === user?.id || order.seniorDoctorId === user?.id;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [ordersList, user, myJuniorDoctors, users]);

  const stats = [
    { 
      label: user?.role === 'Senior Doctor' ? 'Junior Doctors' : 'My Requests', 
      value: user?.role === 'Senior Doctor' ? myJuniorDoctors.length : myOrders.length, 
      icon: user?.role === 'Senior Doctor' ? Users : ShoppingCart,
      color: 'text-primary' 
    },
    { 
      label: 'Pending Orders', 
      value: myOrders.filter(o => o.status === 'Waiting Approval').length, 
      icon: Clock,
      color: 'text-amber-400' 
    },
    { 
      label: 'Completed', 
      value: myOrders.filter(o => o.status === 'Completed').length, 
      icon: CheckCircle2,
      color: 'text-emerald-400' 
    }
  ];

  return (
    <div className="space-y-8 smooth-enter">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome, Dr. {user?.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 font-medium">
          {user?.role} • Hospital Medical Staff
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white border-slate-100 clay-shadow transition-all hover:shadow-md rounded-3xl">
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
        {/* Junior Doctors List (Only for Senior Doctors) */}
        {user?.role === 'Senior Doctor' && (
          <Card className="bg-white border-slate-100 clay-shadow overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-primary" />
                Assigned Junior Doctors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {myJuniorDoctors.length === 0 ? (
                <div className="p-8">
                  <EmptyState 
                    title="No junior doctors assigned" 
                    description="You don't have any junior doctors under your supervision yet."
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {myJuniorDoctors.map((junior) => (
                    <div key={junior.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {junior.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{junior.name}</p>
                          <p className="text-xs text-slate-500">{junior.email}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                        Junior Doctor
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity / Orders Preview */}
        <Card className="bg-white border-slate-100 clay-shadow overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50">
            <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {myOrders.length === 0 ? (
              <div className="p-8">
                <EmptyState 
                  title="No orders found" 
                  description="You haven't placed or reviewed any orders yet."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {myOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-mono font-bold text-primary">#{order.shortId}</p>
                      <p className="text-xs text-slate-500 font-medium">Total: ₹{order.totalCost}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      order.status === 'Waiting Approval' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
