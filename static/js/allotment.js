/* ==========================================
   BE.IPOWALE - IPO Allotment
========================================== */

let ipoData = [];
let filteredData = [];
function getStatus(date){

    const today = new Date();

    today.setHours(0,0,0,0);

    const allotment = new Date(date);

    allotment.setHours(0,0,0,0);

    if(allotment.getTime() === today.getTime()){
        return "Available";
    }

    if(allotment > today){
        return "Upcoming";
    }

    return "Closed";
}

const cards = document.getElementById("cards");
const search = document.getElementById("search");
const ticker = document.getElementById("ticker");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const topBtn = document.getElementById("topBtn");

/* -----------------------------
   Load JSON
------------------------------ */

async function loadData() {
    try {

        const response = await fetch("/static/data/allotment.json");

        if (!response.ok) {
            throw new Error("Failed to load JSON");
        }

        ipoData = await response.json();
        filteredData = [...ipoData];

        updateDashboard();
        updateTicker();
        renderCards(filteredData);

    } catch (error) {

        console.error(error);

        cards.innerHTML = `
            <div class="empty">
                <h2>Unable to load IPO Data</h2>
            </div>
        `;

    } finally {

        if (loading) {
            loading.style.display = "none";
        }

    }
}

/* -----------------------------
   Dashboard
------------------------------ */

function updateDashboard() {

    const total = document.getElementById("totalCount");
    const upcoming = document.getElementById("upcomingCount");
    const available = document.getElementById("availableCount");
    const registrar = document.getElementById("registrarCount");

    if (total)
        total.innerText = ipoData.length;

    if (upcoming)
        upcoming.innerText = ipoData.filter(i => i.status === "Upcoming").length;

    if (available)
        available.innerText = ipoData.filter(i => i.status === "Available").length;

    if (registrar) {

        registrar.innerText =
            [...new Set(ipoData.map(i => i.registrar))].length;

    }

}

/* -----------------------------
   Cards
------------------------------ */

function renderCards(data) {

    cards.innerHTML = "";

    if (data.length === 0) {

        emptyState.style.display = "block";
        return;

    }

    emptyState.style.display = "none";

    data.forEach(ipo => {

        cards.innerHTML += `

<div class="card">

    <div class="card-top"></div>

    ${ipo.featured ? `<div class="ribbon">FEATURED</div>` : ""}

    <div class="card-body">

        <img
            src="${ipo.logo}"
            alt="${ipo.company}"
            class="card-logo"
            onerror="this.src='/static/logo.jpg'">

        <h2>${ipo.company}</h2>

        <div class="info">
            <span class="label">Registrar</span>
            <span class="value">${ipo.registrar}</span>
        </div>

        <div class="info">
            <span class="label">Allotment</span>
            <span class="value">${ipo.allotment}</span>
        </div>

        <span class="status ${ipo.status.toLowerCase()}">
            ${ipo.status}
        </span>

        <a
            href="${ipo.url}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn">

            Check Allotment →

        </a>

        <p class="official-note">

            🛡️ Redirects to Official Registrar Website

        </p>

    </div>

</div>

`;

    });

}

/* -----------------------------
   Search
------------------------------ */

if (search) {

    search.addEventListener("keyup", function () {

        const keyword = this.value.toLowerCase();

        filteredData = ipoData.filter(ipo =>
            ipo.company.toLowerCase().includes(keyword)
        );

        renderCards(filteredData);

    });

}

/* -----------------------------
   Filters
------------------------------ */

document.querySelectorAll(".filter-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".filter-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        const filter = btn.dataset.filter;

        if (filter === "all") {

            filteredData = [...ipoData];

        } else {

            filteredData =
                ipoData.filter(i => i.status === filter);

        }

        renderCards(filteredData);

    });

});

/* -----------------------------
   Live Ticker
------------------------------ */

function updateTicker() {

    if (!ticker) return;

    if (ipoData.length === 0) {

        ticker.innerHTML = "No IPO Available";
        return;

    }

    ticker.innerHTML = "";

    ipoData.forEach(ipo => {

        ticker.innerHTML +=
            `🔥 ${ipo.company} (${ipo.status}) &nbsp;&nbsp;&nbsp;&nbsp;`;

    });

}

/* -----------------------------
   Back To Top
------------------------------ */

window.addEventListener("scroll", () => {

    if (!topBtn) return;

    if (window.scrollY > 300) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

});

if (topBtn) {

    topBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}

/* -----------------------------
   Auto Refresh
------------------------------ */

setInterval(loadData, 300000);

/* -----------------------------
   Start
------------------------------ */

loadData();
