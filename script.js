
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const searchForm = $("#searchForm");
const destinationInput = $("#destination");
const checkinInput = $("#checkin");
const checkoutInput = $("#checkout");
const guestsInput = $("#guests");
const staysGrid = $("#staysGrid");
const stayCards = $$(".stay-card");
const filterButtons = $$(".filter-btn");
const sortSelect = $("#sortSelect");
const resultCount = $("#resultCount");
const noResults = $("#noResults");
const searchHint = $("#searchHint");
const bookingDialog = $("#bookingDialog");
const toast = $("#toast");

let activeCategory = "all";
let currentLanguage = "fa";
let favoriteCount = 0;
let toastTimeout;

const faDigits = value => String(value).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[digit]);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function setLanguage(language) {
  currentLanguage = language;

  const isEnglish = language === "en";
  document.documentElement.lang = language;
  document.documentElement.dir = isEnglish ? "ltr" : "rtl";
  document.title = isEnglish
    ? "LUMIÈRE HOTELS | Luxury Stays"
    : "LUMIÈRE HOTELS | رزرو اقامتگاه لوکس";

  $$("[data-fa][data-en]").forEach(element => {
    const value = element.dataset[language];
    if (value !== undefined) {
      element.innerHTML = value;
    }
  });

  $$("[data-placeholder-fa][data-placeholder-en]").forEach(element => {
    element.placeholder = element.dataset[
      isEnglish ? "placeholderEn" : "placeholderFa"
    ];
  });

  $$("option[data-fa][data-en]").forEach(option => {
    option.textContent = option.dataset[language];
  });

  // متن گزینه‌های تعداد مسافران
  [...guestsInput.options].forEach(option => {
    const number = Number(option.value);
    option.textContent = isEnglish
      ? `${number} ${number === 1 ? "guest" : "guests"}`
      : `${faDigits(number)} نفر`;
  });

  // به‌روزرسانی نام دکمه‌های رزرو
  $$(".book-btn").forEach(button => {
    const name = isEnglish
      ? button.dataset.nameEn
      : button.dataset.nameFa;

    button.setAttribute(
      "aria-label",
      `${isEnglish ? "View and book" : "مشاهده و رزرو"} ${name}`
    );
  });

  // به‌روزرسانی متن‌های پویا
  updateResults();
  updateSearchHint();
}

function updateSearchHint(message) {
  if (message) {
    searchHint.textContent = message;
    return;
  }

  searchHint.textContent = currentLanguage === "en"
    ? "Choose your dates and explore our curated collection."
    : "تاریخ سفرت را انتخاب کن و از میان اقامتگاه‌های منتخب بگرد.";
}

function getSearchValues() {
  return {
    destination: destinationInput.value.trim().toLocaleLowerCase(),
    category: activeCategory,
    sort: sortSelect.value
  };
}

function getVisibleCards() {
  const { destination, category } = getSearchValues();

  return stayCards.filter(card => {
    const matchesCategory =
      category === "all" || card.dataset.category === category;

    const searchableText = [
      card.dataset.place,
      card.querySelector("h3")?.dataset.fa,
      card.querySelector("h3")?.dataset.en,
      card.textContent
    ].join(" ").toLocaleLowerCase();

    const matchesDestination =
      !destination || searchableText.includes(destination);

    return matchesCategory && matchesDestination;
  });
}

function updateResults() {
  const visibleCards = getVisibleCards();
  const { sort } = getSearchValues();

  const sortedCards = [...visibleCards];

  if (sort === "low") {
    sortedCards.sort(
      (a, b) => Number(a.dataset.price) - Number(b.dataset.price)
    );
  } else if (sort === "high") {
    sortedCards.sort(
      (a, b) => Number(b.dataset.price) - Number(a.dataset.price)
    );
  } else if (sort === "rating") {
    sortedCards.sort(
      (a, b) => Number(b.dataset.rating) - Number(a.dataset.rating)
    );
  }

  sortedCards.forEach((card, index) => {
    card.hidden = false;
    card.style.order = index;
    card.style.animationDelay = `${Math.min(index, 5) * 60}ms`;
    staysGrid.appendChild(card);
  });

  stayCards.forEach(card => {
    if (!sortedCards.includes(card)) {
      card.hidden = true;
    }
  });

  noResults.hidden = sortedCards.length > 0;

  resultCount.textContent = currentLanguage === "en"
    ? `${sortedCards.length} ${sortedCards.length === 1 ? "stay" : "stays"}`
    : `${faDigits(sortedCards.length)} اقامتگاه`;
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;

    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    updateResults();
  });
});

sortSelect.addEventListener("change", updateResults);

searchForm.addEventListener("submit", event => {
  event.preventDefault();

  const destination = destinationInput.value.trim();
  const checkin = checkinInput.value;
  const checkout = checkoutInput.value;

  if (!checkin || !checkout) {
    updateSearchHint(
      currentLanguage === "en"
        ? "Please select both check-in and check-out dates."
        : "لطفاً تاریخ ورود و خروج را انتخاب کن."
    );
    (!checkin ? checkinInput : checkoutInput).focus();
    return;
  }

  if (checkout <= checkin) {
    updateSearchHint(
      currentLanguage === "en"
        ? "Check-out must be after check-in."
        : "تاریخ خروج باید بعد از تاریخ ورود باشد."
    );
    checkoutInput.focus();
    return;
  }

  updateResults();

  const visibleCards = getVisibleCards();

  const nights = Math.round(
    (new Date(`${checkout}T12:00:00`) -
      new Date(`${checkin}T12:00:00`)) / 86400000
  );

  if (visibleCards.length === 0) {
    updateSearchHint(
      currentLanguage === "en"
        ? "No matching demo stays. Try another destination."
        : "اقامتگاهی با این مشخصات در نمونهٔ نمایشی پیدا نشد؛ مقصد دیگری را امتحان کن."
    );
  } else {
    updateSearchHint(
      currentLanguage === "en"
        ? `${visibleCards.length} demo stays · ${nights} night(s) · ${guestsInput.value} guest(s). Prices are illustrative.`
        : `${faDigits(visibleCards.length)} اقامتگاه نمایشی · ${faDigits(nights)} شب · ${faDigits(guestsInput.value)} مسافر. قیمت‌ها نمونه هستند.`
    );
  }

  $("#hotels").scrollIntoView({ behavior: "smooth", block: "start" });
});

destinationInput.addEventListener("input", updateResults);

$("#resetSearch").addEventListener("click", () => {
  destinationInput.value = "";
  activeCategory = "all";
  sortSelect.value = "recommended";

  filterButtons.forEach(button => {
    const active = button.dataset.filter === "all";
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  updateResults();
  updateSearchHint();
});

$$(".favorite-btn").forEach(button => {
  button.addEventListener("click", () => {
    const isFavorite = button.classList.toggle("is-favorite");
    button.textContent = isFavorite ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(isFavorite));

    favoriteCount += isFavorite ? 1 : -1;

    showToast(
      isFavorite
        ? (currentLanguage === "en"
            ? "Added to your favorites."
            : "به فهرست علاقه‌مندی‌ها اضافه شد.")
        : (currentLanguage === "en"
            ? "Removed from your favorites."
            : "از فهرست علاقه‌مندی‌ها حذف شد.")
    );
  });
});

$$(".book-btn").forEach(button => {
  button.addEventListener("click", () => {
    const hotelName = currentLanguage === "en"
      ? button.dataset.nameEn
      : button.dataset.nameFa;

    $("#dialogTitle").textContent = hotelName;
    $("#dialogPrice").textContent = button.dataset.price;

    if (bookingDialog.showModal) {
      bookingDialog.showModal();
    } else {
      showToast(
        currentLanguage === "en"
          ? "Booking demo — real reservations are not enabled."
          : "این بخش نمایشی است؛ رزرو واقعی فعال نیست."
      );
    }
  });
});

$("#closeDialog").addEventListener("click", () => {
  bookingDialog.close();
});

$("#confirmDemo").addEventListener("click", () => {
  bookingDialog.close();

  showToast(
    currentLanguage === "en"
      ? "Thanks! This portfolio demo does not create a real booking."
      : "ممنون! این نمونه‌کار رزرو واقعی ثبت نمی‌کند."
  );
});

bookingDialog.addEventListener("click", event => {
  if (event.target === bookingDialog) {
    bookingDialog.close();
  }
});

$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#emailInput").value.trim();
  const message = $("#newsletterMessage");

  if (!email) return;

  message.textContent = currentLanguage === "en"
    ? "Thank you! This demo does not send or store emails."
    : "ممنون! در این نسخه ایمیل ارسال یا ذخیره نمی‌شود.";

  $("#emailInput").value = "";
});

$("#languageBtn").addEventListener("click", () => {
  setLanguage(currentLanguage === "fa" ? "en" : "fa");
});

// محدود کردن انتخاب تاریخ به امروز و بعد از آن
function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = localDateString(new Date());
checkinInput.min = today;
checkoutInput.min = today;

checkinInput.addEventListener("change", () => {
  checkoutInput.min = checkinInput.value || today;

  if (
    checkoutInput.value &&
    checkoutInput.value <= checkinInput.value
  ) {
    checkoutInput.value = "";
  }
});

// تنظیم اولیه
filterButtons.forEach(button => {
  button.setAttribute(
    "aria-pressed",
    String(button.dataset.filter === activeCategory)
  );
});

updateResults();
