const calendar =
    document.getElementById("calendar");

const totalEvents =
    document.getElementById("totalEvents");

const activeDays =
    document.getElementById("activeDays");



/* ==========================================
   EVENT TYPES
   Display Priority:

   1. OPEN
   2. CLOSE
   3. LISTING
   4. ALLOTMENT
========================================== */

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
        key: "listing",
        label: "LISTING",
        className: "status-listing"
    },

    {
        key: "allotment",
        label: "ALLOTMENT",
        className: "status-allotment"
    }

];



/* ==========================================
   EVENT SORT PRIORITY
========================================== */

const STATUS_PRIORITY = {

    open: 1,

    close: 2,

    listing: 3,

    allotment: 4

};



/* ==========================================
   DATE KEY
========================================== */

function dateKey(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}



/* ==========================================
   FORMAT DATE
========================================== */

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



/* ==========================================
   TODAY
========================================== */

function isToday(date) {

    return (
        dateKey(date) ===
        dateKey(new Date())
    );

}



/* ==========================================
   NEXT 30 DAYS
========================================== */

function getNext30Days() {

    const dates = [];


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    for (
        let i = 0;
        i < 30;
        i++
    ) {

        const date =
            new Date(today);


        date.setDate(
            today.getDate() + i
        );


        dates.push(date);

    }


    return dates;

}



/* ==========================================
   LOAD JSON
========================================== */

async function loadCalendar() {

    try {


        const response =
            await fetch(
                "/api/ipo-calendar"
            );


        if (!response.ok) {

            throw new Error(
                "API Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid IPO data"
            );

        }


        generateCalendar(data);


    }

    catch (error) {


        console.error(
            "IPO Calendar Error:",
            error
        );


        calendar.innerHTML = `

            <div class="empty">

                <strong>
                    Unable to load calendar
                </strong>

                Please try again later.

            </div>

        `;

    }

}



/* ==========================================
   GENERATE CALENDAR
========================================== */

function generateCalendar(ipoData) {


    calendar.innerHTML = "";


    const dates =
        getNext30Days();


    let eventCount = 0;


    let activeDayCount = 0;



    /* ======================================
       LOOP THROUGH DAYS
    ====================================== */

    dates.forEach(date => {


        const currentKey =
            dateKey(date);


        const events = [];



        /* ==================================
           FIND EVENTS
        ================================== */

        ipoData.forEach(ipo => {


            EVENT_TYPES.forEach(type => {


                if (
                    ipo[type.key] &&
                    ipo[type.key] === currentKey
                ) {


                    events.push({

                        ipo: ipo,

                        type: type

                    });


                }

            });


        });



        /* ==================================
           SORT EVENTS

           OPEN
           ↓
           CLOSE
           ↓
           LISTING
           ↓
           ALLOTMENT
        ================================== */

        events.sort(
            (a, b) => {

                return (
                    STATUS_PRIORITY[
                        a.type.key
                    ] -
                    STATUS_PRIORITY[
                        b.type.key
                    ]
                );

            }
        );



        /* ==================================
           NO EVENT
        ================================== */

        if (
            events.length === 0
        ) {

            return;

        }



        /* ==================================
           UPDATE COUNTERS
        ================================== */

        eventCount +=
            events.length;


        activeDayCount++;



        /* ==================================
           DAY CARD
        ================================== */

        const dayCard =
            document.createElement(
                "section"
            );


        dayCard.className =
            "day-card";



        /* TODAY */

        if (
            isToday(date)
        ) {

            dayCard.classList.add(
                "today"
            );

        }



        /* ==================================
           DAY HEADER
        ================================== */

        const dayHeader =
            document.createElement(
                "div"
            );


        dayHeader.className =
            "day-header";



        /* ==================================
           DAY LABEL
        ================================== */

        const dayLabel =
            document.createElement(
                "div"
            );


        dayLabel.className =
            "day-label";


        dayLabel.textContent =

            isToday(date)

                ? "• TODAY"

                : date
                    .toLocaleDateString(
                        "en-IN",
                        {
                            weekday:
                                "long"
                        }
                    )
                    .toUpperCase();



        /* ==================================
           DAY DATE
        ================================== */

        const dayDate =
            document.createElement(
                "div"
            );


        dayDate.className =
            "day-date";


        dayDate.textContent =
            formatDate(date);



        /* ==================================
           HEADER APPEND
        ================================== */

        dayHeader.appendChild(
            dayLabel
        );


        dayHeader.appendChild(
            dayDate
        );


        dayCard.appendChild(
            dayHeader
        );



        /* ==================================
           IPO EVENTS
        ================================== */

        events.forEach(
            event => {


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "ipo-row";



                /* ==========================
                   IPO INFO
                ========================== */

                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "ipo-info";



                /* ==========================
                   IPO NAME
                ========================== */

                const name =
                    document.createElement(
                        "div"
                    );


                name.className =
                    "ipo-name";


                name.innerHTML = `

                    ${escapeHTML(
                        event.ipo.name
                    )}

                    <span class="ipo-type">

                        ${escapeHTML(
                            event.ipo.type
                        )}

                    </span>

                `;



                /* ==========================
                   STATUS
                ========================== */

                const status =
                    document.createElement(
                        "div"
                    );


                status.className =
                    `status ${event.type.className}`;


                status.textContent =
                    event.type.label;



                /* ==========================
                   APPEND INFO
                ========================== */

                info.appendChild(
                    name
                );


                row.appendChild(
                    info
                );


                row.appendChild(
                    status
                );


                dayCard.appendChild(
                    row
                );

            }
        );



        /* ==================================
           ADD DAY CARD
        ================================== */

        calendar.appendChild(
            dayCard
        );

    });



    /* ======================================
       UPDATE STATS
    ====================================== */

    totalEvents.textContent =
        eventCount;


    activeDays.textContent =
        activeDayCount;



    /* ======================================
       EMPTY CALENDAR
    ====================================== */

    if (
        activeDayCount === 0
    ) {

        calendar.innerHTML = `

            <div class="empty">

                <strong>
                    No IPO Events
                </strong>

                No IPO events are scheduled
                for the next 30 days.

            </div>

        `;

    }

}



/* ==========================================
   SECURITY
========================================== */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



/* ==========================================
   START CALENDAR
========================================== */

loadCalendar();
