const calendar = document.getElementById("calendar");

const totalEvents = document.getElementById("totalEvents");
const activeDays = document.getElementById("activeDays");


const EVENT_TYPES = [
    {
        key: "open",
        label: "OPEN",
        className: "status-open"
    },
    {
        key: "close",
        label: "CLOSE",
        className: "status-close"
    },
    {
        key: "allotment",
        label: "ALLOTMENT",
        className: "status-allotment"
    },
    {
        key: "listing",
        label: "LISTING",
        className: "status-listing"
    }
];


function dateKey(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function isToday(date) {

    return dateKey(date) === dateKey(new Date());

}


function createDateRange() {

    const dates = [];

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {

        const date = new Date(today);

        date.setDate(
            today.getDate() + i
        );

        dates.push(date);
    }

    return dates;
}


async function loadCalendar() {

    try {

        const response = await fetch(
            "metadata.json"
        );

        const ipoData = await response.json();

        generateCalendar(ipoData);

    } catch (error) {

        console.error(
            "Metadata loading error:",
            error
        );

        calendar.innerHTML = `
            <div class="day-section">
                Unable to load IPO data.
            </div>
        `;
    }
}


function generateCalendar(ipoData) {

    const dates = createDateRange();

    let eventCount = 0;

    let activeDayCount = 0;


    dates.forEach(date => {

        const key = dateKey(date);

        const events = [];


        /*
        Find all IPO events
        happening on this date
        */

        ipoData.forEach(ipo => {

            EVENT_TYPES.forEach(type => {

                if (
                    ipo[type.key] &&
                    ipo[type.key] === key
                ) {

                    events.push({
                        ipo: ipo,
                        type: type
                    });

                }

            });

        });


        /*
        If no event on this date,
        don't display the date.
        */

        if (events.length === 0) {
            return;
        }


        eventCount += events.length;

        activeDayCount++;


        const section = document.createElement(
            "section"
        );

        section.className = "day-section";


        if (isToday(date)) {

            section.classList.add("today");

        }


        /*
        Day header
        */

        const header = document.createElement(
            "div"
        );

        header.className = "day-header";


        const dayTitle = document.createElement(
            "div"
        );

        dayTitle.className = "day-title";

        dayTitle.textContent =
            isToday(date)
                ? "• TODAY"
                : date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "long"
                    }
                ).toUpperCase();


        const dateText = document.createElement(
            "div"
        );

        dateText.className = "day-date";

        dateText.textContent =
            formatDate(date);


        header.appendChild(dayTitle);

        header.appendChild(dateText);

        section.appendChild(header);


        /*
        IPO events
        */

        events.forEach(event => {

            const row = document.createElement(
                "div"
            );

            row.className = "ipo-event";


            const name = document.createElement(
                "div"
            );

            name.className = "ipo-name";


            name.innerHTML = `
                ${event.ipo.name}

                <span class="ipo-type">
                    ${event.ipo.type}
                </span>
            `;


            const status = document.createElement(
                "div"
            );

            status.className =
                `status ${event.type.className}`;


            status.innerHTML =
                `• ${event.type.label}`;


            row.appendChild(name);

            row.appendChild(status);

            section.appendChild(row);

        });


        calendar.appendChild(section);

    });


    /*
    Update statistics
    */

    totalEvents.textContent =
        eventCount;

    activeDays.textContent =
        activeDayCount;
}


loadCalendar();
