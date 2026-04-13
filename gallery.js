const CLOUD_NAME = "dyb6pw3i9";
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

    img.onload = () => {
      onFound(url);
    };

    img.onerror = () => {
      i++;
      tryNext();
    };

    img.src = url;
  }

  tryNext();
}

const container = document.getElementById("gallery-container");
const searchInput = document.getElementById("search");
const filterDate = document.getElementById("filter-date");

let allData = [];

// 🔄 Load data
fetch("data/gallery.json")
  .then(res => res.json())
  .then(data => {
    allData = data.slice().reverse(); // terbaru di atas
    render(allData);
  });

// 🎨 Render function
function render(data) {
  container.innerHTML = "";

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

    // ✅ FIX UTAMA: cek apakah ada items atau tidak
    if (Array.isArray(event.items)) {
      // 🔥 CASE: event group (HUT RI dll)
      event.items.forEach(item => {
        for (let i = 1; i <= item.total; i++) {

          const thumb = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,q_auto/${item.folder}/${i}.${event.ext}`;
          const full = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${item.folder}/${i}.${event.ext}`;

          const a = document.createElement("a");
          a.href = full;
          a.className = "glightbox";
          a.setAttribute("data-gallery", event.title);

          a.innerHTML = `<img src="${thumb}" loading="lazy">`;

          galleryDiv.appendChild(a);
        }
      });

    } else {
      // 🔥 CASE: event normal
      for (let i = 1; i <= event.total; i++) {

        const thumb = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,q_auto/${event.folder}/${i}.${event.ext}`;
        const full = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${event.folder}/${i}.${event.ext}`;

        const a = document.createElement("a");
        a.href = full;
        a.className = "glightbox";
        a.setAttribute("data-gallery", event.title);

        a.innerHTML = `<img src="${thumb}" loading="lazy">`;

        galleryDiv.appendChild(a);
      }
    }

    container.appendChild(group);
  });

  // 🔄 refresh lightbox
  GLightbox({
    selector: ".glightbox"
  });
}

// 🔍 SEARCH
searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();

  const filtered = allData.filter(e =>
    e.title.toLowerCase().includes(keyword)
  );

  render(filtered);
});

// 📅 FILTER BULAN
filterDate.addEventListener("change", () => {
  const val = filterDate.value; // format: YYYY-MM

  if (!val) return render(allData);

  const [year, month] = val.split("-");

  const filtered = allData.filter(e => {
    return e.date.includes(year) &&
           e.date.toLowerCase().includes(getMonthName(month));
  });

  render(filtered);
});

// helper bulan
function getMonthName(m) {
  const months = [
    "januari","februari","maret","april","mei","juni",
    "juli","agustus","september","oktober","november","desember"
  ];
  return months[parseInt(m) - 1];
}
