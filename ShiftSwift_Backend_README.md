# ShiftSwift Backend

## Project Overview

ShiftSwift is a workforce-management backend built with Spring Boot 3 and Spring Security. It provides secure REST APIs for authentication, department management, shift scheduling, attendance tracking, and leave requests.

This implementation is now complete and runs locally with an embedded H2 database so it can be tested without any external database setup.

---

## Technology Stack

- Java 25
- Spring Boot 3.5.x
- Spring Security
- Spring Data JPA
- H2 Database (local development)
- Maven
- JWT (HS512)
- Lombok
- Bean Validation

---

## Features Implemented

### Authentication
- User registration
- User login
- JWT-based authentication
- BCrypt password hashing
- Role-based authorization

### Workforce Management
- Department management
- Shift management
- Attendance tracking
- Leave request management

### Default Seed User
- Username: admin
- Password: admin123
- Role: ROLE_ADMIN

---

## Project Structure

```text
demo/
├── src/main/java/com/example/demo/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── exception/
│   ├── model/
│   ├── repository/
│   ├── security/
│   └── service/
└── src/main/resources/application.properties
```

---

## Run the Project

From the project folder:

```bash
cd demo
mvn spring-boot:run
```

The application will start at:

```text
http://localhost:8080
```

The H2 console is available at:

```text
http://localhost:8080/h2-console
```

Use these values for the H2 console:

```text
JDBC URL: jdbc:h2:mem:shiftswift
Username: sa
Password: (leave blank)
```
---

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Users

```http
GET /api/users
GET /api/users/{id}
```

### Departments

```http
GET /api/departments
POST /api/departments
PUT /api/departments/{id}
DELETE /api/departments/{id}
```

### Shifts

```http
GET /api/shifts
POST /api/shifts
PUT /api/shifts/{id}
DELETE /api/shifts/{id}
```

### Attendance

```http
POST /api/attendance/checkin?userId=1
POST /api/attendance/checkout?attendanceId=1
GET /api/attendance
```

### Leave Requests

```http
POST /api/leaves?userId=1
GET /api/leaves
PUT /api/leaves/{id}?status=APPROVED
```

---

## How to Test the APIs

### Step 1: Start the application

```bash
cd demo
mvn spring-boot:run
```

The app will run at:

```text
http://localhost:8080
```

### Step 2: Get a JWT token

You need a valid token before testing protected endpoints.

#### 1) Register a user — POST /api/auth/register

Use Postman or cURL:

```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json
```

Body:
```json
{
  "username": "employee1",
  "email": "employee1@example.com",
  "password": "strongPassword123",
  "role": "ROLE_EMPLOYEE"
}
```

cURL:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"employee1","email":"employee1@example.com","password":"strongPassword123","role":"ROLE_EMPLOYEE"}'
```

#### 2) Login — POST /api/auth/login

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json
```

Body:
```json
{
  "username": "employee1",
  "password": "strongPassword123"
}
```

cURL:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"employee1","password":"strongPassword123"}'
```

Copy the returned token and use it in the Authorization header for all protected requests:

```text
Authorization: Bearer <TOKEN>
```

---

## Endpoint-by-Endpoint Test Guide

### 1) Users

#### Get all users — GET /api/users

- Method: GET
- Access: Admin only

Postman:
```http
GET http://localhost:8080/api/users
Authorization: Bearer <TOKEN>
```

cURL:
```bash
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer <TOKEN>"
```

#### Get one user by ID — GET /api/users/{id}

- Method: GET
- Access: Admin only

Example:
```http
GET http://localhost:8080/api/users/1
Authorization: Bearer <TOKEN>
```

cURL:
```bash
curl http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 2) Departments

#### Get all departments — GET /api/departments

- Method: GET
- Access: Any authenticated user

```http
GET http://localhost:8080/api/departments
Authorization: Bearer <TOKEN>
```

cURL:
```bash
curl http://localhost:8080/api/departments \
  -H "Authorization: Bearer <TOKEN>"
```

#### Create department — POST /api/departments

- Method: POST
- Access: Admin only

Body:
```json
{
  "name": "Operations",
  "description": "Operations team"
}
```

cURL:
```bash
curl -X POST http://localhost:8080/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Operations","description":"Operations team"}'
```

#### Update department — PUT /api/departments/{id}

- Method: PUT
- Access: Admin only

Body:
```json
{
  "name": "HR",
  "description": "Human resources team"
}
```

Example:
```http
PUT http://localhost:8080/api/departments/1
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

cURL:
```bash
curl -X PUT http://localhost:8080/api/departments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"HR","description":"Human resources team"}'
```

#### Delete department — DELETE /api/departments/{id}

- Method: DELETE
- Access: Admin only

Example:
```http
DELETE http://localhost:8080/api/departments/1
Authorization: Bearer <TOKEN>
```

cURL:
```bash
curl -X DELETE http://localhost:8080/api/departments/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 3) Shifts

#### Get all shifts — GET /api/shifts

- Method: GET
- Access: Any authenticated user

```http
GET http://localhost:8080/api/shifts
Authorization: Bearer <TOKEN>
```

cURL:
```bash
curl http://localhost:8080/api/shifts \
  -H "Authorization: Bearer <TOKEN>"
```

#### Create shift — POST /api/shifts

- Method: POST
- Access: Admin only

Body:
```json
{
  "date": "2026-07-01",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "title": "Morning Shift",
  "department": {
    "id": 1
  }
}
```

cURL:
```bash
curl -X POST http://localhost:8080/api/shifts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"date":"2026-07-01","startTime":"09:00:00","endTime":"17:00:00","title":"Morning Shift","department":{"id":1}}'
```

#### Update shift — PUT /api/shifts/{id}

- Method: PUT
- Access: Admin only

Body:
```json
{
  "date": "2026-07-02",
  "startTime": "10:00:00",
  "endTime": "18:00:00",
  "title": "Updated Shift",
  "department": {
    "id": 1
  }
}
```

cURL:
```bash
curl -X PUT http://localhost:8080/api/shifts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"date":"2026-07-02","startTime":"10:00:00","endTime":"18:00:00","title":"Updated Shift","department":{"id":1}}'
```

#### Delete shift — DELETE /api/shifts/{id}

- Method: DELETE
- Access: Admin only

cURL:
```bash
curl -X DELETE http://localhost:8080/api/shifts/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 4) Attendance

#### Check in — POST /api/attendance/checkin

- Method: POST
- Access: Any authenticated user

Example:
```http
POST http://localhost:8080/api/attendance/checkin?userId=1
Authorization: Bearer <TOKEN>
```

cURL:
```bash
curl -X POST "http://localhost:8080/api/attendance/checkin?userId=1" \
  -H "Authorization: Bearer <TOKEN>"
```

#### Check out — POST /api/attendance/checkout

- Method: POST
- Access: Any authenticated user

Example:
```http
POST http://localhost:8080/api/attendance/checkout?attendanceId=1
Authorization: Bearer <TOKEN>
```

cURL:
```bash
curl -X POST "http://localhost:8080/api/attendance/checkout?attendanceId=1" \
  -H "Authorization: Bearer <TOKEN>"
```

#### Get attendance list — GET /api/attendance

- Method: GET
- Access: Any authenticated user

cURL:
```bash
curl http://localhost:8080/api/attendance \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 5) Leave Requests

#### Create leave request — POST /api/leaves

- Method: POST
- Access: Any authenticated user

Body:
```json
{
  "startDate": "2026-07-01",
  "endDate": "2026-07-03",
  "reason": "Medical leave"
}
```

cURL:
```bash
curl -X POST "http://localhost:8080/api/leaves?userId=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"startDate":"2026-07-01","endDate":"2026-07-03","reason":"Medical leave"}'
```

#### Get leave requests — GET /api/leaves

- Method: GET
- Access: Any authenticated user

cURL:
```bash
curl http://localhost:8080/api/leaves \
  -H "Authorization: Bearer <TOKEN>"
```

#### Update leave status — PUT /api/leaves/{id}

- Method: PUT
- Access: Any authenticated user

Example:
```http
PUT http://localhost:8080/api/leaves/1?status=APPROVED
Authorization: Bearer <TOKEN>
```

cURL:
```bash
curl -X PUT "http://localhost:8080/api/leaves/1?status=APPROVED" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### Recommended test order

1. Register user
2. Login and get token
3. Get departments
4. Create department
5. Create shift
6. Check in attendance
7. Apply leave
8. Get users and leave requests
9. Update and delete records

---

## Test the Application

Run the automated tests:

```bash
cd demo
mvn test
```

The test suite includes an authentication controller test that validates registration and login.

---

## Notes

- The project uses an in-memory H2 database for local development.
- Admin credentials are seeded on startup.
- For production, replace the H2 datasource and JWT secret with secure values.
