/* ==========================================
   BE.IPOWALE - IPO Allotment
========================================== */

let ipoData = [];
let filteredData = [];

const cards = document.getElementById("cards");
const search = document.getElementById("search");
const ticker = document.getElementById("ticker");
const loading = document.getElementById("loading");
const emptyState = document.getElementById("emptyState");
const topBtn = document.getElementById("topBtn");

/* -----------------------------
   Status
------------------------------ */

function getStatus(date){

    const today = new Date();
    today.setHours(0,0,0,0);

    const allotment = new Date(date);
    allotment.setHours(0,0,0,0);

    if(allotment.getTime()===today.getTime()){
        return "Today's Allotment";
    }

    if(allotment>today){
        return "Upcoming";
    }

    return "Closed";
}

/* -----------------------------
   Status Badge
------------------------------ */

function getStatusBadge(status){

    switch(status){

        case "Today's Allotment":
            return "🟢 Today's Allotment";

        case "Upcoming":
            return "🟡 Upcoming";

        default:
            return "⚫ Closed";

    }

}

/* -----------------------------
   Countdown
------------------------------ */

function getCountdown(date){

    const today = new Date();

    today.setHours(0,0,0,0);

    const allotment = new Date(date);

    allotment.setHours(0,0,0,0);

    const diff = Math.ceil(
        (allotment-today)/(1000*60*60*24)
    );

    if(diff===0)
        return "Today";

    if(diff===1)
        return "Tomorrow";

    if(diff>1)
        return diff+" Days Left";

    return "Completed";

}

/* -----------------------------
   Format Date
------------------------------ */

function formatDate(date){

    return new Date(date).toLocaleDateString("en-IN",{

        day:"2-digit",

        month:"short",

        year:"numeric"

    });

}

/* -----------------------------
   Load JSON
------------------------------ */

async function loadData(){

    try{

        const response = await fetch("/static/data/allotment.json");

        if(!response.ok){

            throw new Error("Unable to load JSON");

        }

        ipoData = await response.json();

        ipoData.forEach(ipo=>{

            ipo.status = getStatus(ipo.allotment);

        });

        ipoData.sort((a,b)=>{

            return new Date(a.allotment)-new Date(b.allotment);

        });

        filteredData = [...ipoData];

        updateDashboard();

        updateTicker();

        renderCards(filteredData);

    }

    catch(error){

        console.error(error);

        cards.innerHTML=`

        <div class="empty">

            <h2>Unable to load IPO Data</h2>

        </div>

        `;

    }

    finally{

        if(loading){

            loading.style.display="none";

        }

    }

}

/* -----------------------------
   Dashboard
------------------------------ */

function updateDashboard(){

    const total=document.getElementById("totalCount");

    const upcoming=document.getElementById("upcomingCount");

    const today=document.getElementById("todayCount");

    const closed=document.getElementById("closedCount");

    if(total)

        total.innerText=ipoData.length;

    if(upcoming)

        upcoming.innerText=

        ipoData.filter(i=>i.status==="Upcoming").length;

    if(today)

        today.innerText=

        ipoData.filter(i=>i.status==="Today's Allotment").length;

    if(closed)

        closed.innerText=

        ipoData.filter(i=>i.status==="Closed").length;

}

/* -----------------------------
   Cards
------------------------------ */

function renderCards(data){

    cards.innerHTML="";

    if(data.length===0){

        emptyState.style.display="block";

        return;

    }

    emptyState.style.display="none";

    data.forEach(ipo=>{

        cards.innerHTML+=`

<div class="card">

<div class="card-top"></div>

${ipo.status==="Today's Allotment"

?`<div class="ribbon">TODAY'S ALLOTMENT</div>`

:""}

<div class="card-body">

<img

src="${ipo.logo}"

alt="${ipo.company}"

class="card-logo"

onerror="this.src='/static/logo.jpg'">

<h2>${ipo.company}</h2>

<div class="info">

<span class="label">

Registrar

</span>

<span class="value">

${ipo.registrar}

</span>

</div>

<div class="info">

<span class="label">

Allotment

</span>

<span class="value">

${formatDate(ipo.allotment)}

</span>

</div>

<div class="info">

<span class="label">

Countdown

</span>

<span class="value">

${getCountdown(ipo.allotment)}

</span>

</div>

<span class="status ${ipo.status.toLowerCase().replace(/\\s+/g,'-').replace(/'/g,'')}">

${getStatusBadge(ipo.status)}

</span>

<a

href="${ipo.url}"

target="_blank"

rel="noopener noreferrer"

class="btn">

🏛 Check Official Allotment ↗

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

        const keyword = this.value.trim().toLowerCase();

        filteredData = ipoData.filter(ipo =>

            ipo.company.toLowerCase().includes(keyword) ||

            ipo.registrar.toLowerCase().includes(keyword)

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
            .forEach(button => button.classList.remove("active"));

        btn.classList.add("active");

        const filter = btn.dataset.filter;

        switch (filter) {

            case "all":
                filteredData = [...ipoData];
                break;

            case "Today's Allotment":
                filteredData = ipoData.filter(
                    ipo => ipo.status === "Today's Allotment"
                );
                break;

            case "Upcoming":
                filteredData = ipoData.filter(
                    ipo => ipo.status === "Upcoming"
                );
                break;

            case "Closed":
                filteredData = ipoData.filter(
                    ipo => ipo.status === "Closed"
                );
                break;

            default:
                filteredData = [...ipoData];

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

        ticker.innerHTML += `
            🔥 ${ipo.company}
            • ${ipo.status}
            &nbsp;&nbsp;&nbsp;&nbsp;
        `;

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

setInterval(() => {

    loadData();

}, 300000); // Refresh every 5 minutes

/* -----------------------------
   Initial Load
------------------------------ */

loadData();
