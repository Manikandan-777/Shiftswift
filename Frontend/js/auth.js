/**
 * ============================================================
 * ShiftSwift - Authentication Module (auth.js)
 * Handles JWT token management, login/logout, role checks
 * ============================================================
 */

const Auth = (() => {
  /** Save auth data from JWT login response */
  function saveSession(jwtResponse) {
    localStorage.setItem(CONFIG.TOKEN_KEY, jwtResponse.token);
    localStorage.setItem(CONFIG.USER_KEY, jwtResponse.username);
    localStorage.setItem(CONFIG.ROLE_KEY, jwtResponse.role);
  }

  /** Retrieve the stored JWT token */
  function getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
  }

  /** Retrieve the stored username */
  function getUser() {
    return localStorage.getItem(CONFIG.USER_KEY);
  }

  /** Retrieve the stored role */
  function getRole() {
    return localStorage.getItem(CONFIG.ROLE_KEY);
  }

  /** Check if user is currently authenticated */
  function isAuthenticated() {
    return !!getToken();
  }

  /** Check if current user is ROLE_ADMIN */
  function isAdmin() {
    return getRole() === "ROLE_ADMIN";
  }

  /** Clear all session data and redirect to login */
  function logout() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    localStorage.removeItem(CONFIG.ROLE_KEY);
    window.location.href = "login.html";
  }

  /**
   * Guard for protected pages.
   * Call at top of every page that requires auth.
   * Optionally require admin role.
   */
  function requireAuth(adminOnly = false) {
    if (!isAuthenticated()) {
      window.location.href = "login.html";
      return false;
    }
    if (adminOnly && !isAdmin()) {
      Utils.showToast("Access denied: Admin only.", "danger");
      setTimeout(() => (window.location.href = "dashboard.html"), 1500);
      return false;
    }
    return true;
  }

  /** Build the Authorization header value */
  function authHeader() {
    return `Bearer ${getToken()}`;
  }

  return {
    saveSession,
    getToken,
    getUser,
    getRole,
    isAuthenticated,
    isAdmin,
    logout,
    requireAuth,
    authHeader,
  };
})();
