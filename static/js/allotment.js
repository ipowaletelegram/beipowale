const form = document.getElementById("allotmentForm");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    document.getElementById("loading").style.display = "block";

    document.getElementById("result").innerHTML = "";

    const company = document.getElementById("company").value;

    const search_type = document.getElementById("search_type").value;

    const value = document.getElementById("search_value").value;

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

    if (!data.success) {

        document.getElementById("result").innerHTML =

            `<div class="error">${data.message}</div>`;

        return;

    }

    document.getElementById("result").innerHTML = `

<div class="result-card">

<h2>${data.company}</h2>

<p><b>Registrar :</b> ${data.registrar.toUpperCase()}</p>

<p><b>Search :</b> ${data.search_type}</p>

<p><b>Value :</b> ${data.value}</p>

<p style="margin-top:15px;color:#FFD700">

Backend Connected Successfully

</p>

</div>

`;

});
