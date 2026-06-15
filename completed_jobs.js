
function completedJobsHandler(){
return{
  loading:true,
  jobs:[],

  async init(){
    const tech = JSON.parse(localStorage.getItem("active_tech"));
    if(!tech){
      window.location.href="partnerlogin.html";
      return;
    }
    await this.fetchCompleted();
  },

  async fetchCompleted(){
  this.loading = true;

  const tech = JSON.parse(localStorage.getItem("active_tech"));
  if (!tech) return;

  const { data, error } = await window.sb
    .from("jobs")
    .select("*")
    .eq("status", "completed")
    .eq("tech_id", tech.id)   // 🔥 THIS WAS MISSING
    .order("completed_at", { ascending: false });

  if(error){
    console.error(error);
    this.loading = false;
    return;
  }

  this.jobs = data;
  this.loading = false;
}
,

  formatDate(dt){
    if(!dt) return "-";
    const d = new Date(dt);
    return d.toLocaleDateString("en-IN",{
      day:"2-digit",
      month:"short",
      year:"numeric"
    });
  }
}
}
