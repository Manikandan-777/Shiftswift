/**
 * ============================================================
 * ShiftSwift - Main App JS (app.js)
 * Page-specific logic loader. Each page calls its init().
 * ============================================================
 */

// ============================================================
// Dashboard Page
// ============================================================
const DashboardPage = (() => {
  let allUsers = [], allShifts = [], allAttendance = [], allLeaves = [];

  async function init() {
    Auth.requireAuth();
    Utils.populateNavUser();
    Utils.highlightNav();
    setupLogout();
    applyAdminUI();
    await loadStats();
    renderRecentAttendance();
    renderRecentLeaves();
  }

  function setupLogout() {
    document.getElementById("btn-logout")?.addEventListener("click", Auth.logout);
  }

  function applyAdminUI() {
    if (Auth.isAdmin()) {
      document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("d-none"));
    }
  }

  async function loadStats() {
    Utils.showLoading(true);
    try {
      const [users, shifts, attendance, leaves] = await Promise.all([
        Auth.isAdmin() ? API.getUsers() : Promise.resolve([]),
        API.getShifts(),
        API.getAttendance(),
        API.getLeaves(),
      ]);
      allUsers = users || [];
      allShifts = shifts || [];
      allAttendance = attendance || [];
      allLeaves = leaves || [];

      setStatCard("stat-users",      allUsers.length);
      setStatCard("stat-shifts",     allShifts.length);
      setStatCard("stat-attendance", allAttendance.length);
      setStatCard("stat-leaves",     allLeaves.filter(l => l.status === "PENDING").length);
    } catch (err) {
      Utils.showToast("Error loading dashboard: " + err.message, "danger");
    } finally {
      Utils.showLoading(false);
    }
  }

  function setStatCard(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderRecentAttendance() {
    const tbody = document.getElementById("recent-attendance-body");
    if (!tbody) return;
    const recent = allAttendance.slice(-5).reverse();
    if (!recent.length) { tbody.innerHTML = Utils.emptyRow(4); return; }
    tbody.innerHTML = recent.map(a => `
      <tr>
        <td>${a.id}</td>
        <td>${a.user?.username || "—"}</td>
        <td>${Utils.formatDateTime(a.checkIn)}</td>
        <td>${a.checkOut ? Utils.formatDateTime(a.checkOut) : '<span class="badge text-bg-warning">Active</span>'}</td>
      </tr>`).join("");
  }

  function renderRecentLeaves() {
    const tbody = document.getElementById("recent-leaves-body");
    if (!tbody) return;
    const recent = allLeaves.slice(-5).reverse();
    if (!recent.length) { tbody.innerHTML = Utils.emptyRow(4); return; }
    tbody.innerHTML = recent.map(l => `
      <tr>
        <td>${l.id}</td>
        <td>${l.user?.username || "—"}</td>
        <td>${Utils.formatDate(l.startDate)} – ${Utils.formatDate(l.endDate)}</td>
        <td>${Utils.statusBadge(l.status)}</td>
      </tr>`).join("");
  }

  return { init };
})();

// ============================================================
// Departments Page
// ============================================================
const DepartmentsPage = (() => {
  let all = [], filtered = [], currentPage = 1;
  const PAGE_SIZE = 8;
  let editingId = null;

  async function init() {
    Auth.requireAuth();
    Utils.populateNavUser();
    Utils.highlightNav();
    document.getElementById("btn-logout")?.addEventListener("click", Auth.logout);
    applyAdminUI();
    await load();
    bindSearch();
    bindForm();
  }

  function applyAdminUI() {
    if (!Auth.isAdmin()) {
      document.querySelectorAll(".admin-only").forEach(el => el.classList.add("d-none"));
    }
  }

  async function load() {
    Utils.showLoading(true);
    try {
      all = await API.getDepartments();
      filtered = [...all];
      render();
    } catch (err) {
      Utils.showToast("Failed to load departments: " + err.message, "danger");
    } finally {
      Utils.showLoading(false);
    }
  }

  function render() {
    const { data, page, totalPages, total } = Utils.paginate(filtered, currentPage, PAGE_SIZE);
    currentPage = page;
    const tbody = document.getElementById("dept-table-body");
    if (!data.length) { tbody.innerHTML = Utils.emptyRow(4); }
    else {
      tbody.innerHTML = data.map((d, i) => `
        <tr>
          <td>${(page - 1) * PAGE_SIZE + i + 1}</td>
          <td class="fw-semibold">${d.name}</td>
          <td>${d.description || "<span class='text-muted'>—</span>"}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${d.id}" title="Edit">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${d.id}" title="Delete">
              <i class="bi bi-trash3"></i>
            </button>
          </td>
        </tr>`).join("");
    }

    const pgEl = document.getElementById("dept-pagination");
    if (pgEl) {
      pgEl.innerHTML = Utils.paginationHtml(currentPage, totalPages);
      Utils.bindPagination("dept-pagination", (p) => { currentPage = p; render(); });
    }

    document.getElementById("dept-count").textContent =
      `Showing ${data.length} of ${total} records`;

    // Bind row action buttons
    tbody.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", () => openEdit(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => deleteDept(parseInt(btn.dataset.id)));
    });
  }

  function bindSearch() {
    document.getElementById("dept-search")?.addEventListener("input", (e) => {
      filtered = Utils.filterByQuery(all, e.target.value, ["name", "description"]);
      currentPage = 1;
      render();
    });
  }

  function bindForm() {
    document.getElementById("dept-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Utils.validateForm("dept-form")) return;

      const name = document.getElementById("dept-name").value.trim();
      const description = document.getElementById("dept-desc").value.trim();
      Utils.showLoading(true);
      try {
        if (editingId) {
          await API.updateDepartment(editingId, { name, description });
          Utils.showToast("Department updated successfully!", "success");
        } else {
          await API.createDepartment({ name, description });
          Utils.showToast("Department created successfully!", "success");
        }
        closeModal();
        await load();
      } catch (err) {
        Utils.showToast(err.message, "danger");
      } finally {
        Utils.showLoading(false);
      }
    });

    document.getElementById("btn-add-dept")?.addEventListener("click", openAdd);
  }

  function openAdd() {
    editingId = null;
    Utils.resetForm("dept-form");
    document.getElementById("dept-modal-title").textContent = "Add Department";
    new bootstrap.Modal(document.getElementById("dept-modal")).show();
  }

  function openEdit(id) {
    editingId = id;
    const d = all.find(x => x.id === id);
    if (!d) return;
    document.getElementById("dept-name").value = d.name;
    document.getElementById("dept-desc").value = d.description || "";
    document.getElementById("dept-modal-title").textContent = "Edit Department";
    new bootstrap.Modal(document.getElementById("dept-modal")).show();
  }

  function closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById("dept-modal"));
    modal?.hide();
    Utils.resetForm("dept-form");
    editingId = null;
  }

  async function deleteDept(id) {
    const ok = await Utils.confirm("This will permanently delete the department.");
    if (!ok) return;
    Utils.showLoading(true);
    try {
      await API.deleteDepartment(id);
      Utils.showToast("Department deleted.", "success");
      await load();
    } catch (err) {
      Utils.showToast(err.message, "danger");
    } finally {
      Utils.showLoading(false);
    }
  }

  return { init };
})();

// ============================================================
// Shifts Page
// ============================================================
const ShiftsPage = (() => {
  let all = [], filtered = [], currentPage = 1, departments = [];
  const PAGE_SIZE = 8;
  let editingId = null;

  async function init() {
    Auth.requireAuth();
    Utils.populateNavUser();
    Utils.highlightNav();
    document.getElementById("btn-logout")?.addEventListener("click", Auth.logout);
    applyAdminUI();
    await loadDepts();
    await load();
    bindSearch();
    bindForm();
  }

  function applyAdminUI() {
    if (!Auth.isAdmin()) {
      document.querySelectorAll(".admin-only").forEach(el => el.classList.add("d-none"));
    }
  }

  async function loadDepts() {
    departments = await API.getDepartments();
    const sel = document.getElementById("shift-dept");
    if (sel) {
      sel.innerHTML = `<option value="">Select Department</option>` +
        departments.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
    }
  }

  async function load() {
    Utils.showLoading(true);
    try {
      all = await API.getShifts();
      filtered = [...all];
      render();
    } catch (err) {
      Utils.showToast("Failed to load shifts: " + err.message, "danger");
    } finally {
      Utils.showLoading(false);
    }
  }

  function render() {
    const { data, page, totalPages, total } = Utils.paginate(filtered, currentPage, PAGE_SIZE);
    currentPage = page;
    const tbody = document.getElementById("shift-table-body");
    if (!data.length) { tbody.innerHTML = Utils.emptyRow(7); }
    else {
      tbody.innerHTML = data.map((s, i) => `
        <tr>
          <td>${(page - 1) * PAGE_SIZE + i + 1}</td>
          <td class="fw-semibold">${s.title || "—"}</td>
          <td>${Utils.formatDate(s.date)}</td>
          <td>${s.startTime || "—"}</td>
          <td>${s.endTime || "—"}</td>
          <td>${s.department?.name || "<span class='text-muted'>—</span>"}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${s.id}"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${s.id}"><i class="bi bi-trash3"></i></button>
          </td>
        </tr>`).join("");
    }

    const pgEl = document.getElementById("shift-pagination");
    if (pgEl) {
      pgEl.innerHTML = Utils.paginationHtml(currentPage, totalPages);
      Utils.bindPagination("shift-pagination", (p) => { currentPage = p; render(); });
    }

    document.getElementById("shift-count").textContent = `Showing ${data.length} of ${total} records`;

    tbody.querySelectorAll(".btn-edit").forEach(btn =>
      btn.addEventListener("click", () => openEdit(parseInt(btn.dataset.id))));
    tbody.querySelectorAll(".btn-delete").forEach(btn =>
      btn.addEventListener("click", () => deleteShift(parseInt(btn.dataset.id))));
  }

  function bindSearch() {
    document.getElementById("shift-search")?.addEventListener("input", (e) => {
      filtered = Utils.filterByQuery(all, e.target.value, ["title", "date"]);
      currentPage = 1;
      render();
    });
  }

  function bindForm() {
    document.getElementById("shift-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Utils.validateForm("shift-form")) return;
      const payload = {
        title:     document.getElementById("shift-title").value.trim(),
        date:      document.getElementById("shift-date").value,
        startTime: document.getElementById("shift-start").value,
        endTime:   document.getElementById("shift-end").value,
        department: { id: parseInt(document.getElementById("shift-dept").value) || null },
      };
      Utils.showLoading(true);
      try {
        if (editingId) { await API.updateShift(editingId, payload); Utils.showToast("Shift updated!", "success"); }
        else { await API.createShift(payload); Utils.showToast("Shift created!", "success"); }
        closeModal();
        await load();
      } catch (err) { Utils.showToast(err.message, "danger"); }
      finally { Utils.showLoading(false); }
    });

    document.getElementById("btn-add-shift")?.addEventListener("click", openAdd);
  }

  function openAdd() {
    editingId = null;
    Utils.resetForm("shift-form");
    document.getElementById("shift-modal-title").textContent = "Add Shift";
    new bootstrap.Modal(document.getElementById("shift-modal")).show();
  }

  function openEdit(id) {
    editingId = id;
    const s = all.find(x => x.id === id);
    if (!s) return;
    document.getElementById("shift-title").value = s.title || "";
    document.getElementById("shift-date").value  = s.date  || "";
    document.getElementById("shift-start").value = s.startTime || "";
    document.getElementById("shift-end").value   = s.endTime   || "";
    if (s.department) document.getElementById("shift-dept").value = s.department.id;
    document.getElementById("shift-modal-title").textContent = "Edit Shift";
    new bootstrap.Modal(document.getElementById("shift-modal")).show();
  }

  function closeModal() {
    bootstrap.Modal.getInstance(document.getElementById("shift-modal"))?.hide();
    Utils.resetForm("shift-form");
    editingId = null;
  }

  async function deleteShift(id) {
    if (!await Utils.confirm("Delete this shift?")) return;
    Utils.showLoading(true);
    try { await API.deleteShift(id); Utils.showToast("Shift deleted.", "success"); await load(); }
    catch (err) { Utils.showToast(err.message, "danger"); }
    finally { Utils.showLoading(false); }
  }

  return { init };
})();

// ============================================================
// Attendance Page
// ============================================================
const AttendancePage = (() => {
  let all = [], filtered = [], currentPage = 1;
  const PAGE_SIZE = 10;

  async function init() {
    Auth.requireAuth();
    Utils.populateNavUser();
    Utils.highlightNav();
    document.getElementById("btn-logout")?.addEventListener("click", Auth.logout);
    await load();
    bindSearch();
    bindCheckIn();
    bindCheckOut();
  }

  async function load() {
    Utils.showLoading(true);
    try {
      all = await API.getAttendance();
      filtered = [...all];
      render();
    } catch (err) {
      Utils.showToast("Failed to load attendance: " + err.message, "danger");
    } finally {
      Utils.showLoading(false);
    }
  }

  function render() {
    const { data, page, totalPages, total } = Utils.paginate(filtered, currentPage, PAGE_SIZE);
    currentPage = page;
    const tbody = document.getElementById("att-table-body");
    if (!data.length) { tbody.innerHTML = Utils.emptyRow(5); }
    else {
      tbody.innerHTML = data.map((a, i) => `
        <tr>
          <td>${(page - 1) * PAGE_SIZE + i + 1}</td>
          <td>${a.user?.username || "—"}</td>
          <td>${Utils.formatDateTime(a.checkIn)}</td>
          <td>${a.checkOut ? Utils.formatDateTime(a.checkOut) : '<span class="badge text-bg-warning">In Progress</span>'}</td>
          <td>${calcDuration(a.checkIn, a.checkOut)}</td>
        </tr>`).join("");
    }

    const pgEl = document.getElementById("att-pagination");
    if (pgEl) {
      pgEl.innerHTML = Utils.paginationHtml(currentPage, totalPages);
      Utils.bindPagination("att-pagination", (p) => { currentPage = p; render(); });
    }
    document.getElementById("att-count").textContent = `Showing ${data.length} of ${total} records`;
  }

  function calcDuration(checkIn, checkOut) {
    if (!checkIn || !checkOut) return "—";
    const diff = new Date(checkOut) - new Date(checkIn);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  function bindSearch() {
    document.getElementById("att-search")?.addEventListener("input", (e) => {
      filtered = Utils.filterByQuery(all, e.target.value, ["user"]);
      currentPage = 1;
      render();
    });
  }

  function bindCheckIn() {
    document.getElementById("btn-checkin")?.addEventListener("click", async () => {
      const userId = document.getElementById("att-user-id").value.trim();
      if (!userId) { Utils.showToast("Enter a User ID", "warning"); return; }
      Utils.showLoading(true);
      try {
        await API.checkIn(userId);
        Utils.showToast("Checked in successfully!", "success");
        await load();
      } catch (err) { Utils.showToast(err.message, "danger"); }
      finally { Utils.showLoading(false); }
    });
  }

  function bindCheckOut() {
    document.getElementById("btn-checkout")?.addEventListener("click", async () => {
      const attId = document.getElementById("att-att-id").value.trim();
      if (!attId) { Utils.showToast("Enter an Attendance ID", "warning"); return; }
      Utils.showLoading(true);
      try {
        await API.checkOut(attId);
        Utils.showToast("Checked out successfully!", "success");
        await load();
      } catch (err) { Utils.showToast(err.message, "danger"); }
      finally { Utils.showLoading(false); }
    });
  }

  return { init };
})();

// ============================================================
// Leave Requests Page
// ============================================================
const LeavesPage = (() => {
  let all = [], filtered = [], currentPage = 1;
  const PAGE_SIZE = 8;

  async function init() {
    Auth.requireAuth();
    Utils.populateNavUser();
    Utils.highlightNav();
    document.getElementById("btn-logout")?.addEventListener("click", Auth.logout);
    applyAdminUI();
    await load();
    bindSearch();
    bindFilter();
    bindForm();
  }

  function applyAdminUI() {
    if (!Auth.isAdmin()) {
      document.querySelectorAll(".admin-only").forEach(el => el.classList.add("d-none"));
    }
  }

  async function load() {
    Utils.showLoading(true);
    try {
      all = await API.getLeaves();
      filtered = [...all];
      render();
    } catch (err) {
      Utils.showToast("Failed to load leaves: " + err.message, "danger");
    } finally {
      Utils.showLoading(false);
    }
  }

  function render() {
    const { data, page, totalPages, total } = Utils.paginate(filtered, currentPage, PAGE_SIZE);
    currentPage = page;
    const tbody = document.getElementById("leave-table-body");
    if (!data.length) { tbody.innerHTML = Utils.emptyRow(7); }
    else {
      tbody.innerHTML = data.map((l, i) => `
        <tr>
          <td>${(page - 1) * PAGE_SIZE + i + 1}</td>
          <td>${l.user?.username || "—"}</td>
          <td>${Utils.formatDate(l.startDate)}</td>
          <td>${Utils.formatDate(l.endDate)}</td>
          <td>${l.reason || "—"}</td>
          <td>${Utils.statusBadge(l.status)}</td>
          <td class="admin-only ${Auth.isAdmin() ? "" : "d-none"}">
            <select class="form-select form-select-sm status-sel" data-id="${l.id}" style="min-width:120px">
              <option value="PENDING"  ${l.status === "PENDING"  ? "selected" : ""}>PENDING</option>
              <option value="APPROVED" ${l.status === "APPROVED" ? "selected" : ""}>APPROVED</option>
              <option value="REJECTED" ${l.status === "REJECTED" ? "selected" : ""}>REJECTED</option>
            </select>
          </td>
        </tr>`).join("");
    }

    const pgEl = document.getElementById("leave-pagination");
    if (pgEl) {
      pgEl.innerHTML = Utils.paginationHtml(currentPage, totalPages);
      Utils.bindPagination("leave-pagination", (p) => { currentPage = p; render(); });
    }
    document.getElementById("leave-count").textContent = `Showing ${data.length} of ${total} records`;

    // Status change handler (admin)
    tbody.querySelectorAll(".status-sel").forEach(sel => {
      sel.addEventListener("change", async () => {
        Utils.showLoading(true);
        try {
          await API.updateLeave(sel.dataset.id, sel.value);
          Utils.showToast("Status updated!", "success");
          await load();
        } catch (err) { Utils.showToast(err.message, "danger"); }
        finally { Utils.showLoading(false); }
      });
    });
  }

  function bindSearch() {
    document.getElementById("leave-search")?.addEventListener("input", (e) => {
      applyFilters(e.target.value, document.getElementById("leave-filter").value);
    });
  }

  function bindFilter() {
    document.getElementById("leave-filter")?.addEventListener("change", (e) => {
      applyFilters(document.getElementById("leave-search").value, e.target.value);
    });
  }

  function applyFilters(query, status) {
    let res = Utils.filterByQuery(all, query, ["reason"]);
    if (status) res = res.filter(l => l.status === status);
    filtered = res;
    currentPage = 1;
    render();
  }

  function bindForm() {
    document.getElementById("leave-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!Utils.validateForm("leave-form")) return;
      const userId    = document.getElementById("leave-userid").value.trim();
      const startDate = document.getElementById("leave-start").value;
      const endDate   = document.getElementById("leave-end").value;
      const reason    = document.getElementById("leave-reason").value.trim();
      Utils.showLoading(true);
      try {
        await API.createLeave(userId, { startDate, endDate, reason, status: "PENDING" });
        Utils.showToast("Leave request submitted!", "success");
        bootstrap.Modal.getInstance(document.getElementById("leave-modal"))?.hide();
        Utils.resetForm("leave-form");
        await load();
      } catch (err) { Utils.showToast(err.message, "danger"); }
      finally { Utils.showLoading(false); }
    });

    document.getElementById("btn-add-leave")?.addEventListener("click", () => {
      Utils.resetForm("leave-form");
      new bootstrap.Modal(document.getElementById("leave-modal")).show();
    });
  }

  return { init };
})();

// ============================================================
// Users Page  (Admin only)
// ============================================================
const UsersPage = (() => {
  let all = [], filtered = [], currentPage = 1;
  const PAGE_SIZE = 10;

  async function init() {
    Auth.requireAuth(true); // admin only
    Utils.populateNavUser();
    Utils.highlightNav();
    document.getElementById("btn-logout")?.addEventListener("click", Auth.logout);
    await load();
    bindSearch();
  }

  async function load() {
    Utils.showLoading(true);
    try {
      all = await API.getUsers();
      filtered = [...all];
      render();
    } catch (err) {
      Utils.showToast("Failed to load users: " + err.message, "danger");
    } finally {
      Utils.showLoading(false);
    }
  }

  function render() {
    const { data, page, totalPages, total } = Utils.paginate(filtered, currentPage, PAGE_SIZE);
    currentPage = page;
    const tbody = document.getElementById("user-table-body");
    if (!data.length) { tbody.innerHTML = Utils.emptyRow(5); }
    else {
      tbody.innerHTML = data.map((u, i) => `
        <tr>
          <td>${(page - 1) * PAGE_SIZE + i + 1}</td>
          <td class="fw-semibold">${u.username}</td>
          <td>${u.email}</td>
          <td>${Utils.statusBadge(u.role)}</td>
          <td>${u.department?.name || "<span class='text-muted'>—</span>"}</td>
        </tr>`).join("");
    }

    const pgEl = document.getElementById("user-pagination");
    if (pgEl) {
      pgEl.innerHTML = Utils.paginationHtml(currentPage, totalPages);
      Utils.bindPagination("user-pagination", (p) => { currentPage = p; render(); });
    }
    document.getElementById("user-count").textContent = `Showing ${data.length} of ${total} records`;
  }

  function bindSearch() {
    document.getElementById("user-search")?.addEventListener("input", (e) => {
      filtered = Utils.filterByQuery(all, e.target.value, ["username", "email"]);
      currentPage = 1;
      render();
    });
  }

  return { init };
})();
