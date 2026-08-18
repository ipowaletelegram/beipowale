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

function getStatus(date) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allotment = new Date(date);
    allotment.setHours(0, 0, 0, 0);

    if (allotment.getTime() === today.getTime()) {
        return "Today's Allotment";
    }

    if (allotment > today) {
        return "Upcoming";
    }

    return "Closed";
}


/* -----------------------------
   Status Badge
------------------------------ */

function getStatusBadge(status) {

    switch (status) {

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

function getCountdown(date) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const allotment = new Date(date);

    allotment.setHours(0, 0, 0, 0);

    const diff = Math.ceil(
        (allotment - today) /
        (1000 * 60 * 60 * 24)
    );

    if (diff === 0)
        return "Today";

    if (diff === 1)
        return "Tomorrow";

    if (diff > 1)
        return diff + " Days Left";

    return "Completed";
}


/* -----------------------------
   Format Date
------------------------------ */

function formatDate(date) {

    return new Date(date).toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


/* ==========================================
   GOOGLE SHEET
========================================== */

const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTdEelMixOXPSgQ3IBE0pyHj7sEOYH9WOq9HPCrxZyQlo1l87Dms8xvWLH4Fs2otKN6ubn-4zyUnnM/pub?output=csv";


/* -----------------------------
   CSV Parser
------------------------------ */

function parseCSV(text) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        const next = text[i + 1];


        /* Double quote inside quoted value */

        if (
            char === '"' &&
            insideQuotes &&
            next === '"'
        ) {

            value += '"';

            i++;

        }


        /* Start / End quote */

        else if (char === '"') {

            insideQuotes = !insideQuotes;

        }


        /* Comma */

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(value.trim());

            value = "";

        }


        /* New line */

        else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }


            row.push(value.trim());


            if (
                row.some(
                    cell => cell !== ""
                )
            ) {

                rows.push(row);

            }


            row = [];

            value = "";

        }


        /* Normal character */

        else {

            value += char;

        }

    }


    /* Last row */

    if (
        value !== "" ||
        row.length > 0
    ) {

        row.push(value.trim());


        if (
            row.some(
                cell => cell !== ""
            )
        ) {

            rows.push(row);

        }

    }


    return rows;

}


/* ==========================================
   LOAD DATA FROM GOOGLE SHEET
========================================== */

async function loadData() {

    try {

        /* -----------------------------
           Fetch Google Sheet
        ------------------------------ */

        const response = await fetch(
            GOOGLE_SHEET_URL +
            "&cache=" +
            Date.now()
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load Google Sheet"
            );

        }


        /* -----------------------------
           Read CSV
        ------------------------------ */

        const csvText =
            await response.text();


        /* -----------------------------
           Parse CSV
        ------------------------------ */

        const rows =
            parseCSV(csvText);


        if (rows.length < 2) {

            throw new Error(
                "Google Sheet is empty"
            );

        }


        /* -----------------------------
           First row = Headers
        ------------------------------ */

        const headers =
            rows[0].map(header =>
                header
                    .trim()
                    .toLowerCase()
            );


        /* -----------------------------
           Convert rows to objects
        ------------------------------ */

        ipoData = rows
            .slice(1)

            .filter(row =>
                row[0] &&
                row[0].trim() !== ""
            )

            .map(row => {

                const ipo = {};


               headers.forEach((header, index) => {

                const cleanHeader = header
                    .trim()
                     .toLowerCase();

            ipo[cleanHeader] =
                row[index] !== undefined
                 ? row[index].trim()
                     : "";

            });


                /* Convert featured */

                ipo.featured =
                    String(
                        ipo.featured
                    ).toLowerCase() === "true";


                return ipo;

            });


        /* -----------------------------
           Calculate Status
        ------------------------------ */

        ipoData.forEach(ipo => {

            ipo.status =
                getStatus(
                    ipo.allotment
                );

        });


        /* -----------------------------
           Sort by Allotment Date
        ------------------------------ */

        ipoData.sort((a, b) => {

            return (
                new Date(a.allotment) -
                new Date(b.allotment)
            );

        });


        /* -----------------------------
           Reset Filtered Data
        ------------------------------ */

        filteredData = [
            ...ipoData
        ];


        /* -----------------------------
           Update Dashboard
        ------------------------------ */

        updateDashboard();


        /* -----------------------------
           Update Ticker
        ------------------------------ */

        updateTicker();


        /* -----------------------------
           Render Cards
        ------------------------------ */

        renderCards(
            filteredData
        );


        /* -----------------------------
           Console
        ------------------------------ */

        console.log(
            "Google Sheet Loaded:",
            ipoData
        );

    }


    catch (error) {

        console.error(
            "Google Sheet Error:",
            error
        );


        if (cards) {

            cards.innerHTML = `

                <div class="empty">

                    <h2>
                        Unable to load IPO Data
                    </h2>

                    <p>
                        Please try again later.
                    </p>

                </div>

            `;

        }

    }


    finally {

        if (loading) {

            loading.style.display =
                "none";

        }

    }

}


/* ==========================================
   DASHBOARD
========================================== */

function updateDashboard() {

    const total =
        document.getElementById(
            "totalCount"
        );

    const upcoming =
        document.getElementById(
            "upcomingCount"
        );

    const today =
        document.getElementById(
            "todayCount"
        );

    const closed =
        document.getElementById(
            "closedCount"
        );


    if (total) {

        total.innerText =
            ipoData.length;

    }


    if (upcoming) {

        upcoming.innerText =
            ipoData.filter(
                i =>
                    i.status === "Upcoming"
            ).length;

    }


    if (today) {

        today.innerText =
            ipoData.filter(
                i =>
                    i.status ===
                    "Today's Allotment"
            ).length;

    }


    if (closed) {

        closed.innerText =
            ipoData.filter(
                i =>
                    i.status === "Closed"
            ).length;

    }

}


/* ==========================================
   CARDS
========================================== */

function renderCards(data) {

    if (!cards) return;


    cards.innerHTML = "";


    if (data.length === 0) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    data.forEach(ipo => {

        cards.innerHTML += `

<div class="card">

    <div class="card-top"></div>


    ${
        ipo.status === "Today's Allotment"

        ? `
        <div class="ribbon">
            TODAY'S ALLOTMENT
        </div>
        `

        : ""
    }


    <div class="card-body">


        <img

            src="${ipo.logo}"

            alt="${ipo.company}"

            class="card-logo"

            onerror="
                this.src='/static/logo.jpg'
            "

        >


        <h2>
            ${ipo.company}
        </h2>


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
                ${formatDate(
                    ipo.allotment
                )}
            </span>

        </div>


        <div class="info">

            <span class="label">
                Countdown
            </span>

            <span class="value">
                ${getCountdown(
                    ipo.allotment
                )}
            </span>

        </div>


        <span

            class="status
                ${ipo.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/'/g, "")
                }"

        >

            ${getStatusBadge(
                ipo.status
            )}

        </span>


        <a

            href="${ipo.url}"

            target="_blank"

            rel="noopener noreferrer"

            class="btn"

        >

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


/* ==========================================
   SEARCH
========================================== */

if (search) {

    search.addEventListener(
        "keyup",
        function () {

            const keyword =
                this.value
                    .trim()
                    .toLowerCase();


            filteredData =
                ipoData.filter(ipo =>

                    (
                        ipo.company || ""
                    )
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    (
                        ipo.registrar || ""
                    )
                    .toLowerCase()
                    .includes(keyword)

                );


            renderCards(
                filteredData
            );

        }
    );

}


/* ==========================================
   FILTERS
========================================== */

document
    .querySelectorAll(".filter-btn")
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {


                /* Remove active */

                document
                    .querySelectorAll(
                        ".filter-btn"
                    )
                    .forEach(button => {

                        button.classList
                            .remove("active");

                    });


                /* Add active */

                btn.classList.add(
                    "active"
                );


                const filter =
                    btn.dataset.filter;


                switch (filter) {


                    case "all":

                        filteredData =
                            [
                                ...ipoData
                            ];

                        break;


                    case "Today's Allotment":

                        filteredData =
                            ipoData.filter(
                                ipo =>
                                    ipo.status ===
                                    "Today's Allotment"
                            );

                        break;


                    case "Upcoming":

                        filteredData =
                            ipoData.filter(
                                ipo =>
                                    ipo.status ===
                                    "Upcoming"
                            );

                        break;


                    case "Closed":

                        filteredData =
                            ipoData.filter(
                                ipo =>
                                    ipo.status ===
                                    "Closed"
                            );

                        break;


                    default:

                        filteredData =
                            [
                                ...ipoData
                            ];

                }


                renderCards(
                    filteredData
                );

            }

        );

    });


/* ==========================================
   LIVE TICKER
========================================== */

function updateTicker() {

    if (!ticker) return;


    if (ipoData.length === 0) {

        ticker.innerHTML =
            "No IPO Available";

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


/* ==========================================
   BACK TO TOP
========================================== */

window.addEventListener(
    "scroll",
    () => {

        if (!topBtn) return;


        if (window.scrollY > 300) {

            topBtn.style.display =
                "block";

        }

        else {

            topBtn.style.display =
                "none";

        }

    }
);


if (topBtn) {

    topBtn.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* ==========================================
   AUTO REFRESH
========================================== */

setInterval(
    () => {

        loadData();

    },
    300000
); // 5 minutes


/* ==========================================
   INITIAL LOAD
========================================== */

loadData();
