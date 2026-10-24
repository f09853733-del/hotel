
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let currentLanguage = "fa";
let activeCategory = "all";

const form = $("#searchForm");
const destinationInput = $("#destination");
const checkinInput = $("#checkin");
const checkoutInput = $("#checkout");
const guestsInput = $("#guests");
const cards = $$(".stay-card");
const resultCount = $("#resultCount");
const noResults = $("#noResults");
const grid = $("#staysGrid");
const dialog = $("#bookingDialog");
const toast = $("#toast");

function translate(key) {
  const messages = {
    fa: {
      results: (n) => `${n} اقامتگاه`,
      invalidDates: "تاریخ خروج باید بعد از تاریخ ورود باشد.",
      pastDate: "تاریخ ورود نمی‌تواند در گذشته باشد.",
      favoritesAdded: "به علاقه‌مندی‌ها اضافه شد ♡",
      favoritesRemoved: "از علاقه‌مندی‌ها حذف شد.",
      bookingTitle: "جزئیات اقامت",
      bookingDescription: "قیمت پایه برای هر شب",
      perNight: " / شب",
      guests: (n) => `${n} مهمان`,
      newsletterSuccess: "این نسخه نمایشی است؛ ثبت ایمیل واقعی انجام نمی‌شود.",
      emailError: "لطفاً یک آدرس ایمیل معتبر وارد کن.",
      searchDone: "نتایج جست‌وجو به‌روزرسانی شد.",
      dateLabel: "تاریخ",
      from: "از",
      to: "تا"
    },
    en: {
      results: (n) => `${n} stays`,
      invalidDates: "Check-out must be after check-in.",
      pastDate: "Check-in cannot be in the past.",
      favoritesAdded: "Added to your favorites ♡",
      favoritesRemoved: "Removed from your favorites.",
      bookingTitle: "Your stay details",
      bookingDescription: "Starting price per night",
      perNight: " / night",
      guests: (n) => `${n} guests`,
      newsletterSuccess: "Demo only: your email has not been submitted.",
      emailError: "Please enter a valid email address.",
      searchDone: "Search results updated.",
      dateLabel: "Dates",
      from: "From",
      to: "To"
    }
  };

  return messages[currentLanguage][key];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// Language switcher

function setLanguage(language) {
  currentLanguage = language;

  document.documentElement.lang = language;
  document.documentElement.dir = language === "fa" ? "rtl" : "ltr";

  $("#languageBtn").textContent = language === "fa" ? "EN" : "فا";

  $$("[data-fa][data-en]").forEach((element) => {
    element.innerHTML = element.dataset[language];
  });

  $$("[data-placeholder-fa][data-placeholder-en]").forEach((element) => {
    element.placeholder =
      element.dataset[
        language === "fa" ? "placeholderFa" : "placeholderEn"
      ];
  });

  $$("[data-filter]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.filter === activeCategory
    );
  });

  updateResults();
}

$("#languageBtn").addEventListener("click", () => {
  setLanguage(currentLanguage === "fa" ? "en" : "fa");
});

// Category filters

$("#filterBar").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");

  if (!button) return;

  activeCategory = button.dataset.filter;

  $$("[data-filter]").forEach((item) => {
    item.classList.toggle("active", item === button);
  });

  updateResults();
});

// Search and filtering

function normalize(value) {
  return value
    .toLocaleLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function updateResults() {
  const query = normalize(destinationInput.value);
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesCategory =
      activeCategory === "all" ||
      card.dataset.category === activeCategory;

    const searchableText = normalize(
      card.dataset.place + " " +
      card.querySelector("h3").textContent + " " +
      card.querySelector(".stay-location").textContent
    );

    const matchesDestination =
      query === "" || searchableText.includes(query);

    const visible = matchesCategory && matchesDestination;

    card.hidden = !visible;

    if (visible) {
      visibleCount++;
    }
  });

  resultCount.textContent = translate("results")(visibleCount);
  noResults.hidden = visibleCount !== 0;
  grid.hidden = visibleCount === 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkinInput.value) {
    const arrival = new Date(checkinInput.value + "T00:00:00");

    if (arrival < today) {
      showToast(translate("pastDate"));
      return;
    }
  }

  if (checkinInput.value && checkoutInput.value) {
    if (checkoutInput.value <= checkinInput.value) {
      showToast(translate("invalidDates"));
      return;
    }
  }

  updateResults();

  $("#stays").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  if (!noResults.hidden) {
    showToast(translate("searchDone"));
  }
});

destinationInput.addEventListener("input", updateResults);

// Date restrictions

function setDateMinimums() {
  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  checkinInput.min = localDate;
  checkoutInput.min = checkinInput.value || localDate;

  if (checkinInput.value && checkoutInput.value <= checkinInput.value) {
    checkoutInput.value = "";
  }
}

checkinInput.addEventListener("change", () => {
  const arrival = checkinInput.value;

  checkoutInput.min = arrival || checkinInput.min;

  if (checkoutInput.value && checkoutInput.value <= arrival) {
    checkoutInput.value = "";
  }
});

setDateMinimums();

// Favorites

$$(".favorite-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const isFavorite = button.classList.toggle("favorited");

    button.textContent = isFavorite ? "♥" : "♡";
    button.setAttribute(
      "aria-pressed",
      String(isFavorite)
    );

    showToast(
      isFavorite
        ? translate("favoritesAdded")
        : translate("favoritesRemoved")
    );
  });
});

// Booking demo dialog

$$(".book-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    $("#dialogTitle").textContent = name;

    $("#dialogDescription").textContent =
      translate("bookingDescription");

    $("#dialogPrice").innerHTML =
      `$${price.toLocaleString("en-US")}<small>${translate("perNight")}</small>`;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      showToast(
        currentLanguage === "fa"
          ? "مرورگرت از پنجره رزرو پشتیبانی نمی‌کند."
          : "Your browser does not support the booking dialog."
      );
    }
  });
});

$("#closeDialog").addEventListener("click", () => {
  dialog.close();
});

$("#confirmDemo").addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

// Newsletter demo

$("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = $("#emailInput");
  const message = $("#newsletterMessage");

  message.classList.remove("error");

  if (!email.validity.valid) {
    message.textContent = translate("emailError");
    message.classList.add("error");
    return;
  }

  message.textContent = translate("newsletterSuccess");
  email.value = "";
});

// Image fallback: preserve the layout if an external image fails

$$("img").forEach((img) => {
  img.addEventListener("error", () => {
    img.style.opacity = "0";
    img.setAttribute("aria-label", "Image unavailable");
  });
});

// Initial state

updateResults();
