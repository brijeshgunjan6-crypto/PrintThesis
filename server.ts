import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Razorpay from 'razorpay';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const rzpKeyId = process.env.RAZORPAY_KEY_ID?.trim().replace(/^["'](.+)["']$/, '$1');
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim().replace(/^["'](.+)["']$/, '$1');

  const razorpay = rzpKeyId && rzpKeySecret 
    ? new Razorpay({
        key_id: rzpKeyId,
        key_secret: rzpKeySecret,
      })
    : null;
    
  console.log("Razorpay initialized:", !!razorpay);
  if (!razorpay) {
    console.warn("Razorpay keys missing or empty!");
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/config', (req, res) => {
    res.json({ razorpay_key_id: rzpKeyId });
  });

  app.post('/api/create-razorpay-order', async (req, res) => {
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay not configured' });
    }
    try {
      const { amount, currency } = req.body;
      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: currency || 'INR',
        receipt: `receipt_${Date.now()}`,
      };
      
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay API Error:", error);
      // Return the specific error from Razorpay to help the user debug
      res.status(error.statusCode || 500).json(error.error || { error: 'Failed to create Razorpay order' });
    }
  });

  // Simple mock database for users and orders
  const db = {
    users: [],
    orders: [],
  };

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = { id: Date.now().toString(), name, email, role: 'user' };
    db.users.push({ ...user, password }); // Storing verbatim for mock
    res.json({ token: `mock-jwt-token-${user.id}`, user });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const { password: _, ...userSafe } = user;
    res.json({ token: `mock-jwt-token-${user.id}`, user: userSafe });
  });

  app.post('/api/orders', (req, res) => {
    const order = { ...req.body, id: `ORD-${Date.now()}`, status: 'Order Received', createdAt: new Date().toISOString() };
    db.orders.push(order);
    res.json(order);
  });

  app.get('/api/orders', (req, res) => {
    res.json(db.orders);
  });
  
  app.get('/api/orders/:id', (req, res) => {
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Standard production hosting
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
