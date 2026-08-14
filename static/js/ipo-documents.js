let allCompanies = [];

let currentFilter = "ALL";


const container =
    document.getElementById("documentsContainer");

const searchInput =
    document.getElementById("searchInput");

const resultCount =
    document.getElementById("resultCount");

const noResults =
    document.getElementById("noResults");



/* LOAD DATA */

async function loadDocuments() {

    try {

        const response =
            await fetch("/static/data/documents.json");

        if (!response.ok) {
            throw new Error("Unable to load documents");
        }

        allCompanies = await response.json();

        renderDocuments();

    } catch (error) {

        console.error(error);

        resultCount.innerText =
            "Unable to load documents.";

    }

}



/* FILTER */

function renderDocuments() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    container.innerHTML = "";


    let visibleCompanies = 0;

    let visibleDocuments = 0;


    allCompanies.forEach(company => {

        const companyMatch =
            company.company
                .toLowerCase()
                .includes(search);


        const filteredDocuments =
            company.documents.filter(doc => {

                const filterMatch =
                    currentFilter === "ALL" ||
                    doc.type === currentFilter;

                const documentMatch =
                    doc.name
                        .toLowerCase()
                        .includes(search) ||
                    doc.shortName
                        .toLowerCase()
                        .includes(search);

                return filterMatch &&
                    (companyMatch || documentMatch);

            });


        if (
            filteredDocuments.length === 0
        ) {
            return;
        }


        visibleCompanies++;

        visibleDocuments +=
            filteredDocuments.length;


        const card =
            createCompanyCard(
                company,
                filteredDocuments
            );


        container.appendChild(card);

    });


    resultCount.innerText =
        `${visibleCompanies} compan${visibleCompanies === 1 ? "y" : "ies"} • ${visibleDocuments} document${visibleDocuments === 1 ? "" : "s"}`;


    if (visibleCompanies === 0) {

        noResults.classList.remove("hidden");

    } else {

        noResults.classList.add("hidden");

    }

}



/* COMPANY CARD */

function createCompanyCard(
    company,
    documents
) {

    const card =
        document.createElement("article");

    card.className =
        "company-card";


    let logoHTML = "";


    if (company.logo) {

        logoHTML = `
            <img
                class="company-logo"
                src="${company.logo}"
                alt="${escapeHTML(company.company)}"
                onerror="this.outerHTML='<div class=&quot;company-logo-fallback&quot;>${getInitials(company.company)}</div>'"
            >
        `;

    } else {

        logoHTML = `
            <div class="company-logo-fallback">
                ${getInitials(company.company)}
            </div>
        `;

    }


    const documentsHTML =
        documents.map(doc => {

            return `
                <div class="document-row">

                    <div class="document-left">

                        <div class="document-icon">
                            ${getDocumentIcon(doc.type)}
                        </div>

                        <div>

                            <div class="document-name">
                                ${escapeHTML(doc.name)}
                            </div>

                            <div class="document-type">
                                ${escapeHTML(doc.shortName)}
                            </div>

                        </div>

                    </div>


                    <a
                        class="view-btn"
                        href="${doc.url}"
                        target="_blank"
                        rel="noopener noreferrer">

                        View PDF ↗

                    </a>

                </div>
            `;

        }).join("");


    card.innerHTML = `

        <div class="company-header">

            ${logoHTML}

            <div class="company-info">

                <div class="company-name">
                    ${escapeHTML(company.company)}
                </div>

                <span class="company-type">
                    ${escapeHTML(company.type || "IPO")}
                </span>

            </div>

        </div>


        <div class="document-list">

            ${documentsHTML}

        </div>

    `;


    return card;

}



/* DOCUMENT ICON */

function getDocumentIcon(type) {

    switch (type) {

        case "DRHP":
            return "📑";

        case "RHP":
            return "📄";

        case "ANCHOR":
            return "⚓";

        case "PROSPECTUS":
            return "📘";

        default:
            return "📎";

    }

}



/* INITIALS */

function getInitials(name) {

    return name
        .split(" ")
        .filter(word => word.length > 0)
        .slice(0, 2)
        .map(word => word[0])
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



/* FILTER BUTTONS */

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn => {
                        btn.classList.remove("active");
                    });


                button.classList.add("active");


                currentFilter =
                    button.dataset.filter;


                renderDocuments();

            }
        );

    });



/* START */

loadDocuments();
