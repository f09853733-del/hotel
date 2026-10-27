
const products = [
  {
    id: 1,
    name: "رینگ اسپرت خودرو",
    category: "لوازم جانبی",
    price: 8500000,
    rating: 4.9,
    tag: "پرفروش",
    icon: "🛞",
    image: "images/sport-rim.jpg",
    description: "طراحی اسپرت و ظاهری متفاوت برای خودروی شما"
  },
  {
    id: 2,
    name: "روغن موتور پریمیوم",
    category: "روغن و نگهداری",
    price: 1250000,
    rating: 4.8,
    tag: "محبوب",
    icon: "🛢️",
    image: "images/premium-engine-oil.jpg",
    description: "مناسب برای سرویس و نگهداری خودرو"
  },
  {
    id: 3,
    name: "دوربین ثبت وقایع",
    category: "تجهیزات الکترونیکی",
    price: 3200000,
    rating: 4.7,
    tag: "ویژه",
    icon: "📹",
    image: "images/dash-camera.jpg",
    description: "تجهیزات کاربردی برای رانندگی مطمئن‌تر"
  },
  {
    id: 4,
    name: "چراغ LED خودرو",
    category: "روشنایی خودرو",
    price: 980000,
    rating: 4.8,
    tag: "پیشنهادی",
    icon: "💡",
    image: "images/led-car-lights.jpg",
    description: "روشنایی مدرن برای خودروی شما"
  },
  {
    id: 5,
    name: "کف‌پوش خودرو",
    category: "لوازم جانبی",
    price: 1450000,
    rating: 4.6,
    tag: "جدید",
    icon: "🚘",
    image: "images/car-floor-mats.jpg",
    description: "لوازم کاربردی برای فضای داخلی خودرو"
  },
  {
    id: 6,
    name: "مجموعه ابزار خودرو",
    category: "قطعات یدکی",
    price: 2100000,
    rating: 4.7,
    tag: "کاربردی",
    icon: "🔧",
    image: "images/car-tool-kit.jpg",
    description: "ابزار مناسب برای نگهداری و تعمیرات"
  },
  {
    id: 7,
    name: "شارژر فندکی خودرو",
    category: "تجهیزات الکترونیکی",
    price: 490000,
    rating: 4.5,
    tag: "محبوب",
    icon: "🔌",
    image: "images/car-charger.jpg",
    description: "وسیله‌ای کاربردی برای سفرهای روزانه"
  },
  {
    id: 8,
    name: "کیت ایمنی خودرو",
    category: "ایمنی خودرو",
    price: 760000,
    rating: 4.8,
    tag: "ضروری",
    icon: "🧰",
    image: "images/car-safety-kit.jpg",
    description: "تجهیزات کاربردی برای آمادگی در سفر"
  }
];

const productGrid = document.getElementById("productGrid");
const emptyMessage = document.getElementById("emptyMessage");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

let activeCategory = "همه";
let searchTerm = "";
let cart = [];
let toastTimeout;

function formatPrice(price) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function renderProducts() {
  const filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "همه" || product.category === activeCategory;

    const text = (
      product.name + " " +
      product.category + " " +
      product.description
    ).toLocaleLowerCase("fa");

    const matchesSearch = text.includes(searchTerm.toLocaleLowerCase("fa"));

    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = "";
  emptyMessage.hidden = filtered.length !== 0;

  filtered.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.style.animationDelay = `${index * 60}ms`;

    card.innerHTML = `
      <div class="product-image">
        <div class="product-placeholder" aria-hidden="true">${product.icon}</div>
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-rating">★ ★ ★ ★ ★ <small>${product.rating} از ۵</small></div>
        <div class="product-bottom">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="add-cart" data-add="${product.id}">＋ افزودن به سبد</button>
        </div>
      </div>
    `;

    const img = card.querySelector("img");
    const placeholder = card.querySelector(".product-placeholder");

    img.addEventListener("load", () => {
      placeholder.style.display = "none";
    });

    img.addEventListener("error", () => {
      img.style.display = "none";
      placeholder.style.display = "grid";
    });

    productGrid.appendChild(card);
  });
}

function setCategory(category) {
  activeCategory = category;

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === category);
  });

  renderProducts();
}

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    setCategory(button.dataset.filter);
  });
});

document.querySelectorAll(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    setCategory(category);

    document.getElementById("products").scrollIntoView({
      behavior: "smooth"
    });
  });
});

// جست‌وجوی محصولات
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");

document.getElementById("searchToggle").addEventListener("click", () => {
  searchPanel.classList.toggle("open");

  if (searchPanel.classList.contains("open")) {
    searchInput.focus();
  }
});

function runSearch() {
  searchTerm = searchInput.value.trim();
  renderProducts();

  document.getElementById("products").scrollIntoView({
    behavior: "smooth"
  });
}

document.getElementById("searchButton").addEventListener("click", runSearch);

searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") runSearch();
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  renderProducts();
});

// منوی موبایل
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

// سبد خرید
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    nav.classList.remove("open");
    searchPanel.classList.remove("open");
  }
});

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const id = Number(button.dataset.add);
  const product = products.find(item => item.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  showToast(`${product.name} به سبد خرید اضافه شد.`);
});

function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = new Intl.NumberFormat("fa-IR").format(totalQuantity);
  cartTotal.textContent = formatPrice(totalPrice);
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">سبد خرید شما خالی است 🛒</p>';
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
     <div class="cart-item-icon">
  ${item.image
    ? `<img src="${item.image}" alt="${item.name}" class="cart-product-image" onerror="this.style.display='none'">`
    : item.icon}
</div>
      <div class="cart-item-info">
        <h4></h4>
        <p>${formatPrice(item.price)}</p>
        <div class="quantity">
          <button data-action="increase" data-id="${item.id}" aria-label="افزایش تعداد">+</button>
          <span>${new Intl.NumberFormat("fa-IR").format(item.quantity)}</span>
          <button data-action="decrease" data-id="${item.id}" aria-label="کاهش تعداد">−</button>
        </div>
      </div>
      <button class="remove-item" data-action="remove" data-id="${item.id}">حذف</button>
    `;

    row.querySelector("h4").textContent = item.name;
    cartItems.appendChild(row);
  });
}

cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const item = cart.find(product => product.id === id);

  if (!item) return;

  if (action === "increase") item.quantity++;
  if (action === "decrease") item.quantity--;
  if (action === "remove" || item.quantity <= 0) {
    cart = cart.filter(product => product.id !== id);
  }

  renderCart();
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("ابتدا محصولی به سبد خرید اضافه کنید.");
    return;
  }

  showToast("این نسخه نمایشی است؛ پرداخت واقعی فعال نیست.");
});

// فرم نمایشی خبرنامه
document.getElementById("newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const emailInput = document.getElementById("emailInput");

  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }

  showToast("فرم آزمایشی با موفقیت بررسی شد.");
  emailInput.value = "";
});

// اجرای اولیه
renderProducts();
renderCart();


/* AUTO LUXE intro: auto-enter after 3 seconds */
(() => {
  const intro = document.getElementById("introScreen");

  if (!intro) return;

  const closeIntro = () => {
    intro.classList.add("intro-hidden");

    window.setTimeout(() => {
      intro.remove();
    }, 800);
  };

  window.setTimeout(closeIntro, 3000);
})();
// AUTO LUXE Intro Screen
document.addEventListener("DOMContentLoaded", function () {
  const introScreen = document.getElementById("introScreen");

  if (introScreen) {
    setTimeout(function () {
      introScreen.classList.add("intro-hidden");
    }, 2000);
  }
});

