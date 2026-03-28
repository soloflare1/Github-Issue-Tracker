const api = 'https://phi-lab-server.vercel.app/api/v1/lab';
const all_Issues_api = `${api}/issues`;
const single_issues_api = (id) => `${api}/issue/${id}`;

let allIssues = [];
let activeTab = 'all';
let searchTimer = null;

const $ = (id) => document.getElementById(id);


window.addEventListener("load", () => {
  if(!localStorage.getItem("token")){
    window.location.href = "login.html";
    return;
  }
  $("mainApp").classList.remove("hidden");
})

window.addEventListener("load", () => {
   fetchAllIssues();
})

const fetchAllIssues = () => {
    
  showLoading();
    fetch(all_Issues_api)
      .then(response => {
        if(response.ok){
           return response.json();
        }
        else{
          showError("Can't load, try again!");
          return null;
        }
      })
      .then(data => {
        if(data){
          allIssues = data.data || data || [];
          showIssues(filterByTab(allIssues));
        }
      });
}

const fetchSingleIssue = (id) => {
    showModalLoading();
    const modal = $("issueModal");
    modal.showModal();

    fetch(single_issues_api(id))
      .then(response => {
        if(response.ok){
           return response.json();
        }
        else{
          $("modalBody").innerHTML =
             `<p class="text-red-500 text-center py-8">Can't load, try again!</p>`
          return null;
        }
      })
      .then(data => {
        const issue  = data.data || data;
        showModalContent(issue);
      });
};


const switchTab = (tab) => {
    activeTab = tab;
    
    $("tabAll").className = `btn btn-sm ${tab === "all"  ?  "btn-primary" : "btn-outline" }`;
    $("tabOpen").className = `btn btn-sm ${tab === "open"  ?  "btn-primary" : "btn-outline" }`;
    $("tabClosed").className = `btn btn-sm ${tab === "closed"  ?  "btn-primary" : "btn-outline" }`;

    const searchText = $("searchInput").value.trim();
    if(searchText){
      doSearch(searchText);
    }
    else{
      showIssues(filterByTab(allIssues));
    }
}


const filterByTab = (issues) => {
  if (activeTab === "open")  
    return issues.filter(i => (i.status || i.state) === "open");
  if (activeTab === "closed")  
    return issues.filter(i => (i.status || i.state) === "closed");

  return issues;
}

const handleSearch = (q) => {
  
  clearTimeout(searchTimer)
  if(!q.trim()){
    showIssues(filterByTab(allIssues));
    return;
  }
  searchTimer = setTimeout(() => doSearch(q.trim()),400);
}

const doSearch = (qu) => {
  showLoading();
  fetch(`${api}/issues/search?q=${encodeURIComponent(qu)}`)
  .then(res => res.json())
  .then(data => {
    const r = data.data || data || [];
    showIssues(filterByTab(r));
  })
} 


const showIssues = (issues) => {
    $("issueCount").textContent = issues.length + " Issues";
    if(!issues.length){
        $("issuesGrid").innerHTML = `
          <p class="font-bold text-gray-500 text-center col-span-full">No issues found</p>
        `
        return;
    }
    $("issuesGrid").innerHTML = issues.map(issue => {
       const isOpen = (issue.status || issue.state) === "open";
       const priority = issue.priority || "MEDIUM";
       const labels = issue.labels || [];
       const author = issue.author || issue.user?.login ||  "unknown";
       const date = formatDate(issue.createdAt || issue.created_at)
       const id = issue.id || issue.number;
       const num = issue.number || issue.id;

       const borderColor = isOpen ? "border-t-green-500" : "border-t-purple-500";
       const statusIcon = isOpen 
       ? `<img src="assets/Open-Status.png" class="w-5 h-5" title="Open">`
       : `<img src="assets/Closed-Status .png" class="w-5 h-5" title="Closed">`;

       const labelsHTML = labels.map(l => `<span class="badge badge-sm ${getLabelColor(l.name || l)}" > ${getLabelIcon(l.name || l)} ${l.name || l}</span>`).join("");
       
       return`
          <div class="bg-[#FFFFFF] shadow-sm rounded-xl border border-gray-100 border-t-4 ${borderColor} p-4 cursor-pointer hover:shadow-md transition-all"
            data-id="${id}" onclick="fetchSingleIssue(this.dataset.id)">
              <div class="flex items-center justify-between mb-2">${statusIcon}
                <span class="${getPriorityColor(priority)}">${priority}</span>
              </div>
              <h3 class="font-semibold text-sm leading-snug line-clamp-2 mb-1">${issue.title}</h3>
              <p class="text-xs text-gray-400 mb-2 line-clamp-2">${issue.body || issue.description || "No description."}</p>
              <div class="flex flex-wrap gap-1 mb-3">${labelsHTML}</div>
              <div class="divider my-1"></div>
              <div class="flex flex-col text-sm text-gray-400 gap-1">
                  <span><i class="fa-solid fa-user mr-1"></i>#${num} by ${author}</span>
                  <span>${date}</span>
              </div>
          </div> `
    }).join("");
   
}

const showModalContent = (issue) => {
  const isOpen = (issue.status || issue.state) === "open";
  const labels = issue.labels || [];
  const author = issue.author || issue.user?.login ||   "unknown";
  const assignee = issue.assignee || issue.assignees?.[0]?.login ||   "Unassigned";
  const priority = issue.priority ||  "MEDIUM";
  const date = formatDate(issue.createdAt || issue.created_at);

  const statusBadge = isOpen
                      ? `<span class="badge badge-success text-white gap-1"><img src="assets/open-status.png" class="w-3 h-3" /> Opened </span>`
                      : `<span class="badge badge-secondary text-white gap-1"><img src="assets/closed-status.png" class="w-3 h-3" /> Closed </span>`;
                      
  const labelsHTML = labels.map(l => `<span class="badge badge-sm ${getLabelColor(l.name || l)}" > ${getLabelIcon(l.name || l)} ${l.name || l}</span>`).join("");
  $("modalBody").innerHTML = `
        <div class="flex flex-wrap items-center gap-2 mb-4">${statusBadge}
            <span class="text-xs text-gray-400">
                <i class="fa-solid fa-user mr-1"></i>by <strong>${author}</strong> ● ${date}
            </span>
        </div>
        <h2 class="text-lg font-bold mb-4">${issue.title}</h2>
        <div class="flex flex-wrap gap-1 mb-4">${labelsHTML}</div>
        <div class="bg-base-200 rounded-xl p-4 text-sm text-gray-600 mb-5">${issue.body || issue.description || "No description."}</div>
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="">
                <p class="text-xs font-bold uppercase text-gray-400 mb-1">Assignee</p>
                <p class="font-semibold text-sm">${assignee}</p>
            </div>
            <div class="">
                <p class="text-xs font-bold uppercase text-gray-400 mb-1"><i class="fa-solid fa-flag mr-1"></i>Priority</p>
                <span class=" ${getPriorityColor(priority)} font-bold">${priority}</span>
            </div>
        </div>

        <form method="dialog" class="flex justify-end">
            <button class="btn btn-primary  ">Close</button>
        </form>`;
}

  
const showError = (msg) =>{

  $("issuesGrid").innerHTML = `
      <div class="col-span-full text-center py-16 text-red-400">
        <p>${msg}</p>
      </div>`;
}

const showLoading = () => {
  $("issueCount").textContent = "Loading...";
  $("issuesGrid").innerHTML = `
    <div class="flex col-span-full flex-col items-center py-20 gap-4">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="text-gray-400 text-sm">Loading issue...</p>
    </div>`
}

const showModalLoading = () => {
  $("modalBody").innerHTML = `<div class="flex justify-center py-10"><span class="loading loading-spinner loading-lg text-primary"></span></div>`;
};

const formatDate = (d) => {
  if(!d)  return "";
  try{
    return new Date(d).toLocaleDateString("en-US");
  }catch{
    return d;
  }
};

const getPriorityColor = (p) =>
  p === "HIGH" ? "text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-500":
  p === "MEDIUM" ? "text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-500":
  p === "LOW" ? "text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500":
 "text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-400";

const getLabelColor = (name) => {
  const n = (name || "").toLowerCase();
  return n.includes("bug") ? "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-500":
         n.includes("help") ?  "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-500":
         n.includes("enhance") ?  "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-500":
         n.includes("feature") ?  "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-500":
         n.includes("question") ?  "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-500":
          "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500";
};
const getLabelIcon = (name) => {
  const n = (name || "").toLowerCase();
  return n.includes("bug") ? `<i class="fa-solid fa-bug"></i>`:
         n.includes("help") ? `<i class="fa-regular fa-life-ring"></i>`:
         n.includes("enhance") ? `<i class="fa-solid fa-star"></i>`:
         n.includes("feature") ? `<i class="fa-solid fa-wand-magic-sparkles"></i>`:
         n.includes("question") ? `<i class="fa-solid fa-question"></i>`:
         `<i class="fa-solid fa-tag"></i>`;
};




