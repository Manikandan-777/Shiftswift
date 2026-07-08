/**
 * ============================================================
 * ShiftSwift - API Communication Module (api.js)
 * Centralised Fetch wrapper for all Spring Boot REST calls.
 * ============================================================
 */

const API = (() => {

  /**
   * Core fetch wrapper.
   * Automatically attaches Bearer token and handles errors.
   *
   * @param {string} endpoint  - Relative path e.g. "/api/departments"
   * @param {string} method    - HTTP verb
   * @param {object|null} body - Request body (auto-serialised to JSON)
   * @param {object} extraHeaders - Additional headers
   * @returns {Promise<any>}
   */
  async function request(endpoint, method = "GET", body = null, extraHeaders = {}) {
    const url = CONFIG.BASE_URL + endpoint;

    const headers = {
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    const token = Auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = { method, headers };
    if (body !== null) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    // 204 No-Content: no body to parse
    if (response.status === 204) return null;

    // Attempt to parse JSON
    let data;
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Spring Boot typically sends { message: "..." }
      const msg = (typeof data === "object" && data?.message)
        ? data.message
        : `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(msg);
    }

    return data;
  }

  // ----------------------------------------------------------------
  // Convenience helpers
  // ----------------------------------------------------------------

  const get    = (ep)            => request(ep, "GET");
  const post   = (ep, body)      => request(ep, "POST", body);
  const put    = (ep, body)      => request(ep, "PUT",  body);
  const del    = (ep)            => request(ep, "DELETE");

  // ----------------------------------------------------------------
  // AUTH
  // ----------------------------------------------------------------

  const login    = (credentials) => post(CONFIG.ENDPOINTS.LOGIN,    credentials);
  const register = (data)        => post(CONFIG.ENDPOINTS.REGISTER,  data);

  // ----------------------------------------------------------------
  // USERS  (ROLE_ADMIN)
  // ----------------------------------------------------------------

  const getUsers      = ()     => get(CONFIG.ENDPOINTS.USERS);
  const getUserById   = (id)   => get(CONFIG.ENDPOINTS.USERS + "/" + id);

  // ----------------------------------------------------------------
  // DEPARTMENTS
  // ----------------------------------------------------------------

  const getDepartments    = ()          => get(CONFIG.ENDPOINTS.DEPARTMENTS);
  const createDepartment  = (dept)      => post(CONFIG.ENDPOINTS.DEPARTMENTS, dept);
  const updateDepartment  = (id, dept)  => put(CONFIG.ENDPOINTS.DEPARTMENTS + "/" + id, dept);
  const deleteDepartment  = (id)        => del(CONFIG.ENDPOINTS.DEPARTMENTS + "/" + id);

  // ----------------------------------------------------------------
  // SHIFTS
  // ----------------------------------------------------------------

  const getShifts    = ()            => get(CONFIG.ENDPOINTS.SHIFTS);
  const createShift  = (shift)       => post(CONFIG.ENDPOINTS.SHIFTS, shift);
  const updateShift  = (id, shift)   => put(CONFIG.ENDPOINTS.SHIFTS  + "/" + id, shift);
  const deleteShift  = (id)          => del(CONFIG.ENDPOINTS.SHIFTS  + "/" + id);

  // ----------------------------------------------------------------
  // ATTENDANCE
  // ----------------------------------------------------------------

  const getAttendance = ()             => get(CONFIG.ENDPOINTS.ATTENDANCE);
  const checkIn       = (userId)       => post(`${CONFIG.ENDPOINTS.ATTENDANCE_CHECKIN}?userId=${userId}`);
  const checkOut      = (attendanceId) => post(`${CONFIG.ENDPOINTS.ATTENDANCE_CHECKOUT}?attendanceId=${attendanceId}`);

  // ----------------------------------------------------------------
  // LEAVE REQUESTS
  // ----------------------------------------------------------------

  const getLeaves    = ()                  => get(CONFIG.ENDPOINTS.LEAVES);
  const createLeave  = (userId, leave)     => post(`${CONFIG.ENDPOINTS.LEAVES}?userId=${userId}`, leave);
  const updateLeave  = (id, status)        => put(`${CONFIG.ENDPOINTS.LEAVES}/${id}?status=${status}`);

  return {
    // raw
    get, post, put, del,
    // auth
    login, register,
    // users
    getUsers, getUserById,
    // departments
    getDepartments, createDepartment, updateDepartment, deleteDepartment,
    // shifts
    getShifts, createShift, updateShift, deleteShift,
    // attendance
    getAttendance, checkIn, checkOut,
    // leaves
    getLeaves, createLeave, updateLeave,
  };
})();
