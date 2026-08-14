const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQeTO-2tCHWLT6qJOUUIadywyp1GO8MHHRkHkMzNFjfskCjH97Wu2FuJHHWH8rTLwaqcq8rBcPCl7C_/pubhtml";

let allDocuments = [];
let currentFilter = "ALL";

const container =
    document.getElementById("documentsContainer");

const searchInput =
    document.getElementById("searchInput");

const resultCount =
    document.getElementById("resultCount");

const noResults =
    document.getElementById("noResults");


async function loadDocuments() {

    try {

        const response =
            await fetch(SHEET_URL);

        if (!response.ok) {
            throw new Error("Unable to load sheet");
        }

        const csv =
            await response.text();

        allDocuments =
            parseCSV(csv);

        renderDocuments();

    } catch (error) {

        console.error(error);

        resultCount.innerText =
            "Unable to load documents.";

    }
}


/* CSV PARSER */

function parseCSV(csv) {

    const lines =
        csv.trim().split("\n");

    if (lines.length <= 1) {
        return [];
    }

    const headers =
        lines[0]
            .split(",")
            .map(x =>
                x.trim().toLowerCase()
            );

    const companyIndex =
        headers.indexOf("company");

    const typeIndex =
        headers.indexOf("type");

    const urlIndex =
        headers.indexOf("document url");


    const rows = [];

    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const values =
            parseCSVLine(lines[i]);

        if (!values.length) {
            continue;
        }

        const company =
            values[companyIndex]?.trim();

        const type =
            values[typeIndex]?.trim()
                .toUpperCase();

        const url =
            values[urlIndex]?.trim();


        if (
            company &&
            type &&
            url
        ) {

            rows.push({
                company,
                type,
                url
            });

        }

    }

    return rows;
}


/* CSV LINE */

function parseCSVLine(line) {

    const result = [];

    let current = "";
    let insideQuotes = false;


    for (
        let i = 0;
        i < line.length;
        i++
    ) {

        const char = line[i];


        if (char === '"') {

            insideQuotes =
                !insideQuotes;

            continue;
        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            result.push(current);

            current = "";

        } else {

            current += char;

        }

    }


    result.push(current);

    return result;
}


/* RENDER */

function renderDocuments() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    container.innerHTML = "";


    const companies = {};


    allDocuments.forEach(doc => {

        const matchesSearch =
            doc.company
                .toLowerCase()
                .includes(search) ||

            doc.type
                .toLowerCase()
                .includes(search);


        const matchesFilter =
            currentFilter === "ALL" ||
            doc.type === currentFilter;


        if (
            matchesSearch &&
            matchesFilter
        ) {

            if (!companies[doc.company]) {

                companies[doc.company] = [];

            }

            companies[doc.company]
                .push(doc);

        }

    });


    const companyNames =
        Object.keys(companies);


    let totalDocuments = 0;


    companyNames.forEach(
        companyName => {

            const docs =
                companies[companyName];


            totalDocuments +=
                docs.length;


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "company-card";


            let documentsHTML =
                "";


            docs.forEach(doc => {

                documentsHTML += `

                    <div class="document-row">

                        <div class="document-left">

                            <div class="document-icon">
                                ${getIcon(doc.type)}
                            </div>

                            <div>

                                <div class="document-name">
                                    ${escapeHTML(
                                        getDocumentName(
                                            doc.type
                                        )
                                    )}
                                </div>

                                <div class="document-type">
                                    ${escapeHTML(
                                        doc.type
                                    )}
                                </div>

                            </div>

                        </div>


                        <a
                            href="${doc.url}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="view-btn">

                            View PDF ↗

                        </a>

                    </div>

                `;

            });


            card.innerHTML = `

                <div class="company-header">

                    <div class="company-logo-fallback">

                        ${getInitials(
                            companyName
                        )}

                    </div>


                    <div class="company-info">

                        <div class="company-name">

                            ${escapeHTML(
                                companyName
                            )}

                        </div>

                        <span class="company-type">

                            IPO Documents

                        </span>

                    </div>

                </div>


                <div class="document-list">

                    ${documentsHTML}

                </div>

            `;


            container.appendChild(card);

        }
    );


    resultCount.innerText =
        `${companyNames.length} compan${companyNames.length === 1 ? "y" : "ies"} • ${totalDocuments} document${totalDocuments === 1 ? "" : "s"}`;


    if (
        companyNames.length === 0
    ) {

        noResults.classList.remove(
            "hidden"
        );

    } else {

        noResults.classList.add(
            "hidden"
        );

    }

}


/* ICON */

function getIcon(type) {

    switch (type) {

        case "DRHP":
            return "📑";

        case "RHP":
            return "📄";

        case "ANCHOR":
            return "⚓";

        case "PROSPECTUS":
            return "📘";

        case "BASIS":
            return "📊";

        default:
            return "📎";

    }

}


/* DOCUMENT NAME */

function getDocumentName(type) {

    const names = {

        DRHP:
            "Draft Red Herring Prospectus",

        RHP:
            "Red Herring Prospectus",

        ANCHOR:
            "Anchor Investor List",

        PROSPECTUS:
            "Prospectus",

        BASIS:
            "Basis of Allotment",

        OTHER:
            "Other Document"

    };

    return names[type] || type;
}


/* INITIALS */

function getInitials(name) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(x => x[0])
        .join("")
        .toUpperCase();

}


/* SECURITY */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* SEARCH */

searchInput.addEventListener(
    "input",
    renderDocuments
);


/* FILTER */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".filter-btn"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                renderDocuments();

            }
        );

    });


loadDocuments();
