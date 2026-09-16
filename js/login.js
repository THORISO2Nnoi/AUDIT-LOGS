/* =========================================================
   Broker Login — AB Number + Password
   Validates credentials, enforces lockout, writes audit log
   ========================================================= */

const AB_REGEX = /^AB\d{5,7}$/;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

let brokers = {};
const attempts = {}; // in-memory attempt tracker (production: server-side)

/* ---------- Load broker master data (AB → name) ---------- */
async function loadBrokers() {
  try {
    const res = await fetch("data/brokers.json");
    brokers = await res.json();
  } catch (err) {
    console.warn("Could not load brokers.json — running in preview mode.");
    brokers = {};
  }
}

/* ---------- Audit helper (mock — real version posts to API) ---------- */
function writeAudit(entry) {
  const logs = JSON.parse(localStorage.getItem("audit_login_logs") || "[]");
  logs.push({ ...entry, timestamp: new Date().toISOString() });
  localStorage.setItem("audit_login_logs", JSON.stringify(logs));
  console.log("📝 Audit:", entry);
}

/* ---------- Lockout helpers ---------- */
function isLocked(ab) {
  const rec = attempts[ab];
  if (!rec || !rec.lockedUntil) return false;
  return Date.now() < rec.lockedUntil;
}

function recordFailure(ab, reason) {
  const rec = attempts[ab] || { count: 0 };
  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
  }
  attempts[ab] = rec;
  writeAudit({ ab_number: ab, status: "Failure", reason });
}

function clearFailures(ab) {
  delete attempts[ab];
}

/* ---------- UI helpers ---------- */
function showError(msg, success = false) {
  const box = document.getElementById("errorBox");
  box.textContent = msg;
  box.classList.add("show");
  box.classList.toggle("success", success);
}

function hideError() {
  document.getElementById("errorBox").classList.remove("show");
}

/* ---------- Password validation (demo rule) ---------- */
function isStrongPassword(pwd) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd);
}

/* ---------- Login submit ---------- */
async function handleLogin(e) {
  e.preventDefault();
  hideError();

  const abInput = document.getElementById("abNumber");
  const pwdInput = document.getElementById("password");
  const btn = document.getElementById("loginBtn");

  const ab = abInput.value.trim().toUpperCase();
  const pwd = pwdInput.value;

  abInput.classList.remove("invalid");
  pwdInput.classList.remove("invalid");

  /* --- AB Number format --- */
  if (!AB_REGEX.test(ab)) {
    abInput.classList.add("invalid");
    showError("Invalid AB Number. Format must be AB followed by 5–7 digits (e.g., AB12345).");
    writeAudit({ ab_number: ab, status: "Failure", reason: "Invalid AB format" });
    return;
  }

  /* --- Lockout check --- */
  if (isLocked(ab)) {
    const rec = attempts[ab];
    const mins = Math.ceil((rec.lockedUntil - Date.now()) / 60000);
    showError(`Account locked due to multiple failed attempts. Try again in ${mins} minute(s).`);
    writeAudit({ ab_number: ab, status: "Failure", reason: "Locked account attempt" });
    return;
  }

  /* --- Broker existence --- */
  if (Object.keys(brokers).length > 0 && !brokers[ab]) {
    abInput.classList.add("invalid");
    showError("AB Number not found in our records. Please check with your administrator.");
    recordFailure(ab, "Unknown AB Number");
    return;
  }

  /* --- Password strength (pre-check for demo) --- */
  if (!isStrongPassword(pwd)) {
    pwdInput.classList.add("invalid");
    showError("Password must be 8+ chars with uppercase, lowercase, number, and symbol.");
    recordFailure(ab, "Weak password");
    return;
  }

  /* --- Simulate auth call --- */
  btn.disabled = true;
  btn.textContent = "Signing in…";

  try {
    // PRODUCTION: replace this with real API call
    // const res = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({ ab, pwd }) });
    const ok = true; // demo always succeeds if format + strength pass

    if (ok) {
      clearFailures(ab);
      const broker = brokers[ab] || { name: "Preview Broker" };

      writeAudit({
        ab_number: ab,
        broker_name: broker.name,
        status: "Success",
        ip_address: "—",
        user_agent: navigator.userAgent
      });

      if (document.getElementById("remember").checked) {
        localStorage.setItem("remembered_ab", ab);
      } else {
        localStorage.removeItem("remembered_ab");
      }

      localStorage.setItem("session_ab", ab);
      localStorage.setItem("session_name", broker.name);

      showError("Login successful. Redirecting…", true);
      setTimeout(() => { window.location.href = "dashboard.html"; }, 700);
    } else {
      recordFailure(ab, "Invalid credentials");
      showError("Invalid AB Number or password.");
    }
  } catch (err) {
    showError("Network error. Please try again.");
    recordFailure(ab, "Network error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
}

/* ---------- Password show/hide ---------- */
function setupPasswordToggle() {
  const btn = document.getElementById("togglePwd");
  const pwd = document.getElementById("password");
  btn.addEventListener("click", () => {
    const visible = pwd.type === "text";
    pwd.type = visible ? "password" : "text";
    btn.textContent = visible ? "👁" : "🙈";
  });
}

/* ---------- Auto-format AB Number ---------- */
function setupABAutoFormat() {
  const ab = document.getElementById("abNumber");
  ab.addEventListener("input", () => {
    let v = ab.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!v.startsWith("AB")) v = "AB" + v.replace(/^AB/, "");
    ab.value = v;
  });
}

/* ---------- Prefill remembered AB ---------- */
function prefillRemembered() {
  const saved = localStorage.getItem("remembered_ab");
  if (saved) {
    document.getElementById("abNumber").value = saved;
    document.getElementById("remember").checked = true;
  }
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadBrokers();
  setupPasswordToggle();
  setupABAutoFormat();
  prefillRemembered();
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
});