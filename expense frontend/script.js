let editingId = null
let expenses = []
let expenseChart
let monthlyChart

let currentPage = 1
const itemsPerPage = 5

const API_URL = "http://localhost:3000/api/expenses"

const token = localStorage.getItem("token")

if (!token) {
alert("Please login first")
window.location.href = "login.html"
}

const authHeader = {
"Content-Type": "application/json",
"Authorization": "Bearer " + token
}

async function addExpenses(amount, category, description, date){

if(amount <= 0 || category === "" || description === "" || date === ""){
alert("Please fill all fields")
return
}

const expense = { amount:Number(amount), category, description, date }

try{

if(editingId){

await fetch(`${API_URL}/${editingId}`,{
method:"PUT",
headers:authHeader,
body:JSON.stringify(expense)
})

editingId=null
document.getElementById("addBtn").textContent="Add Expense"

}else{

await fetch(API_URL,{
method:"POST",
headers:authHeader,
body:JSON.stringify(expense)
})

}

clearInputs()
currentPage = 1
fetchExpenses()

}catch(err){
console.error(err)
}

}

async function fetchExpenses(){

try{

const res = await fetch(API_URL,{headers:authHeader})
const data = await res.json()

expenses = Array.isArray(data) ? data : data.expenses || []

filterExpenses()

}catch(err){
console.error(err)
}

}

function showExpenses(data){

const list=document.getElementById("expensesList")
list.innerHTML=""

if(data.length===0){
list.innerHTML="<p>No expenses found</p>"
return
}

const start=(currentPage-1)*itemsPerPage
const paginated=data.slice(start,start+itemsPerPage)

paginated.forEach(exp=>{

const item=document.createElement("div")
item.className="expense-item"

const formattedDate = exp.date ? exp.date.split("T")[0] : "-"

const text=document.createElement("span")
text.textContent=`₹${exp.amount} | ${exp.category} | ${exp.description || "-"} | ${formattedDate}`

const actions=document.createElement("div")

const editBtn=document.createElement("button")
editBtn.textContent="Edit"
editBtn.className="edit-btn"
editBtn.onclick=()=>startEdit(exp)

const delBtn=document.createElement("button")
delBtn.textContent="Delete"
delBtn.className="delete-btn"
delBtn.onclick=()=>deleteExpense(exp._id)

actions.appendChild(editBtn)
actions.appendChild(delBtn)

item.appendChild(text)
item.appendChild(actions)

list.appendChild(item)

})

document.getElementById("pageNumber").textContent="Page "+currentPage

}

async function deleteExpense(id){

await fetch(`${API_URL}/${id}`,{
method:"DELETE",
headers:authHeader
})

currentPage = 1
fetchExpenses()

}

function startEdit(exp){

document.getElementById("amount").value = exp.amount
document.getElementById("category").value = exp.category
document.getElementById("note").value = exp.description || ""
document.getElementById("date").value = exp.date ? exp.date.split("T")[0] : ""

editingId = exp._id

document.getElementById("addBtn").textContent="Update Expense"

}

function calculateFilteredTotal(data){
 const total=data.reduce((sum,exp)=>sum+Number(exp.amount),0)
 document.getElementById("filteredTotal").textContent="Filtered Total: ₹"+total
}

function calculateAnalytics(data){

let food=0
let travel=0
let rent=0
let shopping=0

data.forEach(exp=>{

if(exp.category==="Food")food+=Number(exp.amount)
if(exp.category==="Travel")travel+=Number(exp.amount)
if(exp.category==="Rent")rent+=Number(exp.amount)
if(exp.category==="Shopping")shopping+=Number(exp.amount)

})

document.getElementById("analyticsData").innerHTML=`
Food: ₹${food} <br>
Travel: ₹${travel} <br>
Rent: ₹${rent} <br>
Shopping: ₹${shopping}
`

renderChart(food,travel,rent,shopping)

}

function renderChart(food,travel,rent,shopping){

const ctx=document.getElementById("expenseChart")

if(expenseChart){
expenseChart.destroy()
}

expenseChart=new Chart(ctx,{
type:"doughnut",
data:{
labels:["Food","Travel","Rent","Shopping"],
datasets:[{
data:[food,travel,rent,shopping],
backgroundColor:[
"#334155",
"#475569",
"#64748b",
"#94a3b8"
],
borderWidth:0
}]
},
options:{
responsive:true,
plugins:{
legend:{
position:"bottom",
labels:{
color:"#cbd5f5",
font:{ size:12 }
}
}
},
cutout:"65%"
}
})

}

async function loadMonthlyChart(){

try{

const res = await fetch(`${API_URL}/monthly`,{
headers: authHeader
})

const data = await res.json()

const labels = data.map(item => item.month)
const totals = data.map(item => item.total)

renderMonthlyChart(labels, totals)

}catch(err){
console.error(err)
}

}

function renderMonthlyChart(labels, totals){

const ctx = document.getElementById("monthlyChart")

if(monthlyChart){
monthlyChart.destroy()
}

monthlyChart = new Chart(ctx,{
type:"line",
data:{
labels:labels,
datasets:[{
label:"Monthly Spending",
data:totals,
borderColor:"#38bdf8",
backgroundColor:"rgba(56,189,248,0.15)",
tension:0.4,
fill:true
}]
},
options:{
plugins:{
legend:{ display:false }
},
scales:{
x:{ ticks:{color:"#cbd5f5"} },
y:{ ticks:{color:"#cbd5f5"} }
}
}
})

}

function filterExpenses(){

let filtered = [...expenses]

const category = document.getElementById("filterCategory").value
const search = document.getElementById("searchInput").value.toLowerCase()
const month = document.getElementById("monthFilter").value

if(category !== "all"){
filtered = filtered.filter(e => e.category === category)
}

if(search){
filtered = filtered.filter(e =>
(e.description || "").toLowerCase().includes(search)
)
}

if(month){
filtered = filtered.filter(e => {
if(!e.date) return false
const expenseMonth = new Date(e.date).toISOString().slice(0,7)
return expenseMonth === month
})
}

const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1

if(currentPage > totalPages){
currentPage = totalPages
}

showExpenses(filtered)
calculateFilteredTotal(filtered)
calculateAnalytics(filtered)

}

function clearInputs(){

document.getElementById("amount").value=""
document.getElementById("category").value=""
document.getElementById("note").value=""
document.getElementById("date").value=""

}

document.getElementById("addBtn").addEventListener("click",()=>{

const amount=document.getElementById("amount").value
const category=document.getElementById("category").value
const description=document.getElementById("note").value
const date=document.getElementById("date").value

addExpenses(amount,category,description,date)

})

document.getElementById("filterCategory").addEventListener("change",filterExpenses)
document.getElementById("searchInput").addEventListener("input",filterExpenses)
document.getElementById("monthFilter").addEventListener("change",filterExpenses)

document.getElementById("nextPage").addEventListener("click",()=>{
currentPage++
filterExpenses()
})

document.getElementById("prevPage").addEventListener("click",()=>{
if(currentPage>1){
currentPage--
filterExpenses()
}
})

function logout(){
localStorage.removeItem("token")
window.location.href="login.html"
}

window.onload = () => {
fetchExpenses()
loadMonthlyChart()
}