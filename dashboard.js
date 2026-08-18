/* ==========================================================================
   MINIMALIST DASHBOARD INTERACTION & MOTION LOGIC
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

  // Photo Data
  const PHOTOS = [
    { id: "LZ-8841", title: "Met Gala Red Carpet — Arrival", res: "8640 x 5760", size: "44.8 MB", category: "matched", matchScore: "99.8%", img: "https://picsum.photos/id/1005/600/800", tags: ["#RedCarpet", "#EveningWear"] },
    { id: "LZ-8842", title: "VIP Lounge Gala Dinner", res: "6000 x 4000", size: "28.4 MB", category: "matched", matchScore: "99.5%", img: "https://picsum.photos/id/1025/600/800", tags: ["#VIPLounge", "#Candid"] },
    { id: "LZ-8843", title: "Runway Finale Backstage", res: "8640 x 5760", size: "48.1 MB", category: "flagged", matchScore: "99.1%", img: "https://picsum.photos/id/1062/600/800", tags: ["#Backstage", "#HauteCouture"] },
    { id: "LZ-8844", title: "Afterparty Champagne Toast", res: "6000 x 4000", size: "31.2 MB", category: "matched", matchScore: "98.9%", img: "https://picsum.photos/id/1011/600/800", tags: ["#Toast", "#HighISO"] },
    { id: "LZ-8845", title: "Celebrity Portrait Station", res: "8640 x 5760", size: "42.0 MB", category: "flagged", matchScore: "99.9%", img: "https://picsum.photos/id/1012/600/800", tags: ["#Portrait", "#VIP"] },
    { id: "LZ-8846", title: "Main Stage Performance", res: "8640 x 5760", size: "45.6 MB", category: "matched", matchScore: "99.4%", img: "https://picsum.photos/id/1027/600/800", tags: ["#MainStage", "#LowLight"] },
    { id: "LZ-8847", title: "Keynote Address Crowd", res: "6000 x 4000", size: "29.8 MB", category: "matched", matchScore: "98.7%", img: "https://picsum.photos/id/1069/600/800", tags: ["#Keynote", "#WideAngle"] },
    { id: "LZ-8848", title: "Press Conference Q&A", res: "8640 x 5760", size: "41.4 MB", category: "matched", matchScore: "99.2%", img: "https://picsum.photos/id/1074/600/800", tags: ["#Press", "#Telephoto"] },
    { id: "LZ-8849", title: "Trophy Presentation Ceremony", res: "6000 x 4000", size: "33.1 MB", category: "matched", matchScore: "99.7%", img: "https://picsum.photos/id/1084/600/800", tags: ["#Trophy", "#StageLights"] },
    { id: "LZ-8850", title: "Atmospheric Venue Detail", res: "8640 x 5760", size: "52.0 MB", category: "matched", matchScore: "98.1%", img: "https://picsum.photos/id/1040/600/800", tags: ["#Venue", "#Architecture"] },
    { id: "LZ-8851", title: "Red Carpet Flash Reaction", res: "6000 x 4000", size: "30.5 MB", category: "matched", matchScore: "99.6%", img: "https://picsum.photos/id/1050/600/800", tags: ["#RedCarpet", "#Flash"] },
    { id: "LZ-8852", title: "Executive Suite Arrival", res: "8640 x 5760", size: "44.0 MB", category: "matched", matchScore: "99.3%", img: "https://picsum.photos/id/1060/600/800", tags: ["#Executive", "#Arrival"] }
  ];

  /* --------------------------------------------------------------------------
     1. INITIAL ENTRY & NUMBER COUNTERS
     -------------------------------------------------------------------------- */
  if (hasGSAP) {
    gsap.from(".stat-card", { y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" });
    gsap.from(".dash-hero__title", { y: 15, opacity: 0, duration: 0.6, ease: "power2.out" });
  }

  // Animate Number Counters
  document.querySelectorAll(".stat-num").forEach(numEl => {
    const targetVal = parseFloat(numEl.dataset.target);
    const isDecimal = numEl.dataset.decimals === "1";

    if (hasGSAP) {
      gsap.to(numEl, {
        innerText: targetVal,
        duration: 1.8,
        ease: "power2.out",
        snap: { innerText: isDecimal ? 0.1 : 1 },
        onUpdate: function() {
          if (isDecimal) {
            numEl.innerText = parseFloat(numEl.innerText).toFixed(1);
          } else {
            numEl.innerText = parseInt(numEl.innerText).toLocaleString();
          }
        }
      });
    } else {
      numEl.innerText = isDecimal ? targetVal.toFixed(1) : targetVal.toLocaleString();
    }
  });

  /* --------------------------------------------------------------------------
     2. EVENT SELECTOR DROPDOWN
     -------------------------------------------------------------------------- */
  const eventPillBtn = document.getElementById("eventPillBtn");
  const eventPillDropdown = document.getElementById("eventPillDropdown");
  const currentEventTitle = document.getElementById("currentEventTitle");

  if (eventPillBtn && eventPillDropdown) {
    eventPillBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = eventPillDropdown.hidden;
      eventPillDropdown.hidden = !isHidden;
      eventPillBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (eventPillDropdown && !eventPillDropdown.contains(e.target) && !eventPillBtn.contains(e.target)) {
        eventPillDropdown.hidden = true;
        eventPillBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-item").forEach(i => i.classList.remove("is-selected"));
        item.classList.add("is-selected");

        const newTitle = item.dataset.name;
        if (currentEventTitle) currentEventTitle.innerText = newTitle;
        eventPillDropdown.hidden = true;
        eventPillBtn.setAttribute("aria-expanded", "false");

        showToast(`Switched active event to ${newTitle}`);
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. TAB SWITCHING
     -------------------------------------------------------------------------- */
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      tabPanels.forEach(pane => {
        if (pane.id === targetTab) {
          pane.hidden = false;
          pane.classList.add("is-active");
          if (hasGSAP) {
            gsap.fromTo(pane, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
          }
        } else {
          pane.hidden = true;
          pane.classList.remove("is-active");
        }
      });
    });
  });

  /* --------------------------------------------------------------------------
     4. GALLERY STREAM & FILTERS
     -------------------------------------------------------------------------- */
  const galleryGrid = document.getElementById("galleryGrid");
  const badgePhotoCount = document.getElementById("badgePhotoCount");

  function renderGallery(items) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = "";
    if (badgePhotoCount) badgePhotoCount.innerText = items.length;

    items.forEach(photo => {
      const card = document.createElement("div");
      card.className = "photo-card";
      card.innerHTML = `
        <div class="photo-card__img">
          <img src="${photo.img}" alt="${photo.title}" loading="lazy">
          <span class="badge-match">${photo.matchScore}</span>
        </div>
        <div class="photo-card__meta">
          <div>
            <div class="photo-id">${photo.id}</div>
            <div class="photo-sub">${photo.res}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dash-gold-1)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
        </div>
      `;

      card.addEventListener("click", () => openLightbox(photo));
      galleryGrid.appendChild(card);
    });

    if (hasGSAP) {
      gsap.from(".photo-card", { opacity: 0, y: 15, duration: 0.4, stagger: 0.04, ease: "power2.out" });
    }
  }

  renderGallery(PHOTOS);

  // Filter Buttons
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const category = btn.dataset.filter;
      if (category === "all") {
        renderGallery(PHOTOS);
      } else {
        const filtered = PHOTOS.filter(p => p.category === category);
        renderGallery(filtered);
      }
    });
  });

  // Search Input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = PHOTOS.filter(p => 
        p.id.toLowerCase().includes(q) || 
        p.title.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
      renderGallery(filtered);
    });
  }

  /* --------------------------------------------------------------------------
     5. SIMULATED BATCH UPLOAD (Dropzone & Top Button)
     -------------------------------------------------------------------------- */
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const uploadProgress = document.getElementById("uploadProgress");
  const progressBarFill = document.getElementById("progressBarFill");
  const uploadPercent = document.getElementById("uploadPercent");
  const uploadStatusText = document.getElementById("uploadStatusText");
  const topUploadBtn = document.getElementById("topUploadBtn");

  if (dropZone) {
    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "var(--dash-gold-1)";
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.style.borderColor = "";
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "";
      startSimulatedUpload();
    });

    if (fileInput) {
      fileInput.addEventListener("change", () => startSimulatedUpload());
    }
  }

  if (topUploadBtn) {
    topUploadBtn.addEventListener("click", () => {
      document.querySelector('[data-tab="tabPhotos"]').click();
      window.scrollTo({ top: 180, behavior: "smooth" });
      startSimulatedUpload();
    });
  }

  function startSimulatedUpload() {
    if (!uploadProgress) return;
    uploadProgress.hidden = false;
    uploadPercent.innerText = "0%";
    if (progressBarFill) progressBarFill.style.width = "0%";
    uploadStatusText.innerText = "Indexing RAW frames with AI facial embedding...";

    if (hasGSAP) {
      const progressObj = { val: 0 };
      gsap.to(progressObj, {
        val: 100,
        duration: 2.5,
        ease: "power1.inOut",
        onUpdate: () => {
          const p = Math.round(progressObj.val);
          if (progressBarFill) progressBarFill.style.width = p + "%";
          uploadPercent.innerText = p + "%";
          if (p === 50) {
            uploadStatusText.innerText = "Clustering 512-D vectors & matching attendees...";
          }
        },
        onComplete: () => {
          finishUpload();
        }
      });
    } else {
      if (progressBarFill) progressBarFill.style.width = "100%";
      uploadPercent.innerText = "100%";
      finishUpload();
    }
  }

  function finishUpload() {
    uploadStatusText.innerText = "Batch upload & face indexing complete!";
    
    // Add new photo to top
    const newPhoto = {
      id: `LZ-${Math.floor(8853 + Math.random() * 100)}`,
      title: "Sony A1 Live Ingest Frame",
      res: "8640 x 5760",
      size: "46.2 MB RAW",
      category: "matched",
      matchScore: "99.8%",
      img: `https://picsum.photos/seed/lz-minimal-${Date.now()}/600/800`,
      tags: ["#LiveSync", "#AIClustered"]
    };
    PHOTOS.unshift(newPhoto);
    renderGallery(PHOTOS);

    showToast("Batch uploaded! 24 photos synced & matched to guests.");

    setTimeout(() => {
      uploadProgress.hidden = true;
    }, 2000);
  }

  /* --------------------------------------------------------------------------
     6. AI FACE MATCH SEARCH SIMULATOR (Tab 2)
     -------------------------------------------------------------------------- */
  const runScanBtn = document.getElementById("runScanBtn");
  const laserBeam = document.getElementById("laserBeam");
  const scanReticle = document.getElementById("scanReticle");
  const thumbBtns = document.querySelectorAll(".thumb-btn");
  const scanSubjectImg = document.getElementById("scanSubjectImg");

  if (runScanBtn) {
    runScanBtn.addEventListener("click", () => {
      if (hasGSAP) {
        gsap.fromTo(laserBeam, { y: 0, opacity: 0.9 }, { y: 500, duration: 1.8, ease: "power2.inOut", repeat: 1, yoyo: true });
        gsap.fromTo(scanReticle, { scale: 0.9, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.4)" });
      }
      showToast("Biometric face match complete — 6 photos identified!");
    });

    thumbBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        thumbBtns.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const newSrc = btn.dataset.img;
        if (scanSubjectImg) {
          if (hasGSAP) {
            gsap.to(scanSubjectImg, { opacity: 0, duration: 0.2, onComplete: () => {
              scanSubjectImg.src = newSrc;
              gsap.to(scanSubjectImg, { opacity: 1, duration: 0.25 });
            }});
          } else {
            scanSubjectImg.src = newSrc;
          }
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. GUEST QR & ACCESS ACTIONS (Tab 3)
     -------------------------------------------------------------------------- */
  const printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }

  const copyLinkBtn = document.getElementById("copyLinkBtn");
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.origin + "/guest?key=LZ-METGALA-2026");
      }
      showToast("Direct Guest Portal URL copied to clipboard!");
    });
  }

  /* --------------------------------------------------------------------------
     8. LIGHTBOX MODAL
     -------------------------------------------------------------------------- */
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalImg = document.getElementById("modalImg");
  const modalPhotoId = document.getElementById("modalPhotoId");
  const modalPhotoTitle = document.getElementById("modalPhotoTitle");
  const modalRes = document.getElementById("modalRes");
  const modalSize = document.getElementById("modalSize");
  const modalMatch = document.getElementById("modalMatch");
  const modalTagsRow = document.getElementById("modalTagsRow");

  function openLightbox(photo) {
    if (!modalBackdrop) return;

    modalImg.src = photo.img;
    modalPhotoId.innerText = photo.id;
    modalPhotoTitle.innerText = photo.title;
    modalRes.innerText = photo.res;
    modalSize.innerText = photo.size;
    modalMatch.innerText = `${photo.matchScore} Confidence`;

    if (modalTagsRow) {
      modalTagsRow.innerHTML = photo.tags.map(t => `<span class="tag-chip">${t}</span>`).join("");
    }

    modalBackdrop.hidden = false;

    if (hasGSAP) {
      gsap.fromTo("#modalBox", { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" });
    }
  }

  function closeLightbox() {
    if (!modalBackdrop) return;
    if (hasGSAP) {
      gsap.to("#modalBox", { scale: 0.96, opacity: 0, duration: 0.2, onComplete: () => { modalBackdrop.hidden = true; } });
    } else {
      modalBackdrop.hidden = true;
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeLightbox);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeLightbox();
    });
  }

  /* --------------------------------------------------------------------------
     9. TOAST NOTIFICATION SYSTEM
     -------------------------------------------------------------------------- */
  const toastStack = document.getElementById("toastStack");

  function showToast(message) {
    if (!toastStack) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    toastStack.appendChild(toast);

    setTimeout(() => {
      if (hasGSAP) {
        gsap.to(toast, { opacity: 0, y: -10, duration: 0.25, onComplete: () => toast.remove() });
      } else {
        toast.remove();
      }
    }, 3000);
  }

  /* --------------------------------------------------------------------------
     10. KEYBOARD SHORTCUTS
     -------------------------------------------------------------------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalBackdrop && !modalBackdrop.hidden) closeLightbox();
      if (eventPillDropdown && !eventPillDropdown.hidden) eventPillDropdown.hidden = true;
    }
  });

});
