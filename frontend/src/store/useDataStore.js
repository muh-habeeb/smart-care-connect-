import { create } from 'zustand';
import { db } from '../firebase';
import { ref, onValue, set, push, update, remove } from 'firebase/database';

const useDataStore = create((setStore, get) => ({
  users: {},
  products: {},
  orders: {},
  deliveries: {},
  isLoading: true,

  // Initialize listeners
  initListeners: () => {
    const usersRef = ref(db, 'users');
    const productsRef = ref(db, 'products');
    const ordersRef = ref(db, 'orders');

    onValue(usersRef, (snapshot) => {
      setStore({ users: snapshot.val() || {} });
    });

    onValue(productsRef, (snapshot) => {
      setStore({ products: snapshot.val() || {} });
    });

    onValue(ordersRef, (snapshot) => {
      setStore({ orders: snapshot.val() || {} });
      // Calculate deliveries from orders where status is past 'Approved'
      const ordersData = snapshot.val() || {};
      const deliveriesData = Object.entries(ordersData)
        .filter(([_, order]) => ['In Transit', 'Delivered', 'Completed'].includes(order.deliveryStatus))
        .reduce((acc, [id, order]) => ({ ...acc, [id]: order }), {});
      setStore({ deliveries: deliveriesData });
      
      setStore({ isLoading: false });
    });
  },

  updateUser: async (id, userData) => {
    await update(ref(db, `users/${id}`), userData);
  },
  deleteUser: async (id) => {
    await remove(ref(db, `users/${id}`));
  },

  // Products Methods
  addProduct: async (productData) => {
    const newRef = push(ref(db, 'products'));
    await set(newRef, { ...productData, createdAt: new Date().toISOString() });
  },
  updateProduct: async (id, productData) => {
    await update(ref(db, `products/${id}`), productData);
  },
  deleteProduct: async (id) => {
    await remove(ref(db, `products/${id}`));
  },

  // Orders Methods
  addOrder: async (orderData) => {
    const newRef = push(ref(db, 'orders'));
    // Generate 5-char short ID
    const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
    await set(newRef, { 
      ...orderData, 
      shortId,
      status: 'Waiting Approval',
      deliveryStatus: 'Pending',
      createdAt: new Date().toISOString() 
    });
  },
  updateOrder: async (id, orderData) => {
    await update(ref(db, `orders/${id}`), orderData);
  },

  updateOrderItems: async (id, items, totalCost, seniorInfo = {}) => {
    await update(ref(db, `orders/${id}`), { 
      items, 
      totalCost,
      ...seniorInfo
    });
  },

  markOrderAsPaid: async (id, paymentMethod, seniorInfo = {}) => {
    await update(ref(db, `orders/${id}`), { 
      paymentMethod, 
      paymentStatus: 'Paid',
      status: 'Waiting for Delivery Assignment',
      ...seniorInfo
    });
  },

  cancelOrder: async (id) => {
    const orders = get().orders;
    const order = orders[id];
    const updates = { 
      status: 'Cancelled',
      deliveryStatus: 'Cancelled',
      cancelledAt: new Date().toISOString()
    };

    if (order?.paymentStatus === 'Paid') {
      updates.paymentStatus = 'Refunded';
    }

    await update(ref(db, `orders/${id}`), updates);
  },
  
  // Deliveries Methods
  updateDeliveryStatus: async (orderId, deliveryStatus) => {
    const updates = { deliveryStatus };
    if (deliveryStatus === 'Delivered') {
      updates.status = 'Completed';
      updates.deliveredAt = new Date().toISOString();
    }
    if (deliveryStatus === 'In Transit') {
      updates.dispatchedAt = new Date().toISOString();
    }
    await update(ref(db, `orders/${orderId}`), updates);
  }
}));

export default useDataStore;
