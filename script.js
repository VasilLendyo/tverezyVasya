import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔥 ВСТАВ СЮДИ свій firebaseConfig ↓
const firebaseConfig = {
  apiKey: "AIzaSyDjfn5HTxD5dYfsps--O5dccRhiTbeW2dA",
  authDomain: "tvereziyvasya.firebaseapp.com",
  projectId: "tvereziyvasya",
  storageBucket: "tvereziyvasya.appspot.com",
  messagingSenderId: "877439507683",
  appId: "1:877439507683:web:6195a466e76dfe768139d6",
  measurementId: "G-6PS48H0S9D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(
  app,
  "https://tvereziyvasya-default-rtdb.europe-west1.firebasedatabase.app"
);

const daysEl = document.getElementById("days");
const btn = document.getElementById("stayStrongBtn");
const quoteEl = document.getElementById("quote");
const email = document.getElementById("email");
const password = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const userStatus = document.getElementById("userStatus");

let userId = null;

const quotes = [
  "Справжня сила — це контроль над собою.",
  "Кожен новий день — це новий шанс.",
  "Ти сильніший, ніж здається.",
  "Один день — це вже перемога.",
  "Тверезість — це суперсила.",
  "Ти не сам. Ти в дорозі до кращого себе.",
];
quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];

const dbRef = ref(db);
let soberDays = 0;

// Обробка входу
registerBtn.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      userId = userCredential.user.uid;
      userStatus.textContent = `Привіт, ${email.value}!`;
      loadSoberLog();
    })
    .catch((error) => {
      alert("Помилка реєстрації: " + error.message);
    });
});

loginBtn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      userId = userCredential.user.uid;
      userStatus.textContent = `Вітаю з поверненням, ${email.value}!`;
      loadSoberLog();
    })
    .catch((error) => {
      alert("Помилка входу: " + error.message);
    });
});

function loadSoberLog() {
  if (!userId) return;
  get(ref(db, `users/${userId}/log`)).then((snapshot) => {
    if (snapshot.exists()) {
      const log = snapshot.val();
      updateStats(log);
    } else {
      daysEl.textContent = 0;
    }
  });
}

btn.addEventListener("click", () => {
  if (!userId) {
    alert("Спершу увійди!");
    return;
  }
  //Розширимо збереження
  const today = new Date().toISOString().split("T")[0]; //формат YYYY-MM-DD

  get(ref(db, `users/${userId}/log`)).then((snapshot) => {
    let log = snapshot.val() || [];

    if (!log.includes(today)) {
      log.push(today);
      set(ref(db, `users/${userId}/log`), log);
      updateStats(log);
    } else {
      alert("Ти вже натискав сьогодні!");
    }
  });
});

//Функція для оновлення статистики
function updateStats(log) {
  log.sort();
  daysEl.textContent = log.length;
  quoteEl.textContent = `"${getMotivationQuote(log.length)}"`;
  drawChart(log);
  updateLevel(log.length);
  updateBadges(log.length);
}

// Мотиваційні рівні
function getMotivationQuote(days) {
  if (days < 3) return "Перші кроки - найважчі, але ти вже йдеш!";
  if (days < 7) return "Ти вже тиждень герой! Продовжуй!";
  if (days < 30) return "Ти машина сили! Скоро місяць!";
  if (days < 100) return "Твої дні - як золото!";
  return "Ти легенда! Приклад для інших!";
}

// Графік
function drawChart(log) {
  const dates = log.sort();
  const counts = [];

  // Групуємо по днях
  const dateMap = {};
  dates.forEach((date) => {
    dateMap[date] = 1;
  });

  // Останні 7 днів
  const labels = [];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    labels.push(dateStr);
    data.push(dateMap[dateStr] ? 1 : 0);
  }

  const ctx = document.getElementById("soberChart").getContext("2d");
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Тверезі дні",
          data: data,
          backgroundColor: "#00b894",
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            stepSize: 1,
            callback: function (value) {
              return value === 1 ? "Так" : "Ні";
            },
          },
        },
      },
    },
  });
}

//  Функція для рівня
function updateLevel(days) {
  const levelEl = document.getElementById("level");
  const level = Math.floor(days / 7); //Кожні 7 днів - новий рівень
  levelEl.textContent = level;
}

// Бейджі
function updateBadges(days) {
    const badgesEl = document.querySelector(".badges");
    badgesEl.innerHTML = ''; // очищення

    const badgeList = [];

    if (days >= 1) badgeList.push("🏁");
    if (days >= 3) badgeList.push("🥉");
    if (days >= 7) badgeList.push("🥈");
    if (days >= 14) badgeList.push("🥇");
    if (days >= 30) badgeList.push("🏅");
    if (days >= 100) badgeList.push("👑");

    badgeList.forEach(badge => {
        const span = document.createElement("span");
        span.textContent = badge;
        badgesEl.appendChild(span);
    });
}

