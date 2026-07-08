/**
 * ============================================================
 * ShiftSwift - Global Configuration
 * ============================================================
 * Update BASE_URL to match your Spring Boot backend server.
 * ============================================================
 */

const CONFIG = {
  BASE_URL: "http://localhost:8080",  // <-- Change this to your Spring Boot URL
  TOKEN_KEY: "shiftswift_token",
  USER_KEY: "shiftswift_user",
  ROLE_KEY: "shiftswift_role",

  ENDPOINTS: {
    // Auth
    LOGIN:      "/api/auth/login",
    REGISTER:   "/api/auth/register",

    // Users (ROLE_ADMIN only)
    USERS:      "/api/users",
    USER_BY_ID: "/api/users/{id}",

    // Departments
    DEPARTMENTS: "/api/departments",
    DEPARTMENT:  "/api/departments/{id}",

    // Shifts
    SHIFTS:   "/api/shifts",
    SHIFT:    "/api/shifts/{id}",

    // Attendance
    ATTENDANCE:       "/api/attendance",
    ATTENDANCE_CHECKIN:  "/api/attendance/checkin",
    ATTENDANCE_CHECKOUT: "/api/attendance/checkout",

    // Leaves
    LEAVES: "/api/leaves",
    LEAVE:  "/api/leaves/{id}",
  },
};

Object.freeze(CONFIG);
