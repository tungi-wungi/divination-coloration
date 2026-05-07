let colorDatabase = {};

const pexelsKey = "PoL6bYyyQwMb5PFougeQIO8zNr5axkbuvetOvipGepHscADA2mGkHhHF";

const daySelect = document.getElementById("daySelect");
const fortuneSelect = document.getElementById("fortuneSelect");
const searchButton = document.getElementById("searchButton");
const statusText = document.getElementById("status");
const colorResults = document.getElementById("colorResults");
const outfitResults = document.getElementById("outfitResults");

let topZIndex = 10;

fetch("colors.json")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    colorDatabase = data;
    console.log("Color database loaded:", colorDatabase);
  });

searchButton.addEventListener("click", function() {
  const selectedDay = daySelect.value;
  const selectedFortune = fortuneSelect.value;

  const colors = colorDatabase[selectedDay][selectedFortune];

  colorResults.innerHTML = "";
  outfitResults.innerHTML = "";

  statusText.textContent = "Your outfit colors are " + colors.join(", ");

  colors.forEach(function(color) {
    colorResults.innerHTML += `
      <div class="color-card">
        <p>${color}</p>
      </div>
    `;
  });

  searchAllColors(colors);
});

function searchAllColors(colors) {
  outfitResults.innerHTML = "<p>Loading outfit inspiration...</p>";

  const allSearches = colors.map(function(color) {
    return searchPexels(color);
  });

  Promise.all(allSearches)
    .then(function(results) {
      const mixedPhotos = [];

      results.forEach(function(result) {
        result.photos.forEach(function(photo) {
          mixedPhotos.push({
            color: result.color,
            photo: photo
          });
        });
      });

      const uniquePhotos = removeDuplicatePhotographers(mixedPhotos);

      outfitResults.innerHTML = "";

      uniquePhotos.forEach(function(item, index) {
        const color = item.color;
        const photo = item.photo;

        const card = document.createElement("div");
        card.className = "outfit-card";

        const randomX = 300 + Math.random() * 1000;
        const randomY = 120 + Math.random() * 420;
        const randomRotate = -12 + Math.random() * 24;

        card.style.left = randomX + "px";
        card.style.top = randomY + "px";
        card.style.transform = `rotate(${randomRotate}deg)`;
        card.style.zIndex = index;

        card.innerHTML = `
          <p>${color} outfit</p>
          <img src="${photo.src.portrait}" alt="${photo.alt}">
          <p>Photo by ${photo.photographer}</p>
        `;

        makeDraggable(card);
        outfitResults.appendChild(card);
      });
    });
}

function searchPexels(color) {
  const query = color + " fashion outfit";

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=5`;

  return fetch(url, {
    headers: {
      Authorization: pexelsKey
    }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      return {
        color: color,
        photos: data.photos
      };
    });
}

function removeDuplicatePhotographers(items) {
  const usedPhotographerIds = [];
  const uniqueItems = [];

  items.forEach(function(item) {
    const photographerId = item.photo.photographer_id;

    if (!usedPhotographerIds.includes(photographerId)) {
      usedPhotographerIds.push(photographerId);
      uniqueItems.push(item);
    }
  });

  return uniqueItems;
}

function makeDraggable(card) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  card.addEventListener("mousedown", function(event) {
    isDragging = true;

    offsetX = event.clientX - card.offsetLeft;
    offsetY = event.clientY - card.offsetTop;

    topZIndex = topZIndex + 1;
    card.style.zIndex = topZIndex;
  });

  document.addEventListener("mousemove", function(event) {
    if (isDragging === false) {
      return;
    }

    card.style.left = event.clientX - offsetX + "px";
    card.style.top = event.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", function() {
    isDragging = false;
  });
}
