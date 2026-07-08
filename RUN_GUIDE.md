# ShiftSwift - Running the Project

Follow these steps to run both the **Spring Boot Backend** and the **Vanilla Frontend** locally.

---

## 🛠️ Step 1: Backend Setup & Execution

### 1. Database Configuration
Make sure you have a local MySQL server running. The project is configured to use:
* **Database URL**: `jdbc:mysql://localhost:3306/shiftswifts` (the schema will be created automatically if it doesn't exist).
* **Username**: `root`
* **Password**: `Mani@10407##`

If you need to change the database credentials, update:
`demo/src/main/resources/application.properties`

### 2. Run the Spring Boot Server
Navigate to the `demo` directory in your terminal and run the Maven wrapper command:

```powershell
# Windows PowerShell
cd demo
.\mvnw.cmd spring-boot:run
```

Once started, the backend will listen on **`http://localhost:8080`**.

---

## 💻 Step 2: Frontend Setup & Execution

### 1. Configure API Base URL (If needed)
The frontend is already configured to talk to `http://localhost:8080`. If your backend port changes, edit:
`frontend/js/config.js` -> `BASE_URL` property.

### 2. Launch the Frontend
Since the frontend uses vanilla HTML5, CSS3, and JavaScript, no build/compile steps are required. You can run it in two ways:

#### Option A: Live Server (Recommended)
1. Open the workspace folder in VS Code.
2. If you have the **Live Server** extension installed, right-click `frontend/index.html` and select **"Open with Live Server"**.
3. This will serve the frontend at `http://127.0.0.1:5500/frontend/index.html`.

#### Option B: Direct File Open
1. Simply double-click `frontend/index.html` in your file explorer.
2. It will open directly using your browser's `file://` protocol.

---

## 🔑 Default Sign In Credentials
During the first launch, the seeder automatically populates the database with an Admin account:
* **Username**: `admin`
* **Password**: `admin123`
* **Role**: `ROLE_ADMIN`
