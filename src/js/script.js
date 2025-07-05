const MAX_ATTEMPTS = 5;
const STORAGE_KEY = "altverse-limit";

const form = document.getElementById("predictForm");
const loading = document.getElementById("loadingState");
const resultContainer = document.getElementById("resultContainer");
const resultCards = document.getElementById("resultCards");
const formBox = document.getElementById("formBox");
const limitMsg = document.getElementById("limitMessage");
const attemptCounter = document.getElementById("attemptCounter");

function getLimitData() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const today = new Date().toDateString();
  if (saved.date !== today) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
    return { date: today, count: 0 };
  }
  return saved;
}

function updateAttemptUI() {
  const data = getLimitData();
  attemptCounter.textContent = `Attempts left: ${
    MAX_ATTEMPTS - data.count
  }/${MAX_ATTEMPTS}`;
}

function incrementLimit() {
  const data = getLimitData();
  data.count++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateAttemptUI();
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = getLimitData();
  if (data.count >= MAX_ATTEMPTS) {
    form.classList.add("d-none");
    limitMsg.classList.remove("d-none");
    return;
  }

  const question = document.getElementById("question").value.trim();
  form.classList.add("d-none");
  loading.classList.remove("d-none");

  try {
    const res = await fetch("https://altverse-api.onrender.com/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const result = await res.json();
    console.log(result)
    loading.classList.add("d-none");
    resultContainer.classList.remove("d-none");

    if (result.result && result.result.good && result.result.medium && result.result.bad) {
      const { good, medium, bad } = result.result;

      resultCards.innerHTML = `
        <div class="col">
          <div class="card outcome-card border-success h-100">
            <div class="card-header bg-success text-dark fw-bold">🌟 Utopian Outcome</div>
            <div class="card-body text-light"><ul>${good.map(i => `<li>${i}</li>`).join("")}</ul></div>
          </div>
        </div>
        <div class="col">
          <div class="card outcome-card border-warning h-100">
            <div class="card-header bg-warning text-dark fw-bold">⚖️ Mixed Outcome</div>
            <div class="card-body text-light"><ul>${medium.map(i => `<li>${i}</li>`).join("")}</ul></div>
          </div>
        </div>
        <div class="col">
          <div class="card outcome-card border-danger h-100">
            <div class="card-header bg-danger text-dark fw-bold">⚠️ Dystopian Outcome</div>
            <div class="card-body text-light"><ul>${bad.map(i => `<li>${i}</li>`).join("")}</ul></div>
          </div>
        </div>
      `;
    } else {
      const fallback = result.raw || "❌ Could not generate a response.";
      resultCards.innerHTML = `
        <div class="col">
          <div class="card bg-dark border-warning text-light p-4">
            <h5 class="text-warning">⚠️ Notice</h5>
            <p>${fallback}</p>
          </div>
        </div>
      `;
    }

    incrementLimit();
    resultContainer.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    loading.classList.add("d-none");
    resultCards.innerHTML = `
      <div class="col">
        <div class="card bg-dark border-danger text-light p-4">
          <h5 class="text-danger">❌ Error</h5>
          <p>Something went wrong. Please try again later.</p>
        </div>
      </div>
    `;
    resultContainer.classList.remove("d-none");
  }
});

updateAttemptUI();
