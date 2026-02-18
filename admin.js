// 🔥 SAME FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyCDqoLfAiv8Koz24-gLHKbga0Klo_-GNyQ",
  authDomain: "jusprint-orders.firebaseapp.com",
  projectId: "jusprint-orders"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const ordersDiv = document.getElementById("orders");

db.collection("orders").orderBy("createdAt", "desc")
  .onSnapshot(snapshot => {
    ordersDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const o = doc.data();
      ordersDiv.innerHTML += `
        <div class="order-item">
          <b>${o.name}</b><br>
          ${o.service} - ${o.size} x ${o.qty}<br>
          Color: ${o.color}<br>
          Price: ₱${o.price}<br>
          ${o.desc}<br>
          ${o.imageUrl ? `<a href="${o.imageUrl}" target="_blank">View Design</a>` : ""}
        </div>
      `;
    });
  });
