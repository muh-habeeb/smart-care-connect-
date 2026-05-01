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
  
  // Deliveries Methods
  updateDeliveryStatus: async (orderId, deliveryStatus) => {
    const updates = { deliveryStatus };
    if (deliveryStatus === 'Completed') {
      updates.status = 'Completed';
    }
    await update(ref(db, `orders/${orderId}`), updates);
  }
}));

export default useDataStore;
