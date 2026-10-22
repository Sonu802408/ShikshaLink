# ShikshaLink — Full-Stack Tutor-Parent Marketplace

A complete, production-ready, trustworthy tutor-parent marketplace connecting families with verified educators across **Mayur Vihar**, **East Delhi**, and **Delhi NCR**, architected for pan-India expansion.

---

## 1. Product Vision & Three Teaching Modes

ShikshaLink supports exactly three distinct teaching modes:
1. **Online Tuition:** Remote, interactive live classes with digital tools, whiteboards, and class meeting link distribution.
2. **Student's Home:** Personalized 1-on-1 tutoring at the student's doorstep within local travel radius. Exact residential addresses and parent phone numbers remain protected until mutual booking confirmation.
3. **Tutor's Centre:** Small-batch focused tuition in the teacher's neighbourhood classroom with batch capacities, schedules, and facilities.

Tutors can configure one, two, or all three modes with distinct rate cards.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, React Router v7, Lucide React icons.
- **Backend:** Node.js v24, Express v4.
- **Database:** MongoDB with Mongoose v8.
- **Authentication & Security:** JWT tokens with role-based authorization (`parent`, `tutor`, `admin`), bcrypt password hashing, and express-rate-limit.
- **File Storage:** Multer with dual storage (public for profile photos, encrypted private directory for sensitive qualification documents).
- **Test Suite:** Native Node.js test runner (`node:test`, `node:assert/strict`) with Supertest integration tests.

---

## 3. Database Architecture & Models

| Model | Collection | Key Responsibilities |
| :--- | :--- | :--- |
| `User` | `users` | Role-based authentication (`parent`, `tutor`, `admin`), secure password hashing, status (`active`, `suspended`). |
| `ParentProfile` | `parentprofiles` | Parent location, preferred language, and notification settings. |
| `ChildProfile` | `childprofiles` | Multi-child records with class grade, board, subjects, goals. Public data is strictly anonymized for child safety. |
| `TutorProfile` | `tutorprofiles` | Bio, pedagogy, modes, fee structure, home tuition travel radius, centre details & batches, rating aggregates. |
| `TutorQualification` | `tutorqualifications` | Degrees, certifications, private upload paths, audit verification status (`pending`, `verified`, `rejected`). |
| `TuitionRequirement` | `tuitionrequirements` | Multi-step requirements with schedule, budget, locality, and matching engine scoring. |
| `Booking` | `bookings` | Strict state transitions (`pending`, `confirmed`, `alternative_proposed`, `completed`, `cancelled`), conflict prevention, private address release. |
| `Review` | `reviews` | Verified reviews only from completed bookings with multi-criteria sub-ratings (teaching quality, punctuality, communication). |
| `SavedTutor` | `savedtutors` | Parent saved bookmarks with uniqueness constraints. |
| `SupportTicket` | `supporttickets` | Complaints, tutor replacement requests, dispute handling, admin resolutions. |
| `PlatformSettings` | `platformsettings` | Configurable subjects, classes, boards, East Delhi localities, cancellation & safety policies. |
| `AuditLog` | `auditlogs` | Immutable audit trail for all administrative decisions and user status changes. |

---

## 4. Key Workflows & Features Implemented

1. **Intelligent Matching Engine (`server/src/services/matchingService.js`):**
   - Applies hard requirements (Subject, Class, Teaching Mode) before calculating a multi-factor compatibility score (0-100%).
   - Transparently detects fee mismatches and labels tutors above budget instead of silently claiming affordability.
2. **Booking & Demo Lifecycle State Machine:**
   - Server-side conflict detection prevents overlapping confirmed bookings for either the tutor or the student.
   - Supports tutor schedule change proposals (`alternative_proposed`) with parent accept/decline flows.
   - Meeting link distribution for online classes and protected address release upon confirmation for home visits.
3. **Child Privacy & Safety First:**
   - Children's full names, schools, and home addresses are never published to unauthenticated users or public search feeds. Anonymized display handles (e.g. `Aarav S.`) are used.
4. **Tutor Document Verification Queue:**
   - Private qualification documents are securely served only to the document owner and platform administrators.
   - Dedicated admin verification queue to approve or reject degrees with feedback notes and update verification badges.
5. **Side-by-Side Tutor Comparison:**
   - Parents can compare up to 3 tutors side-by-side across fees, experience, verification badges, teaching modes, and ratings.
6. **Guided 6-Step Tuition Requirement Wizard:**
   - Multi-step guided submission for student details, teaching arrangement, schedule, budget, preferences, and summary review.

---

## 5. Getting Started on Windows

### Prerequisites
- **Node.js:** v18+ (tested on v24.21.0)
- **npm:** v9+ (tested on v11.19.0)
- **MongoDB:** MongoDB Community Server running locally on `mongodb://127.0.0.1:27017`

### Step 1: Clone or Navigate to Directory
```powershell
cd d:\ShikshaLink
```

### Step 2: Ensure MongoDB Service is Running
Start MongoDB using Windows services or run mongod pointing to your data directory:
```powershell
# In PowerShell:
mongod --dbpath d:\ShikshaLink\data\db --port 27017 --bind_ip 127.0.0.1
```

### Step 3: Install Dependencies
```powershell
# Install backend dependencies
cd d:\ShikshaLink\server
npm install

# Install frontend dependencies
cd d:\ShikshaLink\client
npm install
```

### Step 4: Seed Initial Data
Run the database seed script to populate realistic Delhi NCR / Mayur Vihar data and configure the initial administrator:
```powershell
cd d:\ShikshaLink\server
npm run seed
```

### Step 5: Run the Full Stack
You can start both servers together using the Windows batch script:
```powershell
# From d:\ShikshaLink
.\run-app.bat
```
Or start them in separate terminal windows:
- **Terminal 1 (Backend API):**
  ```powershell
  cd d:\ShikshaLink\server
  npm run dev
  ```
  *Server starts at `http://localhost:5000`*
- **Terminal 2 (Frontend Client):**
  ```powershell
  cd d:\ShikshaLink\client
  npm run dev
  ```
  *Frontend starts at `http://localhost:5173`*

---

## 6. Demo Accounts (Autofill Buttons on Login Page)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@shikshalink.in` | `Admin@12345` | Document verification queue, user moderation, platform settings. |
| **Parent** | `rajesh.parent@example.com` | `Parent@123` | Resident of Mayur Vihar Phase 1 with children in Class 7 & 10. |
| **Parent** | `sunita.parent@example.com` | `Parent@123` | Resident of Patparganj (IP Extension) with child in Class 12. |
| **Tutor (Online + Home)** | `vikram.tutor@example.com` | `Tutor@123` | Dr. Vikram Malhotra — M.Sc. Maths (DU), 10+ yrs exp, Verified. |
| **Tutor (Centre + Home)** | `pooja.tutor@example.com` | `Tutor@123` | Pooja Aggarwal — Science centre in Mayur Vihar Phase 2. |
| **Tutor (Online)** | `amitabh.tutor@example.com` | `Tutor@123` | Amitabh Sen — B.Tech IIT Delhi, Computer Science & Physics. |
| **Tutor (Pending Verification)** | `sneha.tutor@example.com` | `Tutor@123` | Sneha Verma — M.Com, waiting in Admin Verification Queue. |

---

## 7. Running Backend Integration Tests

Run the comprehensive integration test suite verifying authentication, role boundaries, booking lifecycle transitions, conflict prevention, review eligibility, and child privacy:
```powershell
cd d:\ShikshaLink\server
npm test
```
**Test Results:**
- 13 integration tests passed (100% pass rate).
- Covers conflict prevention, unauthorized record isolation, review restrictions, and matching endpoints.

---

## 8. Environment Variables Reference

Located in `server/.env`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for the Express backend server. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/shikshalink` | MongoDB connection URI. |
| `JWT_SECRET` | `shikshalink_super_secure_jwt_secret_key_2026_dev` | Secret used to sign JWT auth tokens. |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime duration. |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin for frontend client. |
| `ADMIN_BOOTSTRAP_KEY` | `shikshalink_secure_admin_bootstrap_key` | Secure key for remote administrator bootstrap. |

---

## 9. Security & Production Deployment Guidance

1. **Child Data Protection:** All public APIs sanitize child documents using `toSafePublic()` or explicit projections. Exact home address is disclosed to a tutor only if a booking is confirmed for home tuition.
2. **Private Document Storage:** Private qualification proofs uploaded to `uploads/private/` are blocked from public static file serving and are accessible only through authenticated route `/api/tutors/qualifications/:id/document` after checking user ownership or administrator role.
3. **Production Builds:**
   - Frontend is compiled with `npm run build` in `client/` generating optimized production assets in `client/dist/`.
   - Reverse proxy (e.g. NGINX) or Node static serving can serve `client/dist` while forwarding `/api` to the Express backend.
