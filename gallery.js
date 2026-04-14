const CLOUD_NAME = "dyb6pw3i9";

/* =========================
   DOM ELEMENTS
========================= */
const container = document.getElementById("gallery-container");
const searchInput = document.getElementById("search");
const filterDate = document.getElementById("filter-date");
const backToTop = document.getElementById("back-to-top");

// Modal Elements
const modalContainer = document.getElementById("modal-container");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalCounter = document.getElementById("modal-counter");
const modalClose = document.getElementById("modal-close");
const modalPrev = document.getElementById("modal-prev");
const modalNext = document.getElementById("modal-next");

let allData = [];
let currentData = [];
let page = 0;
const limit = 3;
let loading = false;

// Modal State
let currentGalleryImages = [];
let currentImageIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let currentZoom = 1;
let lastPinchDistance = 0;

/* =========================
   CLOUDINARY HELPERS
========================= */
function getImageUrl(folder, index, isFullSize = false) {
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  const transform = isFullSize ? "f_auto,q_auto" : "f_auto,q_auto,w_400,h_300,c_fill";
  return `${base}/${transform}/${folder}/${index}`;
}

/* =========================
   LAZY LOADING
========================= */
const imgObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.onload = () => img.classList.add("loaded");
      obs.unobserve(img);
    }
  });
}, { rootMargin: "200px" });

/* =========================
   MODAL FUNCTIONS
========================= */
function openModal(galleryItems, index, title) {
  currentGalleryImages = galleryItems;
  currentImageIndex = index;
  
  updateModalImage(title);
  modalContainer.classList.remove("modal-hidden");
  modalContainer.classList.add("modal-open");
  document.body.classList.add("modal-open");
  document.documentElement.style.overflow = "hidden";
}

function closeModal() {
  modalContainer.classList.remove("modal-open");
  modalContainer.classList.add("modal-hidden");
  document.body.classList.remove("modal-open");
  document.documentElement.style.overflow = "";
}

function updateModalImage(title) {
  const item = currentGalleryImages[currentImageIndex];
  const fullImageUrl = getImageUrl(item.folder, item.index, true);
  
  // Reset zoom on image change
  currentZoom = 1;
  lastPinchDistance = 0;
  
  // Fade out current image
  modalImage.style.opacity = "0.3";
  modalImage.style.transform = "scale(0.98)";
  
  // Preload and display image with smooth transition
  const img = new Image();
  img.onload = () => {
    // Update content
    modalImage.src = fullImageUrl;
    modalTitle.textContent = title;
    modalCounter.textContent = `${currentImageIndex + 1}/${currentGalleryImages.length}`;
    
    // Trigger reflow to apply new src, then animate in
    setTimeout(() => {
      modalImage.style.opacity = "1";
      modalImage.style.transform = "scale(1)";
      modalImage.style.pointerEvents = "auto";
      modalImage.style.cursor = "zoom-in";
    }, 50);
  };
  img.onerror = () => {
    modalImage.style.opacity = "1";
    modalImage.style.pointerEvents = "auto";
    console.error("Error loading image:", fullImageUrl);
  };
  img.src = fullImageUrl;
}

function nextImage(title) {
  if (currentImageIndex < currentGalleryImages.length - 1) {
    currentImageIndex++;
    updateModalImage(title);
  }
}

function prevImage(title) {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    updateModalImage(title);
  }
}

/* =========================
   LOAD INITIAL DATA
========================= */
fetch("data/gallery.json")
  .then(res => res.json())
  .then(data => {
    allData = data.sort((a, b) => b.date.localeCompare(a.date));
    currentData = [...allData];
    loadMore();
  })
  .catch(err => console.error("Gagal memuat data gallery:", err));

/* =========================
   INFINITE SCROLL
========================= */
window.addEventListener("scroll", () => {
  // Don't load more if modal is open
  if (document.body.classList.contains("modal-open")) return;
  if (loading) return;
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
    loadMore();
  }

  // Back to Top visibility
  if (window.scrollY > 800) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =========================
   LOAD MORE LOGIC
========================= */
function loadMore() {
  const next = currentData.slice(page * limit, (page + 1) * limit);
  if (!next.length) {
    if (page === 0) {
      document.getElementById("empty-state").classList.remove("hidden");
    }
    return;
  }
  render(next);
  page++;
}

/* =========================
   RENDER FUNCTION
========================= */
function render(data) {
  loading = true;

  data.forEach(event => {
    const group = document.createElement("section");
    group.className = "gallery-group";

    group.innerHTML = `
      <div class="group-header">
        <h2>${event.title}</h2>
        <span class="date">${formatDate(event.date)}</span>
      </div>
      <div class="gallery"></div>
    `;

    const grid = group.querySelector(".gallery");
    const galleryItems = [];

    for (let i = 1; i <= event.total; i++) {
      galleryItems.push({ folder: event.folder, index: i });
      createImage(grid, event.title, event.folder, i, galleryItems.length - 1, galleryItems, event.title);
    }

    container.appendChild(group);
  });

  loading = false;
}

/* =========================
   CREATE IMAGE ELEMENT
========================= */
function createImage(container, title, folder, index, itemIndex, galleryItems , eventTitle) {
  const thumb = getImageUrl(folder, index, false);

  const item = document.createElement("div");
  item.className = "gallery-item";

  const img = document.createElement("img");
  img.dataset.src = thumb;
  img.alt = `${title} - Foto ${index}`;
  img.loading = "lazy";

  item.appendChild(img);
  
  item.addEventListener("click", () => {
    openModal(galleryItems, itemIndex, eventTitle);
  });

  container.appendChild(item);

  imgObserver.observe(img);
}

/* =========================
   MODAL EVENT LISTENERS
========================= */
modalClose.addEventListener("click", closeModal);

modalPrev.addEventListener("click", () => {
  const title = modalTitle.textContent;
  prevImage(title);
});

modalNext.addEventListener("click", () => {
  const title = modalTitle.textContent;
  nextImage(title);
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
  if (e.key === "ArrowLeft" && document.body.classList.contains("modal-open")) {
    const title = modalTitle.textContent;
    prevImage(title);
  }
  if (e.key === "ArrowRight" && document.body.classList.contains("modal-open")) {
    const title = modalTitle.textContent;
    nextImage(title);
  }
});

// Close on overlay click
document.querySelector(".modal-overlay").addEventListener("click", closeModal);

/* =========================
   TOUCH SWIPE & INTERACTIONS
========================= */

// Helper function to calculate distance between two touch points
function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Touch swipe for mobile navigation
document.addEventListener("touchstart", (e) => {
  if (!document.body.classList.contains("modal-open")) return;
  
  if (e.touches.length === 1) {
    // Single touch = swipe
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    lastPinchDistance = 0;
  } else if (e.touches.length === 2) {
    // Two fingers = pinch zoom
    lastPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
  }
}, { passive: true });

// Touch move for pinch zoom
document.addEventListener("touchmove", (e) => {
  if (!document.body.classList.contains("modal-open")) return;
  if (e.touches.length !== 2) return;
  
  const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
  
  if (lastPinchDistance > 0) {
    const ratio = currentDistance / lastPinchDistance;
    const zoomStep = (ratio - 1) * 0.5; // Gentle zoom sensitivity
    const newZoom = currentZoom * (1 + zoomStep);
    const maxZoom = 3;
    const minZoom = 1;
    
    currentZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
    modalImage.style.transform = `scale(${currentZoom})`;
    modalImage.style.cursor = currentZoom > 1 ? "grab" : "zoom-in";
  }
  
  lastPinchDistance = currentDistance;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (!document.body.classList.contains("modal-open")) return;
  
  // Only handle single touch end (swipe)
  if (e.touches.length > 0) return;
  
  const touchEndX = e.changedTouches[e.changedTouches.length - 1].clientX;
  const touchEndY = e.changedTouches[e.changedTouches.length - 1].clientY;
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;
  
  // Only register horizontal swipes (ignore vertical scrolls)
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0) {
      // Swipe left = next image
      const title = modalTitle.textContent;
      nextImage(title);
    } else {
      // Swipe right = prev image
      const title = modalTitle.textContent;
      prevImage(title);
    }
  }
  
  touchStartX = 0;
  touchStartY = 0;
  lastPinchDistance = 0;
}, { passive: true });

// Mouse wheel zoom on desktop
modalImage.addEventListener("wheel", (e) => {
  if (!document.body.classList.contains("modal-open")) return;
  e.preventDefault();
  
  const zoomStep = 0.2;
  const maxZoom = 3;
  const minZoom = 1;
  
  if (e.deltaY < 0) {
    currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
  } else {
    currentZoom = Math.max(currentZoom - zoomStep, minZoom);
  }
  
  modalImage.style.transform = `scale(${currentZoom})`;
  modalImage.style.cursor = currentZoom > 1 ? "grab" : "zoom-in";
}, { passive: false });

// Double-click to toggle zoom
modalImage.addEventListener("dblclick", () => {
  if (!document.body.classList.contains("modal-open")) return;
  
  if (currentZoom > 1) {
    currentZoom = 1;
    modalImage.style.cursor = "zoom-in";
  } else {
    currentZoom = 1.5;
    modalImage.style.cursor = "zoom-out";
  }
  modalImage.style.transform = `scale(${currentZoom})`;
});

/* =========================
   SEARCH HANDLER
========================= */
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  currentData = allData.filter(e => e.title.toLowerCase().includes(keyword));
  reset();
  loadMore();
});

/* =========================
   DATE FILTER HANDLER
========================= */
filterDate.addEventListener("change", () => {
  const val = filterDate.value;
  if (!val) {
    currentData = [...allData];
  } else {
    currentData = allData.filter(e => e.date.startsWith(val));
  }
  reset();
  loadMore();
});

/* =========================
   RESET UI
========================= */
function reset() {
  container.innerHTML = "";
  document.getElementById("empty-state").classList.add("hidden");
  page = 0;
}

/* =========================
   DATE FORMATTER
========================= */
function formatDate(iso) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(iso).toLocaleDateString('id-ID', options);
}
