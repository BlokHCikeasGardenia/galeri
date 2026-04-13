const CLOUD_NAME = "dyb6pw3i9";

/* =========================
   CLOUDINARY HELPERS
========================= */
function getImageUrl(folder, index, ext, isThumb = false) {
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  const transform = isThumb
    ? "f_auto,q_auto,w_400"
    : "f_auto,q_auto";

  return `${base}/${transform}/${folder}/${index}.${ext}`;
}

/* =========================
   LAZY LOADING OBSERVER
========================= */
const imgObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      obs.unobserve(img);
    }
  });
});

/* =========================
   DOM
========================= */
const container = document.getElementById("gallery-container");
const searchInput = document.getElementById("search");
const filterDate = document.getElementById("filter-date");

let allData = [];
let page = 0;
const limit = 5;
let loading = false;

/* =========================
   LOAD DATA
========================= */
fetch("data/gallery.json")
  .then(res => res.json())
  .then(data => {
    // 🔥 SORT TERBARU (ISO DATE)
    allData = data.sort((a, b) => b.date.localeCompare(a.date));

    loadMore();
  });

/* =========================
   INFINITE SCROLL
========================= */
window.addEventListener("scroll", () => {
  if (loading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
    loadMore();
  }
});

/* =========================
   LOAD MORE
========================= */
function loadMore() {
  const next = allData.slice(page * limit, (page + 1) * limit);

  if (next.length === 0) return;

  render(next);

  page++;
}

/* =========================
   RENDER
========================= */
function render(data) {
  loading = true;

  data.forEach(event => {
    const group = document.createElement("div");
    group.className = "gallery-group";

    group.innerHTML = `
      <div class="group-header">
        <h2>${event.title}</h2>
        <span>${formatDate(event.date)}</span>
      </div>
      <div class="gallery"></div>
    `;

    const galleryDiv = group.querySelector(".gallery");

    const exts = ["jpg", "jpeg", "png"];

    // ======================
    // EVENT DENGAN ITEMS
    // ======================
    if (Array.isArray(event.items)) {
      event.items.forEach(item => {
        for (let i = 1; i <= item.total; i++) {
          createImage(galleryDiv, event.title, item.folder, i, event.ext, exts);
        }
      });
    }

    // ======================
    // EVENT NORMAL
    // ======================
    else {
      for (let i = 1; i <= event.total; i++) {
        createImage(galleryDiv, event.title, event.folder, i, event.ext, exts);
      }
    }

    container.appendChild(group);
  });

  initLightbox();
  loading = false;
}

/* =========================
   CREATE IMAGE
========================= */
function createImage(container, title, folder, index, ext) {

  const url = getImageUrl(folder, index, ext, true);
  const full = getImageUrl(folder, index, ext, false);

  const a = document.createElement("a");
  a.href = full;
  a.className = "glightbox";
  a.setAttribute("data-gallery", title);

  const img = document.createElement("img");
  img.dataset.src = url;
  img.alt = title;

  a.appendChild(img);
  container.appendChild(a);

  imgObserver.observe(img);
}

/* =========================
   LIGHTBOX
========================= */
let lightbox;

function initLightbox() {
  if (lightbox) lightbox.destroy();

  lightbox = GLightbox({
    selector: ".glightbox"
  });
}

/* =========================
   SEARCH (FIXED)
========================= */
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  const filtered = allData.filter(e =>
    e.title.toLowerCase().includes(keyword)
  );

  resetGallery();
  render(filtered.slice(0, limit));
});

/* =========================
   FILTER BULAN (FIXED ISO)
========================= */
filterDate.addEventListener("change", () => {
  const val = filterDate.value; // YYYY-MM

  if (!val) {
    resetGallery();
    render(allData.slice(0, limit));
    return;
  }

  const filtered = allData.filter(e => {
    return e.date.startsWith(val);
  });

  resetGallery();
  render(filtered.slice(0, limit));
});

/* =========================
   RESET
========================= */
function resetGallery() {
  container.innerHTML = "";
  page = 0;
}

/* =========================
   FORMAT DATE DISPLAY
========================= */
function formatDate(iso) {
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const d = new Date(iso);

  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
