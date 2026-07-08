/**
 * ============================================================
 * ShiftSwift - Utility Module (utils.js)
 * Reusable UI helpers: toasts, loading, modals, formatting
 * ============================================================
 */

const Utils = (() => {

  /* ----------------------------------------------------------
   * Toast Notifications
   * ----------------------------------------------------------*/

  /**
   * Show a Bootstrap toast notification.
   * @param {string} message - Message text
   * @param {string} type - Bootstrap color: 'success'|'danger'|'warning'|'info'
   * @param {number} duration - Auto-hide after ms (default 3500)
   */
  function showToast(message, type = "success", duration = 3500) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container position-fixed top-0 end-0 p-3";
      container.style.zIndex = "9999";
      document.body.appendChild(container);
    }

    const icons = {
      success: "bi-check-circle-fill",
      danger:  "bi-x-circle-fill",
      warning: "bi-exclamation-triangle-fill",
      info:    "bi-info-circle-fill",
    };

    const id = `toast-${Date.now()}`;
    const html = `
      <div id="${id}" class="toast align-items-center text-bg-${type} border-0 shadow-lg" role="alert" aria-live="assertive">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi ${icons[type] || "bi-bell-fill"} fs-5"></i>
            <span>${message}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>`;
    container.insertAdjacentHTML("beforeend", html);

    const toastEl = document.getElementById(id);
    const toast = new bootstrap.Toast(toastEl, { delay: duration });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  }

  /* ----------------------------------------------------------
   * Loading Overlay
   * ----------------------------------------------------------*/

  function showLoading(show = true) {
    let overlay = document.getElementById("loading-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "loading-overlay";
      overlay.innerHTML = `
        <div class="spinner-wrapper">
          <div class="spinner-border text-light" role="status" style="width:3.5rem;height:3.5rem;border-width:.35em;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-light mt-3 fw-semibold">Loading…</p>
        </div>`;
      overlay.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(15,23,42,.65);backdrop-filter:blur(4px);
        display:flex;align-items:center;justify-content:center;
        z-index:9998;flex-direction:column;`;
      document.body.appendChild(overlay);
    }
    overlay.style.display = show ? "flex" : "none";
  }

  /* ----------------------------------------------------------
   * Confirmation Dialog
   * ----------------------------------------------------------*/

  /**
   * Show a Bootstrap modal confirmation dialog.
   * @returns {Promise<boolean>} Resolves true if confirmed
   */
  function confirm(message = "Are you sure you want to delete this record?", title = "Confirm Deletion") {
    return new Promise((resolve) => {
      const id = "confirm-modal";
      let modal = document.getElementById(id);
      if (modal) modal.remove();

      const html = `
        <div class="modal fade" id="${id}" tabindex="-1" data-bs-backdrop="static">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
              <div class="modal-header bg-danger text-white border-0">
                <h5 class="modal-title d-flex align-items-center gap-2">
                  <i class="bi bi-exclamation-triangle-fill"></i> ${title}
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body py-4 px-4 text-center">
                <p class="mb-0 fs-6">${message}</p>
              </div>
              <div class="modal-footer border-0 justify-content-center gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal" id="confirm-cancel">Cancel</button>
                <button type="button" class="btn btn-danger px-4" id="confirm-ok">
                  <i class="bi bi-trash3-fill me-1"></i>Delete
                </button>
              </div>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML("beforeend", html);

      const bsModal = new bootstrap.Modal(document.getElementById(id));
      bsModal.show();

      document.getElementById("confirm-ok").addEventListener("click", () => {
        bsModal.hide();
        resolve(true);
      });
      document.getElementById("confirm-cancel").addEventListener("click", () => {
        bsModal.hide();
        resolve(false);
      });
      document.getElementById(id).addEventListener("hidden.bs.modal", () => {
        document.getElementById(id)?.remove();
      });
    });
  }

  /* ----------------------------------------------------------
   * Date / Time Formatting
   * ----------------------------------------------------------*/

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return "—";
    return new Date(dateTimeStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  /* ----------------------------------------------------------
   * Status Badge
   * ----------------------------------------------------------*/

  function statusBadge(status) {
    const map = {
      PENDING:  ["warning",  "hourglass-split"],
      APPROVED: ["success",  "check-circle-fill"],
      REJECTED: ["danger",   "x-circle-fill"],
      ACTIVE:   ["success",  "circle-fill"],
      INACTIVE: ["secondary","circle"],
      ROLE_ADMIN:  ["primary", "shield-fill"],
      ROLE_EMPLOYEE: ["info",  "person-fill"],
    };
    const [color, icon] = map[status] || ["secondary", "circle"];
    return `<span class="badge text-bg-${color} d-inline-flex align-items-center gap-1">
              <i class="bi bi-${icon}" style="font-size:.7rem;"></i>${status}
            </span>`;
  }

  /* ----------------------------------------------------------
   * Table empty-state row
   * ----------------------------------------------------------*/

  function emptyRow(cols, message = "No records found") {
    return `<tr><td colspan="${cols}" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>${message}
            </td></tr>`;
  }

  /* ----------------------------------------------------------
   * Client-side Search Filter (for data arrays)
   * ----------------------------------------------------------*/

  function filterByQuery(arr, query, fields) {
    const q = query.toLowerCase().trim();
    if (!q) return arr;
    return arr.filter((item) =>
      fields.some((f) => String(item[f] ?? "").toLowerCase().includes(q))
    );
  }

  /* ----------------------------------------------------------
   * Simple Client-side Pagination
   * ----------------------------------------------------------*/

  function paginate(arr, page, pageSize) {
    const total = arr.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      data: arr.slice(start, start + pageSize),
      page: safePage,
      totalPages,
      total,
    };
  }

  function paginationHtml(current, total, onPageClick) {
    if (total <= 1) return "";
    let html = `<nav><ul class="pagination pagination-sm justify-content-center flex-wrap mb-0">`;

    html += `<li class="page-item ${current === 1 ? "disabled" : ""}">
               <a class="page-link" href="#" data-page="${current - 1}">
                 <i class="bi bi-chevron-left"></i>
               </a></li>`;

    for (let i = 1; i <= total; i++) {
      html += `<li class="page-item ${i === current ? "active" : ""}">
                 <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }

    html += `<li class="page-item ${current === total ? "disabled" : ""}">
               <a class="page-link" href="#" data-page="${current + 1}">
                 <i class="bi bi-chevron-right"></i>
               </a></li>`;

    html += `</ul></nav>`;

    // Attach event after insert (caller must do: el.innerHTML = paginationHtml(...))
    // We expose a helper to bind
    return html;
  }

  function bindPagination(containerId, callback) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = parseInt(link.dataset.page);
        if (!isNaN(page)) callback(page);
      });
    });
  }

  /* ----------------------------------------------------------
   * Form Validation Helpers
   * ----------------------------------------------------------*/

  function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    form.classList.add("was-validated");
    return form.checkValidity();
  }

  function resetForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.reset();
    form.classList.remove("was-validated");
  }

  /* ----------------------------------------------------------
   * Navbar active link highlighting
   * ----------------------------------------------------------*/

  function highlightNav() {
    const current = window.location.pathname.split("/").pop();
    document.querySelectorAll(".nav-link").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href === current) link.classList.add("active");
    });
  }

  /* ----------------------------------------------------------
   * Inject username & role into nav
   * ----------------------------------------------------------*/

  function populateNavUser() {
    const userEl = document.getElementById("nav-username");
    const roleEl = document.getElementById("nav-role");
    if (userEl) userEl.textContent = Auth.getUser() || "User";
    if (roleEl) roleEl.textContent = Auth.isAdmin() ? "Administrator" : "Employee";
  }

  return {
    showToast, showLoading, confirm, formatDate, formatDateTime,
    statusBadge, emptyRow, filterByQuery, paginate, paginationHtml,
    bindPagination, validateForm, resetForm, highlightNav, populateNavUser,
  };
})();
