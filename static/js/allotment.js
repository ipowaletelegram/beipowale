const form = document.getElementById("allotmentForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const company = document.getElementById("company").value;
    const search_type = document.getElementById("search_type").value;
    const value = document.getElementById("search_value").value;

    document.getElementById("loading").style.display = "block";
    document.getElementById("result").innerHTML = "";

    try {

        const response = await fetch("/check-allotment", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                company,
                search_type,
                value
            })

        });

        const data = await response.json();

        document.getElementById("loading").style.display = "none";

        if (data.success) {

            document.getElementById("result").innerHTML = `

            <div class="success-card">

                <h2>IPO Allotment Result</h2>

                <hr>

                <p><strong>Company</strong><br>${company}</p>

                <p><strong>Registrar</strong><br>${data.registrar}</p>

                <p><strong>Status</strong><br>${data.status}</p>

                <p><strong>Shares</strong><br>${data.shares}</p>

                <p><strong>Lots</strong><br>${data.lots}</p>

            </div>

            `;

        }

        else {

            document.getElementById("result").innerHTML = `

            <div class="error-card">

                <h2>${data.registrar}</h2>

                <p>${data.message}</p>

            </div>

            `;

        }

    }

    catch (err) {

        document.getElementById("loading").style.display = "none";

        document.getElementById("result").innerHTML = `

        <div class="error-card">

        <h2>Server Error</h2>

        <p>Please try again later.</p>

        </div>

        `;

    }

});
