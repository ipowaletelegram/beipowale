const companies = [

"Caliber Mining & Logistics Ltd",

"SBI Funds Management Ltd",

"Indo-MIM Ltd",

"Lohia Corp Ltd"

];

const dropdown=document.getElementById("company");

companies.forEach(company=>{

const option=document.createElement("option");

option.value=company;

option.textContent=company;

dropdown.appendChild(option);

});

document.getElementById("allotmentForm").addEventListener("submit",function(e){

e.preventDefault();

document.getElementById("loading").style.display="block";

document.getElementById("result").innerHTML="";

setTimeout(()=>{

document.getElementById("loading").style.display="none";

document.getElementById("result").innerHTML=`
<div style="background:#0d1117;padding:20px;border-radius:10px;border:1px solid #333;color:white;text-align:center;">
Ready for Backend Integration
</div>
`;

},1200);

});
