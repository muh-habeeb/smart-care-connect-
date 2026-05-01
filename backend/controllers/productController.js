import { db } from '../config/firebase.js';
import { ref, push, set, get } from 'firebase/database';

export const createProduct = async (req, res) => {
  try {
    const { name, category, stock } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: 'Please provide required fields' });
    }

    const productsRef = ref(db, 'products');
    const newProductRef = push(productsRef);
    
    const newProductData = {
      name,
      category,
      stock: stock || 0,
      createdAt: new Date().toISOString()
    };

    await set(newProductRef, newProductData);
    res.status(201).json({ id: newProductRef.key, ...newProductData });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'products'));
    if (snapshot.exists()) {
      res.status(200).json(snapshot.val());
    } else {
      res.status(200).json({});
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
