


      // ===== LocalStorage Keys (Global & Unified) =====
    const SPARES_KEY = "cmms_spares_v1";
    const SUPPLIERS_KEY = "cmms_suppliers_v1";
    const PO_KEY = "purchase_orders_v1";
    const EQUIPMENT_KEY = "cmms_equipment_v1";
    const WO_KEY = "cmms_workorders_v1";
    const CM_KEY = "cmms_cm_logs_v1";
    const PM_KEY = "cmms_pm_logs_v1";
    const PDM_KEY = "cmms_pdm_logs_v1";

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn2");

  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
});

/* ========= EQUIPMENT ========= */
function loadEquipment() {
  return JSON.parse(localStorage.getItem(EQUIPMENT_KEY) || "[]");
}
function saveEquipment(list) {
  localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(list));
}

/* ========= CM ========= */
function loadCMLogs() {
  return JSON.parse(localStorage.getItem(CM_KEY) || "[]");
}
function saveCMLogs(list) {
  localStorage.setItem(CM_KEY, JSON.stringify(list));
}

/* ========= PM ========= */
function loadPMLogs() {
  return JSON.parse(localStorage.getItem(PM_KEY) || "[]");
}
function savePMLogs(list) {
  localStorage.setItem(PM_KEY, JSON.stringify(list));
}

/* ========= PDM ========= */
function loadPDMLogs() {
  return JSON.parse(localStorage.getItem(PDM_KEY) || "[]");
}
function savePDMLogs(list) {
  localStorage.setItem(PDM_KEY, JSON.stringify(list));
}
function calcCMKPIs(equipmentId) {
  const cms = loadCMLogs().filter(
    cm => cm.equipment_id === equipmentId && cm.end
  );

  if (!cms.length) {
    return { mttr: "—", downtime: 0 };
  }

  const durations = cms.map(cm =>
    (cm.end - cm.start) / 3600000 // ساعات
  );

  const downtime = durations.reduce((a,b)=>a+b,0);
  const mttr = downtime / durations.length;

  return {
    mttr: mttr.toFixed(2),
    downtime: downtime.toFixed(2)
  };
}
function calcPMCompliance(equipmentId) {
  const pms = loadPMLogs().filter(
    pm => pm.equipment_id === equipmentId
  );

  if (!pms.length) return "—";

  const completed = pms.filter(pm => pm.completedDate).length;
  return ((completed / pms.length) * 100).toFixed(1) + "%";
}
function addPDMReading(equipmentId, parameter, value, threshold) {

  const logs = loadPDMLogs();

  logs.push({
    id: "PDM-" + Date.now(),
    equipment_id: equipmentId,
    parameter,
    value: Number(value),
    threshold: Number(threshold),
    date: Date.now()
  });

  savePDMLogs(logs);

  // 🔔 قرار صيانة تلقائي
  if (value < threshold) {
    triggerAutoCM(equipmentId, parameter, value);
  }
}
function triggerAutoCM(equipmentId, parameter, value) {

  const cms = loadCMLogs();

  const openExists = cms.some(
    cm => cm.equipment_id === equipmentId && !cm.end
  );
  if (openExists) return;

  cms.push({
    id: "CM-AUTO-" + Date.now(),
    equipment_id: equipmentId,
    reason: `PdM Alert: ${parameter} = ${value}`,
    start: Date.now(),
    end: null
  });

  saveCMLogs(cms);
}
function calcPDMHealth(equipmentId) {
  const logs = loadPDMLogs().filter(
    l => l.equipment_id === equipmentId
  );

  if (!logs.length) return "—";

  const last = logs.sort((a,b)=>b.date - a.date)[0];

  if (last.value < last.threshold) return "Critical";
  if (last.value < last.threshold + 10) return "Warning";
  return "Good";
}

function renderEquipmentKPIs() {
  const tbody = document.querySelector("#equipKpiTable tbody");
  if (!tbody) return;

  const equipment = loadEquipment();
  tbody.innerHTML = "";

  equipment.forEach(eq => {

    const cm  = calcCMKPIs(eq.id);
    const pm  = calcPMCompliance(eq.id);
    const pdm = calcPDMHealth(eq.id);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${eq.id}</td>
      <td>—</td>
      <td>${cm.mttr}</td>
      <td>${pm}</td>
      <td>${cm.downtime}</td>
      <td>${pdm}</td>
    `;
    tbody.appendChild(tr);
  });
}

 
(function(){
  try{
    // Simple, robust single-file implementation. Avoid duplicate identifiers.
    const app = document.getElementById('app');
    const loginPage = document.getElementById('loginPage');
    const loginForm = document.getElementById('loginForm');
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const darkBtn = document.getElementById('darkBtn');
    const navLinks = document.getElementById('navLinks');

    // Forms & elements
    const addForm = document.getElementById('addForm');
    const pmForm = document.getElementById('pmForm');
    const cmForm = document.getElementById('cmForm');
    const pdmForm = document.getElementById('pdmForm');

    const spareForm = document.getElementById('spareForm');
    const supplierForm = document.getElementById('supplierForm');
    const USERS_KEY = 'cmms_users_v1';
    const notifLogEl = document.getElementById('notifLog');
    const historyLogEl = document.getElementById('historyLog');
    const supplierListEl = document.getElementById('supplierList');
    const spSupplierSelect = document.getElementById('spSupplier');
    const autoOrderLogEl = document.getElementById('autoOrderLog');




function loadPOs(){
  return JSON.parse(localStorage.getItem(PO_KEY) || "[]");
}
function savePOs(list){
  localStorage.setItem(PO_KEY, JSON.stringify(list));
}

function loadSpares(){
  return JSON.parse(localStorage.getItem(SPARES_KEY) || "[]");
}
function saveSpares(list){
  localStorage.setItem(SPARES_KEY, JSON.stringify(list));
}
function fillPOSpares(){
  const sel = document.getElementById("po_spare");
  sel.innerHTML = "";

  loadSpares().forEach(sp => {
    const opt = document.createElement("option");
    opt.value = sp.code;
    opt.textContent = `${sp.code} - ${sp.name} (Stock: ${sp.stock})`;
    sel.appendChild(opt);
  });
}


function renderPOs(){
  const tbody = document.querySelector("#poTable tbody");
  if(!tbody) return;

  tbody.innerHTML = "";

  loadPOs().forEach((po, i) => {

    const canApprove = po.status === "Open";
    const canReceive = po.status === "Approved";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${po.id}</td>
      <td>${po.part}</td>
      <td>${po.qty}</td>
      <td>${po.supplier}</td>
      <td>${po.status}</td>
      <td>${po.created}</td>
      <td>
        <button class="editPoBtn" data-i="${i}">Edit</button>
        <button class="approvePoBtn" data-i="${i}" ${!canApprove ? "disabled" : ""}>Approve</button>
        <button class="receivePoBtn" data-i="${i}" ${!canReceive ? "disabled" : ""}>Receive</button>
        <button class="delPoBtn" data-i="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
const poModal = document.getElementById("poModal");

document.getElementById("createPoBtn").onclick = () => {
  fillPOSpares();
  document.getElementById("poModalTitle").innerText = "Create PO";
  document.getElementById("po_edit_index").value = "";
  poModal.style.display = "flex";
};

document.getElementById("poCancelBtn").onclick = () => {
  poModal.style.display = "none";
};

document.getElementById("poSaveBtn").onclick = () => {

  const part = document.getElementById("po_spare").value;
  const qty  = Number(document.getElementById("po_qty").value);
  const supplier = document.getElementById("po_supplier").value.trim();
  const editIdx = document.getElementById("po_edit_index").value;

  if(!part || !qty || !supplier){
    alert("All fields are required");
    return;
  }

  const list = loadPOs();

  if(editIdx !== ""){
    list[editIdx].part = part;
    list[editIdx].qty = qty;
    list[editIdx].supplier = supplier;
  } else {
    list.push({
      id: "PO-" + Math.random().toString(36).slice(2,7).toUpperCase(),
      part,
      qty,
      supplier,
      status: "Open",
      created: new Date().toLocaleDateString()
    });
  }

  savePOs(list);
  renderPOs();
  poModal.style.display = "none";
};
document.addEventListener("click", function (e) {

  /* =======================
     EDIT PURCHASE ORDER
     ======================= */
  if (e.target.classList.contains("editPoBtn")) {
    const i = e.target.dataset.i;
    const poList = loadPOs();
    const po = poList[i];

    // منع تعديل PO بعد الاستلام
    if (po.status === "Received") {
      alert("Received PO cannot be edited");
      return;
    }

    // تعبئة قائمة قطع الغيار
    fillPOSpares();

    // تعبئة بيانات الـ modal
    document.getElementById("poModalTitle").innerText = "Edit PO";
    document.getElementById("po_spare").value = po.part;
    document.getElementById("po_qty").value = po.qty;
    document.getElementById("po_supplier").value = po.supplier;
    document.getElementById("po_edit_index").value = i;

    // فتح الـ modal
    poModal.style.display = "flex";
  }

  /* =======================
     APPROVE PURCHASE ORDER
     ======================= */
  if (e.target.classList.contains("approvePoBtn")) {
    const i = e.target.dataset.i;
    const poList = loadPOs();

    if (poList[i].status !== "Open") {
      alert("Only Open PO can be approved");
      return;
    }

    poList[i].status = "Approved";
    savePOs(poList);
    renderPOs();
  }

  /* =======================
     RECEIVE PURCHASE ORDER
     (WITH DOUBLE-RECEIVE PROTECTION)
     ======================= */
  if (e.target.classList.contains("receivePoBtn")) {
    const i = e.target.dataset.i;
    const poList = loadPOs();
    const po = poList[i];

    // 🔐 منع الاستلام مرتين
    if (po.status !== "Approved") {
      alert("PO must be Approved and not previously Received");
      return;
    }

    const spares = loadSpares();
    const spare = spares.find(s => s.code === po.part);

    if (!spare) {
      alert("Spare part not found in inventory");
      return;
    }

    // تحديث المخزون (مرة واحدة فقط)
    spare.stock += po.qty;
    saveSpares(spares);

    // قفل الـ PO
    po.status = "Received";
    savePOs(poList);

    renderPOs();
  }

  /* =======================
     DELETE PURCHASE ORDER
     ======================= */
  if (e.target.classList.contains("delPoBtn")) {
    const i = e.target.dataset.i;

    if (!confirm("Delete this Purchase Order?")) return;

    const poList = loadPOs();
    poList.splice(i, 1);
    savePOs(poList);
    renderPOs();
  }

});

function loadUsers(){
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function renderUsers(){
  const tbody = document.querySelector('#usersTable tbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  const users = loadUsers();
  users.forEach((u, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(u.email)}</td>
                    <td>${escapeHtml(u.name)}</td>
                    <td>${escapeHtml(u.role)}</td>
                    <td>
                      <button class="editUserBtn" data-idx="${idx}">Edit</button>
                      <button class="delUserBtn" data-idx="${idx}">Delete</button>
                    </td>`;
    tbody.appendChild(tr);
  });
  // refresh tech select lists if any
  refreshTechSelects();
}

function addUser(user){
  const users = loadUsers();
  // prevent duplicate email
  if(users.some(u=>u.email === user.email)){
    alert('Email already exists.');
    return false;
  }
  users.push(user);
  saveUsers(users);
  renderUsers();
  return true;
}
function updateUser(idx, user){
  const users = loadUsers();
  if(!users[idx]) return false;
  // if email changed, ensure uniqueness
  if(users.some((u,i)=>u.email===user.email && i!==idx)){ alert('Email already exists.'); return false; }
  users[idx] = user;
  saveUsers(users);
  renderUsers();
  return true;
}
function deleteUser(idx){
  const users = loadUsers();
  if(!users[idx]) return;
  if(!confirm('Delete user '+users[idx].email+'?')) return;
  users.splice(idx,1);
  saveUsers(users);
  renderUsers();
}

// wire up form
const userForm = document.getElementById('userForm');
const userCancelBtn = document.getElementById('userCancelBtn');
if(userForm){
  userForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = document.getElementById('u_email').value.trim();
    const name = document.getElementById('u_name').value.trim();
    const role = document.getElementById('u_role').value;
    const pass = document.getElementById('u_pass').value;
    const idField = document.getElementById('u_id').value;
    const userObj = { email, name, role, pass };
    if(idField){
      const idx = Number(idField);
      if(updateUser(idx, userObj)){
        audit('User Updated — '+email);
        userForm.reset();
        document.getElementById('u_id').value = '';
      }
    } else {
      if(addUser(userObj)){
        audit('User Created — '+email);
        userForm.reset();
      }
    }
  });
  userCancelBtn.addEventListener('click', function(){ userForm.reset(); document.getElementById('u_id').value=''; });
  // delegated actions
  document.addEventListener('click', function(e){
    if(e.target && e.target.classList.contains('editUserBtn')){
      const idx = Number(e.target.getAttribute('data-idx'));
      const users = loadUsers();
      const u = users[idx];
      if(u){
        document.getElementById('u_email').value = u.email;
        document.getElementById('u_name').value = u.name;
        document.getElementById('u_role').value = u.role;
        document.getElementById('u_pass').value = u.pass;
        document.getElementById('u_id').value = idx;
      }
    } else if(e.target && e.target.classList.contains('delUserBtn')){
      const idx = Number(e.target.getAttribute('data-idx'));
      deleteUser(idx);
      audit('User Deleted — index='+idx);
    }
  });
}


// helper: refresh any select lists that show techs (class 'techSelect')
function refreshTechSelects(){
  const users = loadUsers();
  const techs = users.filter(u=>u.role==='tech' || u.role==='engineer' || u.role==='manager');
  document.querySelectorAll('select.techSelect').forEach(sel=>{
    const cur = sel.value;
    sel.innerHTML = '<option value="">Unassigned</option>';
    techs.forEach(t=>{
      const opt = document.createElement('option');
      opt.value = t.email;
      opt.textContent = t.name+' ('+t.email+')';
      sel.appendChild(opt);
    });
    // try to keep previous value if still valid
    if(cur) sel.value = cur;
  });
}

// initialize users table (create demo users if none exist)
(function initUsersDemo(){
  const users = loadUsers();
  if(users.length === 0){
    const demo = [
      {email:'admin@cmms.com', name:'Admin', role:'admin', pass:'admin123'},
      {email:'eng@cmms.com', name:'Engineer', role:'engineer', pass:'eng123'},
      {email:'tech@cmms.com', name:'Tech', role:'tech', pass:'tech123'},
      {email:'manager@cmms.com', name:'Manager', role:'manager', pass:'mgr123'}
    ];
    saveUsers(demo);
  }
  renderUsers();
  refreshWOTechNames();
})();
  

// Audit
    const STORAGE_KEY = 'cmms_audit_v1';
    let auditEntries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    let currentUser = {email:'', role:''};
    const sessionId = Math.random().toString(36).slice(2,12);

    function escapeHtml(str){ if(str==null) return ''; return String(str).replace(/[&<>\"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s])); }

    function renderAudit(){
      const auditLog = document.getElementById('auditLog'); if(!auditLog) return; auditLog.innerHTML = '';
      auditEntries.forEach(e=>{ const div=document.createElement('div'); div.innerHTML = '['+new Date(e.timestamp).toLocaleString()+'] '+escapeHtml(e.event); auditLog.appendChild(div); });
    }

    async function sha256b64(str){ const enc=new TextEncoder(); const buf=await crypto.subtle.digest('SHA-256', enc.encode(str)); return btoa(String.fromCharCode(...new Uint8Array(buf))); }
    async function audit(event){ const ts=new Date().toISOString(); const payload = ts+'|'+event+'|'+(currentUser.email||'')+'|'+(currentUser.role||'')+'|'+sessionId; const sig = await sha256b64(payload); const entry={timestamp:ts,event,signature:sig}; auditEntries.push(entry); localStorage.setItem(STORAGE_KEY, JSON.stringify(auditEntries)); renderAudit(); }

    // LOGIN LOGIC
    const validCredentials = {
      "admin@cmms.com": { pass: "admin123", role: "admin" },
      "eng@cmms.com":   { pass: "eng123", role: "engineer" },
      "tech@cmms.com":  { pass: "tech123", role: "tech" },
      "manager@cmms.com":{ pass: "mgr123", role: "manager" }
    };

    // ===== Dynamic login using users stored in localStorage (cmms_users_v1) =====
    if(loginForm) loginForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPass').value.trim();

      // load users list if available (from Users management code)
      const users = (typeof loadUsers === 'function') ? loadUsers() : JSON.parse(localStorage.getItem('cmms_users_v1') || '[]');

      // find user by email
      const user = users.find(u => u.email === email);

      if(!user){
        // optional fallback to the old validCredentials object if you left it in the file
        if(typeof validCredentials !== 'undefined' && validCredentials[email]){
          const creds = validCredentials[email];
          if(pass !== creds.pass){ alert('Incorrect password'); return; }
          currentUser = { email, role: creds.role };
        } else {
          alert('Unknown email');
          return;
        }
      } else {
        // user found in users DB -> validate password
        if(!user.pass || String(user.pass) !== String(pass)){
          alert('Incorrect password');
          return;
        }
        currentUser = { email: user.email, role: user.role };
      }

      // proceed to show app
      loginPage.style.display = 'none';
      app.style.display = 'block';

      // role-based visibility: adjust as needed — ensure 'users' included where you want it
      const rolePages = {
        admin: ['dashboard','equipment','workorders','add-equipment','pm','cm','pdm','spare-parts','audit','equipment-kpi','users','integrations','vendors',
    'purchase-orders'],
        engineer: ['dashboard','equipment','workorders','pm','cm','pdm','spare-parts','equipment-kpi','integrations','vendors',
    'purchase-orders'],
        tech: ['dashboard','equipment','workorders','pm','cm','pdm','spare-parts','vendors'],
        manager: ['dashboard','equipment','workorders','pm','spare-parts','equipment-kpi','users','integrations','vendors',
    'purchase-orders']
      };

      // show/hide nav items according to role
      document.querySelectorAll('#navLinks li[data-page]').forEach(li=>{
        const p = li.getAttribute('data-page');
        if(!rolePages[currentUser.role] || !rolePages[currentUser.role].includes(p)) li.style.display='none';
        else li.style.display='flex';
      });

      // record audit
      if(typeof audit === 'function') await audit('User Logged In — '+currentUser.email);
    });


    // Navigation
   // function showPage(id){ document.querySelectorAll('.page').forEach(p=>p.classList.remove('active')); const el=document.getElementById(id); if(el) el.classList.add('active'); }
function showPage(id){

  // 1) إخفاء جميع الصفحات
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });

  // 2) إظهار الصفحة المطلوبة
  const el = document.getElementById(id);
  if(!el) return;

  el.classList.add('active');

  // 3) Page-specific hooks
  switch(id){
    case "purchase-orders":
    renderPOs();
    break;
    case "equipment-kpi":
    renderEquipmentKPIs();
    break;

    case "spare-parts":
      // مثال إن أردت تحديث مخزون أو أشياء أخرى
      // renderSpares();
      break;

    case "users":
      // renderUsers();
      break;

    default:
      // لا شيء
      break;
  }
}

    // --- Logout Robust Handler ---
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
  logoutBtn.addEventListener('click', async function(){
    app.style.display = 'none';
    loginPage.style.display = 'block';
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('dashboard').classList.add('active');
    if(loginForm) loginForm.reset();
    currentUser = { email:'', role:'' };
    await audit('User Logged Out');
  });
}

navLinks.addEventListener('click', function(e){
      const li = e.target.closest('li[data-page]'); if(!li) return;
      const page = li.getAttribute('data-page');
      if(li.id === 'logoutBtn'){
        // Logout: hide app, show login page, reset pages
        app.style.display='none';
        loginPage.style.display='block';
        showPage('dashboard'); // reset default page
        loginForm.reset();
        currentUser = { email:'', role:'' };
        audit('User Logged Out');
        return;
      }
      showPage(page);
    });

    menuBtn.addEventListener('click', ()=>{ sidebar.classList.toggle('expanded'); sidebar.classList.toggle('collapsed'); });
    darkBtn.addEventListener('click', ()=> document.body.classList.toggle('dark'));

    // Equipment add
    function renderEquipCards(){ const cont=document.getElementById('equipCardContainer'); if(!cont) return; cont.innerHTML=''; const rows=[...document.querySelectorAll('#equipmentTable tbody tr')]; rows.forEach(r=>{ const c=document.createElement('div'); c.className='equip-card'; const tds=[...r.children]; c.innerHTML = `<div><b>ID:</b> ${tds[0].textContent}</div>
<div><b>Category:</b> ${tds[1].textContent}</div>
<div><b>Model:</b> ${tds[2].textContent}</div>
<div><b>Serial:</b> ${tds[3].textContent}</div>
<div><b>Location:</b> ${tds[4].textContent}</div>
<div><b>Risk:</b> ${tds[5].textContent}</div>
<div><b>Age:</b> ${tds[6]?.textContent||'—'}</div>
<div><b>Warranty:</b> ${tds[7]?.textContent||'—'}</div>
<div><b>Next PM:</b> ${tds[8]?.textContent||'—'}</div>`;
 cont.appendChild(c); }); }

function applyEquipmentColoring(){
      document.querySelectorAll('#equipmentTable tbody tr').forEach(r=>{
        const age=r.children[6]?.textContent||'';
        const warr=r.children[7]?.textContent||'';
        const next=r.children[8]?.textContent||'';
        // Age color
        if(age.includes('yrs')){
          const v=parseFloat(age);
          r.children[6].style.color = v>=10? 'red': v>=5? 'orange':'green';
        }
        // Warranty color
        if(warr==='Expired'){
          r.children[7].style.color='red';
          notifLogEl.innerHTML += '<div>['+new Date().toLocaleTimeString()+'] Warranty expired: '+r.children[0].textContent+'</div>';
        } else if(warr.includes('yrs')){
          const v=parseFloat(warr);
          r.children[7].style.color = v<=1? 'orange':'green';
        }
        // Next PM color
        if(next && next!=='—'){
          const due=new Date(next+'T00:00:00'); const now=new Date(); now.setHours(0,0,0,0);
          const diff=(due-now)/(1000*60*60*24);
          r.children[8].style.color = diff<=5? 'red': diff<=15? 'orange':'green';
        }
      });
    }
    if (addForm) addForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const deviceID = document.getElementById("deviceID").value.trim();
  const category = document.getElementById("category").value.trim();
  const manufacturer = document.getElementById("manufacturer").value.trim();
  const model = document.getElementById("model").value.trim();
  const serial = document.getElementById("serial").value.trim();
  const installDate = document.getElementById("installDate").value;
  const annualCost = Number(document.getElementById("annualCost").value || 0);

  if (!deviceID) {
    alert("Equipment ID is required");
    return;
  }

  const equipment = loadEquipment();

  // منع التكرار
  if (equipment.some(eq => eq.id === deviceID)) {
    alert("Equipment ID already exists");
    return;
  }

  equipment.push({
    id: deviceID,
    category,
    manufacturer,
    model,
    serial,
    installDate,
    annualCost
  });

  saveEquipment(equipment);

  alert("Equipment saved successfully");
  addForm.reset();
});

// PM (REAL & COMPATIBLE)
if (pmForm) pmForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const equip = document.getElementById("pmEquip").value.trim();
  const interval = Number(document.getElementById("pmInterval").value) || 90;
  const last = document.getElementById("pmLast").value
    ? new Date(document.getElementById("pmLast").value)
    : new Date();

  const next = new Date(last);
  next.setDate(next.getDate() + interval);

  /* ===== UPDATE UI ===== */
  const tbody = document.querySelector("#pmTable tbody");
  if (tbody) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(equip)}</td>
      <td>${interval} days</td>
      <td class="pmDue">${next.toISOString().split("T")[0]}</td>
      <td><button class="pmCompleteBtn" data-equip="${equip}">Complete</button></td>
    `;
    tbody.appendChild(tr);
  }

  /* ===== PM REAL LOG (SCHEDULE) ===== */
  const pms = loadPMLogs();
  pms.push({
    id: "PM-" + Date.now(),
    equipment_id: equip,
    scheduledDate: next.toISOString().split("T")[0],
    completedDate: null
  });
  savePMLogs(pms);

  /* ===== AUTO CREATE WO ===== */
  const assignedPM = document.getElementById("pmAssigned")
    ? document.getElementById("pmAssigned").value
    : "";
  createWorkOrder(equip, "PM", assignedPM);

  pmForm.reset();
});


    // delegated handler: mark PM complete
    // --- Work Orders Auto‑Creation ---
// ======= UPDATED createWorkOrder: show user NAME instead of email =======
function createWorkOrder(equip, type, assignedTech) {

  const tbody = document.querySelector("#woTable tbody");
  if (!tbody) return;

  const woId = "WO-" + Date.now();
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${woId}</td>
    <td>${type}</td>
    <td>${equip}</td>
    <td class="woStatus">Open</td>
    <td>${assignedTech || "—"}</td>
    <td>
      <button class="closeWoBtn" data-wo="${woId}" data-type="${type}" data-equip="${equip}">
        Close
      </button>
    </td>
  `;

  tbody.appendChild(tr);
}

document.addEventListener("click", function (e) {

  if (!e.target.classList.contains("closeWoBtn")) return;

  const row = e.target.closest("tr");
  if (!row) return;

  const type  = row.children[1]?.innerText; // CM / PM
  const equip = row.children[2]?.innerText;

  const statusCell = row.querySelector(".woStatus");
  if (!statusCell || statusCell.innerText === "Closed") return;

  // تحديث حالة الـ WO
  statusCell.innerText = "Closed";

  /* ========= CM COMPLETE ========= */
  if (type === "CM") {
    const cms = loadCMLogs();
    const cm = cms.find(
      c => c.equipment_id === equip && c.end === null
    );

    if (cm) {
      cm.end = Date.now();
      saveCMLogs(cms);
    }
  }

  /* ========= PM COMPLETE ========= */
  if (type === "PM") {
    const pms = loadPMLogs();
    const pm = pms.find(
      p => p.equipment_id === equip && !p.completedDate
    );

    if (pm) {
      pm.completedDate = new Date().toISOString().slice(0,10);
      savePMLogs(pms);
    }
  }

  // تحديث KPIs مباشرة
  renderEquipmentKPIs();
});


// OPTIONAL: replace emails with user names in existing WO table rows
function refreshWOTechNames(){
  const users = (typeof loadUsers === 'function') ? loadUsers() : JSON.parse(localStorage.getItem('cmms_users_v1')||'[]');
  const emailToName = {};
  users.forEach(u => { if(u.email) emailToName[u.email] = u.name || u.email; });

  document.querySelectorAll('#woTable tbody tr').forEach(row=>{
    const techCell = row.children[4]; // 0:WO,1:Type,2:Equip,3:Status,4:Tech
    if(!techCell) return;
    const val = techCell.textContent.trim();
    if(val && emailToName[val]) techCell.textContent = emailToName[val];
  });
}

// continue CM/PdM handlers

// Auto-create WO for CM (REAL & SAFE)
if (cmForm) cmForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const equip = document.getElementById("cmEquip").value.trim();
  const fail = document.getElementById("cmFail").value.trim();
  const action = document.getElementById("cmAction").value.trim();
  const parts = document.getElementById("cmParts").value.trim();


  if (!equip) {
    alert("Equipment is required");
    return;
  }

  /* ===== PREVENT DUPLICATE OPEN CM ===== */
  const cms = loadCMLogs();
  const openExists = cms.some(
    c => c.equipment_id === equip && !c.end
  );

  if (openExists) {
    alert("There is already an open CM for this equipment");
    return;
  }

  /* ===== UPDATE UI ===== */
  const tbody = document.querySelector("#cmTable tbody");
  if (tbody) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(equip)}</td>
      <td>${escapeHtml(fail)}</td>
      <td>${escapeHtml(action)}</td>
      <td>${escapeHtml(parts)}</td>
      <td>${new Date().toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  }

  /* ===== CM REAL LOG (START) ===== */
  cms.push({
    id: "CM-" + Date.now(),
    equipment_id: equip,
    failure: fail,
    start: Date.now(),
    end: null
  });
  saveCMLogs(cms);

  /* ===== AUTO CREATE WO ===== */
  const assignedCM = document.getElementById("cmAssigned")
    ? document.getElementById("cmAssigned").value
    : "";
  createWorkOrder(equip, "CM", assignedCM);

  cmForm.reset();
});

// Auto-create WO for PdM
// PdM submit (REAL & SAFE)
// PdM submit (CALIBRATION ONLY - SIMPLE)
if (pdmForm) pdmForm.addEventListener('submit', function (e) {
  e.preventDefault();

  // ===== READ INPUTS =====
  const equipEl = document.getElementById('pdmEquip');
  const paramEl = document.getElementById('pdmParam');
  const thresholdEl = document.getElementById('pdmThreshold');

  const equip = equipEl ? equipEl.value.trim() : '';
  const parameter = paramEl ? paramEl.value.trim() : '';
  const threshold = thresholdEl ? Number(thresholdEl.value) : NaN;

  const assignedPdM = document.getElementById('pdmAssigned')
    ? document.getElementById('pdmAssigned').value
    : '';

  // ===== SIMPLE VALIDATION =====
  if (!equip || !parameter || isNaN(threshold)) {
    alert("Invalid PdM input");
    return;
  }

  // ===== SAVE CALIBRATION =====
  addPDMReading(
    equip,
    parameter,
    null,      // لا توجد قراءة الآن
    threshold
  );

  // ===== OPTIONAL: CREATE WO =====
  createWorkOrder(equip, 'PdM', assignedPdM);

  pdmForm.reset();
});

document.addEventListener("click", function (e) {

  if (!e.target.classList.contains("pmCompleteBtn")) return;

  const equip = e.target.dataset.equip;
  if (!equip) return;

  /* ========= PM COMPLETE (REAL LOG) ========= */
  const pms = loadPMLogs();
  const pm = pms.find(p => p.equipment_id === equip && !p.completedDate);

  if (pm) {
    pm.completedDate = new Date().toISOString().slice(0,10);
    savePMLogs(pms);
  }

  /* ========= CLOSE RELATED WO ========= */
  const woRows = document.querySelectorAll("#woTable tbody tr");
  woRows.forEach(r => {
    const tds = r.children;
    if (
      tds[1].textContent === "PM" &&
      tds[2].textContent === equip &&
      tds[3].textContent === "Open"
    ) {
      tds[3].textContent = "Closed";
      r.style.backgroundColor = "#d1ffe0";
    }
  });

  /* ========= UPDATE UI ========= */
  const row = e.target.closest("tr");
  if (row) {
    const due = row.querySelector(".pmDue");
    if (due) due.textContent = "Done";
    e.target.remove();
    row.style.backgroundColor = "#e6ffed";
  }

  /* ========= REFRESH KPIs ========= */
  if (typeof renderEquipmentKPIs === "function") {
    renderEquipmentKPIs();
  }

});

 // ===== Integrations v2 (HIS / LIS / RIS-PACS aware) =====
const INTEGRATIONS_KEY = 'cmms_integrations_v2';

function loadIntegrations(){
  return JSON.parse(localStorage.getItem(INTEGRATIONS_KEY) || '[]');
}
function saveIntegrations(list){
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(list));
}
function renderIntegrations(){
  const tbody = document.querySelector('#integrationsTable tbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  const list = loadIntegrations();
  list.forEach((it, idx) => {
    const endpointDisplay = it.endpoint ? (it.endpoint + (it.port ? ':'+it.port : '') + (it.path ? it.path : '')) : '—';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(it.system_role||'—')}</td>
                    <td>${escapeHtml(it.name)}</td>
                    <td>${escapeHtml(it.protocol)}</td>
                    <td>${escapeHtml(endpointDisplay)}</td>
                    <td>${escapeHtml(it.auth_type || '—')}</td>
                    <td>
                      <button class="editIntBtn" data-idx="${idx}">Edit</button>
                      <button class="delIntBtn" data-idx="${idx}">Delete</button>
                      <button class="testIntBtn" data-idx="${idx}">Test</button>
                    </td>`;
    tbody.appendChild(tr);
  });
}

// wire form
const integrationForm = document.getElementById('integrationForm');
const intCancelBtn = document.getElementById('intCancelBtn');
const intTestBtn = document.getElementById('intTestBtn');

if(integrationForm){
  integrationForm.addEventListener('submit', function(e){
    e.preventDefault();
    const obj = {
      system_role: document.getElementById('int_system_role').value,
      name: document.getElementById('int_name').value.trim(),
      protocol: document.getElementById('int_protocol').value,
      endpoint: document.getElementById('int_endpoint').value.trim(),
      port: document.getElementById('int_port').value.trim(),
      path: document.getElementById('int_path').value.trim(),
      auth_type: document.getElementById('int_auth_type').value,
      auth_value: document.getElementById('int_auth_value').value.trim()
    };
    const editIdx = Number(integrationForm.dataset.editIdx ?? -1);
    const list = loadIntegrations();
    if(editIdx >= 0){
      list[editIdx] = obj;
      saveIntegrations(list);
      audit && audit('Integration Updated — '+obj.name);
    } else {
      list.push(obj);
      saveIntegrations(list);
      audit && audit('Integration Created — '+obj.name);
    }
    integrationForm.reset();
    delete integrationForm.dataset.editIdx;
    renderIntegrations();
  });

  intCancelBtn.addEventListener('click', function(){
    integrationForm.reset();
    delete integrationForm.dataset.editIdx;
  });

  // delegated actions
  document.addEventListener('click', async function(e){
    if(e.target && e.target.classList.contains('editIntBtn')){
      const idx = Number(e.target.getAttribute('data-idx'));
      const list = loadIntegrations();
      const it = list[idx];
      if(it){
        document.getElementById('int_system_role').value = it.system_role || 'his';
        document.getElementById('int_name').value = it.name;
        document.getElementById('int_protocol').value = it.protocol;
        document.getElementById('int_endpoint').value = it.endpoint || '';
        document.getElementById('int_port').value = it.port || '';
        document.getElementById('int_path').value = it.path || '';
        document.getElementById('int_auth_type').value = it.auth_type || '';
        document.getElementById('int_auth_value').value = it.auth_value || '';
        integrationForm.dataset.editIdx = idx;
      }
    } else if(e.target && e.target.classList.contains('delIntBtn')){
      const idx = Number(e.target.getAttribute('data-idx'));
      const list = loadIntegrations();
      if(!list[idx]) return;
      if(!confirm('Delete integration '+list[idx].name+'?')) return;
      list.splice(idx,1);
      saveIntegrations(list);
      renderIntegrations();
      audit && audit('Integration Deleted — index='+idx);
    } else if(e.target && e.target.classList.contains('testIntBtn')){
      const idx = Number(e.target.getAttribute('data-idx'));
      await testIntegration(idx);
    }
  });

  // test selected button (uses current form values if editing)
  intTestBtn.addEventListener('click', async function(){
    const idx = integrationForm.dataset.editIdx ? Number(integrationForm.dataset.editIdx) : -1;
    if(idx >= 0){
      await testIntegration(idx);
    } else {
      // create temp object from form and test it
      const temp = {
        system_role: document.getElementById('int_system_role').value,
        name: document.getElementById('int_name').value.trim() || 'TempTest',
        protocol: document.getElementById('int_protocol').value,
        endpoint: document.getElementById('int_endpoint').value.trim(),
        port: document.getElementById('int_port').value.trim(),
        path: document.getElementById('int_path').value.trim(),
        auth_type: document.getElementById('int_auth_type').value,
        auth_value: document.getElementById('int_auth_value').value.trim()
      };
      await testIntegrationObject(temp);
    }
  });
}

// high-level test dispatcher
async function testIntegration(idx){
  const list = loadIntegrations();
  const it = list[idx];
  if(!it){ showResult('Integration not found'); return; }
  await testIntegrationObject(it);
}

function showResult(msg){
  const el = document.getElementById('integrationTestResult');
  if(!el) return;
  el.textContent = msg;
}

// build sample payloads for each system
function buildSamplePayload(it){
  const base = {
    wo_id: 'WO-TEST-' + Math.random().toString(36).slice(2,6).toUpperCase(),
    equipment_id: 'EQ-001',
    requested_by: currentUser && currentUser.email ? currentUser.email : 'local',
    timestamp: new Date().toISOString()
  };
  if(it.system_role === 'lis'){
    return {
      type: 'order',
      hl7_orm_sample: {
        patient_id: 'MRN-0001',
        order_id: base.wo_id,
        tests: [{ code: 'LOINC:2093-3', name: 'Cholesterol' }]
      },
      json: base
    };
  }
  if(it.system_role === 'ris' || it.system_role === 'pacs'){
    return {
      type: 'imaging_order',
      json: Object.assign({}, base, { procedure_code: 'XR-CHEST', patient_id: 'MRN-100' }),
      dicom_test_note: 'DICOM uploads/tests must be done via PACS or middleware (STOW-RS / C-STORE)'
    };
  }
  // default HIS/vendor
  return {
    type: 'order',
    json: base
  };
}

// ===== updated testIntegrationObject with in-browser demo fallback for MLLP / DIMSE / DICOMweb CORS =====
async function testIntegrationObject(it){
  showResult('Testing '+it.name+' ('+it.protocol+') ...');

  // compute endpoint URL if possible
  let url = '';
  if(it.endpoint){
    if(it.endpoint.startsWith('http') || it.endpoint.startsWith('https')){
      url = it.endpoint + (it.path ? it.path : '');
    } else {
      const portPart = it.port ? ':'+it.port : '';
      url = 'http://' + it.endpoint + portPart + (it.path ? it.path : '');
    }
  }

  const payloads = buildSamplePayload(it);

  try {
    // REST / FHIR: actual test via fetch
    if(it.protocol === 'rest' || it.protocol === 'fhir'){
      if(!url){ showResult('No valid HTTP endpoint specified.'); return; }
      const headers = { 'Content-Type':'application/json' };
      if(it.auth_type === 'bearer' && it.auth_value) headers['Authorization'] = 'Bearer '+it.auth_value;
      if(it.auth_type === 'basic' && it.auth_value) headers['Authorization'] = 'Basic '+btoa(it.auth_value);

      const resp = await fetch(url, { method:'POST', headers, body: JSON.stringify(payloads.json) });
      const txt = await resp.text();
      showResult(`HTTP ${resp.status} — ${txt.slice(0,1000)}`);
      audit && audit('Integration Test (HTTP) — '+it.name+' — status '+resp.status);
      return;
    }

    // HL7 via middleware (REST→MLLP)
    if(it.protocol === 'hl7_http'){
      if(!url){ showResult('No middleware HTTP endpoint specified (needed to forward to MLLP).'); return; }
      const headers = { 'Content-Type':'application/json' };
      if(it.auth_type === 'bearer' && it.auth_value) headers['Authorization'] = 'Bearer '+it.auth_value;
      const body = { mode:'send-hl7', system: it.system_role, payload: payloads.hl7_orm_sample || payloads.json };
      try {
        const resp = await fetch(url, { method:'POST', headers, body: JSON.stringify(body) });
        const txt = await resp.text();
        showResult(`Middleware HTTP ${resp.status} — ${txt.slice(0,1000)}`);
        audit && audit('Integration Test (HL7 via middleware) — '+it.name+' — status '+resp.status);
      } catch(err){
        showResult('Error calling middleware: '+ (err.message||err));
      }
      return;
    }

    // MLLP: cannot send raw MLLP from browser — simulate demo ACK locally unless middleware exists
    if(it.protocol === 'mllp'){
      if(url){
        // If user configured an HTTP middleware endpoint, prefer that (same as hl7_http)
        try {
          const headers = { 'Content-Type':'application/json' };
          if(it.auth_type === 'bearer' && it.auth_value) headers['Authorization'] = 'Bearer '+it.auth_value;
          const body = { mode:'send-mllp', system: it.system_role, payload: payloads.hl7_orm_sample || payloads.json };
          const resp = await fetch(url, { method:'POST', headers, body: JSON.stringify(body) });
          const txt = await resp.text();
          showResult(`Middleware (forward→MLLP) HTTP ${resp.status} — ${txt.slice(0,1000)}`);
          audit && audit('Integration Test (MLLP via middleware) — '+it.name+' — status '+resp.status);
          return;
        } catch(err){
          // fall-through to demo
        }
      }
      // Demo simulation: show a realistic ACK after a short delay
      showResult('Simulating MLLP send — building HL7 message...');
      await new Promise(r=>setTimeout(r,700));
      const simulatedACK = 'MSA|AA|'+(payloads.json?.wo_id || 'WO-DEMO')+'|Simulated-Ack';
      showResult('Simulated MLLP result — ACK received: ' + simulatedACK);
      audit && audit('Integration Demo (MLLP simulated) — '+it.name);
      return;
    }

    // DICOMweb: try real fetch; if fails (CORS/network) provide demo fallback
    if(it.protocol === 'dicomweb'){
      if(!url){ showResult('No DICOMweb endpoint specified.'); return; }
      try {
        // attempt a lightweight GET (may fail due to CORS)
        const wado = url + (it.path && !url.endsWith('/') ? it.path : '') ;
        const resp = await fetch(wado, { method:'GET' });
        const txt = await resp.text();
        showResult(`DICOMweb response HTTP ${resp.status} — ${txt.slice(0,500)}`);
        audit && audit('Integration Test (DICOMweb) — '+it.name+' — status '+resp.status);
      } catch(err){
        // CORS or network error — show demo WADO and example result
        const demoWado = 'https://demo.pacs.example/wado?studyUID=1.2.840.113619.2.55.3.604688432.783.160...';
        showResult('DICOMweb test failed (likely CORS or unreachable). Demo fallback: WADO URL: ' + demoWado + ' — Demo result: Study found, 12 instances. (This is a client-side demo; run server-side test or use Orthanc for real verification.)');
        audit && audit('Integration Demo (DICOMweb simulated) — '+it.name);
      }
      return;
    }

    // DICOM DIMSE (C-STORE): cannot run from browser — try middleware if present, otherwise simulate
    if(it.protocol === 'dicom_dimse'){
      if(url){
        // allow middleware to proxy to DIMSE
        try {
          const headers = { 'Content-Type':'application/json' };
          if(it.auth_type === 'bearer' && it.auth_value) headers['Authorization'] = 'Bearer '+it.auth_value;
          const body = { mode:'send-dimse', system: it.system_role, note: 'client-demo-call' };
          const resp = await fetch(url, { method:'POST', headers, body: JSON.stringify(body) });
          const txt = await resp.text();
          showResult(`Middleware (forward→DIMSE) HTTP ${resp.status} — ${txt.slice(0,1000)}`);
          audit && audit('Integration Test (DIMSE via middleware) — '+it.name+' — status '+resp.status);
          return;
        } catch(err){
          // fall-through to demo
        }
      }
      // Demo simulation for C-STORE
      showResult('Simulating DICOM C-STORE (DIMSE) — sending study...');
      await new Promise(r=>setTimeout(r,900));
      showResult('Simulated DICOM C-STORE result — SUCCESS (2 series, 24 instances).');
      audit && audit('Integration Demo (DIMSE simulated) — '+it.name);
      return;
    }

    if(it.protocol === 'sftp'){
      showResult('SFTP tests must be performed from server (not from browser). Use SSH client or backend job to test SFTP upload/download.');
      return;
    }

    showResult('Protocol not supported for test from browser.');
  } catch(err){
    showResult('Test error: '+(err.message||String(err)));
  }
}


// init render
renderIntegrations();
// ===== Demo sequence runner: HIS -> LIS -> RIS/PACS =====
const runDemoBtn = document.getElementById('runDemoBtn');
const demoStatusEl = document.getElementById('demoStatus');
const demoLogWrapper = document.getElementById('demoLogWrapper');
const demoLogEl = document.getElementById('demoLog');

if(runDemoBtn){
  runDemoBtn.addEventListener('click', async function(){
    await runDemoSequence();
  });
}

// helper: append a line to demo log (timestamped)
function appendDemoLog(line){
  if(!demoLogEl) return;
  const t = new Date().toISOString();
  const entry = `[${t}] ${line}`;
  demoLogEl.innerText += entry + '\n';
  // ensure visible and scroll to bottom
  demoLogWrapper.style.display = 'block';
  demoLogWrapper.scrollTop = demoLogWrapper.scrollHeight;
}

// main runner
async function runDemoSequence(){
  // disable UI
  runDemoBtn.disabled = true;
  demoStatusEl.textContent = 'Running demo sequence...';
  demoLogEl.innerText = '';
  demoLogWrapper.style.display = 'block';
  appendDemoLog('Demo sequence started.');

  // Build three demo integration objects that match the shape expected by testIntegrationObject
  const demoHIS = {
    system_role: 'his',
    name: 'Demo-HIS (HL7 MLLP simulated)',
    protocol: 'mllp', // will trigger MLLP demo behavior if no middleware endpoint
    endpoint: '',     // intentionally empty -> triggers client-side simulation
    port: '',
    path: '',
    auth_type: '',
    auth_value: ''
  };

  const demoLIS = {
    system_role: 'lis',
    name: 'Demo-LIS (ORM sample via HL7_http simulated)',
    protocol: 'hl7_http', // attempts middleware if configured; otherwise middleware call fails then fallback?
    endpoint: '', // empty to force HL7 payload in testIntegrationObject; it will be treated in demo mode
    port: '',
    path: '',
    auth_type: '',
    auth_value: ''
  };

  const demoRIS = {
    system_role: 'pacs',
    name: 'Demo-RIS/PACS (DICOM simulated)',
    protocol: 'dicom_dimse', // will simulate C-STORE if no middleware
    endpoint: '',
    port: '',
    path: '',
    auth_type: '',
    auth_value: ''
  };

  // sequence array
  const seq = [
    { label: 'HIS (HL7 / MLLP demo)', obj: demoHIS },
    { label: 'LIS (HL7 ORM demo)', obj: demoLIS },
    { label: 'RIS/PACS (DICOM demo)', obj: demoRIS }
  ];

  // run sequentially
  for(const step of seq){
    appendDemoLog('---');
    appendDemoLog(`Starting step: ${step.label}`);
    appendDemoLog(`Integration name: ${step.obj.name}, protocol: ${step.obj.protocol}`);

    // show in status
    demoStatusEl.textContent = `Running: ${step.label}`;

    const start = Date.now();
    try {
      // testIntegrationObject will use demo fallback behaviors if middleware not set
      await testIntegrationObject(step.obj);

      const duration = Date.now() - start;
      appendDemoLog(`Completed step: ${step.label} — duration ${duration} ms`);
    } catch(err){
      const duration = Date.now() - start;
      appendDemoLog(`Error in step: ${step.label} — ${err && err.message ? err.message : String(err)} (after ${duration} ms)`);
    }
  }

  appendDemoLog('Demo sequence finished.');
  demoStatusEl.textContent = 'Demo finished.';
  runDemoBtn.disabled = false;
}

// ===== Vendors module (localStorage: cmms_vendors_v1) =====
const VENDORS_KEY = 'cmms_vendors_v1';

function loadVendors(){
  return JSON.parse(localStorage.getItem(VENDORS_KEY) || '[]');
}
function saveVendors(list){
  localStorage.setItem(VENDORS_KEY, JSON.stringify(list));
}
function renderVendors(){
  const tbody = document.querySelector('#vendorsTable tbody');
  const sel = document.getElementById('vendorSelectForWO');
  if(!tbody || !sel) return;
  tbody.innerHTML = '';
  sel.innerHTML = '<option value="">Select vendor...</option>';
  const list = loadVendors();
  list.forEach((v, idx) => {
    const tr = document.createElement('tr');
    const ep = v.endpoint ? v.endpoint : '—';
    const auth = v.auth_type ? (v.auth_type + (v.auth_value ? ' (set)' : '')) : '—';
    tr.innerHTML = `<td>${escapeHtml(v.code||'—')}</td>
                    <td>${escapeHtml(v.name)}</td>
                    <td>${escapeHtml(v.email||'—')}</td>
                    <td>${escapeHtml(ep)}</td>
                    <td>${escapeHtml(auth)}</td>
                    <td>
                      <button class="editVendorBtn" data-idx="${idx}">Edit</button>
                      <button class="delVendorBtn" data-idx="${idx}">Delete</button>
                      <button class="testVendorBtn" data-idx="${idx}">Test WO</button>
                    </td>`;
    tbody.appendChild(tr);

    // populate select for WO
    const opt = document.createElement('option');
    opt.value = idx;
    opt.text = (v.code ? '['+v.code+'] ' : '') + v.name + (v.email ? ' ('+v.email+')' : '');
    sel.appendChild(opt);
  });
}

// Vendor form wiring
const vendorForm = document.getElementById('vendorForm');
const vendorCancelBtn = document.getElementById('vendorCancelBtn');
if(vendorForm){
  vendorForm.addEventListener('submit', function(e){
    e.preventDefault();
    const obj = {
      name: document.getElementById('v_name').value.trim(),
      code: document.getElementById('v_code').value.trim(),
      email: document.getElementById('v_email').value.trim(),
      endpoint: document.getElementById('v_endpoint').value.trim(),
      auth_type: document.getElementById('v_auth_type').value,
      auth_value: document.getElementById('v_auth_value').value.trim()
    };
    const editIdx = Number(vendorForm.dataset.editIdx ?? -1);
    const list = loadVendors();
    if(editIdx >= 0){
      list[editIdx] = obj;
      saveVendors(list);
      audit && audit('Vendor Updated — '+obj.name);
    } else {
      list.push(obj);
      saveVendors(list);
      audit && audit('Vendor Created — '+obj.name);
    }
    vendorForm.reset();
    delete vendorForm.dataset.editIdx;
    renderVendors();
  });

  vendorCancelBtn.addEventListener('click', function(){
    vendorForm.reset();
    delete vendorForm.dataset.editIdx;
  });

  // delegated actions: edit / delete / test
  document.addEventListener('click', async function(e){
    if(e.target && e.target.classList.contains('editVendorBtn')){
      const idx = Number(e.target.getAttribute('data-idx'));
      const list = loadVendors();
      const v = list[idx];
      if(v){
        document.getElementById('v_name').value = v.name;
        document.getElementById('v_code').value = v.code || '';
        document.getElementById('v_email').value = v.email || '';
        document.getElementById('v_endpoint').value = v.endpoint || '';
        document.getElementById('v_auth_type').value = v.auth_type || '';
        document.getElementById('v_auth_value').value = v.auth_value || '';
        vendorForm.dataset.editIdx = idx;
      }
    } else if(e.target && e.target.classList.contains('delVendorBtn')){
      const idx = Number(e.target.getAttribute('data-idx'));
      const list = loadVendors();
      if(!list[idx]) return;
      if(!confirm('Delete vendor '+list[idx].name+'?')) return;
      list.splice(idx,1);
      saveVendors(list);
      renderVendors();
      audit && audit('Vendor Deleted — index='+idx);
    } else if(e.target && e.target.classList.contains('testVendorBtn')){
      const idx = Number(e.target.getAttribute('data-idx'));
      await sendWoToVendor(idx);
    }
  });
}

// send WO to vendor (by vendor index or by selected index)
const sendWoBtn = document.getElementById('sendWoBtn');
const sendWoStatus = document.getElementById('sendWoStatus');
const sendWoLog = document.getElementById('sendWoLog');

async function sendWoToVendor(indexOrIdx){
  const list = loadVendors();
  const idx = (typeof indexOrIdx === 'number') ? indexOrIdx : Number(document.getElementById('vendorSelectForWO').value);
  if(isNaN(idx) || idx < 0 || !list[idx]) { alert('Please select a vendor'); return; }
  const vendor = list[idx];
  // build simple WO payload
  const payload = {
    wo_id: 'WO-' + Math.random().toString(36).slice(2,6).toUpperCase(),
    equipment_id: 'EQ-001',
    description: 'Demo: please perform maintenance',
    requested_by: currentUser && currentUser.email ? currentUser.email : 'local',
    timestamp: new Date().toISOString()
  };

  // show log panel
  sendWoLog.style.display = 'block';
  sendWoLog.innerText = '';
  function log(line){ sendWoLog.innerText += '['+new Date().toISOString()+'] '+line + '\n'; sendWoLog.scrollTop = sendWoLog.scrollHeight; }

  // if no endpoint -> simulate demo
  if(!vendor.endpoint){
    log('No endpoint configured for vendor. Running demo send (simulated).');
    await new Promise(r=>setTimeout(r,700));
    log('Simulated: WO '+payload.wo_id+' sent to vendor '+vendor.name+' — vendor responded: accepted (simulated).');
    sendWoStatus.textContent = 'Demo send completed';
    audit && audit('Vendor Demo WO sent — '+vendor.name+' WO:'+payload.wo_id);
    return;
  }

  // prepare URL
  let url = vendor.endpoint;
  // if endpoint is only host, allow possible path not set — assume POST to endpoint
  try {
    // headers
    const headers = { 'Content-Type': 'application/json' };
    if(vendor.auth_type === 'bearer' && vendor.auth_value) headers['Authorization'] = 'Bearer ' + vendor.auth_value;
    if(vendor.auth_type === 'basic' && vendor.auth_value) headers['Authorization'] = 'Basic ' + btoa(vendor.auth_value);

    log('Posting WO to '+url);
    sendWoStatus.textContent = 'Sending...';
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    const text = await resp.text();
    log('HTTP '+resp.status+' — '+ (text.length>1000? text.slice(0,1000)+'...': text));
    sendWoStatus.textContent = 'Send completed: '+resp.status;
    audit && audit('Vendor WO sent — '+vendor.name+' WO:'+payload.wo_id+' status:'+resp.status);
  } catch(err){
    log('Error sending to vendor: '+(err.message||String(err)));
    sendWoStatus.textContent = 'Send error';
  }
}

// wire manual send button
if(sendWoBtn){
  sendWoBtn.addEventListener('click', async function(){ await sendWoToVendor(); });
}

// initialize vendors list and select
(function initVendorsDemo(){
  const existing = loadVendors();
  if(existing.length === 0){
    // seed a demo vendor
    const demo = [
      { code:'VEND-DEMO', name:'Demo Vendor Inc.', email:'vendor@example.com', endpoint:'', auth_type:'', auth_value:'' }
    ];
    saveVendors(demo);
  }
  renderVendors();
})();

// ===== Spare Parts Management (robust replacement) =====
(function(){

  // elements
  const sparesTbody = document.querySelector('#sparesTable tbody');
  const poTbody = document.querySelector('#poTable tbody');
  const suppliersList = document.getElementById('suppliersList');
  const spareSearch = document.getElementById('spareSearch');
  const spareToast = document.getElementById('spareToast');

  // modal elems
  const spareModal = document.getElementById('spareModal');
  const spareModalTitle = document.getElementById('spareModalTitle');
  const m_code = document.getElementById('m_code');
  const m_name = document.getElementById('m_name');
  const m_supplier = document.getElementById('m_supplier');
  const m_stock = document.getElementById('m_stock');
  const m_min = document.getElementById('m_min');
  const m_location = document.getElementById('m_location');
  const m_desc = document.getElementById('m_desc');
  const spareModalCancel = document.getElementById('spareModalCancel');
  const spareModalSave = document.getElementById('spareModalSave');

  const supplierModal = document.getElementById('supplierModal');
  const supplierModalTitle = document.getElementById('supplierModalTitle');
  const s_name = document.getElementById('s_name');
  const s_email = document.getElementById('s_email');
  const s_endpoint = document.getElementById('s_endpoint');
  const supplierCancel = document.getElementById('supplierCancel');
  const supplierSave = document.getElementById('supplierSave');

  // utility helpers
  function load(key, fallback){ try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch(e){ return fallback; } }
  function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function notify(msg, timeout=2200){
    if(!spareToast) return;
    spareToast.textContent = msg; spareToast.style.display = 'block';
    setTimeout(()=> spareToast.style.display = 'none', timeout);
  }
  function uid(prefix='ID'){ return prefix + '-' + Math.random().toString(36).slice(2,8).toUpperCase(); }
  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }

  // data getters
  function saveSpares(list){ save(SPARES_KEY, list); }
  function saveSuppliers(list){ save(SUPPLIERS_KEY, list); }
  function loadPOs(){ return load(PO_KEY, []); }
  function savePOs(list){ save(PO_KEY, list); }

  // render suppliers list (right column)
  function renderSuppliers(){
    const list = JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || "[]");
    suppliersList.innerHTML = '';
    if(list.length === 0){
      suppliersList.innerHTML = '<div style="color:#666">No suppliers defined. Add one.</div>';
      return;
    }
    list.forEach(s => {
      const div = document.createElement('div');
      div.style.padding = '6px 0';
      div.innerHTML = `<div style="font-weight:600">${escapeHtml(s.name)}</div>
                       <div style="font-size:12px;color:#444">${escapeHtml(s.email||'')} ${s.endpoint?'<div style="font-size:11px;color:#888">['+escapeHtml(s.endpoint)+']</div>':''}</div>
                       <div style="margin-top:6px"><button type="button" class="sp-btn sp-edit-supplier" data-id="${s.id}">Edit</button>
                       <button type="button" class="sp-btn sp-del-supplier" data-id="${s.id}">Delete</button></div>`;
      suppliersList.appendChild(div);
    });
  }

  // fill supplier select in spare modal
  function populateSupplierSelect(){
    const list = JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || "[]");
    m_supplier.innerHTML = '<option value="">-- None --</option>';
    list.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id; opt.text = s.name;
      m_supplier.appendChild(opt);
    });
  }

  // render spares table
  function renderSpares(filter=''){
    const list = JSON.parse(localStorage.getItem(SPARES_KEY) || "[]");
    const suppliers = JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || "[]");
    const f = filter.trim().toLowerCase();
    sparesTbody.innerHTML = '';
    list.filter(sp => {
      if(!f) return true;
      return (sp.code||'').toLowerCase().includes(f) || (sp.name||'').toLowerCase().includes(f) || (getSupplierName(sp.supplierId)||'').toLowerCase().includes(f);
    }).forEach(sp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(sp.code)}</td>
                      <td>${escapeHtml(sp.name)}</td>
                      <td>${escapeHtml(getSupplierName(sp.supplierId))}</td>
                      <td>${Number(sp.stockQty||0)}</td>
                      <td>${Number(sp.minStock||0)}</td>
                      <td>${escapeHtml(sp.location||'')}</td>
                      <td>
                        <button type="button" class="sp-btn" data-action="edit" data-id="${sp.id}">Edit</button>
                        <button type="button" class="sp-btn" data-action="delete" data-id="${sp.id}">Delete</button>
                      </td>`;
      sparesTbody.appendChild(tr);
    });
  }

  function getSupplierName(id){ const s = JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || "[]").find(x=> x.id === id); return s ? s.name : '—'; }

  // render POs (recent first)



  // open/close modals
  let currentSpareId = null;
  function openSpareModal(spareId){
    currentSpareId = spareId || null;
    populateSupplierSelect();
    if(spareId){
      spareModalTitle.textContent = 'Edit Spare';
      const spares = JSON.parse(localStorage.getItem(SPARES_KEY) || "[]");
      const sp = spares.find(s => s.id === spareId);

      if(!sp) return;
      m_code.value = sp.code || '';
      m_name.value = sp.name || '';
      m_supplier.value = sp.supplierId || '';
      m_stock.value = sp.stockQty || 0;
      m_min.value = sp.minStock || 0;
      m_location.value = sp.location || '';
      m_desc.value = sp.description || '';
    } else {
      spareModalTitle.textContent = 'Add Spare';
      m_code.value = ''; m_name.value=''; m_supplier.value=''; m_stock.value=0; m_min.value=0; m_location.value=''; m_desc.value='';
    }
    spareModal.style.display = 'flex';
  }
  function closeSpareModal(){ spareModal.style.display = 'none'; currentSpareId = null; }

  // supplier modal
  let currentSupplierId = null;
  function openSupplierModal(supplierId){
    currentSupplierId = supplierId || null;
    if(supplierId){
      supplierModalTitle.textContent = 'Edit Supplier';
      const s = JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || "[]").find(x=> x.id === supplierId);
      if(!s) return;
      s_name.value = s.name || '';
      s_email.value = s.email || '';
      s_endpoint.value = s.endpoint || '';
    } else {
      supplierModalTitle.textContent = 'Add Supplier';
      s_name.value=''; s_email.value=''; s_endpoint.value='';
    }
    supplierModal.style.display = 'flex';
  }
  function closeSupplierModal(){ supplierModal.style.display = 'none'; currentSupplierId = null; }

  // save spare from modal
  spareModalSave.addEventListener('click', function(){
    const code = m_code.value.trim();
    const name = m_name.value.trim();
    if(!code || !name){ alert('Code and Name are required'); return; }
    const supplierId = m_supplier.value || '';
    const spList = JSON.parse(localStorage.getItem(SPARES_KEY) || "[]");
    if(currentSpareId){
      // update
      const sp = spList.find(s=> s.id === currentSpareId);
      if(!sp) return;
      sp.code = code; sp.name = name; sp.supplierId = supplierId;
      sp.stockQty = Number(m_stock.value) || 0; sp.minStock = Number(m_min.value) || 0;
      sp.location = m_location.value || ''; sp.description = m_desc.value || '';
      saveSpares(spList);
      notify('Spare updated');
      audit && audit('Spare updated: '+sp.code);
    } else {
      // create
      const sp = { id: uid('SP'), code, name, supplierId, stockQty: Number(m_stock.value)||0, minStock: Number(m_min.value)||0, location:m_location.value||'', description:m_desc.value||'' };
      spList.push(sp); saveSpares(spList);
      notify('Spare created');
      audit && audit('Spare created: '+sp.code);
    }
    closeSpareModal(); renderSpares(spareSearch.value);renderSuppliers();
  });
  spareModalCancel.addEventListener('click', closeSpareModal);
  supplierCancel.addEventListener('click', closeSupplierModal);

  // supplier save
  supplierSave.addEventListener('click', function(){
    const name = s_name.value.trim();
    if(!name){ alert('Supplier name required'); return; }
    const list = JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || "[]");
    if(currentSupplierId){
      const s = list.find(x=> x.id === currentSupplierId);
      if(!s) return;
      s.name = name; s.email = s_email.value.trim(); s.endpoint = s_endpoint.value.trim();
      saveSuppliers(list); notify('Supplier updated'); audit && audit('Supplier updated: '+s.name);
    } else {
      const s = { id: uid('V'), name, email: s_email.value.trim(), endpoint: s_endpoint.value.trim() };
      list.push(s); saveSuppliers(list); notify('Supplier created'); audit && audit('Supplier created: '+s.name);
    }
    closeSupplierModal(); populateSupplierSelect(); renderSuppliers(); renderSpares(spareSearch.value);
  });

  // deletion functions
  function deleteSpare(id){
    if(!confirm('Delete spare?')) return;
    const arr = JSON.parse(localStorage.getItem(SPARES_KEY) || "[]")
  .filter(s => s.id !== id);
    saveSpares(arr); renderSpares(spareSearch.value); notify('Spare deleted'); audit && audit('Spare deleted: '+id);
  }

  function deleteSupplier(id){
    if(!confirm('Delete supplier? This will not delete related spares automatically.')) return;
    const arr = JSON.parse(localStorage.getItem(SUPPLIERS_KEY) || "[]").filter(s=> s.id !== id);
    saveSuppliers(arr); renderSuppliers(); populateSupplierSelect(); renderSpares(spareSearch.value); notify('Supplier deleted'); audit && audit('Supplier deleted: '+id);
  }

  





  // delegate click handlers for spares + suppliers
  document.addEventListener('click', function(e){
    const btn = e.target.closest && e.target.closest('.sp-btn, .sp-edit-supplier, .sp-del-supplier, button[data-action], #addSpareBtn, #addSupplierBtn');
    if(!btn) return;
    // prevent other global handlers
    e.preventDefault(); e.stopPropagation();

    // spare table buttons
    if(btn.id === 'addSpareBtn'){ openSpareModal(null); return; }
    if(btn.id === 'addSupplierBtn'){ openSupplierModal(null); return; }

    // supplier small buttons
    if(btn.classList.contains('sp-edit-supplier')){
      const id = btn.getAttribute('data-id'); openSupplierModal(id); return;
    }
    if(btn.classList.contains('sp-del-supplier')){
      const id = btn.getAttribute('data-id'); deleteSupplier(id); return;
    }

    // sp-btn actions
    if(btn.classList.contains('sp-btn')){
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if(action === 'edit'){ openSpareModal(id); return; }
      if(action === 'delete'){ deleteSpare(id); return; }
    }
  });

  // search filter
  spareSearch.addEventListener('input', function(){ renderSpares(spareSearch.value); });

  // keyboard escape for modals
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      if(spareModal.style.display === 'flex') closeSpareModal();
      if(supplierModal.style.display === 'flex') closeSupplierModal();
    }
  });

  // initial seeding if empty
function seedIfEmpty(){

  if(!localStorage.getItem(SUPPLIERS_KEY)){
    saveSuppliers([
      { id:'V-1', name:'Demo Supplier Ltd', email:'vendor@example.com', endpoint:'' }
    ]);
  }

  if(!localStorage.getItem(SPARES_KEY)){
    saveSpares([
      { id:'SP-01', code:'ABC-001', name:'Filter Model A', supplierId:'V-1',
        stockQty:5, minStock:2, location:'Store A', description:'Demo filter' }
    ]);
  }

  if(!localStorage.getItem(PO_KEY)){
    savePOs([]);
  }
}


  // expose small API if needed
  window.cmmsSpareAPI = { openSpareModal, openSupplierModal, renderSpares, renderSuppliers}; // optional
})();

/* =====================================================
   HELPER FUNCTIONS (LOAD / SAVE)
===================================================== */

function load(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* =====================================================
   EQUIPMENT
===================================================== */
/*function renderEquipment() {
  const tbody = document.querySelector("#equipmentTable tbody");
  if (!tbody) return;

  const data = loadEquipment(); // ✅ التعديل هنا
  tbody.innerHTML = "";

  data.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.id}</td>
      <td>${e.category}</td>
      <td>${e.model}</td>
      <td>${e.serial}</td>
      <td>${e.location}</td>
      <td>${e.risk}</td>
      <td>${e.age}</td>
      <td>${e.warranty}</td>
      <td>${e.next_pm}</td>
    `;
    tbody.appendChild(tr);
  });
}*/

/* =====================================================
   WORK ORDERS
===================================================== */
function renderWO() {
  const tbody = document.querySelector("#woTable tbody");
  if (!tbody) return;
  const data = load("workorders");
  tbody.innerHTML = "";
  data.forEach((w, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${w.wo}</td>
        <td>${w.type}</td>
        <td>${w.equip}</td>
        <td>${w.status}</td>
        <td>${w.tech}</td>
        <td><button onclick="deleteWO(${i})">Delete</button></td>
      </tr>`;
  });
}
function deleteWO(i) {
  const d = load("workorders");
  d.splice(i,1); save("workorders",d); renderWO();
}

/* =====================================================
   PM
===================================================== */
function renderPM() {
  const tbody = document.querySelector("#pmTable tbody");
  if (!tbody) return;
  const data = load("pm");
  tbody.innerHTML = "";
  data.forEach((p,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${p.equip}</td>
        <td>${p.interval}</td>
        <td>${p.next_due}</td>
      </tr>`;
  });
}

/* =====================================================
   CM
===================================================== */
function renderCM() {
  const tbody = document.querySelector("#cmTable tbody");
  if (!tbody) return;
  const data = load("cm");
  tbody.innerHTML = "";
  data.forEach((c,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${c.equip}</td>
        <td>${c.failure}</td>
        <td>${c.action}</td>
        <td>${c.parts}</td>
        <td>${c.response}</td>
      </tr>`;
  });
}

/* =====================================================
   PDM
===================================================== */
function renderPDM() {
  const tbody = document.querySelector("#pdmTable tbody");
  if (!tbody) return;
  const data = load("pdm");
  tbody.innerHTML = "";
  data.forEach((p,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${p.equip}</td>
        <td>${p.cond}</td>
        <td>${p.status}</td>
      </tr>`;
  });
}

/* =====================================================
   SPARES
===================================================== */
function renderSpares() {
  const tbody = document.querySelector("#sparesTable tbody");
  if (!tbody) return;
  const data = load("spares");
  tbody.innerHTML = "";
  data.forEach((s,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${s.code}</td>
        <td>${s.name}</td>
        <td>${s.supplier}</td>
        <td>${s.stock}</td>
        <td>${s.min}</td>
        <td>${s.location}</td>
        <td><button onclick="deleteSpare(${i})">Delete</button></td>
      </tr>`;
  });
}
function deleteSpare(i){
  const d = load("spares");
  d.splice(i,1); save("spares",d); renderSpares();
}

/* =====================================================
   PURCHASE ORDERS
===================================================== */
function renderPO() {
  const tbody = document.querySelector("#poTable tbody");
  if (!tbody) return;
  const data = load("po");
  tbody.innerHTML = "";
  data.forEach((p,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.spare}</td>
        <td>${p.qty}</td>
        <td>${p.supplier}</td>
        <td>${p.status}</td>
        <td>${p.created}</td>
        <td><button onclick="deletePO(${i})">Delete</button></td>
      </tr>`;
  });
}
function deletePO(i){
  const d = load("po");
  d.splice(i,1); save("po",d); renderPO();
}

/* =====================================================
   USERS
===================================================== */
/*function renderUsers() {
  const tbody = document.querySelector("#usersTable tbody");
  if (!tbody) return;
  const data = load("users");
  tbody.innerHTML = "";
  data.forEach((u,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${u.email}</td>
        <td>${u.name}</td>
        <td>${u.role}</td>
        <td><button onclick="deleteUser(${i})">Delete</button></td>
      </tr>`;
  });
}
function deleteUser(i){
  const d = load("users");
  d.splice(i,1); save("users",d); renderUsers();
}*/

/* =====================================================
   VENDORS
===================================================== */
/*function renderVendors() {
  const tbody = document.querySelector("#vendorsTable tbody");
  if (!tbody) return;
  const data = load("vendors");
  tbody.innerHTML = "";
  data.forEach((v,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${v.code}</td>
        <td>${v.name}</td>
        <td>${v.contact}</td>
        <td>${v.endpoint}</td>
        <td>${v.auth}</td>
        <td><button onclick="deleteVendor(${i})">Delete</button></td>
      </tr>`;
  });
}
function deleteVendor(i){
  const d = load("vendors");
  d.splice(i,1); save("vendors",d); renderVendors();
}*/

/* =====================================================
   INTEGRATIONS
===================================================== */
/*
function renderIntegrations() {
  const tbody = document.querySelector("#integrationsTable tbody");
  if (!tbody) return;
  const data = load("integrations");
  tbody.innerHTML = "";
  data.forEach((x,i)=>{
    tbody.innerHTML += `
      <tr>
        <td>${x.system}</td>
        <td>${x.name}</td>
        <td>${x.protocol}</td>
        <td>${x.endpoint}</td>
        <td>${x.auth}</td>
        <td><button onclick="deleteIntegration(${i})">Delete</button></td>
      </tr>`;
  });
}
function deleteIntegration(i){
  const d = load("integrations");
  d.splice(i,1); save("integrations",d); renderIntegrations();
}*/

/* =====================================================
   LOAD ALL TABLES ON PAGE LOAD
===================================================== */
document.addEventListener("DOMContentLoaded", function(){
  renderEquipment();
  renderWO();
  renderPM();
  renderCM();
  renderPDM();
  renderSpares();
  renderPO();
  renderUsers();
  renderVendors();
  renderIntegrations();
});
function computeDashboardKPIs() {

  const equipment = loadEquipment();
  const cms = loadCMLogs();
  const pms = loadPMLogs();

  const totalDevices = equipment.length;

  /* ========= MTTR ========= */
  let mttrSum = 0;
  let mttrCount = 0;

  equipment.forEach(eq => {
    const cm = calcCMKPIs(eq.id);
    if (cm.mttr !== "—") {
      mttrSum += Number(cm.mttr);
      mttrCount++;
    }
  });

  const avgMTTR = mttrCount ? (mttrSum / mttrCount).toFixed(2) : "—";

  /* ========= MTBF ========= */
  const closedCMs = cms.filter(c => c.end);
  let mtbf = "—";
  if (closedCMs.length > 1) {
    const times = closedCMs
      .map(c => c.start)
      .sort((a,b)=>a-b);
    const diffs = [];
    for (let i=1;i<times.length;i++){
      diffs.push((times[i]-times[i-1]) / 86400000);
    }
    mtbf = (diffs.reduce((a,b)=>a+b,0) / diffs.length).toFixed(1);
  }

  /* ========= PM Compliance ========= */
  const totalPMs = pms.length;
  const completedPMs = pms.filter(p => p.completedDate).length;
  const pmCompliance =
    totalPMs ? ((completedPMs / totalPMs) * 100).toFixed(1) + "%" : "—";

  /* ========= Downtime % ========= */
  let totalDowntime = 0;
  cms.forEach(c => {
    if (c.end) totalDowntime += (c.end - c.start);
  });

  const downtimeHours = totalDowntime / 3600000;
  const downtimePercent =
    totalDevices
      ? ((downtimeHours / (totalDevices * 24 * 365)) * 100).toFixed(2)
      : "—";

  /* ========= Cost / Device / Year ========= */
  const costPerDevice =
    totalDevices
      ? Math.round(
          equipment.reduce((s,e)=>s+(Number(e.annualCost)||0),0)
          / totalDevices
        )
      : "—";

  /* ========= Profiles ========= */
  const completeProfiles = equipment.filter(
    e => e.category && e.model && e.serial && e.location
  ).length;

  const completeProfilesPct =
    totalDevices
      ? Math.round((completeProfiles / totalDevices) * 100)
      : "—";

  return {
    mtbf,
    avgMTTR,
    pmCompliance,
    downtimePercent,
    costPerDevice,
    totalDevices,
    completeProfilesPct,
    incompleteProfiles: totalDevices - completeProfiles
  };
}
function calcDowntimeImprovement() {
  const cms = loadCMLogs().filter(c => c.end);

  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const endLastMonth = startThisMonth;

  let lastMonthDT = 0;
  let thisMonthDT = 0;

  cms.forEach(c => {
    const dur = c.end - c.start;
    if (c.end >= startLastMonth && c.end < endLastMonth) lastMonthDT += dur;
    if (c.end >= startThisMonth) thisMonthDT += dur;
  });

  if (lastMonthDT === 0) return "—";

  const improvement = ((lastMonthDT - thisMonthDT) / lastMonthDT) * 100;
  return improvement.toFixed(1) + "%";
}
function calcReplacementAlerts() {
  const equipment = loadEquipment();
  const cms = loadCMLogs().filter(c => c.end);
  const pdms = loadPDMLogs();

  const since = Date.now() - (90 * 24 * 3600000); // آخر 90 يومًا
  let alerts = 0;

  equipment.forEach(eq => {
    const cmCount = cms.filter(
      c => c.equipment_id === eq.id && c.end >= since
    ).length;

    const lastPdm = pdms
      .filter(p => p.equipment_id === eq.id)
      .sort((a,b)=>b.date - a.date)[0];

    const pdmCritical = lastPdm && lastPdm.value < lastPdm.threshold;

    if (cmCount >= 3 || pdmCritical) alerts++;
  });

  return alerts;
}

function renderDashboardKPIs() {

  const k = computeDashboardKPIs();

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  /* ===== Dashboard KPIs ===== */
  set("kpi_mtbf", k.mtbf);
  set("kpi_mttr", k.avgMTTR);
  set("kpi_pmcomp", k.pmCompliance);
  set("kpi_downtime", k.downtimePercent);
  set("kpi_cost", k.costPerDevice);

  /* ===== Technical Outcomes ===== */
  set("tech_total_devices", k.totalDevices);
  set("tech_complete_profiles", k.completeProfilesPct + "%");
  set("tech_incomplete_profiles", k.incompleteProfiles);
  set("tech_dt_improvement", "—");          // يحتاج baseline
  set("tech_replacement_alerts", "—");      // يحتاج spare thresholds
  set("tech_regulatory", "Compliant");      // افتراضي منطقي
  set("tech_dt_improvement", calcDowntimeImprovement());
  set("tech_replacement_alerts", calcReplacementAlerts());

}
renderDashboardKPIs();

  }catch(err){ console.error('Fatal error:', err); }
})();