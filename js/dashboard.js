/* =========================================================
   Dashboard — loads JSON data, renders all views
   ========================================================= */

const state = {
  brokers: {},
  activity: [],
  logins: [],
  downloads: [],
  security: [],
  brokerSummary: [],
  toolUsage: [],
  exports: [],
  filteredActivity: []
};

/* ---------- Data loading ---------- */
async function loadJSON(path){
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(path);
    return await res.json();
  } catch (err) {
    console.warn("Could not load", path);
    return null;
  }
}

async function loadAllData(){
  const [brokers, activity, logins, downloads, security, brokerSummary, toolUsage, exports] =
    await Promise.all([
      loadJSON("data/brokers.json"),
      loadJSON("data/activity.json"),
      loadJSON("data/logins.json"),
      loadJSON("data/downloads.json"),
      loadJSON("data/security.json"),
      loadJSON("data/broker-summary.json"),
      loadJSON("data/tool-usage.json"),
      loadJSON("data/exports.json")
    ]);

  state.brokers       = brokers       || {};
  state.activity      = activity      || [];
  state.logins        = logins        || [];
  state.downloads     = downloads     || [];
  state.security      = security      || [];
  state.brokerSummary = brokerSummary || [];
  state.toolUsage     = toolUsage     || [];
  state.exports       = exports       || [];
  state.filteredActivity = [...state.activity];
}

/* ---------- Helpers ---------- */
function brokerName(ab) {
  return (state.brokers[ab] && state.brokers[ab].name) || ab;
}

function badgeClass(action){
  const map = {
    Login: "login", View: "view", Download: "download",
    Generate: "generate", "Failed Login": "failed"
  };
  return map[action] || "view";
}

function sevClass(s){
  return (s || "").toLowerCase();
}

/* ---------- Renderers ---------- */
function renderActivity(rows = state.filteredActivity){
  const body = document.getElementById("tbl-activity");
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:#9ca3af;">No records match the filters.</td></tr>`;
    document.getElementById("rowInfoActivity").textContent = "0 entries";
    return;
  }
  body.innerHTML = rows.map(r => `
    <tr>
      <td>${r.timestamp}</td>
      <td>${r.ab_number}</td>
      <td>${brokerName(r.ab_number)}</td>
      <td>${r.ip}</td>
      <td>${r.tool}</td>
      <td><span class="badge ${badgeClass(r.action)}">${r.action}</span></td>
      <td>${r.details}</td>
      <td class="${r.status === 'Success' ? 'status-ok' : 'status-err'}">${r.status}</td>
    </tr>`).join("");
  document.getElementById("rowInfoActivity").textContent =
    `Showing 1–${rows.length} of ${rows.length} entries`;
}

function renderLogins(){
  document.getElementById("tbl-logins").innerHTML = state.logins.map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${r.ab_number}</td>
      <td>${brokerName(r.ab_number)}</td>
      <td>${r.login}</td>
      <td>${r.logout}</td>
      <td>${r.duration}</td>
      <td>${r.ip}</td>
      <td class="${r.status === 'Success' ? 'status-ok' : 'status-err'}">${r.status}</td>
    </tr>`).join("");
}

function renderDownloads(){
  document.getElementById("tbl-downloads").innerHTML = state.downloads.map(r => `
    <tr>
      <td>${r.timestamp}</td>
      <td>${r.ab_number}</td>
      <td>${brokerName(r.ab_number)}</td>
      <td>${r.report}</td>
      <td>${r.tool}</td>
      <td><span class="badge view">${r.format}</span></td>
      <td>${r.size}</td>
      <td class="status-ok">${r.status}</td>
    </tr>`).join("");
}

function renderSecurity(){
  document.getElementById("tbl-security").innerHTML = state.security.map(r => `
    <tr>
      <td>${r.timestamp}</td>
      <td><span class="badge ${sevClass(r.severity)}">${r.severity}</span></td>
      <td>${r.type}</td>
      <td>${r.source}</td>
      <td>${r.ip}</td>
      <td>${r.description}</td>
      <td><span class="badge ${r.status === 'Open' ? 'open' : 'resolved'}">${r.status}</span></td>
      <td><button style="background:#1e3a8a;color:#fff;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:11.5px;" onclick="alert('Details (preview).')">View</button></td>
    </tr>`).join("");
}

function renderBroker(){
  document.getElementById("tbl-broker").innerHTML = state.brokerSummary.map(r => `
    <tr>
      <td>${r.ab_number}</td>
      <td>${brokerName(r.ab_number)}</td>
      <td>${r.logins}</td>
      <td>${r.actions}</td>
      <td>${r.downloads}</td>
      <td>${r.top_tool}</td>
      <td>${r.last_activity}</td>
    </tr>`).join("");
}

function renderTools(){
  document.getElementById("tbl-tools").innerHTML = state.toolUsage.map(r => `
    <tr>
      <td>${r.tool}</td>
      <td>${r.brokers}</td>
      <td>${r.actions}</td>
      <td>${r.sessions}</td>
      <td>${r.avg}</td>
    </tr>`).join("");
}

function renderExports(){
  document.getElementById("tbl-exports").innerHTML = state.exports.map(r => `
    <tr>
      <td>${r.timestamp}</td>
      <td>${r.exported_by}</td>
      <td>${r.view}</td>
      <td>${r.format}</td>
      <td>${r.rows}</td>
      <td class="status-ok">${r.status}</td>
    </tr>`).join("");
}

/* ---------- Populate filter dropdowns ---------- */
function populateFilters(){
  const brokerSel = document.getElementById("fBroker");
  Object.keys(state.brokers).forEach(ab => {
    const opt = document.createElement("option");
    opt.value = ab;
    opt.textContent = `${ab} · ${state.brokers[ab].name}`;
    brokerSel.appendChild(opt);
  });

  const tools = [...new Set(state.activity.map(a => a.tool))];
  const toolSel = document.getElementById("fTool");
  tools.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    toolSel.appendChild(opt);
  });

  const actions = [...new Set(state.activity.map(a => a.action))];
  const actSel = document.getElementById("fAction");
  actions.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    actSel.appendChild(opt);
  });
}

/* ---------- Navigation ---------- */
function switchView(view){
  document.querySelectorAll("aside a").forEach(a =>
    a.classList.toggle("active", a.dataset.view === view));
  document.querySelectorAll(".view").forEach(v =>
    v.classList.remove("active"));
  const el = document.getElementById("view-" + view);
  if (el) el.classList.add("active");
}

/* ---------- Session / Logout & RBAC Protection ---------- */
function checkSession(){
  const role = localStorage.getItem("session_role");
  const ab = localStorage.getItem("session_ab");

  // Enforce Admin Access (role must be admin or audit.viewer)
  if (!ab || (role !== "admin" && role !== "audit.viewer")) {
    console.warn("🚫 Access Denied: Unauthorized role attempting dashboard access:", role);
    localStorage.removeItem("session_role");
    localStorage.removeItem("session_ab");
    localStorage.removeItem("session_name");
    localStorage.removeItem("session_email");
    window.location.href = "index.html?error=unauthorized";
    return false;
  }

  const name = localStorage.getItem("session_name") || "System Administrator";
  document.getElementById("userLabel").textContent = `👑 Admin: ${name} (${ab})`;
  return true;
}

function setupLogout(){
  document.getElementById("logoutBtn").addEventListener("click", () => {
    // Log the logout event
    const logs = JSON.parse(localStorage.getItem("audit_login_logs") || "[]");
    logs.push({
      user_id: localStorage.getItem("session_ab"),
      user_name: localStorage.getItem("session_name"),
      role: localStorage.getItem("session_role"),
      status: "Logout",
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("audit_login_logs", JSON.stringify(logs));

    localStorage.removeItem("session_ab");
    localStorage.removeItem("session_role");
    localStorage.removeItem("session_name");
    localStorage.removeItem("session_email");
    window.location.href = "index.html";
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  if (!checkSession()) return;
  await loadAllData();
  populateFilters();

  renderActivity();
  renderLogins();
  renderDownloads();
  renderSecurity();
  renderBroker();
  renderTools();
  renderExports();

  // Load chart + filter modules
  if (window.renderAllCharts) window.renderAllCharts(state);
  if (window.setupFilters) window.setupFilters(state, renderActivity);

  document.querySelectorAll("aside a").forEach(a => {
    a.addEventListener("click", () => switchView(a.dataset.view));
  });

  setupLogout();
});