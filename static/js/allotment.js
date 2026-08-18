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


/* ==========================================
   GOOGLE SHEET SETTINGS
========================================== */

const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTdEelMixOXPSgQ3IBE0pyHj7sEOYH9WOq9HPCrxZyQlo1l87Dms8xvWLH4Fs2otKN6ubn-4zyUnnM/pub?output=csv";


/* Logo folder */

const LOGO_PATH = "/static/logos/";


/* Google Sheet timeout */

const SHEET_TIMEOUT = 8000;


/* Local storage backup */

const STORAGE_KEY =
    "beipowale_allotment_data";


/* ==========================================
   STATUS
========================================== */

function getStatus(date) {

    if (!date) {
        return "Closed";
    }

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const allotment =
        new Date(date);

    allotment.setHours(
        0,
        0,
        0,
        0
    );


    if (
        allotment.getTime() ===
        today.getTime()
    ) {

        return "Today's Allotment";

    }


    if (
        allotment > today
    ) {

        return "Upcoming";

    }


    return "Closed";

}


/* ==========================================
   STATUS BADGE
========================================== */

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


/* ==========================================
   COUNTDOWN
========================================== */

function getCountdown(date) {

    if (!date) {
        return "N/A";
    }


    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const allotment =
        new Date(date);

    allotment.setHours(
        0,
        0,
        0,
        0
    );


    const diff = Math.ceil(

        (
            allotment -
            today
        ) /

        (
            1000 *
            60 *
            60 *
            24
        )

    );


    if (diff === 0) {

        return "Today";

    }


    if (diff === 1) {

        return "Tomorrow";

    }


    if (diff > 1) {

        return diff +
            " Days Left";

    }


    return "Completed";

}


/* ==========================================
   FORMAT DATE
========================================== */

function formatDate(date) {

    if (!date) {
        return "N/A";
    }


    const parsedDate =
        new Date(date);


    if (
        isNaN(
            parsedDate.getTime()
        )
    ) {

        return date;

    }


    return parsedDate.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


/* ==========================================
   LOGO PATH
========================================== */

function getLogoPath(logo) {

    if (!logo) {

        return "/static/logo.jpg";

    }


    logo = String(logo).trim();


    /* Already full URL */

    if (
        logo.startsWith("http://") ||
        logo.startsWith("https://")
    ) {

        return logo;

    }


    /* Already website path */

    if (
        logo.startsWith("/")
    ) {

        return logo;

    }


    /* Filename only */

    return LOGO_PATH + logo;

}


/* ==========================================
   SAFE TEXT
========================================== */

function safeText(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value).trim();

}


/* ==========================================
   CSV PARSER
========================================== */

function parseCSV(text) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];


        /* Double quote */

        if (
            char === '"' &&
            insideQuotes &&
            next === '"'
        ) {

            value += '"';

            i++;

        }


        /* Start / End quote */

        else if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

        }


        /* Comma */

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value.trim()
            );

            value = "";

        }


        /* New line */

        else if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }


            row.push(
                value.trim()
            );


            if (
                row.some(
                    cell =>
                        cell !== ""
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

        row.push(
            value.trim()
        );


        if (
            row.some(
                cell =>
                    cell !== ""
            )
        ) {

            rows.push(row);

        }

    }


    return rows;

}


/* ==========================================
   LOAD GOOGLE SHEET DATA
========================================== */

async function loadData() {

    try {

        /* -----------------------------
           Timeout Controller
        ------------------------------ */

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => {

                    controller.abort();

                },
                SHEET_TIMEOUT
            );


        /* -----------------------------
           Fetch Google Sheet
        ------------------------------ */

        const response =
            await fetch(

                GOOGLE_SHEET_URL +
                "&cache=" +
                Date.now(),

                {

                    method: "GET",

                    cache: "no-store",

                    signal:
                        controller.signal

                }

            );


        clearTimeout(timeout);


        if (
            !response.ok
        ) {

            throw new Error(
                "Google Sheet returned " +
                response.status
            );

        }


        /* -----------------------------
           Read CSV
        ------------------------------ */

        const csvText =
            await response.text();


        if (
            !csvText ||
            csvText.trim() === ""
        ) {

            throw new Error(
                "Google Sheet returned empty data"
            );

        }


        /* -----------------------------
           Parse CSV
        ------------------------------ */

        const rows =
            parseCSV(csvText);


        if (
            rows.length < 2
        ) {

            throw new Error(
                "Google Sheet is empty"
            );

        }


        /* -----------------------------
           Headers
        ------------------------------ */

        const headers =
            rows[0].map(
                header =>

                    safeText(header)
                        .toLowerCase()
                        .replace(
                            /^\uFEFF/,
                            ""
                        )
            );


        console.log(
            "Google Sheet Headers:",
            headers
        );


        /* -----------------------------
           Convert rows to objects
        ------------------------------ */

        const newData = rows
            .slice(1)

            .filter(
                row =>
                    row[0] &&
                    safeText(row[0]) !== ""
            )

            .map(
                row => {

                    const ipo = {};


                    headers.forEach(
                        (
                            header,
                            index
                        ) => {

                            const cleanHeader =
                                safeText(
                                    header
                                )
                                .toLowerCase();


                            ipo[
                                cleanHeader
                            ] =

                                row[index] !==
                                undefined

                                ?

                                safeText(
                                    row[index]
                                )

                                :

                                "";

                        }
                    );


                    /* -----------------------------
                       Registrar Fix
                    ------------------------------ */

                    if (
                        !ipo.registrar
                    ) {

                        if (
                            ipo.registered
                        ) {

                            ipo.registrar =
                                ipo.registered;

                        }

                        else if (
                            ipo.registrarname
                        ) {

                            ipo.registrar =
                                ipo.registrarname;

                        }

                        else if (
                            ipo.registrar_name
                        ) {

                            ipo.registrar =
                                ipo.registrar_name;

                        }

                        else {

                            ipo.registrar =
                                "Registrar";

                        }

                    }


                    /* -----------------------------
                       Featured
                    ------------------------------ */

                    ipo.featured =
                        String(
                            ipo.featured
                        )
                        .trim()
                        .toLowerCase() ===
                        "true";


                    /* -----------------------------
                       Logo
                    ------------------------------ */

                    ipo.logo =
                        getLogoPath(
                            ipo.logo
                        );


                    return ipo;

                }
            );


        /* -----------------------------
           Calculate Status
        ------------------------------ */

        newData.forEach(
            ipo => {

                ipo.status =
                    getStatus(
                        ipo.allotment
                    );

            }
        );


        /* -----------------------------
           Featured First
        ------------------------------ */

        newData.sort(
            (a, b) => {

                /* Featured first */

                if (
                    a.featured &&
                    !b.featured
                ) {

                    return -1;

                }


                if (
                    !a.featured &&
                    b.featured
                ) {

                    return 1;

                }


                /* Then allotment date */

                return (
                    new Date(
                        a.allotment
                    ) -

                    new Date(
                        b.allotment
                    )
                );

            }
        );


        /* -----------------------------
           Save Data
        ------------------------------ */

        ipoData =
            newData;


        filteredData =
            [
                ...ipoData
            ];


        /* -----------------------------
           Local Backup
        ------------------------------ */

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(
                ipoData
            )

        );


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


        /* =================================
           FALLBACK TO LOCAL DATA
        ================================= */

        try {

            const savedData =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (
                savedData
            ) {

                ipoData =
                    JSON.parse(
                        savedData
                    );


                /* Recalculate status */

                ipoData.forEach(
                    ipo => {

                        ipo.status =
                            getStatus(
                                ipo.allotment
                            );


                        ipo.logo =
                            getLogoPath(
                                ipo.logo
                            );

                    }
                );


                filteredData =
                    [
                        ...ipoData
                    ];


                updateDashboard();

                updateTicker();

                renderCards(
                    filteredData
                );


                console.log(
                    "Loaded saved IPO data"
                );

            }


            else {

                throw new Error(
                    "No saved IPO data"
                );

            }

        }


        catch (backupError) {

            console.error(
                "Backup Error:",
                backupError
            );


            if (cards) {

                cards.innerHTML = `

                    <div class="empty">

                        <h2>
                            Unable to load IPO Data
                        </h2>

                        <p>
                            Please refresh the page.
                        </p>

                    </div>

                `;

            }

        }

    }


    finally {

        /* Always stop loading */

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
                ipo =>
                    ipo.status ===
                    "Upcoming"
            ).length;

    }


    if (today) {

        today.innerText =
            ipoData.filter(
                ipo =>
                    ipo.status ===
                    "Today's Allotment"
            ).length;

    }


    if (closed) {

        closed.innerText =
            ipoData.filter(
                ipo =>
                    ipo.status ===
                    "Closed"
            ).length;

    }

}


/* ==========================================
   CARDS
========================================== */

function renderCards(data) {

    if (!cards) {
        return;
    }


    cards.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

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


    data.forEach(
        ipo => {

            const company =
                safeText(
                    ipo.company
                );


            const registrar =
                safeText(
                    ipo.registrar
                ) ||
                "Registrar";


            const logo =
                getLogoPath(
                    ipo.logo
                );


            const allotment =
                safeText(
                    ipo.allotment
                );


            const url =
                safeText(
                    ipo.url
                );


            const featuredBadge =
                ipo.featured

                ?

                `
                    <div class="featured-badge">
                        ⭐ FEATURED
                    </div>
                `

                :

                "";


            const todayRibbon =
                ipo.status ===
                "Today's Allotment"

                ?

                `
                    <div class="ribbon">
                        TODAY'S ALLOTMENT
                    </div>
                `

                :

                "";


            const statusClass =
                safeText(
                    ipo.status
                )
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                )
                .replace(
                    /'/g,
                    ""
                );


            cards.innerHTML += `

<div class="card">

    <div class="card-top"></div>


    ${featuredBadge}


    ${todayRibbon}


    <div class="card-body">


        <img

            src="${logo}"

            alt="${company}"

            class="card-logo"

            onerror="
                this.onerror=null;
                this.src='/static/logo.jpg';
            "

        >


        <h2>
            ${company}
        </h2>


        <div class="info">

            <span class="label">
                Registrar
            </span>

            <span class="value">
                ${registrar}
            </span>

        </div>


        <div class="info">

            <span class="label">
                Allotment
            </span>

            <span class="value">
                ${formatDate(
                    allotment
                )}
            </span>

        </div>


        <div class="info">

            <span class="label">
                Countdown
            </span>

            <span class="value">
                ${getCountdown(
                    allotment
                )}
            </span>

        </div>


        <span

            class="
                status
                ${statusClass}
            "

        >

            ${getStatusBadge(
                ipo.status
            )}

        </span>


        <a

            href="${url}"

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

        }
    );

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
                ipoData.filter(
                    ipo => {

                        const company =
                            safeText(
                                ipo.company
                            )
                            .toLowerCase();


                        const registrar =
                            safeText(
                                ipo.registrar
                            )
                            .toLowerCase();


                        return (

                            company.includes(
                                keyword
                            )

                            ||

                            registrar.includes(
                                keyword
                            )

                        );

                    }
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
    .querySelectorAll(
        ".filter-btn"
    )
    .forEach(
        btn => {

            btn.addEventListener(
                "click",
                () => {


                    /* Remove active */

                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(
                            button => {

                                button.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    /* Add active */

                    btn.classList.add(
                        "active"
                    );


                    const filter =
                        btn.dataset.filter;


                    switch (
                        filter
                    ) {


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

        }
    );


/* ==========================================
   LIVE TICKER
========================================== */

function updateTicker() {

    if (!ticker) {
        return;
    }


    if (
        ipoData.length === 0
    ) {

        ticker.innerHTML =
            "No IPO Available";

        return;

    }


    ticker.innerHTML =
        "";


    ipoData.forEach(
        ipo => {

            ticker.innerHTML += `

                🔥 ${safeText(
                    ipo.company
                )}

                • ${safeText(
                    ipo.status
                )}

                &nbsp;&nbsp;&nbsp;&nbsp;

            `;

        }
    );

}


/* ==========================================
   BACK TO TOP
========================================== */

window.addEventListener(
    "scroll",
    () => {

        if (!topBtn) {
            return;
        }


        if (
            window.scrollY > 300
        ) {

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
