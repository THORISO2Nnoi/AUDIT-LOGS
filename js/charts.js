/* =========================================================
   Charts — bar & horizontal bar renderers (pure CSS)
   ========================================================= */

function renderLoginChart(data){
  const el = document.getElementById("chart-logins");
  if (!el) return;
  const max = Math.max(...data.map(x => x.v));
  el.innerHTML = data.map(x => `
    <div class="bar-wrap">
      <div class="bar-value">${x.v}</div>
      <div class="bar" style="height:${(x.v / max) * 140}px;"></div>
      <div class="bar-label">${x.d}</div>
    </div>`).join("");
}

function renderDownloadsChart(data){
  const el = document.getElementById("chart-downloads");
  if (!el) return;
  const max = Math.max(...data.map(x => x.v));
  el.innerHTML = data.map(x => `
    <div class="hbar-row">
      <div class="name">${x.name}</div>
      <div class="track"><div class="fill" style="width:${(x.v / max) * 100}%"></div></div>
      <div class="num">${x.v}</div>
    </div>`).join("");
}

function renderToolsChart(data){
  const el = document.getElementById("chart-tools");
  if (!el) return;
  const max = Math.max(...data.map(x => x.actions));
  el.innerHTML = data.map(x => `
    <div class="hbar-row">
      <div class="name">${x.tool}</div>
      <div class="track"><div class="fill" style="width:${(x.actions / max) * 100}%"></div></div>
      <div class="num">${x.actions}</div>
    </div>`).join("");
}

/* ---------- Master chart renderer ---------- */
window.renderAllCharts = function(state){
  // Weekly logins — computed from state.logins
  const weekMap = {};
  state.logins.forEach(l => {
    weekMap[l.date] = (weekMap[l.date] || 0) + 1;
  });
  const weekData = Object.entries(weekMap)
    .sort()
    .map(([d, v]) => ({ d: d.slice(5), v: v * 20 })); // scale for demo

  if (weekData.length === 0) {
    weekData.push(
      { d: "Mon", v: 210 }, { d: "Tue", v: 232 }, { d: "Wed", v: 198 },
      { d: "Thu", v: 245 }, { d: "Fri", v: 268 }, { d: "Sat", v: 180 },
      { d: "Sun", v: 248 }
    );
  }
  renderLoginChart(weekData);

  // Top downloads
  const dlMap = {};
  state.downloads.forEach(d => {
    dlMap[d.tool] = (dlMap[d.tool] || 0) + 1;
  });
  const dlData = Object.entries(dlMap)
    .map(([name, v]) => ({ name, v: v * 25 }))
    .sort((a, b) => b.v - a.v);

  if (dlData.length === 0) {
    dlData.push(
      { name: "X-Ray Report", v: 142 },
      { name: "Portfolio Compare", v: 98 },
      { name: "Fund Screen", v: 76 }
    );
  }
  renderDownloadsChart(dlData);

  // Tool usage
  renderToolsChart(state.toolUsage);
};