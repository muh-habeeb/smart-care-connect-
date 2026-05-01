import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import useDataStore from '../../store/useDataStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  ShoppingCart, Plus, Trash2, Package, ArrowLeft, 
  Pill, Stethoscope, Beaker, ShoppingBag, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import OrderDetails from '../../components/orders/OrderDetails';

export default function DoctorOrders({ mode = 'history' }) {
  const { user } = useAuthStore();
  const { orders, products, addOrder, users } = useDataStore();

  const [view, setView] = useState('history'); // 'history', 'categories', 'listing'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal States
  const [editingOrder, setEditingOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const productsList = useMemo(() => Object.entries(products || {}).map(([id, data]) => ({ id, ...data })), [products]);
  const ordersList = useMemo(() => {
    const list = Object.entries(orders || {}).map(([id, data]) => ({ id, ...data }));
    const myJuniorIds = Object.values(users)
      .filter(u => u.role === 'Junior Doctor' && u.seniorDoctorId === user?.id)
      .map(u => u.id);

    return list.filter(order => {
      const isMyOwnOrder = order.juniorDoctorId === user?.id || order.seniorDoctorId === user?.id;
      const isMyJuniorOrder = myJuniorIds.includes(order.juniorDoctorId);
      const isTeamOrder = isMyOwnOrder || isMyJuniorOrder;

      if (mode === 'pending') {
        // Senior Doctors see all "Waiting Approval" orders across the hospital
        if (user?.role === 'Senior Doctor') {
          return order.status === 'Waiting Approval';
        }
        // Juniors see their full history in the main orders view (not just pending)
        return isMyOwnOrder;
      }

      // History mode: Show all orders belonging to the team/user
      return isTeamOrder;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, user, users, mode]);

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    return sum + (products[id]?.price || 0) * qty;
  }, 0);

  const categories = [
    { id: 'Medicines', icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Equipment', icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/5' },
    { id: 'Laboratory Items', icon: Beaker, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const addToCart = (productId) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast.success('Added to cart', { duration: 1000, position: 'bottom-right' });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const updateCartQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => ({ ...prev, [productId]: qty }));
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const seniorEntry = Object.entries(users || {}).find(([uid]) => uid === user?.seniorDoctorId);
      const seniorDoc = seniorEntry ? { id: seniorEntry[0], ...seniorEntry[1] } : undefined;
      const orderData = {
        juniorDoctorId: user.id,
        juniorDoctorName: user.name,
        seniorDoctorId: user.seniorDoctorId || '',
        seniorDoctorName: seniorDoc?.name || 'Unassigned',
        items: Object.entries(cart).map(([id, qty]) => ({
          productId: id,
          name: products[id].name,
          price: products[id].price,
          quantity: qty,
          category: products[id].category
        })),
        totalCost: cartTotal,
        status: 'Waiting Approval',
        paymentStatus: 'Unpaid',
        paymentMethod: 'None',
        deliveryStatus: 'Pending'
      };

      await addOrder(orderData);
      toast.success('Order placed successfully!');
      setCart({});
      setView('history');
    } catch (err) {
      toast.error('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Senior Doctor Actions
  const handleEditOrder = (order) => {
    setEditingOrder({ ...order });
    setIsEditModalOpen(true);
  };

  const removeOrderItem = (index) => {
    const newItems = [...editingOrder.items];
    newItems.splice(index, 1);
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setEditingOrder({ ...editingOrder, items: newItems, totalCost: newTotal });
  };

  const saveEditedOrder = async () => {
    try {
      const { updateOrderItems } = useDataStore.getState();
      await updateOrderItems(editingOrder.id, editingOrder.items, editingOrder.totalCost, {
        seniorDoctorId: user.id,
        seniorDoctorName: user.name
      });
      toast.success('Order updated');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
    
    try {
      const { cancelOrder } = useDataStore.getState();
      await cancelOrder(order.id);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const getCancelDisabledReason = (order) => {
    if (order.status === 'Cancelled') return "Already cancelled";
    if (order.status === 'Completed') return "Cannot cancel completed orders";
    if (order.paymentMethod === 'Razorpay') return "Cannot cancel after online payment";
    if (order.paymentMethod === 'COD' && order.deliveryPerson) return "Cannot cancel after delivery assignment";
    return null;
  };

  const processPayment = async (orderId, method) => {
    const seniorInfo = {
      seniorDoctorId: user.id,
      seniorDoctorName: user.name
    };

    if (method === 'COD') {
      const { markOrderAsPaid } = useDataStore.getState();
      await markOrderAsPaid(orderId, 'COD', seniorInfo);
      toast.success('Order confirmed with COD');
      return;
    }

    try {
      const order = orders[orderId];
      const { default: api } = await import('../../lib/api');
      
      // 1. Create order on backend
      const { data: rzpOrder } = await api.post('/payment/create-order', {
        amount: order.totalCost,
        receipt: `receipt_${order.shortId}`
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "SmartCareConnect",
        description: `Order Payment #${order.shortId}`,
        order_id: rzpOrder.id,
        handler: async function (response) {
          const { markOrderAsPaid } = useDataStore.getState();
          await markOrderAsPaid(orderId, 'Razorpay', seniorInfo);
          toast.success('Payment Successful!');
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#8b5cf6" },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error('Payment initialization failed');
    }
  };

  // 1. History View
  if (view === 'history') {
    return (
      <div className="space-y-6 smooth-enter">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {user?.role === 'Senior Doctor' 
                ? (mode === 'pending' ? 'Approve Orders' : 'Order History')
                : 'My Orders'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {user?.role === 'Senior Doctor'
                ? (mode === 'pending' ? 'Review and authorize medical requests from your juniors.' : 'Track team medical requests and prescriptions.')
                : 'Manage and track your medical requests and prescriptions.'}
            </p>
          </div>
          {/* Create Order Button for Juniors */}
          {user?.role === 'Junior Doctor' && (
            <Button className="gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => setView('categories')}>
              <Plus className="w-4 h-4" /> Create New Order
            </Button>
          )}
        </div>

        {/* Senior Doctor Info Card for Junior Doctors */}
        {user?.role === 'Junior Doctor' && (() => {
          const seniorEntry = Object.entries(users || {}).find(([uid]) => uid === user?.seniorDoctorId);
            const seniorDoc = seniorEntry ? { id: seniorEntry[0], ...seniorEntry[1] } : undefined;
            return seniorDoc ? (
            <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Your Senior Doctor</p>
                  <p className="text-lg font-bold text-slate-900">{seniorDoc.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{seniorDoc.email}</p>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {ordersList.length === 0 ? (
          <EmptyState 
            title={mode === 'pending' ? "All caught up!" : "No orders found"} 
            description={mode === 'pending' 
              ? "There are no pending orders waiting for your approval." 
              : "You haven't placed any medical orders yet. Click 'Create New Order' to start."}
            icon={ShoppingCart}
          />
        ) : (
          <div className="bg-white border border-slate-100 overflow-hidden clay-shadow rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Items</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cost</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Payment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ordersList.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-bold text-primary">#{order.shortId}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{(order.items || []).length} products</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">₹{(order.totalCost || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                          order.status === 'Waiting Approval' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          order.paymentStatus === 'To be Paid' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          order.paymentStatus === 'Refunded' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                          {order.paymentStatus || 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {user.role === 'Senior Doctor' && order.status !== 'Cancelled' && order.status !== 'Completed' && (
                          <>
                            {order.status === 'Waiting Approval' && (
                              <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)} className="h-8 text-primary hover:bg-primary/5">Edit</Button>
                            )}
                            {order.paymentStatus !== 'Paid' && (
                              <>
                                <Button size="sm" onClick={() => processPayment(order.id, 'Razorpay')} className="h-8 bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/20">Pay Now</Button>
                                {order.paymentStatus !== 'To be Paid' && (
                                  <Button size="sm" onClick={() => processPayment(order.id, 'COD')} className="h-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">COD</Button>
                                )}
                              </>
                            )}
                            
                            {/* Cancel Button */}
                            {(() => {
                              const disabledReason = getCancelDisabledReason(order);
                              return (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleCancelOrder(order)}
                                  disabled={!!disabledReason}
                                  title={disabledReason || "Cancel this order"}
                                  className={`h-8 font-black text-[10px] uppercase tracking-wider transition-all border ${
                                    disabledReason 
                                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                                      : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500'
                                  }`}
                                >
                                  Cancel
                                </Button>
                              );
                            })()}
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedDetailsOrder(order);
                          setIsDetailsModalOpen(true);
                        }} className="h-8 text-slate-500">Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Detailed Order Invoice">
          <OrderDetails order={selectedDetailsOrder} onClose={() => setIsDetailsModalOpen(false)} />
        </Modal>

        {/* Edit Order Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit & Refine Order">
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
            {/* Current Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Current Prescriptions</h4>
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 divide-y divide-slate-200">
                {editingOrder?.items.map((item, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center group hover:bg-white transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">₹{item.price} × {item.quantity} units</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-slate-900">₹{item.price * item.quantity}</p>
                      <button onClick={() => removeOrderItem(idx)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Item Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Plus size={14} className="text-primary" /> Add Medical Supplies
              </h4>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search products to add..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
                {searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-50 overflow-hidden">
                    {productsList
                      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(product => (
                        <div 
                          key={product.id} 
                          className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
                          onClick={() => {
                            const newItems = [...(editingOrder.items || [])];
                            const existingItem = newItems.find(i => i.productId === product.id);
                            
                            if (existingItem) {
                              existingItem.quantity += 1;
                            } else {
                              newItems.push({
                                productId: product.id,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                category: product.category
                              });
                            }
                            
                            const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                            setEditingOrder({ ...editingOrder, items: newItems, totalCost: newTotal });
                            setSearchTerm('');
                            toast.success(`Added ${product.name}`);
                          }}
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">{product.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase">{product.category}</p>
                          </div>
                          <p className="text-sm font-black text-primary">₹{product.price}</p>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-100 flex justify-between items-center sticky bottom-0 bg-white pb-2">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Payable</p>
                <p className="text-2xl font-black text-slate-900">₹{editingOrder?.totalCost.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-500">Cancel</Button>
                <Button onClick={saveEditedOrder} className="font-bold shadow-md">Save & Approve</Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // 2. Categories View
  if (view === 'categories') {
    return (
      <div className="space-y-8 smooth-enter">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setView('history')} className="text-slate-500 hover:bg-slate-100 rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
          </Button>
          <h1 className="text-2xl font-semibold text-slate-900">Select Category</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Card 
              key={cat.id} 
              className="group cursor-pointer bg-white border border-slate-100 hover:border-primary/30 transition-all hover:-translate-y-1 shadow-sm hover:shadow-md rounded-3xl"
              onClick={() => {
                setSelectedCategory(cat.id);
                setView('listing');
              }}
            >
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-3xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                  <cat.icon size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{cat.id}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">Browse and add {cat.id.toLowerCase()} to your medical order.</p>
                <div className="mt-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 3. Product Listing View
  const filteredProducts = productsList.filter(p => p.category === selectedCategory);

  return (
    <div className="flex flex-col lg:flex-row gap-8 smooth-enter">
      {/* Product List */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setView('categories')} className="text-slate-500 hover:bg-slate-100 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedCategory}</h1>
          </div>
        </div>

        <div className="bg-white border border-slate-100 overflow-hidden rounded-2xl clay-shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{product.category}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-black">₹{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      size="sm" 
                      className="h-8 shadow-sm font-bold"
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add to Order
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-6">
          <Card className="bg-white border border-slate-100 clay-shadow overflow-hidden rounded-3xl">
            <div className="bg-primary/5 p-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Current Order</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{cartCount} items selected</p>
              </div>
            </div>
            
            <CardContent className="p-0">
              {cartCount === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Your medical order is currently empty.</p>
                </div>
              ) : (
                <>
                  <div className="max-h-[40vh] overflow-y-auto divide-y divide-slate-50 p-2 custom-scrollbar">
                    {Object.entries(cart).map(([id, qty]) => (
                      <div key={id} className="p-4 space-y-3 group hover:bg-slate-50 transition-colors rounded-2xl">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{products[id]?.name}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{products[id]?.category}</p>
                          </div>
                          <button onClick={() => removeFromCart(id)} className="text-slate-300 hover:text-red-500 p-1 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-900 font-black">₹{(products[id]?.price * qty).toLocaleString()}</p>
                          <div className="flex items-center gap-3 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                            <button 
                              onClick={() => updateCartQty(id, qty - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                            >-</button>
                            <span className="text-xs font-black text-slate-900 w-4 text-center">{qty}</span>
                            <button 
                              onClick={() => updateCartQty(id, qty + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Payable</p>
                        <p className="text-2xl font-black text-slate-900">₹{cartTotal.toLocaleString()}</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Medical Order'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

