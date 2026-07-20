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
   Load JSON
------------------------------ */

async function loadData(){

    try{

        const response = await fetch("/static/data/allotment.json");

        ipoData = await response.json();

        filteredData = [...ipoData];

        updateDashboard();

        updateTicker();

        renderCards(filteredData);

    }

    catch(error){

        console.error(error);

        cards.innerHTML =
        "<h2>Unable to load IPO Data.</h2>";

    }

    finally{

        loading.style.display="none";

    }

}

/* -----------------------------
   Dashboard
------------------------------ */

function updateDashboard(){

    document.getElementById("totalCount").innerText =
    ipoData.length;

    document.getElementById("upcomingCount").innerText =
    ipoData.filter(x=>x.status=="Upcoming").length;

    document.getElementById("availableCount").innerText =
    ipoData.filter(x=>x.status=="Available").length;

    const registrars =
    [...new Set(ipoData.map(x=>x.registrar))];

    document.getElementById("registrarCount").innerText =
    registrars.length;

}

/* -----------------------------
   Cards
------------------------------ */

function renderCards(data){

    cards.innerHTML="";

    if(data.length==0){

        emptyState.style.display="block";

        return;

    }

    emptyState.style.display="none";

    data.forEach(ipo=>{

        cards.innerHTML += `

<div class="card">

<div class="card-top"></div>

${ipo.featured ? '<div class="ribbon">FEATURED</div>' : ''}

<div class="card-body">

<img src="${ipo.logo}"

class="card-logo">

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

${ipo.allotment}

</span>

</div>

<div class="info">

<span class="label">

Listing

</span>

<span class="value">

${ipo.listing}

</span>

</div>

<span class="status ${ipo.status.toLowerCase()}">

${ipo.status}

</span>

<a

href="${ipo.url}"

target="_blank"

class="btn">

Check Allotment →

</a>

</div>

</div>

`;

    });

}

/* -----------------------------
   Search
------------------------------ */

search.addEventListener("keyup",()=>{

    const keyword =

    search.value.toLowerCase();

    filteredData = ipoData.filter(ipo=>

        ipo.company.toLowerCase().includes(keyword)

    );

    renderCards(filteredData);

});

/* -----------------------------
   Filters
------------------------------ */

document.querySelectorAll(".filter-btn")

.forEach(btn=>{

btn.onclick=()=>{

document.querySelectorAll(".filter-btn")

.forEach(x=>x.classList.remove("active"));

btn.classList.add("active");

const filter=btn.dataset.filter;

if(filter=="all"){

filteredData=[...ipoData];

}

else{

filteredData=

ipoData.filter(x=>x.status==filter);

}

renderCards(filteredData);

}

});

/* -----------------------------
   Live Ticker
------------------------------ */

function updateTicker(){

    if(ipoData.length==0){

        ticker.innerHTML="No IPO Available";

        return;

    }

    ticker.innerHTML="";

    ipoData.forEach(ipo=>{

        ticker.innerHTML +=

`🔥 ${ipo.company} (${ipo.status}) &nbsp;&nbsp;&nbsp;&nbsp;`;

    });

}

/* -----------------------------
   Back To Top
------------------------------ */

window.onscroll=()=>{

if(window.scrollY>300){

topBtn.style.display="block";

}

else{

topBtn.style.display="none";

}

}

topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

}

/* -----------------------------
   Auto Refresh JSON

   Every 5 Minutes
------------------------------ */

setInterval(()=>{

loadData();

},300000);

/* -----------------------------
   Start
------------------------------ */

loadData();
