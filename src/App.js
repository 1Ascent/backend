import React, { useState, useEffect } from "react";
import "./App.css";
import spidervid from "./assets/images/videos/2.mp4";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";

export default function StoreStarter() {

  const [backendProducts, setBackendProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hideNav, setHideNav] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [checkoutData, setCheckoutData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
  });

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  function resetCheckout() {
    setCart([]);
    setCheckoutData({
      name: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      address: "",
    });
    setShowCheckout(false);
    setOrderSuccess(false);
    setOrderId(null);
  }

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Navbar scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScrollY + 5) setHideNav(true);
      if (current < lastScrollY - 5) setHideNav(false);
      lastScrollY = current;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch products
  useEffect(() => {
    fetch("https://onebackend-xlo8.onrender.com/api/products")
      .then(res => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then(data => {
        setBackendProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  function addToCart(product, imgElement) {
    animateFlyToCart(imgElement);

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function increaseQty(id) {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  function decreaseQty(id) {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter(item => item.qty > 0)
    );
  }

  function animateFlyToCart(imgElement) {
    if (!imgElement) return;

    const imgRect = imgElement.getBoundingClientRect();
    const cartIcon = document.getElementById("cart-icon");
    if (!cartIcon) return;

    const cartRect = cartIcon.getBoundingClientRect();

    const flyingImg = imgElement.cloneNode(true);
    flyingImg.classList.add("fly-image");
    flyingImg.style.top = imgRect.top + "px";
    flyingImg.style.left = imgRect.left + "px";
    document.body.appendChild(flyingImg);

    requestAnimationFrame(() => {
      const x = cartRect.left - imgRect.left;
      const y = cartRect.top - imgRect.top - 100;

      flyingImg.style.transform = `translate(${x}px, ${y}px) scale(0.2)`;
      flyingImg.style.opacity = "0";
    });

    setTimeout(() => flyingImg.remove(), 800);
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (
      !checkoutData.name ||
      !checkoutData.email ||
      !checkoutData.phone ||
      !checkoutData.country ||
      !checkoutData.city ||
      !checkoutData.address
    ) {
      alert("Please fill all fields");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const res = await fetch("https://onebackend-xlo8.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: checkoutData,
          items: cart,
          total: subtotal,
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      const data = await res.json();

      setOrderId(data.orderId);
      setOrderSuccess(true);
      setShowCheckout(false);
      setCart([]);
      setIsCartOpen(false);

    } catch (err) {
      console.error(err);
      alert("❌ Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className={`nav ${hideNav ? "nav-hidden" : ""}`}>
        <h1 className="brand">Rendure Store</h1>

        <div className="cart-info">
          <FontAwesomeIcon
            icon={faShoppingBag}
            id="cart-icon"
            onClick={() => setIsCartOpen(true)}
          />
          {cart.length > 0 && (
            <span className="cart-count">{cart.length}</span>
          )}
        </div>
      </header>

      {/* VIDEO */}
      <div className="video-banner">
        <video autoPlay muted loop playsInline>
          <source src={spidervid} type="video/mp4" />
        </video>
      </div>

      {/* CART */}
      <div className={`cart-sidebar ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)}>Close</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <span>{item.name}</span>
                <div className="cart-qty">
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <p className="total-amt">Total: ${subtotal.toFixed(2)}</p>
          <button
            className="checkout-btn"
            onClick={() => {
              setIsCartOpen(false);
              setShowCheckout(true);
            }}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* CHECKOUT */}
      {showCheckout && (
        <div className="checkout-modal">
          <div className="checkout-box">
            <h2>Checkout</h2>

            <form className="checkout-form" onSubmit={handlePlaceOrder}>
              {["name","email","phone","country","city","address"].map(field => (
                <input
                  key={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  required
                  onChange={e =>
                    setCheckoutData({ ...checkoutData, [field]: e.target.value })
                  }
                />
              ))}

              <h3>Order Summary</h3>

              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} x {item.qty}</span>
                  <span>${item.price * item.qty}</span>
                </div>
              ))}

              <div className="summary-total">
                <strong>Total:</strong>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              <button
                className="place-order-btn"
                type="submit"
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Placing..." : "Place Order"}
              </button>

              <button
                type="button"
                className="back-btn"
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {orderSuccess && (
        <div className="checkout-modal">
          <div className="checkout-box">
            <h2>✅ Order Confirmed</h2>
            <p>Thank you for your purchase!</p>
            <p><strong>Order ID:</strong> {orderId}</p>
            <button onClick={resetCheckout}>Back to Store</button>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <main className="container">
        {loading && <p>Loading...</p>}

        <div className="products">
          {backendProducts.map(product => (
            <div key={product.id} className="card">
              <img
                src={`https://onebackend-xlo8.onrender.com/images/${product.image.split('/').pop()}`}
                alt={product.name}
              />

              <h3>{product.name}</h3>
              <p>${product.price}</p>

              <button
                onClick={(e) => {
                  const img = e.target.closest(".card").querySelector("img");
                  addToCart(product, img);
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}