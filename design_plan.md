# Detailed Design Plan for VIDYUT Attendance Management System

## 1. High-Level Architecture

The system will follow a microservices-oriented architecture, separating the web application, API services, and mobile application for better scalability and maintainability.

```mermaid
graph TD
    A[Web Application (React.js)] -->|API Calls| B(API Services - Node.js)
    C[Android Mobile App (Kotlin)] -->|API Calls| B
    B --> D(PostgreSQL Database)
    B --> E(Google Maps API)
    B --> F(Firebase Cloud Messaging)
    B --> G(Email/SMS Service)
    B --> H(Storage for Photos/Selfies)
    SubGraph External Services
        E
        F
        G
        H
    End
```

## 2. Component-wise Detailed Plan

### 2.1. Web Application (React.js)

*   **Technology Stack:** React.js, React Router, Redux/Context API for state management, Material-UI/Ant Design for UI components, Axios for API calls.
*   **Modules:**
    *   **a. User Onboarding:**
        *   **Employee Registration:** Forms for Admin/HR to register new employees with fields for name, email, mobile, role (Admin, HR, Employee), department, designation, and shift.
        *   **Role-Based Access:** Implement React Router guards and backend API checks to enforce RBAC.
        *   **Department, Designation, Shift Management:** Dedicated CRUD interfaces for managing these entities.
        *   **Bulk Import/Export:**
            *   **Import:** UI for uploading CSV/Excel files. Client-side validation before sending to API. Backend API to parse and insert data, with error reporting for invalid rows.
            *   **Export:** Buttons to trigger CSV/Excel download of employee data via API.
        *   **User Verification (Email/SMS):** Integrate with a third-party email/SMS service (e.g., SendGrid, Twilio) via Node.js backend for sending verification links/OTPs during registration or password reset.
    *   **b. Attendance Reporting:**
        *   **View Attendance Logs:** Interactive tables displaying daily, weekly, monthly attendance.
        *   **Filtering:** Robust filter options by employee name, ID, department, date range (date pickers).
        *   **Exportable Reports:** Buttons to generate and download PDF (using libraries like `jsPDF` or server-side PDF generation) and Excel reports (using `xlsx` or server-side generation).
        *   **Geo-location Map:** Integrate Google Maps API to display check-in/check-out locations on a map. Markers for each punch, with pop-ups showing details (timestamp, employee, photo).
        *   **Leave and Absence Analytics:** Dashboards and reports showing leave types, duration, and absence patterns.
    *   **c. Administration Dashboard:**
        *   **Statistics:** Visualizations (charts, graphs) for on-time percentage, late percentage, absentee count, average working hours, etc.
        *   **Shift Scheduling & Holiday Calendar:**
            *   **Shift Scheduling:** Interface to define shifts (start/end times, grace periods) and assign them to employees/departments.
            *   **Holiday Calendar:** CRUD for managing company holidays, which affect attendance calculations.
        *   **Manage Locations (Geo-fencing):** Map interface to define geo-fenced areas (polygons/circles) for office locations. Store geo-fence coordinates in the database.
        *   **Manage API Tokens:** Interface for Admin to generate, revoke, and manage API tokens for mobile app integration.
        *   **Notifications & Alerts:** Display real-time alerts (e.g., late check-ins, missed punches, geo-fence violations) on the dashboard.

### 2.2. API Services (Node.js)

*   **Technology Stack:** Node.js, Express.js, PostgreSQL ORM (e.g., Sequelize or TypeORM), JWT for authentication, Multer for file uploads, Axios for external API calls, Firebase Admin SDK for push notifications.
*   **API Endpoints:**
    *   **Authentication API (JWT):**
        *   `/api/auth/login`: Authenticate user, return JWT token.
        *   `/api/auth/refresh-token`: Refresh expired JWT.
        *   `/api/auth/logout`: Invalidate token (optional, can be handled client-side).
        *   `/api/auth/register`: (Admin/HR only) Register new users.
    *   **Check-in/Check-out API:**
        *   `/api/attendance/punch`: POST endpoint for check-in/check-out.
            *   **Payload:** `latitude`, `longitude`, `timestamp`, `photo` (base64 string or multipart file), `batteryStatus` (optional), `networkStatus` (optional).
            *   **Logic:** Validate geo-coordinates against defined geo-fences. Store punch data, photo reference, and optional metadata.
    *   **Location Tracking API:**
        *   `/api/location/track`: POST endpoint for periodic background location updates.
            *   **Payload:** `employeeId`, `latitude`, `longitude`, `timestamp`.
            *   **Logic:** Store location history. Implement rate limiting to prevent abuse.
    *   **Attendance Summary API:**
        *   `/api/attendance/summary`: GET endpoint for mobile dashboard.
            *   **Parameters:** `employeeId`, `dateRange`.
            *   **Response:** Daily/weekly/monthly attendance summary, total hours, late/absent days.
    *   **Push Notification Support (Firebase):**
        *   Integrate Firebase Cloud Messaging (FCM) via Firebase Admin SDK.
        *   API endpoints to send notifications for daily reminders, missed punches, geo-fence violations.
        *   Store FCM device tokens in the database.

### 2.3. Android Mobile Application (Kotlin)

*   **Technology Stack:** Kotlin, Android Jetpack Compose/XML Layouts, Retrofit for API calls, Room for local database (offline support), Google Play Services Location API, CameraX for selfie capture, Firebase Messaging SDK.
*   **Modules:**
    *   **a. Login & Profile:**
        *   **Secure Login:** Email/mobile + password. Implement biometric authentication (fingerprint/face ID) using Android BiometricPrompt API.
        *   **View Profile:** Display employee details, assigned shifts, and attendance logs fetched from API.
    *   **b. Attendance Capture:**
        *   **One-tap Check-in/Check-out:** Prominent buttons.
        *   **Mandatory Selfie Capture:** Use CameraX API to enforce front camera usage and capture selfie. Compress image before upload.
        *   **Automatic Geo-location Capture:** Use Google Play Services Location API to get precise `latitude` and `longitude` at the time of punch.
        *   **Offline Punch Support:** Store punch data locally in Room database if no internet connection. Implement background sync service to upload pending punches when online.
    *   **c. Live Location Tracking:**
        *   **Periodic Background Location Updates:** Implement a foreground service to periodically capture and send location updates to the API during office hours.
        *   **Background Permission Handling:** Request `ACCESS_BACKGROUND_LOCATION` permission. Educate user on its necessity and energy implications. Implement energy-efficient location strategies (e.g., low power mode, batching updates).
        *   **Location History View:** Display employee's own location history on a map within the app.
    *   **d. Notifications & Alerts:**
        *   **Daily Reminders:** Receive FCM notifications for "Don't forget to Check-In/Check-Out".
        *   **Alerts:** Receive FCM alerts for missed punches or geo-fence violations.

## 3. Security & Compliance

*   **Data Encryption:**
    *   **At Rest:** Encrypt sensitive data (e.g., photos, location history) in PostgreSQL using database-level encryption or application-level encryption before storing.
    *   **In Transit:** Enforce SSL/TLS for all API communication (HTTPS).
*   **Role-Based Access Control (RBAC):**
    *   Define clear roles (Admin, HR, Employee) and their permissions.
    *   Implement RBAC at the API level (Node.js middleware) to authorize requests based on user roles and permissions.
    *   Frontend (React.js, Kotlin) will dynamically render UI elements based on user roles.
*   **GDPR/IT Compliance:**
    *   **Consent:** Obtain explicit consent for location tracking and photo capture.
    *   **Data Minimization:** Collect only necessary data.
    *   **Data Retention Policies:** Define and implement policies for deleting old location/photo data.
    *   **Anonymization/Pseudonymization:** Consider for analytics where individual identification is not required.
*   **Audit Trail and Logs:**
    *   Log all critical API access and data modifications (who, what, when, from where).
    *   Store logs securely and make them accessible for auditing.

## 4. Database Design (PostgreSQL)

*   **Key Tables:**
    *   `users`: `id`, `email`, `password_hash`, `role_id`, `department_id`, `designation_id`, `shift_id`, `first_name`, `last_name`, `mobile`, `is_active`, `created_at`, `updated_at`.
    *   `roles`: `id`, `name` (Admin, HR, Employee).
    *   `permissions`: `id`, `name` (e.g., `can_manage_users`, `can_view_all_attendance`).
    *   `role_permissions`: `role_id`, `permission_id`.
    *   `departments`: `id`, `name`.
    *   `designations`: `id`, `name`.
    *   `shifts`: `id`, `name`, `start_time`, `end_time`, `grace_period_minutes`.
    *   `attendance_logs`: `id`, `user_id`, `punch_type` (check-in/check-out), `timestamp`, `latitude`, `longitude`, `photo_url`, `battery_status` (optional), `network_status` (optional), `is_offline_punch`, `synced_at`.
    *   `locations`: `id`, `name`, `geo_fence_coordinates` (JSON/GeoJSON for polygon/circle data).
    *   `holidays`: `id`, `name`, `date`.
    *   `api_tokens`: `id`, `token`, `user_id`, `expires_at`, `created_at`.
    *   `user_device_tokens`: `user_id`, `fcm_token`.
    *   `location_history`: `id`, `user_id`, `latitude`, `longitude`, `timestamp`.
    *   `leaves`: `id`, `user_id`, `leave_type_id`, `start_date`, `end_date`, `status` (pending, approved, rejected).
    *   `leave_types`: `id`, `name`.

## 5. Hosting Considerations

*   **On-Premise Server / AWS:**
    *   **Backend (Node.js):** Deploy on EC2 instances (AWS) or dedicated servers (On-Premise) behind a load balancer. Use Docker for containerization.
    *   **Database (PostgreSQL):** Use AWS RDS for managed PostgreSQL or set up a dedicated PostgreSQL server (On-Premise).
    *   **Static Files (React.js):** Host React.js build on AWS S3 + CloudFront for CDN, or serve directly from Node.js server.
    *   **Photo Storage:** Use AWS S3 for scalable and secure storage of employee photos/selfies.