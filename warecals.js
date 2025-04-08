const brandProducts = {
  Finolex: [
    { name: "PVC Elbow", price: 50, image: "pvc-pipe.jpg", stock: 5 },
    { name: "UPVC Pipe", price: 120, image: "garden-pipe.jpg", stock: 8 },
    { name: "SWR Tee", price: 130, image: "swr-tee.jpeg", stock: 3 },
    { name: "Tank-Connector", price: 70, image: "tank-connector.jpg", stock: 2 },
    { name: "Agri-tee", price: 80, image: "tee-gri.jpg", stock: 6 },
    { name: "UpvC-Bend", price: 110, image: "upvc-bend.webp", stock: 4 },
    { name: "Bend", price: 20, image: "bend.jpg", stock: 10 },
    { name: "ASTM Elbow", price: 30, image: "astm_elbow_90-1-min.png", stock: 7 },
    { name: "SWR Elbow", price: 70, image: "swrelbo.png", stock: 3 },
    { name: "Reducing Bush", price: 10, image: "reducing bush.png", stock: 1 }
  ],
  Paras: [
    { name: "CPVC Pipe", price: 100, image: "cpvc-pipe.webp", stock: 5 },
    { name: "Tank", price: 4000, image: "tank-paras.jpg", stock: 1 },
    { name: "Brass MTA", price: 40, image: "mtabrass.png", stock: 6 }
  ],
  Elleys: [
    { name: "Screw Driver", price: 60, image: "screw-driver.webp", stock: 9 },
    { name: "Pakad", price: 150, image: "pakad.jpg", stock: 2 }
  ],
  Bajaj: [
    { name: "Ceiling Fan", price: 1200, image: "ceiling_fan.jpg", stock: 3 },
    { name: "Table Fan", price: 800, image: "table_fan.jpg", stock: 4 }
  ]
};

const cart = [];
const savedCart = JSON.parse(localStorage.getItem("warecals_cart"));
if (savedCart) {
  cart.push(...savedCart);
}

const sheetURL = "https://script.google.com/macros/s/AKfycbwirH37mhSURvZYEWotGph98cCkGAEoCRhoJqxHMkv_OoLUUZ7aqBR2jR3XgIgxicV0/exec";

window.addEventListener("DOMContentLoaded", () => {
  const footer = document.querySelector("footer");
  const productContainer = document.createElement("div");
  productContainer.classList.add("product-container");
  document.body.appendChild(productContainer);

  const cartContainer = document.createElement("div");
  cartContainer.classList.add("cart-container");
  document.body.appendChild(cartContainer);

  const backButton = document.createElement("button");
  backButton.innerText = "← Back to Brands";
  backButton.style.display = "none";
  document.body.insertBefore(backButton, productContainer);

  function renderProductCard(product, brand, container) {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    const outOfStock = product.stock <= 0;

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" width="150"><br>
      <strong>${product.name}</strong><br>
      Price: ₹${product.price}<br>
      <span>Stock: ${product.stock}</span><br>
      <input type="number" value="1" min="1" max="${product.stock}" class="quantity-input" ${outOfStock ? "disabled" : ""}>
      <button class="add-to-cart" ${outOfStock ? "disabled" : ""}>${outOfStock ? "Out of Stock" : "Add to Cart"}</button>
    `;

    if (!outOfStock) {
      productCard.querySelector(".add-to-cart").addEventListener("click", () => {
        const qty = parseInt(productCard.querySelector(".quantity-input").value);
        if (qty > product.stock) return alert("Not enough stock!");
        addToCart({ ...product, brand, quantity: qty });
        product.stock -= qty;
        productCard.querySelector("span").innerText = `Stock: ${product.stock}`;
        if (product.stock <= 0) {
          productCard.querySelector(".add-to-cart").disabled = true;
          productCard.querySelector(".add-to-cart").innerText = "Out of Stock";
          productCard.querySelector(".quantity-input").disabled = true;
        }
        renderCart(cartContainer.querySelector(".cart-items"));
        updateCartCount();
      });
    }

    container.appendChild(productCard);
  }

  document.querySelector(".search-bar button").addEventListener("click", () => {
    const query = document.querySelector(".search-bar input").value.toLowerCase();
    if (!query) return;

    const results = [];
    for (const brand in brandProducts) {
      brandProducts[brand].forEach(product => {
        if (
          product.name.toLowerCase().includes(query) ||
          brand.toLowerCase().includes(query)
        ) {
          results.push({ ...product, brand });
        }
      });
    }

    document.querySelector(".cardcontainer").style.display = "none";
    document.querySelector(".cardcontainer2").style.display = "none";
    productContainer.innerHTML = `<h2>Search Results for "${query}"</h2>`;
    cartContainer.innerHTML = `<h2>Cart</h2><div class='cart-items'></div><button id='checkout-btn'>Proceed to Payment</button>`;
    backButton.style.display = "block";

    const cartItemsDiv = cartContainer.querySelector(".cart-items");

    results.forEach(product => renderProductCard(product, product.brand, productContainer));

    document.getElementById("checkout-btn").addEventListener("click", showAddressForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".cards, .cards1").forEach(card => {
    card.addEventListener("click", () => {
      const brandName = card.querySelector("h2").innerText;
      showProducts(brandName);
    });
  });

  backButton.addEventListener("click", () => {
    document.querySelector(".cardcontainer").style.display = "block";
    document.querySelector(".cardcontainer2").style.display = "block";
    productContainer.innerHTML = "";
    cartContainer.innerHTML = "";
    backButton.style.display = "none";
  });

  function showProducts(brandName) {
    document.querySelector(".cardcontainer").style.display = "none";
    document.querySelector(".cardcontainer2").style.display = "none";
    backButton.style.display = "block";

    cartContainer.innerHTML = `<h2>Cart</h2><div class='cart-items'></div><button id='checkout-btn'>Proceed to Payment</button>`;

    const cartItemsDiv = cartContainer.querySelector(".cart-items");

    brandProducts[brandName]?.forEach(product => {
      renderProductCard(product, brandName, productContainer);
    });

    document.getElementById("checkout-btn").addEventListener("click", showAddressForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(product) {
    const existing = cart.find(p => p.name === product.name);
    if (existing) {
      existing.quantity += product.quantity;
    } else {
      cart.push(product);
    }
    localStorage.setItem("warecals_cart", JSON.stringify(cart));
  }

  function renderCart(container) {
    container.innerHTML = "";
    cart.forEach((p, index) => {
      const item = document.createElement("div");
      item.classList.add("cart-item");
      item.innerHTML = `
        ${p.name} x ${p.quantity} = ₹${p.quantity * p.price}
        <button class="remove-item" data-index="${index}">❌</button>
      `;
      container.appendChild(item);
    });

    const total = document.createElement("div");
    total.innerHTML = `<strong>Total: ₹${getTotal()}</strong>`;
    container.appendChild(total);

    container.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = e.target.dataset.index;
        cart.splice(i, 1);
        renderCart(container);
        updateCartCount();
        localStorage.setItem("warecals_cart", JSON.stringify(cart));
      });
    });
  }

  function getTotal() {
    return cart.reduce((sum, p) => sum + p.quantity * p.price, 0);
  }

  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countSpan = document.getElementById("cart-count");
    if (countSpan) countSpan.innerText = count;
  }

  function showAddressForm() {
    cartContainer.innerHTML = `
      <h2>Enter Delivery Address</h2>
      <input type="text" placeholder="Full Name" id="name"><br>
      <input type="text" placeholder="Phone Number" id="phone"><br>
      <textarea placeholder="Delivery Address" id="address"></textarea><br>
      <button id="proceed-payment">Continue to Payment</button>
    `;

    document.getElementById("proceed-payment").addEventListener("click", () => {
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();

      if (!name || !phone || !address) {
        alert("Please fill all details");
        return;
      }

      showPaymentOptions(name, phone, address);
    });
  }

  function showPaymentOptions(name, phone, address) {
    cartContainer.innerHTML = `
      <h2>Choose Payment Method</h2>
      <p>Total: ₹${getTotal()}</p>
      <button class="pay-btn" data-method="Google Pay">Google Pay</button>
      <button class="pay-btn" data-method="PhonePe">PhonePe</button>
      <button class="pay-btn" data-method="Paytm">Paytm</button>
      <div class="qr-code"></div>
    `;

    document.querySelectorAll(".pay-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const method = btn.dataset.method;
        const qrContainer = document.querySelector(".qr-code");
        let imgSrc = "qrcode.jpeg";

        qrContainer.innerHTML = `
          <h3>Scan QR for ${method}</h3>
          <img src="${imgSrc}" width="200"><br>
          <button id="finish-order">Payment Done</button>
        `;

        document.getElementById("finish-order").addEventListener("click", () => {
          const totalAmount = getTotal();
          const orderData = {
            name,
            phone,
            address,
            cart,
            total: totalAmount,
            timestamp: new Date().toLocaleString()
          };

          fetch(sheetURL, {
            method: "POST",
            body: JSON.stringify(orderData),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then(res => res.json())
            .then(response => {
              alert("Payment successful & order saved!");
              cart.length = 0;
              localStorage.removeItem("warecals_cart");
              location.reload();
            })
            .catch(error => {
              console.error("Error:", error);
              alert("Order save failed, but payment successful.");
            });
        });
      });
    });
  }
});
