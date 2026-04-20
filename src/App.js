
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

  const [checkoutData, setCheckoutData] = useState({
    name: "",
    email: "",
    country: "",
    address: "",
  });

  // ✅ Safe localStorage load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  }, []);

  // ✅ Save cart
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // NAV SCROLL
  useEffect(() => {
    if (typeof window === "undefined") return;

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

  // FETCH PRODUCTS
  useEffect(() => {
    fetch("https://rendure-backend.onrender.com/api/products")
      .then(res => res.json())
      .then(data => {
        setBackendProducts(data);
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
    if (!imgElement || typeof window === "undefined") return;

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

    await fetch("https://rendure-backend.onrender.com/api/orders", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        customer: checkoutData,
        items: cart,
        total: subtotal
      })
    });

    setOrderSuccess(true);
    setShowCheckout(false);
    setCart([]);
  }

  function resetCheckout() {
    setCart([]);
    setCheckoutData({
      name: "",
      email: "",
      country: "",
      address: "",
    });
    setShowCheckout(false);
    setOrderSuccess(false);
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className={`nav ${hideNav ? "nav-hidden" : ""}`}>
        <h1 className="brand">My Store</h1>

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
      {isCartOpen && (
        <div className="cart-sidebar">
          <button onClick={() => setIsCartOpen(false)}>Close</button>

          {cart.map(item => (
            <div key={item.id}>
              {item.name} x {item.qty}
              <button onClick={() => increaseQty(item.id)}>+</button>
              <button onClick={() => decreaseQty(item.id)}>-</button>
            </div>
          ))}

          <p>Total: ${subtotal.toFixed(2)}</p>

          <button onClick={() => {
            setIsCartOpen(false);
            setShowCheckout(true);
          }}>
            Checkout
          </button>
        </div>
      )}

      {/* CHECKOUT */}
      {showCheckout && (
        <form onSubmit={handlePlaceOrder}>
          <input placeholder="Name"
            onChange={e => setCheckoutData({...checkoutData, name: e.target.value})}/>
          <input placeholder="Email"
            onChange={e => setCheckoutData({...checkoutData, email: e.target.value})}/>
          <input placeholder="Country"
            onChange={e => setCheckoutData({...checkoutData, country: e.target.value})}/>

          <button type="submit">Place Order</button>
        </form>
      )}

      {/* SUCCESS */}
      {orderSuccess && (
        <div>
          <h2>Order Placed 🎉</h2>
          <button onClick={resetCheckout}>Back</button>
        </div>
      )}

      {/* PRODUCTS */}
      <main className="container">
        {loading && <p>Loading...</p>}

        <div className="products">
          {backendProducts.map(product => (
            <div key={product.id} className="card">
              <img src={product.image} alt={product.name} />

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

