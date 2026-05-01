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
      // 1. First check if it belongs to this team
      const isMyTeam = order.juniorDoctorId === user?.id || 
                       order.seniorDoctorId === user?.id || 
                       myJuniorIds.includes(order.juniorDoctorId);

      if (!isMyTeam && order.status !== 'Waiting Approval') return false;

      // 2. Filter by mode
      if (mode === 'pending') {
        return order.status === 'Waiting Approval';
      }

      // 3. For History mode, show everything related to team
      return isMyTeam;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, user, users, mode]);

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    return sum + (products[id]?.price || 0) * qty;
  }, 0);

  const categories = [
    { id: 'Medicines', icon: Pill, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'Equipment', icon: Stethoscope, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'Laboratory Items', icon: Beaker, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
      const seniorDoc = Object.values(users).find(u => u.id === user.seniorDoctorId);
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
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {mode === 'pending' ? 'Approve Orders' : 'Order History'}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {mode === 'pending' 
                ? 'Review and authorize pending medical requests from your juniors.' 
                : 'Track your medical requests and prescriptions.'}
            </p>
          </div>
          {/* Senior Doctors cannot order - only Junior Doctors */}
          {user?.role === 'Junior Doctor' && mode === 'history' && (
            <Button className="gap-2" onClick={() => setView('categories')}>
              <Plus className="w-4 h-4" /> Create New Order
            </Button>
          )}
        </div>

        {ordersList.length === 0 ? (
          <EmptyState 
            title={mode === 'pending' ? "All caught up!" : "No orders found"} 
            description={mode === 'pending' 
              ? "There are no pending orders waiting for your approval." 
              : "You haven't placed any medical orders yet. Click 'Create New Order' to start."}
            icon={ShoppingCart}
          />
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden shadow-sm rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Order ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Items</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Cost</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Payment</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {ordersList.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-white">#{order.shortId}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{(order.items || []).length} products</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">₹{(order.totalCost || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          order.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                          order.status === 'Waiting Approval' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          order.paymentStatus === 'Refunded' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-slate-500/20 text-slate-300 border border-slate-700'
                        }`}>
                          {order.paymentStatus || 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {user.role === 'Senior Doctor' && order.status !== 'Cancelled' && order.status !== 'Completed' && (
                          <>
                            {order.status === 'Waiting Approval' && (
                              <Button variant="ghost" size="sm" onClick={() => handleEditOrder(order)} className="h-8 text-primary hover:bg-primary/10">Edit</Button>
                            )}
                            {order.paymentStatus !== 'Paid' && (
                              <>
                                <Button size="sm" onClick={() => processPayment(order.id, 'Razorpay')} className="h-8 bg-emerald-500 hover:bg-emerald-600">Pay Now</Button>
                                <Button size="sm" onClick={() => processPayment(order.id, 'COD')} className="h-8 bg-slate-800 border border-slate-600 text-white hover:bg-slate-700">COD</Button>
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
                                  className={`h-8 font-bold transition-all ${
                                    disabledReason 
                                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50' 
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white'
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
                        }} className="h-8 text-slate-300">Details</Button>
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
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Current Prescriptions</h4>
              <div className="bg-white/5 rounded-xl border border-slate-700/50 divide-y divide-slate-700/50">
                {editingOrder?.items.map((item, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center group">
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-xs text-slate-400">₹{item.price} × {item.quantity} units</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-white">₹{item.price * item.quantity}</p>
                      <button onClick={() => removeOrderItem(idx)} className="text-slate-500 hover:text-red-400 p-1 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Item Section */}
            <div className="space-y-3 pt-4 border-t border-slate-700/50">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                <Plus size={14} className="text-primary" /> Add Medical Supplies
              </h4>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search products to add..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
                {searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-700/50">
                    {productsList
                      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(product => (
                        <div 
                          key={product.id} 
                          className="p-3 hover:bg-white/5 cursor-pointer flex justify-between items-center"
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
                            <p className="text-sm font-medium text-white">{product.name}</p>
                            <p className="text-[10px] text-slate-500">{product.category}</p>
                          </div>
                          <p className="text-sm font-bold text-primary">₹{product.price}</p>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-700/50 flex justify-between items-center sticky bottom-0 bg-slate-900 pb-2">
              <div>
                <p className="text-xs text-slate-400">Total Payable Amount</p>
                <p className="text-2xl font-black text-white">₹{editingOrder?.totalCost.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-400">Cancel</Button>
                <Button onClick={saveEditedOrder} className="font-bold shadow-lg shadow-primary/20">Save & Approve</Button>
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
          <Button variant="ghost" size="sm" onClick={() => setView('history')} className="text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-semibold text-white">Select Category</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Card 
              key={cat.id} 
              className="group cursor-pointer bg-slate-900/60 backdrop-blur-xl border-slate-700/50 hover:border-primary/50 transition-all hover:translate-y-[-4px]"
              onClick={() => {
                setSelectedCategory(cat.id);
                setView('listing');
              }}
            >
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-3xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>
                  <cat.icon size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{cat.id}</h3>
                <p className="text-sm text-slate-400">Browse and add {cat.id.toLowerCase()} to your order.</p>
                <ChevronRight className="w-5 h-5 text-slate-500 mt-6 group-hover:text-primary transition-colors" />
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
            <Button variant="ghost" size="sm" onClick={() => setView('categories')} className="text-slate-300">
              <ArrowLeft className="w-4 h-4 mr-2" /> Categories
            </Button>
            <h1 className="text-2xl font-semibold text-white">{selectedCategory}</h1>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden rounded-2xl shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.category}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">₹{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      size="sm" 
                      className="h-8 shadow-md"
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
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
          <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="bg-primary/20 p-4 border-b border-slate-700/50 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-white">Current Order</h2>
              <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>
            </div>
            
            <CardContent className="p-0">
              {cartCount === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-slate-500">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  <div className="max-h-[40vh] overflow-y-auto divide-y divide-slate-700/50 p-2">
                    {Object.entries(cart).map(([id, qty]) => (
                      <div key={id} className="p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white line-clamp-1">{products[id]?.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{products[id]?.category}</p>
                          </div>
                          <button onClick={() => removeFromCart(id)} className="text-slate-500 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-400">₹{(products[id]?.price * qty).toLocaleString()}</p>
                          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button 
                              onClick={() => updateCartQty(id, qty - 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                            >-</button>
                            <span className="text-xs font-bold text-white w-4 text-center">{qty}</span>
                            <button 
                              onClick={() => updateCartQty(id, qty + 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-slate-800/50 border-t border-slate-700/50 space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-xs text-slate-400">Total Amount</p>
                      <p className="text-2xl font-bold text-white">₹{cartTotal.toLocaleString()}</p>
                    </div>
                    <Button 
                      className="w-full h-12 rounded-xl font-bold text-white shadow-lg shadow-primary/20"
                      disabled={isSubmitting}
                      onClick={handlePlaceOrder}
                    >
                      {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
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

