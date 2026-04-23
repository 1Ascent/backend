
import "./App.css";
import spidervid from "./assets/images/videos/2.mp4";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";


function MyOrders({ API_URL }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const userId = localStorage.getItem("userId");

 useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_URL}/api/my-orders/${userId}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingOrders(false);
      });
  }, [API_URL, userId]);

  if (!userId) {
    return <p style={{ color: "white", padding: "20px" }}>Please login to see your orders</p>;
  }

  return (
    <div className="orders-page">
      <h2>My Orders</h2>

      {loadingOrders ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
       <p style={{ textAlign: "center", color: "#aaa" }}>
  You haven’t placed any orders yet 🛒
</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Total:</strong> ${order.total}</p>
            <p><strong>Status:</strong> {order.status}</p>

            {order.items.map((item, i) => (
              <div key={i}>
                {item.name} x {item.qty}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}


export default function StoreStarter() {
   
  const [showOrders, setShowOrders] = useState(false);
  const [backendProducts, setBackendProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hideNav, setHideNav] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

    const [showAuth, setShowAuth] = useState(false);
 const [isLogin, setIsLogin] = useState(true);







const [authData, setAuthData] = useState({
  name: "",
  email: "",
  password: "",
});

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://onebackend-xlo8.onrender.com";

  async function handleAuth(e) {
  e.preventDefault();

  const url = isLogin
    ? `${API_URL}/api/login`
    : `${API_URL}/api/register`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authData),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error");

    if (isLogin) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      alert("✅ Logged in!");
      setShowAuth(false);
    } else {
      alert("✅ Registered! Now login.");
      setIsLogin(true);
    }

  } catch (err) {
    alert("❌ " + err.message);
  }
}


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
  fetch(`${API_URL}/api/products`)
    .then(res => res.json())
    .then(data => {
      setBackendProducts(data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Fetch error:", err);
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

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Please login first");
    setShowAuth(true);
    return;
  }

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
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
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

  
 
 {localStorage.getItem("userId") ? (
  <button
    className="auth-btn"
    onClick={() => {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      alert("Logged out");
      window.location.reload();
    }}
  >
    <FontAwesomeIcon icon={faUser} />
  </button>
) : (
  <button className="auth-btn" onClick={() => setShowAuth(true)}>
    <FontAwesomeIcon icon={faUser} />
  </button>
)}


  <button onClick={() => setShowOrders(!showOrders)}>
  {showOrders ? "Back to Store" : "My Orders"}
</button>
  

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

 {showOrders && (
  <div className="fade-page">
    <MyOrders API_URL={API_URL} />
  </div>
)}



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
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Login first");
    setShowAuth(true);
    return;
  }

  setIsCartOpen(false);
  setShowCheckout(true);
}}
          >
            Checkout
          </button>
        </div>
      </div>


      {showAuth && (
  <div className="checkout-modal">
    <div className="checkout-box">
      <h2>{isLogin ? "Login" : "Register"}</h2>

      <form onSubmit={handleAuth}>
        
        {!isLogin && (
          <input
            placeholder="Name"
            onChange={e =>
              setAuthData({ ...authData, name: e.target.value })
            }
          />
        )}

        <input
          placeholder="Email"
          onChange={e =>
            setAuthData({ ...authData, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e =>
            setAuthData({ ...authData, password: e.target.value })
          }
        />

        <button type="submit">
          {isLogin ? "Login" : "Register"}
        </button>

        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register instead" : "Login instead"}
        </p>

        <button type="button" onClick={() => setShowAuth(false)}>
          Cancel
        </button>
      </form>
    </div>
  </div>
)}


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
  type="button"
  onClick={handlePlaceOrder}
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


      
    {/* VIDEO */}
     {!showOrders && (
  <div className="video-banner">
    <video autoPlay muted loop playsInline>
      <source src={spidervid} type="video/mp4" />
    </video>
  </div>
)}
  

      {/* PRODUCTS */}
    
     {!showOrders && (
  <main className="container">
    {loading && <p>Loading...</p>}



    <div className="products">
      {backendProducts.map(product => (
        <div key={product.id} className="card">
          <img
            src={`https://onebackend-xlo8.onrender.com/images/${product.image}`}
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
)}
      

    </div>
  );
}