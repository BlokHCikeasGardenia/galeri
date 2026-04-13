const CLOUD_NAME = "dyb6pw3i9";

const container = document.getElementById("gallery-container");
const searchInput = document.getElementById("search");
const filterDate = document.getElementById("filter-date");

let allData = [];

// 🔄 Load data
fetch("data/gallery.json")
  .then(res => res.json())
  .then(data => {
    allData = data.reverse(); // terbaru di atas
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

    for (let i = 1; i <= event.total; i++) {
      const thumb = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,q_auto/${event.folder}/${i}.${event.ext}`;
      const full = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${event.folder}/${i}.${event.ext}`;

      const a = document.createElement("a");
      a.href = full;
      a.className = "glightbox";
      a.setAttribute("data-gallery", event.folder);

      a.innerHTML = `<img src="${thumb}" loading="lazy">`;

      galleryDiv.appendChild(a);
    }

    container.appendChild(group);
  });

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
