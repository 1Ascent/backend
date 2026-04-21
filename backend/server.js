
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ Middleware
app.use(cors()); // allow all origins
app.use(express.json());

// ✅ Serve images
app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ In-memory storage
let orders = [];

// ✅ Products
const products = [
  {
    id: 1,
    name: "Batsuit",
    price: 1000,
    image: "https://onebackend-xlo8.onrender.com./images/sp1.jpg",
  },
  {
    id: 2,
    name: "Spider Mask",
    price: 100,
    image: "https://onebackend-xlo8.onrender.com/images/sp2.jpg",
  },
];

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Backend running");
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/orders", (req, res) => {
  const order = {
    id: Date.now(),
    customer: req.body.customer,
    items: req.body.items,
    total: req.body.total,
    status: "pending",
    createdAt: new Date(),
  };

  orders.push(order);

  console.log("🧾 New order:", order);

  res.status(201).json({
    success: true,
    orderId: order.id,
  });
});

app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// ✅ Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

