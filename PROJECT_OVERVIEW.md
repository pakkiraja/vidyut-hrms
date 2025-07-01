# Vidyut Attendance Application: Project Overview

This document provides an overview of the Vidyut Attendance Application, detailing the purpose and function of its backend, frontend, and Android components, and how they interact.

## 1. Backend (Node.js with Express and Sequelize)

The backend serves as the central API server for the application, handling all business logic, data storage, and authentication.

*   **Purpose:**
    *   Manages user authentication (login, registration, token management).
    *   Handles data persistence for various entities (Users, Roles, Departments, Shifts, Attendance Logs, Locations, Holidays, Leaves, etc.) using PostgreSQL.
    *   Exposes RESTful APIs for the frontend and Android application to interact with the data.
    *   Implements business logic related to attendance tracking, leave management, and user administration.
    *   Integrates with Firebase Admin for potential push notifications or other Firebase services (indicated by `firebase-admin` dependency).
*   **Key Technologies:**
    *   **Node.js:** Runtime environment for server-side JavaScript.
    *   **Express.js:** Web application framework for building REST APIs.
    *   **Sequelize:** ORM (Object-Relational Mapper) for interacting with the PostgreSQL database.
    *   **PostgreSQL:** Relational database for storing application data.
    *   **bcryptjs:** For hashing passwords securely.
    *   **jsonwebtoken:** For implementing JWT (JSON Web Tokens) for authentication.
    *   **dotenv:** For managing environment variables.
    *   **multer:** For handling multipart/form-data, typically used for file uploads (e.g., profile pictures, attendance proofs).
    *   **axios:** HTTP client for making requests (though typically used on the client-side, it might be used for external API calls from the backend).
*   **Core Functionalities (based on models and routes):**
    *   **Authentication:** User registration, login, token validation (`authRoutes.js`, `authMiddleware.js`).
    *   **User Management:** CRUD operations for users, roles, departments, designations (`userRoutes.js`, `Role.js`, `Department.js`, `Designation.js`).
    *   **Attendance:** Logging attendance, managing shifts, tracking location history (`attendanceRoutes.js`, `Shift.js`, `AttendanceLog.js`, `Location.js`, `LocationHistory.js`).
    *   **Leave Management:** Applying for leaves, leave types, holiday management (`Leave.js`, `LeaveType.js`, `Holiday.js`).
    *   **API Tokens & Device Tokens:** Management of API tokens and user device tokens for specific integrations or push notifications (`ApiToken.js`, `UserDeviceToken.js`).

## 2. Frontend (React)

The frontend is a web-based user interface that allows administrators and potentially employees to interact with the application via a web browser.

*   **Purpose:**
    *   Provides a graphical user interface (GUI) for users to access application features.
    *   Consumes APIs exposed by the backend to display data and send user input.
    *   Handles client-side routing and state management.
*   **Key Technologies:**
    *   **React:** JavaScript library for building user interfaces.
    *   **react-scripts:** Toolchain for React projects (create-react-app).
    *   **Web Vitals:** For measuring performance.
    *   **Testing Libraries:** `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` for unit and integration testing.
*   **Core Functionalities:**
    *   User dashboards.
    *   Forms for data entry (e.g., adding users, configuring shifts, applying for leave).
    *   Displaying reports (e.g., attendance records, leave balances).
    *   Administrative panels for managing application settings and master data.

## 3. Android Application (React Native)

The Android application is a mobile client designed for specific mobile-centric functionalities, likely focusing on employee-facing features like attendance logging and location tracking.

*   **Purpose:**
    *   Provides a native mobile experience for employees.
    *   Enables features that leverage mobile device capabilities (e.g., GPS for location-based attendance, push notifications).
    *   Communicates with the backend API to send attendance data and receive updates.
*   **Key Technologies:**
    *   **React Native:** Framework for building native mobile apps using JavaScript and React.
    *   **Android SDK:** For building and running Android applications.
    *   **Gradle:** Build automation tool for Android projects.
*   **Core Functionalities:**
    *   Employee login and authentication.
    *   Clock-in/Clock-out functionality, potentially with location verification.
    *   Viewing personal attendance history.
    *   Receiving push notifications (if implemented via Firebase).
    *   Submitting leave requests.

## 4. Inter-component Communication

*   **Frontend & Android to Backend:** Both the React frontend and the React Native Android application communicate with the Node.js backend primarily via RESTful API calls over HTTP/HTTPS.
    *   The frontend and Android app send requests (e.g., GET for data retrieval, POST for creating records, PUT/PATCH for updates, DELETE for removal) to specific API endpoints exposed by the backend.
    *   Authentication is handled using JWTs: users log in via the frontend or Android app, receive a JWT from the backend, and then include this token in subsequent requests to access protected resources.
*   **Database:** The backend interacts directly with the PostgreSQL database using Sequelize ORM to perform CRUD operations and manage data integrity.
*   **Nginx (in production hosting):** Nginx acts as a reverse proxy, serving the static frontend files and forwarding API requests to the Node.js backend, providing load balancing, SSL termination, and improved security.