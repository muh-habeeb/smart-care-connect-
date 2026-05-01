import express from 'express';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { ref, runTransaction, get } from 'firebase/database';

dotenv.config();
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', verifyToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, items = [] } = req.body;

    // If items are provided, validate stock and decrement
    const updatedItems = [];
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const { id, quantity } = item;
        if (!id || !quantity || quantity <= 0) {
          // rollback any previous updates
          for (const done of updatedItems) {
            const stockRef = ref(db, `products/${done.id}/stock`);
            await runTransaction(stockRef, (current) => {
              if (current === null) return current;
              return current + done.quantity;
            });
          }
          return res.status(400).json({ error: 'Invalid item id or quantity' });
        }

        const stockRef = ref(db, `products/${id}/stock`);

        // check and decrement using transaction on the stock value
        const result = await runTransaction(stockRef, (currentStock) => {
          if (currentStock === null) return; // abort if product/stock missing
          if (currentStock >= quantity) {
            return currentStock - quantity;
          }
          return; // abort transaction if insufficient
        });

        if (!result.committed) {
          // rollback previous successful decrements
          for (const done of updatedItems) {
            const r = ref(db, `products/${done.id}/stock`);
            await runTransaction(r, (current) => {
              if (current === null) return current;
              return current + done.quantity;
            });
          }

          // fetch current available stock to provide helpful message
          const snap = await get(stockRef);
          const available = snap.exists() ? snap.val() : 0;
          return res.status(400).json({ error: `Insufficient stock for item ${id}. Available: ${available}, requested: ${quantity}` });
        }

        // record successful decrement for potential rollback
        updatedItems.push({ id, quantity });
      }
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay/Error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

export default router;
