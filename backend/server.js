import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();



// ✅ Create app FIRST
const app = express();

app.use(cors({
  origin: [
    'https://rendure.store',
    'https://www.rendure.store'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use('/images', express.static(path.join(__dirname, 'images')));
// ✅ Middleware
app.use(express.json());

// ✅ Mongo connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error:", err));

// ✅ Models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ✅ IMPORTANT
  customer: {
    name: String,
    email: String,
    country: String,
    address: String,
  },
  items: Array,
  total: Number,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

// ✅ AUTH ROUTES
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    res.json({ success: true });
} catch (err) {
  console.error("Register error:", err);
  res.status(500).json({ error: err.message });
}
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, "SECRET_KEY");

  res.json({ token, userId: user._id });
});

// ✅ ORDER ROUTE
app.post("/api/orders", async (req, res) => {
  try {
    console.log("📥 Order:", req.body);

    const newOrder = new Order({
      userId: req.body.userId, // ✅ link user
      customer: req.body.customer,
      items: req.body.items,
      total: req.body.total,
    });

    const savedOrder = await newOrder.save();

    res.json({ success: true, orderId: savedOrder._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// ✅ GET ORDERS
app.get("/api/orders", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});


app.get('/test-image', (req, res) => { res.sendFile(path.join(__dirname, 'images', 'sp2.jpg')); });

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const products = [
  {
    id: 1,
    name: "Batsuit",
    price: 1000,
    image: "sp1.jpg",
  },
  {
    id: 2,
    name: "Spider Mask",
    price: 100,
    image: "sp2.jpg",
  },
];
app.get("/api/products", (req, res) => {
  res.json(products);
});

