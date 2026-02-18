 
const sizeGroup = document.getElementById("sizeGroup");
const sizeOptionsDiv = document.getElementById("sizeOptions");
const dimensionGroup = document.getElementById("dimensionGroup");
const qtyGroup = document.getElementById("qtyGroup");
const colorGroup = document.getElementById("colorGroup");
const colorInput = document.getElementById("color");

const widthEl = document.getElementById("width");
const heightEl = document.getElementById("height");
const qtyEl = document.getElementById("qty");
const priceEl = document.getElementById("price");

// ========================
// Load services JSON
// ========================
let servicesData = [];

async function loadServices() {
  const res = await fetch("services.json");
  const data = await res.json();
  servicesData = data.services;
  renderServiceButtons();
}

// ========================
// Render Service Buttons
// ========================
function renderServiceButtons() {
  const container = document.getElementById("serviceGroup");
  container.innerHTML = `<p class="font-semibold mb-2">Select Service</p>
                         <div class="grid grid-cols-2 gap-4" id="serviceButtons"></div>`;
  const serviceButtonsDiv = document.getElementById("serviceButtons");

  servicesData.forEach(service => {
    const label = document.createElement("label");
    label.className = "cursor-pointer";
    label.innerHTML = `
      <input type="radio" name="service" value="${service.name}" class="peer hidden" />
      <div class="flex flex-col items-center justify-center p-4 border rounded-lg bg-white shadow hover:bg-blue-50 peer-checked:border-blue-500 peer-checked:bg-blue-100 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${service.icon}" />
        </svg>
        <span class="text-gray-700 font-medium">${service.name}</span>
      </div>
    `;
    serviceButtonsDiv.appendChild(label);
  });

  document.querySelectorAll('input[name="service"]').forEach(r => r.addEventListener("change", handleServiceChange));
}

// ========================
// Handle Service Change
// ========================
function handleServiceChange() {
  const selectedName = document.querySelector('input[name="service"]:checked')?.value;
  const service = servicesData.find(s => s.name === selectedName);

  sizeGroup.classList.add("hidden");
  dimensionGroup.classList.add("hidden");
  qtyGroup.classList.add("hidden");
  colorGroup.classList.add("hidden");
  sizeOptionsDiv.innerHTML = "";
  widthEl.value = "";
  heightEl.value = "";
  qtyEl.value = 1;
  colorInput.value = "";

  if (!service) return;

  qtyGroup.classList.remove("hidden");
  colorGroup.classList.remove("hidden");

  if (service.name === "Tarpaulin") {
    dimensionGroup.classList.remove("hidden");
  } else if (service.sizes) {
    sizeGroup.classList.remove("hidden");
    service.sizes.forEach(size => {
      const label = document.createElement("label");
      label.className = "inline-flex items-center mr-4 mb-2 cursor-pointer";
      label.innerHTML = `
        <input type="radio" name="size" value="${size}" class="hidden peer" />
        <div class="px-4 py-2 border rounded-lg peer-checked:bg-blue-100 peer-checked:border-blue-500 transition">${size}</div>
      `;
      sizeOptionsDiv.appendChild(label);
    });

    document.querySelectorAll('input[name="size"]').forEach(r => r.addEventListener("change", calculatePrice));
  }

  calculatePrice();
}

// ========================
// Get selected size
// ========================
function getSelectedSize() {
  const checked = document.querySelector('input[name="size"]:checked');
  return checked ? checked.value : "";
}

// ========================
// Predefined Color Buttons
// ========================
const colorPalette = [
  { name: "Red", bg: "bg-red-600" },
  { name: "Blue", bg: "bg-blue-600" },
  { name: "Green", bg: "bg-green-600" },
  { name: "Yellow", bg: "bg-yellow-400" },
  { name: "Black", bg: "bg-black" },
  { name: "White", bg: "bg-white border-gray-300" }
];

const colorOptionsDiv = document.getElementById("colorOptions");
colorPalette.forEach(c => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("data-color", c.name);
  btn.className = `w-8 h-8 rounded-full border-2 ${c.bg} hover:ring-2 hover:ring-blue-500`;
  colorOptionsDiv.appendChild(btn);
});

document.querySelectorAll("#colorOptions button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#colorOptions button").forEach(b => b.classList.remove("ring-2", "ring-blue-500"));
    btn.classList.add("ring-2", "ring-blue-500");
    colorInput.value = btn.getAttribute("data-color");
    calculatePrice();
  });
});

// ========================
// Price Calculation
// ========================
function calculatePrice() {
  const selectedName = document.querySelector('input[name="service"]:checked')?.value;
  if (!selectedName) { priceEl.innerText = "0"; return 0; }
  const service = servicesData.find(s => s.name === selectedName);
  let total = 0;

  if (service.name === "Tarpaulin") {
    const w = parseFloat(widthEl.value || 0);
    const h = parseFloat(heightEl.value || 0);
    const qty = parseInt(qtyEl.value || 1);
    total = w * h * (service.tarpaulinRate || 35) * qty;
  } else if (service.prices) {
    const size = getSelectedSize();
    const qty = parseInt(qtyEl.value || 1);
    total = (service.prices[size] || 0) * qty;
  }

  priceEl.innerText = total.toFixed(2);
  return total;
}

[widthEl, heightEl, qtyEl].forEach(el => el.addEventListener("input", calculatePrice));

// ========================
// Convert file to Base64
// ========================
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ========================
// Submit Order
// ========================
document.getElementById("submitBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const desc = document.getElementById("desc").value;
  const file = document.getElementById("image")?.files[0];
  const service = document.querySelector('input[name="service"]:checked')?.value;
  const size = getSelectedSize();
  const color = colorInput.value;

  if (!name || !service || !desc) { alert("Please fill required fields"); return; }

  let imageBase64 = "";
  if (file) imageBase64 = await fileToBase64(file);

  const order = {
    name,email, phone, service, size,
    width: widthEl.value || "", height: heightEl.value || "",
    qty: qtyEl.value || 1, color, desc,
    price: calculatePrice(),
    imageBase64, createdAt: new Date()
  };

 

  sendEmail(order);
  alert("Order submitted successfully!");
  location.reload();
});

 function sendEmail(order) {
  const templateParams = {
    order_id: 100001,
    to_email: "jusprint.services@gmail.com",
    from_name: order.name,
    service: order.service,
    size: order.size || "-",
    dimensions: `${order.width || "-"} x ${order.height || "-"} ft`,
    quantity: order.qty,
    color: order.color || "-",
    price: `₱${order.price}`,
    description: order.desc,
    image_url: order.imageBase64 || "https://static.vecteezy.com/system/resources/thumbnails/074/482/764/small/3d-product-feedback-icon-on-transparent-background-png.png"
  };

  emailjs.send("service_b9niqqs", "template_3lguulw", templateParams)
    .then(function(response) {
       alert("Order sent via email successfully!");
    }, function(error) {
       alert("Failed to send email. " + JSON.stringify(error));
    });
}


// ========================
// Initialize
// ========================
window.addEventListener("DOMContentLoaded", loadServices);
