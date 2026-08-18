gsap.registerPlugin(ScrollTrigger);

/* ---------- HERO PHOTO COLLAGE: build tiles ---------- */
// Individual tiles (not one background image) so each can independently
// cycle through a blurred "resting" state and a sharp "focus" state.
const COLLAGE_SEEDS = [
  "1005","1011","1012","1015","1025","1027","1062","1069","1074","1084",
  "1040","1050","64","91","177","237","338","342","399","445"
];
const collageEl = document.getElementById("collage");
const tiles = [];

function buildCollageTiles() {
  COLLAGE_SEEDS.forEach((photoId, i) => {
    const tile = document.createElement("div");
    tile.className = "collage-tile";
    const col = i % 5;
    const row = Math.floor(i / 5);
    const left = col * 20 + (Math.random() * 8 - 4);
    const top = row * 26 + (Math.random() * 10 - 5);
    const rotate = (Math.random() * 10 - 5).toFixed(1);
    tile.style.left = left + "%";
    tile.style.top = top + "%";
    tile.style.transform = `rotate(${rotate}deg)`;
    tile.dataset.baseRotate = rotate;

    const img = document.createElement("img");
    img.src = `https://picsum.photos/id/${photoId}/220/280`;
    img.alt = "Event memory";
    tile.appendChild(img);

    collageEl.appendChild(tile);
    tiles.push(tile);
  });
}
buildCollageTiles();

/* ---------- HERO PHOTO COLLAGE: looping focus cycle ---------- */
// Every ~2.4s, pick 2–3 random tiles, sharpen/lift them, draw a thin
// connecting line between the first two (nodding to "matching" faces
// across photos), then release them and pick a new random set. Loops
// indefinitely — this is what's actually happening on the reference site
// (the focused cluster doesn't track the cursor, it's an ambient loop).
const linesSvg = document.getElementById("collageLines");

function clearLines() {
  while (linesSvg.firstChild) linesSvg.removeChild(linesSvg.firstChild);
}

function drawLine(elA, elB) {
  const wrapRect = collageEl.getBoundingClientRect();
  const a = elA.getBoundingClientRect();
  const b = elB.getBoundingClientRect();
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", a.left + a.width / 2 - wrapRect.left);
  line.setAttribute("y1", a.top + a.height / 2 - wrapRect.top);
  line.setAttribute("x2", b.left + b.width / 2 - wrapRect.left);
  line.setAttribute("y2", b.top + b.height / 2 - wrapRect.top);
  line.style.opacity = 0;
  linesSvg.appendChild(line);
  gsap.to(line, { opacity: 1, duration: 0.5 });
}

let focusCycleActive = tiles.length > 0;
function runFocusCycle() {
  if (!focusCycleActive || document.hidden) return;

  tiles.forEach(t => t.classList.remove("is-focus"));
  clearLines();

  const count = 2 + Math.floor(Math.random() * 2); // 2–3 tiles
  const pool = [...tiles].sort(() => Math.random() - 0.5).slice(0, count);
  pool.forEach(t => t.classList.add("is-focus"));

  if (pool.length >= 2) {
    // Slight delay so the line draws after the tiles have started lifting.
    gsap.delayedCall(0.25, () => drawLine(pool[0], pool[1]));
  }
}
window.addEventListener("load", () => {
  runFocusCycle();
  setInterval(runFocusCycle, 2400);
});

/* ---------- HERO PHOTO COLLAGE: mouse parallax ---------- */
// A real mouse-interactive layer: the whole tile wall tilts slightly
// opposite the cursor position, giving the wall a subtle sense of depth.
const heroEl = document.querySelector(".hero");
const collageParallax = gsap.quickTo(".hero__collage", "x", { duration: 0.9, ease: "power3.out" });
const collageParallaxY = gsap.quickTo(".hero__collage", "y", { duration: 0.9, ease: "power3.out" });

heroEl.addEventListener("mousemove", e => {
  const rect = heroEl.getBoundingClientRect();
  const dx = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
  const dy = (e.clientY - rect.top) / rect.height - 0.5;
  collageParallax(dx * -28);
  collageParallaxY(dy * -20);
});
heroEl.addEventListener("mouseleave", () => {
  collageParallax(0);
  collageParallaxY(0);
});

/* ---------- HERO LOAD-IN ---------- */
window.addEventListener("DOMContentLoaded", () => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".collage-tile", { scale: 0.7, opacity: 0, duration: 1.2, stagger: { each: 0.03, from: "random" }, ease: "power2.out" })
    .from(".hero__title", { y: 30, opacity: 0, duration: 1 }, "-=0.9")
    .from(".hero__sub", { y: 16, opacity: 0, duration: 0.8 }, "-=0.6")
    .from(".hero__discover", { y: 12, opacity: 0, duration: 0.7 }, "-=0.5");
});

/* ---------- HERO SCROLL PARALLAX ---------- */
gsap.to(".hero__collage", {
  yPercent: 8,
  ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

/* ---------- NAV BACKGROUND SWAP PER SECTION ---------- */
const nav = document.getElementById("nav");
document.querySelectorAll("[data-nav]").forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: "top 90px",
    end: "bottom 90px",
    onToggle: self => {
      if (self.isActive) nav.setAttribute("data-state", section.dataset.nav === "light" ? "light" : "dark");
    }
  });
});

/* ---------- PINNED STORY NARRATIVE (Shoot / Share / Deliver) ---------- */
const storySlides = gsap.utils.toArray(".story-slide");
const storyTexts = gsap.utils.toArray(".story-text");
const storyDots = gsap.utils.toArray(".story-progress span");
const syncFillEl = document.getElementById("syncFill");
const phoneStates = gsap.utils.toArray(".phone-mock__state");

let currentStoryStep = -1;
let syncFillTween = null;
let phoneSwapTimer = null;
const shootPhotoEl = document.getElementById("shootPhoto");
const MAX_SHOOT_BLUR = 9; // px — matches the CSS starting blur value

function setStoryStep(index) {
  if (index === currentStoryStep) return;
  currentStoryStep = index;

  storySlides.forEach((el, i) => el.classList.toggle("is-active", i === index));
  storyTexts.forEach((el, i) => el.classList.toggle("is-active", i === index));
  storyDots.forEach((el, i) => el.classList.toggle("is-active", i === index));

  // Leaving step 1 backwards (scrolling back up past it) resets the photo
  // to fully blurred so the reveal reads as fresh again next time.
  if (index !== 0 && shootPhotoEl) {
    gsap.set(shootPhotoEl, { filter: `blur(${MAX_SHOOT_BLUR}px) brightness(0.75)` });
  }
}

ScrollTrigger.create({
  trigger: ".story-pin",
  start: "top top",
  end: "bottom bottom",
  pin: ".story-pin__sticky",
  pinSpacing: true,
  anticipatePin: 1,
  scrub: true,
  onUpdate: self => {
    const step = Math.min(2, Math.floor(self.progress * 3));
    setStoryStep(step);

    // Step 1 "Shoot" scroll-driven blur-to-sharp
    if (step === 0 && shootPhotoEl) {
      const localProgress = Math.min(1, Math.max(0, self.progress / (1 / 3)));
      const blurAmount = MAX_SHOOT_BLUR * (1 - localProgress);
      const brightness = 0.75 + 0.25 * localProgress;
      shootPhotoEl.style.filter = `blur(${blurAmount}px) brightness(${brightness})`;
    }

    // Step 2 "Share" scroll-driven progress bar fill (1/3 to 2/3 of pinned section)
    if (syncFillEl) {
      const shareProgress = Math.min(1, Math.max(0, (self.progress - (1 / 3)) / (1 / 3)));
      syncFillEl.style.width = (shareProgress * 100) + "%";

      const terminalEl = document.querySelector(".sync-panel__terminal");
      if (terminalEl) {
        if (shareProgress < 0.35) {
          terminalEl.innerText = "> INDEXING FACIAL VECTORS…";
        } else if (shareProgress < 0.75) {
          terminalEl.innerText = "> EXTRACTING 512-D FEATURE LANDMARKS…";
        } else {
          terminalEl.innerText = "> CLUSTERING ATTENDEE GALLERIES [COMPLETE]";
        }
      }
    }

    // Step 3 "Deliver" scroll-driven phone screen & photo gallery swap
    if (phoneStates.length >= 2) {
      const showGallery = self.progress > 0.75;
      phoneStates[0].classList.toggle("is-active", step === 2 && !showGallery);
      phoneStates[1].classList.toggle("is-active", step === 2 && showGallery);
    }
  }
});

/* ---------- WAVE TRANSITION FLATTENING ANIMATION ---------- */
const wavePath = document.getElementById("storyWavePath");
if (wavePath) {
  const waveValues = { y0: 140, y1: 60, y2: 10, y3: 45, y4: 82, y5: 150, y6: 95 };

  gsap.to(waveValues, {
    y0: 0, y1: 0, y2: 0, y3: 0, y4: 0, y5: 0, y6: 0,
    ease: "power1.out",
    scrollTrigger: {
      trigger: ".story-pin",
      start: "62% top",
      end: "90% top",
      scrub: 0.5,
      onUpdate: () => {
        const d = `M0,${waveValues.y0} C 220,${waveValues.y1} 460,${waveValues.y2} 720,${waveValues.y3} C 1000,${waveValues.y4} 1220,${waveValues.y5} 1440,${waveValues.y6} L1440,180 L0,180 Z`;
        wavePath.setAttribute("d", d);
      }
    }
  });
}

/* ---------- HORIZONTAL SCROLL-JACKED SCENES GALLERY ---------- */
let scenesScrollTrigger = null;

function initSceneFilters() {
  const filterBtns = document.querySelectorAll(".scene-filter-btn");
  const sceneCards = document.querySelectorAll(".scene-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.dataset.filter;
      sceneCards.forEach(card => {
        if (filter === "all" || card.dataset.category === filter) {
          card.classList.remove("is-dimmed");
        } else {
          card.classList.add("is-dimmed");
        }
      });
    });
  });
}

function buildScenesScroll() {
  const track = document.getElementById("scenesTrack");
  const stickyEl = document.querySelector(".scenes-pin__sticky");
  const pinWrap = document.querySelector(".scenes-pin");
  const counterEl = document.getElementById("scenesCounter");
  const progressFillEl = document.getElementById("scenesProgressFill");
  const cards = document.querySelectorAll(".scene-card");

  if (!track || !pinWrap || !stickyEl) return;

  if (scenesScrollTrigger) {
    scenesScrollTrigger.kill();
    gsap.set(track, { x: 0 });
  }

  const stickyStyles = getComputedStyle(stickyEl);
  const padLeft = parseFloat(stickyStyles.paddingLeft) || 0;
  const distance = Math.max(0, track.scrollWidth - stickyEl.clientWidth + (padLeft * 2));

  if (distance <= 0) return;

  scenesScrollTrigger = ScrollTrigger.create({
    trigger: pinWrap,
    start: "top top",
    end: () => "+=" + distance,
    scrub: 0.8,
    pin: stickyEl,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    animation: gsap.to(track, { x: () => -distance, ease: "none" }),
    onUpdate: self => {
      if (progressFillEl) {
        gsap.to(progressFillEl, {
          width: Math.max(10, self.progress * 100) + "%",
          duration: 0.15,
          overwrite: "auto",
          ease: "none"
        });
      }

      const totalCards = cards.length;
      const activeIdx = Math.min(totalCards - 1, Math.floor(self.progress * totalCards));

      if (counterEl) {
        const currentStr = (activeIdx + 1).toString().padStart(2, '0');
        const totalStr = totalCards.toString().padStart(2, '0');
        counterEl.innerText = `${currentStr} / ${totalStr}`;
      }

      cards.forEach((card, idx) => {
        card.classList.toggle("is-active-focus", idx === activeIdx);
      });
    }
  });
}

window.addEventListener("load", () => {
  initSceneFilters();
  buildScenesScroll();
  ScrollTrigger.refresh();
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    buildScenesScroll();
    ScrollTrigger.refresh();
  }, 200);
});

/* ---------- GENERIC REVEALS ---------- */
gsap.from(".section-head", {
  y: 24, opacity: 0, duration: 0.8,
  scrollTrigger: { trigger: ".section-head", start: "top 88%" }
});

gsap.utils.toArray(".feature-card").forEach((card, i) => {
  gsap.from(card, {
    y: 30, opacity: 0, duration: 0.7, delay: (i % 3) * 0.08,
    ease: "power2.out",
    scrollTrigger: { trigger: card, start: "top 90%" }
  });
});

gsap.utils.toArray(".privacy-item").forEach((item, i) => {
  gsap.from(item, {
    y: 20, opacity: 0, duration: 0.6, delay: (i % 4) * 0.07,
    scrollTrigger: { trigger: item, start: "top 92%" }
  });
});

gsap.from(".panel__form", {
  x: -30, opacity: 0, duration: 0.8,
  scrollTrigger: { trigger: ".panel", start: "top 75%" }
});
gsap.from(".panel__faq", {
  x: 30, opacity: 0, duration: 0.8,
  scrollTrigger: { trigger: ".panel", start: "top 75%" }
});

/* ---------- FAQ ACCORDION ---------- */
document.querySelectorAll(".faq-item").forEach(item => {
  const btn = item.querySelector(".faq-q");
  const answer = item.querySelector(".faq-a");
  if (item.classList.contains("is-open")) answer.style.maxHeight = answer.scrollHeight + "px";

  btn.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    document.querySelectorAll(".faq-item.is-open").forEach(open => {
      if (open !== item) {
        open.classList.remove("is-open");
        open.querySelector(".faq-a").style.maxHeight = null;
      }
    });
    if (isOpen) {
      item.classList.remove("is-open");
      answer.style.maxHeight = null;
    } else {
      item.classList.add("is-open");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

/* ---------- SIGNUP FORM (front-end only demo) ---------- */
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", e => {
  e.preventDefault();
  document.getElementById("signupNote").textContent = "Request received — check your inbox for next steps.";
  signupForm.reset();
});

/* ---------- MOBILE NAV ---------- */
document.getElementById("burger").addEventListener("click", () => {
  document.querySelector(".nav__links").classList.toggle("is-open");
});
