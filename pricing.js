/* ==========================================================================
   LUMENZIN — PRICING PAGE INTERACTION & CALCULATOR LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const hasGSAP = typeof gsap !== "undefined";

  // Theme Manager (Dark / Light Mode)
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const savedTheme = localStorage.getItem("lumenzin-theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-mode");
      localStorage.setItem("lumenzin-theme", isLight ? "light" : "dark");
    });
  }

  if (hasGSAP) {
    gsap.from(".pricing-hero__content > *", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" });
    gsap.from(".pricing-card", { y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" });
  }

  /* --------------------------------------------------------------------------
     1. BILLING TOGGLE (Monthly vs Annual)
     -------------------------------------------------------------------------- */
  const billingToggle = document.getElementById("billingToggle");
  const labelMonthly = document.getElementById("labelMonthly");
  const labelAnnual = document.getElementById("labelAnnual");
  const priceAmounts = document.querySelectorAll(".price-amount[data-monthly]");
  const billedNote1 = document.getElementById("billedNote1");
  const billedNote2 = document.getElementById("billedNote2");

  let isAnnual = true;

  function updatePrices() {
    isAnnual = billingToggle.getAttribute("aria-checked") === "true";

    labelMonthly.classList.toggle("is-active", !isAnnual);
    labelAnnual.classList.toggle("is-active", isAnnual);

    priceAmounts.forEach(el => {
      const targetVal = isAnnual ? el.dataset.annual : el.dataset.monthly;
      if (hasGSAP) {
        gsap.to(el, {
          innerText: targetVal,
          duration: 0.4,
          snap: { innerText: 1 }
        });
      } else {
        el.innerText = targetVal;
      }
    });

    if (billedNote1) billedNote1.innerText = isAnnual ? "Billed annually ($468/yr)" : "Billed monthly";
    if (billedNote2) billedNote2.innerText = isAnnual ? "Billed annually ($1,188/yr)" : "Billed monthly";
  }

  if (billingToggle) {
    billingToggle.addEventListener("click", () => {
      const currentState = billingToggle.getAttribute("aria-checked") === "true";
      billingToggle.setAttribute("aria-checked", !currentState);
      updatePrices();
    });
  }

  /* --------------------------------------------------------------------------
     2. INTERACTIVE ROI CALCULATOR
     -------------------------------------------------------------------------- */
  const rangeEvents = document.getElementById("rangeEvents");
  const rangePhotos = document.getElementById("rangePhotos");
  const valEvents = document.getElementById("valEvents");
  const valPhotos = document.getElementById("valPhotos");
  const resHours = document.getElementById("resHours");
  const resRevenue = document.getElementById("resRevenue");

  function calculateROI() {
    if (!rangeEvents || !rangePhotos) return;

    const events = parseInt(rangeEvents.value);
    const photos = parseInt(rangePhotos.value);

    valEvents.innerText = `${events} Event${events > 1 ? 's' : ''}`;
    valPhotos.innerText = `${photos.toLocaleString()} Photos`;

    // Calculation formulas
    // Approx 6 hours saved per 1000 photos sorted manually
    const hoursSaved = Math.round(events * (photos / 1000) * 4);
    // Estimated upsell revenue per event from fast gallery retrieval
    const revenue = Math.round(events * (photos / 1000) * 90);

    if (resHours) resHours.innerText = `${hoursSaved} Hours`;
    if (resRevenue) resRevenue.innerText = `+$${revenue.toLocaleString()} / mo`;
  }

  if (rangeEvents && rangePhotos) {
    rangeEvents.addEventListener("input", calculateROI);
    rangePhotos.addEventListener("input", calculateROI);
    calculateROI();
  }

  /* --------------------------------------------------------------------------
     3. FAQ ACCORDIONS
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const btn = item.querySelector(".faq-q");
    if (btn) {
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        faqItems.forEach(i => i.classList.remove("is-open"));
        if (!isOpen) item.classList.add("is-open");
      });
    }
  });

});
