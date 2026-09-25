/* =========================================================
   Filters — activity log filtering logic
   ========================================================= */

window.setupFilters = function(state, renderFn){
  const btn = document.getElementById("applyFilters");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const from   = document.getElementById("fFrom").value;
    const to     = document.getElementById("fTo").value;
    const broker = document.getElementById("fBroker").value;
    const tool   = document.getElementById("fTool").value;
    const action = document.getElementById("fAction").value;
    const search = document.getElementById("fSearch").value.toLowerCase();

    const filtered = state.activity.filter(r => {
      const ts = r.timestamp.slice(0, 10);
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      if (broker && r.ab_number !== broker) return false;
      if (tool && r.tool !== tool) return false;
      if (action && r.action !== action) return false;
      if (search && !r.details.toLowerCase().includes(search)) return false;
      return true;
    });

    state.filteredActivity = filtered;
    renderFn(filtered);
  });

  const resetBtn = document.getElementById("resetFilters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.getElementById("fFrom").value = "";
      document.getElementById("fTo").value = "";
      document.getElementById("fBroker").value = "";
      document.getElementById("fTool").value = "";
      document.getElementById("fAction").value = "";
      document.getElementById("fSearch").value = "";

      state.filteredActivity = [...state.activity];
      renderFn(state.filteredActivity);
      if (window.Exporter) window.Exporter.toast("Activity log filters reset");
    });
  }
};