const CLOUD_NAME = "dyb6pw3i9";

/* =========================
   AUTO DETECT IMAGE EXT
========================= */
function getValidImage(folder, index, exts, onFound) {
  let i = 0;

  function tryNext() {
    if (i >= exts.length) {
      console.warn("Image not found:", folder + "/" + index);
      return;
    }

    const ext = exts[i];
    const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${folder}/${index}.${ext}`;

    const img = new Image();

    img.onload = () => onFound(url);

    img.onerror = () => {
      i++;
      tryNext();
    };

    img.src = url;
  }

  tryNext();
}

/* =========================
   DOM
========================= */
const container = document.getElementById("gallery-container");
const searchInput = document.getElementById("search");
const filterDate = document.getElementById("filter-date");

let allData = [];

/* =========================
   LOAD JSON
========================= */
fetch("data/gallery.json")
  .then(res => res.json())
  .then(data => {
    allData = data.slice().reverse();
    render(allData);
  });

/* =========================
   LIGHTBOX SAFE INIT
========================= */
let lightbox;

function initLightbox() {
  if (lightbox) lightbox.destroy();

  lightbox = GLightbox({
    selector: ".glightbox"
  });
}

/* =========================
   RENDER FUNCTION
========================= */
function render(data) {
  container.innerHTML = "";

  const exts = ["jpg", "jpeg", "png"];

  data.forEach(event => {
    const group = document.createElement("div");
    group.className = "gallery-group";

    group.innerHTML = `
      <div class="group-header">
        <h2>${event.title}</h2>
        <span>${event.date}</span>
      </div>
      <div class="gallery"></div>
    `;

    const galleryDiv = group.querySelector(".gallery");

    /* =========================
       EVENT DENGAN ITEMS
    ========================= */
    if (Array.isArray(event.items)) {
      event.items.forEach(item => {

        for (let i = 1; i <= item.total; i++) {

          getValidImage(item.folder, i, exts, (url) => {
            const a = document.createElement("a");
            a.href = url;
            a.className = "glightbox";
            a.setAttribute("data-gallery", event.title);

            a.innerHTML = `<img src="${url}" loading="lazy">`;

            galleryDiv.appendChild(a);
          });

        }

      });

    }

    /* =========================
       EVENT NORMAL
    ========================= */
    else {
      for (let i = 1; i <= event.total; i++) {

        getValidImage(event.folder, i, exts, (url) => {
          const a = document.createElement("a");
          a.href = url;
          a.className = "glightbox";
          a.setAttribute("data-gallery", event.title);

          a.innerHTML = `<img src="${url}" loading="lazy">`;

          galleryDiv.appendChild(a);
        });

      }
    }

    container.appendChild(group);
  });

  initLightbox();
}

/* =========================
   SEARCH
========================= */
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  const filtered = allData.filter(e =>
    e.title.toLowerCase().includes(keyword)
  );

  render(filtered);
});

/* =========================
   FILTER BULAN
========================= */
filterDate.addEventListener("change", () => {
  const val = filterDate.value;

  if (!val) return render(allData);

  const [year, month] = val.split("-");

  const filtered = allData.filter(e => {
    return e.date.includes(year) &&
      e.date.toLowerCase().includes(getMonthName(month));
  });

  render(filtered);
});

/* =========================
   HELPER BULAN
========================= */
function getMonthName(m) {
  const months = [
    "januari","februari","maret","april","mei","juni",
    "juli","agustus","september","oktober","november","desember"
  ];
  return months[parseInt(m) - 1];
}
