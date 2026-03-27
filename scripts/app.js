const api = 'https://phi-lab-server.vercel.app/api/v1/lab';
const all_Issues_api = `${api}/issues`;
const single_issues_api = (id) => `${api}/issue/${id}`;

let allIssues = [];
let activeTab = 'all';
let searchTimer = null;

const $ = (id) => document.getElementById(id);


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

const fetchSingleIssues = (id) => {
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
    
    $("tabAll").className = `tab-btn ${tab === "all"  ?  "active-tab" : "inactive-tab" }`;
    $("tabOpen").className = `tab-btn ${tab === "open"  ?  "active-tab" : "inactive-tab" }`;
    $("tabClosed").className = `tab-btn ${tab === "close"  ?  "active-tab" : "inactive-tab" }`;

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
}

const handleSearch = (q) => {
  if(!q.trim()){
    showIssues(filterByTab(allIssues));
    return;
  }
  doSearch(q.trim());
}

const doSearch = (qu) => {
  showLoading();
  fetch(`${api}/issues/search?q=${encodeURIComponent(qu)}`)
  .then(res => res.json())
  .then(data => {
    const r = data.data || data || [];
    showIssues(filterByTab(allIssues));
  })
} 



const formatDate = (d) => {
  if(!d)  return "";
  try
  {
    return new Date(d).toLocaleDateString("en-US",{
          month: "short", day: "numeric", year: "numeric"
    });
  }catch{
    return d;
  }
};

const getPriorityColor = (p) =>
  p === "HIGH" ? "priority-high":
  p === "MEDIUM" ? "priority-medium":
  p === "LOW" ? "priority-low":
  "priority-default";

const getLabelColor = (name) => {
  const n = (name || "").toLowerCase();
  return n.includes("bug") ? "label-bug":
         n.includes("help") ? "label-help":
         n.includes("enhance") ? "label-enhance":
         n.includes("feature") ? "label-feature":
         n.includes("question") ? "label-question":
         "label-default";
};


