/* ==========================================
   BE.IPOWALE - IPO ALLOTMENT
   Google Sheet Powered
========================================== */


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let ipoData = [];
let filteredData = [];


/* ==========================================
   DOM ELEMENTS
========================================== */

const cards =
    document.getElementById("cards");

const search =
    document.getElementById("search");

const ticker =
    document.getElementById("ticker");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const topBtn =
    document.getElementById("topBtn");


/* ==========================================
   GOOGLE SHEET CONFIGURATION
========================================== */

const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTdEelMixOXPSgQ3IBE0pyHj7sEOYH9WOq9HPCrxZyQlo1l87Dms8xvWLH4Fs2otKN6ubn-4zyUnnM/pub?output=csv";


/* ==========================================
   LOGO CONFIGURATION
========================================== */

const LOGO_PATH =
    "/static/logos/";


/* ==========================================
   FALLBACK LOGO
========================================== */

const FALLBACK_LOGO =
    "/static/logo.jpg";


/* ==========================================
   GOOGLE SHEET TIMEOUT
========================================== */

const SHEET_TIMEOUT =
    8000;


/* ==========================================
   LOCAL STORAGE
========================================== */

const STORAGE_KEY =
    "beipowale_allotment_data_v2";


/* ==========================================
   STATUS
========================================== */

function getStatus(date) {

    if (!date) {

        return "Closed";

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const allotment =
        new Date(date);


    if (
        isNaN(
            allotment.getTime()
        )
    ) {

        return "Closed";

    }


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
        allotment.getTime() >
        today.getTime()
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


        case "Closed":

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


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const allotment =
        new Date(date);


    if (
        isNaN(
            allotment.getTime()
        )
    ) {

        return "N/A";

    }


    allotment.setHours(
        0,
        0,
        0,
        0
    );


    const diff =
        Math.ceil(

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

        return (
            diff +
            " Days Left"
        );

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


    const parsed =
        new Date(date);


    if (
        isNaN(
            parsed.getTime()
        )
    ) {

        return date;

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


/* ==========================================
   CLEAN TEXT
========================================== */

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)
        .replace(
            /^\uFEFF/,
            ""
        )
        .trim();

}


/* ==========================================
   NORMALIZE HEADER
========================================== */

function normalizeHeader(header) {

    return cleanText(header)

        .toLowerCase()

        .replace(
            /[\u200B-\u200D\uFEFF]/g,
            ""
        )

        .replace(
            /[_-]+/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* ==========================================
   GET VALUE USING MULTIPLE COLUMN NAMES
========================================== */

function getColumnValue(
    row,
    aliases
) {

    for (
        const alias of aliases
    ) {

        const key =
            normalizeHeader(
                alias
            );


        if (
            Object.prototype.hasOwnProperty.call(
                row,
                key
            )
        ) {

            const value =
                cleanText(
                    row[key]
                );


            if (value !== "") {

                return value;

            }

        }

    }


    return "";

}


/* ==========================================
   LOGO PATH
========================================== */

function getLogoPath(logo) {

    logo =
        cleanText(logo);


    if (!logo) {

        return FALLBACK_LOGO;

    }


    /* Full URL */

    if (
        logo.startsWith(
            "http://"
        ) ||

        logo.startsWith(
            "https://"
        )
    ) {

        return logo;

    }


    /* Existing website path */

    if (
        logo.startsWith("/")
    ) {

        return logo;

    }


    /* Filename only */

    return (
        LOGO_PATH +
        logo
    );

}


/* ==========================================
   CSV PARSER
========================================== */

function parseCSV(text) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes =
        false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];


        /* -----------------------------
           Double quote inside quoted field
        ------------------------------ */

        if (
            char === '"' &&
            insideQuotes &&
            next === '"'
        ) {

            value += '"';

            i++;

            continue;

        }


        /* -----------------------------
           Quote
        ------------------------------ */

        if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

            continue;

        }


        /* -----------------------------
           Comma
        ------------------------------ */

        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value.trim()
            );

            value = "";

            continue;

        }


        /* -----------------------------
           New line
        ------------------------------ */

        if (
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

                rows.push(
                    row
                );

            }


            row = [];

            value = "";

            continue;

        }


        /* -----------------------------
           Normal character
        ------------------------------ */

        value += char;

    }


    /* -----------------------------
       Last row
    ------------------------------ */

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

            rows.push(
                row
            );

        }

    }


    return rows;

}


/* ==========================================
   CONVERT CSV TO OBJECTS
========================================== */

function convertCSVToObjects(
    rows
) {

    if (
        !rows ||
        rows.length < 2
    ) {

        return [];

    }


    /* -----------------------------
       Headers
    ------------------------------ */

    const headers =
        rows[0].map(
            header =>
                normalizeHeader(
                    header
                )
        );


    console.log(
        "Google Sheet Headers:",
        headers
    );


    /* -----------------------------
       Data rows
    ------------------------------ */

    const rawData =
        rows
            .slice(1)
            .filter(
                row =>
                    row &&
                    cleanText(
                        row[0]
                    ) !== ""
            )
            .map(
                row => {

                    const object =
                        {};


                    headers.forEach(
                        (
                            header,
                            index
                        ) => {

                            object[
                                header
                            ] =

                                row[index] !==
                                undefined

                                ?

                                cleanText(
                                    row[index]
                                )

                                :

                                "";

                        }
                    );


                    return object;

                }
            );


    /* -----------------------------
       Convert to standard structure
    ------------------------------ */

    const finalData =
        rawData.map(
            raw => {


                /* COMPANY */

                const company =
                    getColumnValue(
                        raw,
                        [
                            "company",
                            "company name",
                            "company_name",
                            "ipo",
                            "ipo name",
                            "ipo_name"
                        ]
                    );


                /* LOGO */

                const logo =
                    getColumnValue(
                        raw,
                        [
                            "logo",
                            "logo name",
                            "logo_name",
                            "image",
                            "image name",
                            "image_name"
                        ]
                    );


                /* REGISTRAR */

                const registrar =
                    getColumnValue(
                        raw,
                        [
                            "registrar",
                            "register",
                            "registered",
                            "registrar name",
                            "registrar_name",
                            "registrarname"
                        ]
                    );


                /* ALLOTMENT */

                const allotment =
                    getColumnValue(
                        raw,
                        [
                            "allotment",
                            "allotment date",
                            "allotment_date",
                            "allotmentdate"
                        ]
                    );


                /* FEATURED */

                const featuredValue =
                    getColumnValue(
                        raw,
                        [
                            "featured",
                            "feature",
                            "is featured",
                            "is_featured"
                        ]
                    );


                /* URL */

                const url =
                    getColumnValue(
                        raw,
                        [
                            "url",
                            "link",
                            "status link",
                            "status_link",
                            "status url",
                            "status_url",
                            "registrar link",
                            "registrar_link"
                        ]
                    );


                return {

                    company:
                        company,

                    logo:
                        getLogoPath(
                            logo
                        ),

                    registrar:
                        registrar,

                    allotment:
                        allotment,

                    featured:
                        (
                            featuredValue
                                .toLowerCase() ===
                            "true"
                        ),

                    url:
                        url,

                    status:
                        getStatus(
                            allotment
                        )

                };

            }
        );


    return finalData;

}


/* ==========================================
   SORT DATA
========================================== */

function sortIPOData(
    data
) {

    return data.sort(
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


            /* Then date */

            const dateA =
                new Date(
                    a.allotment
                ).getTime();


            const dateB =
                new Date(
                    b.allotment
                ).getTime();


            if (
                isNaN(dateA)
            ) {

                return 1;

            }


            if (
                isNaN(dateB)
            ) {

                return -1;

            }


            return (
                dateA -
                dateB
            );

        }
    );

}


/* ==========================================
   LOAD DATA FROM GOOGLE SHEET
========================================== */

async function loadData(
    showLoader = true
) {

    try {

        /* -----------------------------
           Show loader only initial load
        ------------------------------ */

        if (
            showLoader &&
            loading
        ) {

            loading.style.display =
                "flex";

        }


        /* -----------------------------
           Abort controller
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
           Fetch
        ------------------------------ */

        const response =
            await fetch(

                GOOGLE_SHEET_URL +
                "&cache=" +
                Date.now(),

                {

                    method:
                        "GET",

                    cache:
                        "no-store",

                    signal:
                        controller.signal

                }

            );


        clearTimeout(
            timeout
        );


        if (
            !response.ok
        ) {

            throw new Error(
                "Google Sheet HTTP " +
                response.status
            );

        }


        /* -----------------------------
           Read response
        ------------------------------ */

        const csvText =
            await response.text();


        if (
            !csvText ||
            csvText.trim() === ""
        ) {

            throw new Error(
                "Google Sheet returned empty response"
            );

        }


        /* -----------------------------
           Parse CSV
        ------------------------------ */

        const rows =
            parseCSV(
                csvText
            );


        if (
            rows.length < 2
        ) {

            throw new Error(
                "Google Sheet has no IPO rows"
            );

        }


        /* -----------------------------
           Convert data
        ------------------------------ */

        let newData =
            convertCSVToObjects(
                rows
            );


        if (
            newData.length === 0
        ) {

            throw new Error(
                "No valid IPO data found"
            );

        }


        /* -----------------------------
           Sort
        ------------------------------ */

        newData =
            sortIPOData(
                newData
            );


        /* -----------------------------
           Save global data
        ------------------------------ */

        ipoData =
            newData;


        filteredData =
            [
                ...ipoData
            ];


        /* -----------------------------
           Local backup
        ------------------------------ */

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(
                ipoData
            )

        );


        /* -----------------------------
           Update page
        ------------------------------ */

        updateDashboard();

        updateTicker();

        renderCards(
            filteredData
        );


        console.log(
            "✅ Google Sheet Loaded",
            ipoData
        );


        console.log(
            "📊 Total IPOs:",
            ipoData.length
        );


        /* -----------------------------
           Registrar debugging
        ------------------------------ */

        console.table(
            ipoData.map(
                ipo => ({

                    Company:
                        ipo.company,

                    Registrar:
                        ipo.registrar,

                    Allotment:
                        ipo.allotment,

                    Featured:
                        ipo.featured

                })
            )
        );


    }

    catch (error) {

        console.error(
            "❌ Google Sheet Error:",
            error
        );


        /* =================================
           LOAD LOCAL BACKUP
        ================================= */

        try {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (
                !saved
            ) {

                throw new Error(
                    "No local backup available"
                );

            }


            let savedData =
                JSON.parse(
                    saved
                );


            if (
                !Array.isArray(
                    savedData
                )
            ) {

                throw new Error(
                    "Invalid local backup"
                );

            }


            /* Recalculate status */

            savedData.forEach(
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


            savedData =
                sortIPOData(
                    savedData
                );


            ipoData =
                savedData;


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
                "⚠️ Loaded saved IPO data"
            );

        }

        catch (backupError) {

            console.error(
                "❌ Backup Error:",
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

        /* -----------------------------
           Always hide initial loader
        ------------------------------ */

        if (
            showLoader &&
            loading
        ) {

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
   RENDER CARDS
========================================== */

function renderCards(
    data
) {

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


            /* -----------------------------
               Safe values
            ------------------------------ */

            const company =
                cleanText(
                    ipo.company
                ) ||
                "IPO";


            const registrar =
                cleanText(
                    ipo.registrar
                ) ||
                "Not Available";


            const allotment =
                cleanText(
                    ipo.allotment
                );


            const url =
                cleanText(
                    ipo.url
                );


            const logo =
                getLogoPath(
                    ipo.logo
                );


            const status =
                ipo.status ||
                getStatus(
                    allotment
                );


            const statusClass =
                status
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    )
                    .replace(
                        /'/g,
                        ""
                    );


            /* -----------------------------
               Featured badge
            ------------------------------ */

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


            /* -----------------------------
               Today ribbon
            ------------------------------ */

            const todayRibbon =
                status ===
                "Today's Allotment"

                ?

                `

                    <div class="ribbon">

                        TODAY'S ALLOTMENT

                    </div>

                `

                :

                "";


            /* -----------------------------
               Official button
            ------------------------------ */

            const officialButton =
                url

                ?

                `

                    <a

                        href="${url}"

                        target="_blank"

                        rel="noopener noreferrer"

                        class="btn"

                    >

                        🏛 Check Official Allotment ↗

                    </a>

                `

                :

                `

                    <div class="btn">

                        🏛 Official Link Not Available

                    </div>

                `;


            /* -----------------------------
               Create card
            ------------------------------ */

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

                                this.src='${FALLBACK_LOGO}';

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

                            class="status ${statusClass}"

                        >

                            ${getStatusBadge(
                                status
                            )}

                        </span>


                        ${officialButton}


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
        "input",
        function () {

            const keyword =
                cleanText(
                    this.value
                )
                .toLowerCase();


            filteredData =
                ipoData.filter(
                    ipo => {

                        const company =
                            cleanText(
                                ipo.company
                            )
                            .toLowerCase();


                        const registrar =
                            cleanText(
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
   FILTER BUTTONS
========================================== */

document
    .querySelectorAll(
        ".filter-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {


                    /* -----------------------------
                       Remove active
                    ------------------------------ */

                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(
                            btn => {

                                btn.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    /* -----------------------------
                       Add active
                    ------------------------------ */

                    button.classList.add(
                        "active"
                    );


                    const filter =
                        button.dataset.filter;


                    /* -----------------------------
                       Filter
                    ------------------------------ */

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

            const featured =
                ipo.featured
                    ? " ⭐"
                    : "";


            ticker.innerHTML += `

                🔥
                ${cleanText(
                    ipo.company
                )}

                ${featured}

                •
                ${cleanText(
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
   Every 5 Minutes
========================================== */

setInterval(
    () => {

        /*
           false = don't show
           full-page loader
        */

        loadData(
            false
        );

    },

    300000
);


/* ==========================================
   INITIAL LOAD
========================================== */

loadData(
    true
);
