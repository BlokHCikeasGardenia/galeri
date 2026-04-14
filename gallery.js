const CLOUD_NAME = "dyb6pw3i9";

/* =========================
   CLOUDINARY (NO EXT)
========================= */
function getImageUrl(folder, index, isThumb = false) {
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

  const transform = isThumb
    ? "f_auto,q_auto,w_500"
    : "f_auto,q_auto";

  return `${base}/${transform}/${folder}/${index}`;
}

/* =========================
   LAZY LOAD OBSERVER
========================= */
const imgObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add("loaded");
      obs.unobserve(img);
    }
  });
}, {
  rootMargin: "200px"
});

/* =========================
   DOM
========================= */
const container = document.getElementById("gallery-container");
const searchInput = document.getElementById("search");
const filterDate = document.getElementById("filter-date");

let allData = [];
let page = 0;
const limit = 4;
let loading = false;

/* =========================
   LOAD DATA
========================= */
fetch("data/gallery.json")
  .then(res => res.json())
  .then(data => {
    allData = data.sort((a, b) => b.date.localeCompare(a.date));
    loadMore();
  });

/* =========================
   INFINITE SCROLL
========================= */
window.addEventListener("scroll", () => {
  if (loading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadMore();
  }
});

/* =========================
   LOAD MORE
========================= */
function loadMore() {
  const next = allData.slice(page * limit, (page + 1) * limit);
  if (!next.length) return;

  render(next);
  page++;
}

/* =========================
   RENDER (MASONRY STYLE)
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
      <div class="gallery masonry"></div>
    `;

    const gallery = group.querySelector(".gallery");

    for (let i = 1; i <= event.total; i++) {
      createImage(gallery, event.title, event.folder, i);
    }

    container.appendChild(group);
  });

  initLightbox();
  loading = false;
}

/* =========================
   CREATE IMAGE CARD
========================= */
function createImage(container, title, folder, index) {

  const thumb = getImageUrl(folder, index, true);
  const full = getImageUrl(folder, index, false);

  const a = document.createElement("a");
  a.href = full;
  a.className = "glightbox";
  a.setAttribute("data-gallery", title);

  const img = document.createElement("img");
  img.dataset.src = thumb;
  img.alt = title;
  img.loading = "lazy";

  img.style.willChange = "transform, opacity";

  a.appendChild(img);
  container.appendChild(a);

  imgObserver.observe(img);
}

/* =========================
   LIGHTBOX FULLSCREEN CLEAN
========================= */
let lightbox;

function initLightbox() {
  if (lightbox) lightbox.destroy();

  lightbox = GLightbox({
    selector: ".glightbox",
    touchNavigation: true,
    loop: false,
    zoomable: false,
    draggable: false
  });
}

/* =========================
   SEARCH
========================= */
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  const filtered = allData.filter(e =>
    e.title.toLowerCase().includes(keyword)
  );

  reset();
  render(filtered.slice(0, limit));
});

/* =========================
   FILTER ISO DATE
========================= */
filterDate.addEventListener("change", () => {
  const val = filterDate.value;

  if (!val) {
    reset();
    render(allData.slice(0, limit));
    return;
  }

  const filtered = allData.filter(e =>
    e.date.startsWith(val)
  );

  reset();
  render(filtered.slice(0, limit));
});

/* =========================
   RESET
========================= */
function reset() {
  container.innerHTML = "";
  page = 0;
}

/* =========================
   FORMAT DATE
========================= */
function formatDate(iso) {
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
