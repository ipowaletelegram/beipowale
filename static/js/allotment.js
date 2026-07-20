let ipoData=[];

fetch("/static/data/allotment.json")
.then(res=>res.json())
.then(data=>{

ipoData=data;

showCards(data);

});

function showCards(data){

const container=document.getElementById("cards");

container.innerHTML="";

data.forEach(ipo=>{

container.innerHTML+=`

<div class="card">

<img src="${ipo.logo}" class="logo">

<h2>${ipo.company}</h2>

<p><b>Registrar</b><br>${ipo.registrar}</p>

<p><b>Allotment</b><br>${ipo.allotment}</p>

<p><b>Listing</b><br>${ipo.listing}</p>

<span class="status ${ipo.status.toLowerCase()}">

${ipo.status}

</span>

<a href="${ipo.url}"

target="_blank"

class="btn">

Check Allotment →

</a>

</div>

`;

});

}

document.getElementById("search")

.addEventListener("keyup",function(){

const keyword=this.value.toLowerCase();

const filtered=ipoData.filter(x=>

x.company.toLowerCase().includes(keyword)

);

showCards(filtered);

});
