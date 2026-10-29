# CareerConnect – Smart Job and Internship Finder Portal

A complete, responsive, full-stack web application designed for students, fresh graduates, employers, and administrators. Built with a modern, responsive frontend (Plain HTML5, CSS3, JavaScript) and a robust backend (Node.js, Express.js, MongoDB, Mongoose, Multer, bcrypt).

---

## 🌟 Key Highlights & Features

- **Multi-Role Authentication & Authorization**: Strict server-side role-based access control (RBAC) separating **Students / Job Seekers**, **Employers**, and **Administrators**.
- **Real MongoDB Database**: Fully dynamic data persistence using Mongoose models (User, StudentProfile, Company, Job, Application, SavedJob, Resume) with indexes, compound constraints, and relationships.
- **Explainable Skill-Based Recommendation Engine**: Real-time algorithm matching a student's profile skills with employer requirements, calculating percentage suitability, highlighting possessed skills (green) and identifying missing skills (amber).
- **Secure PDF Resume Pipeline**: Multer middleware enforcing `.pdf` MIME-type validation, 5MB file-size limits, and role-authorized file streaming (preventing unauthorized downloads).
- **Full Job Application Lifecycle**: 1-click application submission with selected resume and optional cover letter, duplicate application prevention, and real-time status transitions (`Applied` &rarr; `Under Review` &rarr; `Shortlisted` &rarr; `Selected` &rarr; `Rejected` &rarr; `Withdrawn`).
- **Comprehensive Employer Console**: Job posting wizard, live status toggle (`Active` / `Closed`), candidate applicant review, resume downloads, and hiring stage transitions.
- **Protected Admin Console**: Platform-wide metrics, user account moderation (activation, deactivation, deletion), and job catalog takedown controls.
- **Clean Responsive UI**: Blue (`#2563eb`) and Purple (`#7c3aed`) modern aesthetic with responsive navigation, mobile drawer menu, rounded cards, subtle shadows, and toast notifications.

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Structure** | HTML5 | Clean semantic markup across 18 responsive pages |
| **Frontend Styling** | CSS3 & Responsive CSS | Custom modern design, CSS variables, mobile media queries |
| **Frontend Interactions** | Vanilla JavaScript (ES6+) | REST API integration, state handling, dynamic DOM |
| **Data Exchange** | JSON & Multipart Form-Data | REST communication and PDF file uploads |
| **Backend Runtime** | Node.js (v18+) | Non-blocking server-side execution environment |
| **API Framework** | Express.js (v4) | RESTful API routing, middleware chaining, static file serving |
| **Database** | MongoDB | Document database with schema enforcement |
| **ODM Modeling** | Mongoose (v8) | Schema definitions, validation, compound indexes |
| **Authentication** | JSON Web Tokens (JWT) & bcrypt | Salted password hashing and token-based RBAC |
| **File Uploads** | Multer | PDF file validation, size limits, and disk storage |
| **Security** | Helmet, CORS, Express-Rate-Limit | Header hardening, origin protection, brute-force throttling |

---

## 📁 Project Structure

```text
CareerConnect/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── adminController.js    # System stats, user management & job moderation
│   │   ├── applicationController.js # Apply, applicant review, status transitions
│   │   ├── authController.js     # Register, login, me, session management
│   │   ├── employerController.js # Employer stats, my jobs, company profile
│   │   ├── jobController.js      # Public search, filters, skill recommendations
│   │   ├── profileController.js  # Student profile, skills & academic history
│   │   ├── resumeController.js   # Multer file upload, stream & delete
│   │   └── savedJobController.js # Bookmark jobs & unsave operations
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & authorizeRoles() guard
│   │   ├── errorHandler.js       # Centralized JSON error responder
│   │   └── upload.js             # Multer PDF filter and 5MB limiter
│   ├── models/
│   │   ├── Application.js        # Job application records & unique compound index
│   │   ├── Company.js            # Employer organization metadata
│   │   ├── Job.js                # Job & internship listings with text search
│   │   ├── Resume.js             # Uploaded resume metadata & file references
│   │   ├── SavedJob.js           # Student bookmark references
│   │   ├── StudentProfile.js     # Academic details, skills, and portfolio
│   │   └── User.js               # User accounts, bcrypt hashing & roles
│   ├── routes/
│   │   ├── adminRoutes.js        # /api/admin/*
│   │   ├── applicationRoutes.js  # /api/applications/*
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── employerRoutes.js     # /api/employer/*
│   │   ├── jobRoutes.js          # /api/jobs/*
│   │   ├── profileRoutes.js      # /api/profile/*
│   │   ├── resumeRoutes.js       # /api/resumes/*
│   │   └── savedJobRoutes.js     # /api/saved-jobs/*
│   ├── uploads/                  # Secure directory for uploaded PDF resumes
│   ├── seed.js                   # Database seed script with rich realistic demo data
│   └── server.js                 # Express server & static asset mount
├── frontend/
│   ├── css/
│   │   ├── style.css             # Main styling, color palette, cards, badges, buttons
│   │   └── responsive.css        # Mobile drawer, tablet grids & responsive media queries
│   ├── js/
│   │   ├── admin.js              # Admin portal stats, user toggle & job takedown
│   │   ├── api.js                # Fetch wrapper, token storage, toast alerts, formatters
│   │   ├── applications.js       # Student application tracking & status badges
│   │   ├── auth.js               # Route guard, dynamic navbar & footer rendering
│   │   ├── employer.js           # Post/edit job, manage jobs, review candidate resumes
│   │   ├── job-details.js        # Detailed role view, skill analysis, apply modal
│   │   ├── jobs.js               # Search keywords, location, category, job type filters
│   │   ├── profile.js            # Student profile editor & skills preview
│   │   ├── resumes.js            # PDF resume upload, preview & delete
│   │   ├── saved-jobs.js         # Bookmarked positions & unsave
│   │   └── student-dashboard.js  # Student metrics, recent apps, skill recommendations
│   ├── about.html                # About Us & Platform Architecture
│   ├── admin-dashboard.html      # Protected Admin Console
│   ├── applicants.html           # Employer Applicant Review & Status Manager
│   ├── applications.html         # Student My Applications Page
│   ├── contact.html              # Contact Support & FAQs
│   ├── employer-dashboard.html   # Employer Recruitment Hub
│   ├── index.html                # Modern Landing Page with Hero & Featured Jobs
│   ├── internships.html          # Browse Internships Page
│   ├── job-details.html          # Job Details & Apply Modal
│   ├── jobs.html                 # Browse All Jobs with Advanced Filters
│   ├── login.html                # Sign In with Quick Demo Logins
│   ├── manage-jobs.html          # Employer Job Postings Manager
│   ├── post-job.html             # Post / Edit Job Wizard
│   ├── profile.html              # Student Profile & Skills Manager
│   ├── register.html             # Student & Employer Registration
│   ├── resume-upload.html        # PDF Resume Uploader
│   ├── saved-jobs.html           # Bookmarked Jobs Page
│   └── student-dashboard.html    # Student Dashboard & Recommendations
├── .env.example                  # Template configuration file
├── .env                          # Environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies and scripts
└── README.md                     # Comprehensive documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (running locally on port 27017 or a MongoDB Atlas Cloud URI)

### 2. Installation
Open your terminal inside the project directory and install dependencies:
```bash
npm install
```

### 3. Environment Variables Setup
Create a `.env` file in the project root (a `.env.example` is provided for reference):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careerconnect
JWT_SECRET=careerconnect_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> **Using MongoDB Atlas (Cloud)?**
> Replace `MONGODB_URI` with your connection string:
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/careerconnect?retryWrites=true&w=majority`

### 4. Seed the Database
Populate the database with realistic sample employers, students, PDF resumes, jobs, internships, and applications:
```bash
npm run seed
```

### 5. Start the Server
Run the application:
```bash
npm start
```
Or for development with automatic restart:
```bash
npm run dev
```

Visit the application in your browser:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 Pre-Configured Demo Accounts (For Viva / Testing)

The seed script creates ready-to-test accounts across all three roles. You can also click the **Quick Demo Login** buttons on the `/login.html` page to autofill these credentials instantly:

| Role | Name | Email | Password | Pre-configured Data |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@careerconnect.com` | `adminpassword123` | Full moderation console, platform metrics, user controls |
| **Employer** | Google India Talent | `recruiter@google.com` | `employer123` | Active listings (Frontend, Cloud Intern, Mobile Dev) & applicants |
| **Employer** | Razorpay Talent | `talent@razorpay.com` | `employer123` | Active listings (Backend Intern, UX Designer) & applicants |
| **Student** | Rahul Sharma | `rahul@student.com` | `student123` | Web Developer profile (React, Node, Mongo), resume & 3 applications |
| **Student** | Ananya Patel | `ananya@student.com` | `student123` | Data Science profile (Python, SQL, ML), resume & applications |
| **Student** | Rohan Gupta | `rohan@student.com` | `student123` | UI/UX Designer profile (Figma, Prototyping), resume & applications |

---

## 🎯 Role-Based Feature Walkthrough

### 1. Student / Job Seeker
- **Register / Sign In**: Creates an account and initializes a dedicated `StudentProfile`.
- **Profile & Skills**: Manage college, degree, graduation year, social links (GitHub, LinkedIn, Portfolio), and list technical skills.
- **Resume Upload**: Upload Adobe PDF resumes up to 5MB. Resumes are validated on both client and server sides, saved to `backend/uploads/`, and recorded in MongoDB.
- **Search & Filter**: Find jobs and internships by keywords, location, category, workplace mode (`Remote`, `Hybrid`, `Onsite`), and sort order.
- **Skill Fit Breakdown**: When viewing any job details, the system compares the student's listed skills against required skills, outputting a clear percentage match score, matching skills, and missing skills.
- **1-Click Apply**: Select an uploaded resume, add an optional cover letter, and submit. Duplicate applications to the same role are blocked.
- **Track & Withdraw**: Monitor submitted applications across statuses (`Applied`, `Under Review`, `Shortlisted`, `Selected`, `Rejected`, `Withdrawn`). Eligible applications can be withdrawn anytime.

### 2. Employer
- **Company Setup**: Maintain company name, description, industry, and website.
- **Job Posting Wizard**: Post jobs and internships with title, category, workplace mode, experience level, location, salary/stipend, application deadline, and required skills.
- **Manage Postings**: View applicant counts per job, edit listings, toggle statuses (`Active` vs. `Closed`), or delete postings.
- **Applicant Review & Resumes**: Access candidate submissions, view educational backgrounds, inspect cover letters, and securely download applicant resumes.
- **Status Progression**: Move candidate statuses in real time using the status dropdown menu.

### 3. Administrator
- **Protected Access**: Admin console is strictly protected server-side via `authorizeRoles('admin')`. Admin accounts cannot be created via public registration.
- **Platform Analytics**: Real-time counts of total students, total employers, total job listings, and submitted applications.
- **User Moderation**: View all registered accounts, filter by role, search by name/email, toggle active/deactivated status, or delete accounts with cascading cleanup.
- **Listing Moderation**: Inspect all posted jobs across companies and delete any inappropriate, invalid, or expired postings.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (Student or Employer) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/logout` | Public | Clear authentication cookie |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile & role data |

### Jobs & Recommendations (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | Browse jobs with search, category, type, and pagination |
| `GET` | `/api/jobs/recommended` | Student | Get skill-matched recommendations for current student |
| `GET` | `/api/jobs/:id` | Public | Retrieve single job details & student skill fit analysis |
| `POST` | `/api/jobs` | Employer | Post a new job or internship opening |
| `PATCH` | `/api/jobs/:id` | Employer/Admin | Update an existing job listing |
| `DELETE` | `/api/jobs/:id` | Employer/Admin | Delete a job listing |

### Applications (`/api/applications` & `/api/jobs/:id/apply`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/jobs/:id/apply` | Student | Apply for a job with selected resume & cover letter |
| `GET` | `/api/applications/me` | Student | List applications submitted by logged-in student |
| `PATCH` | `/api/applications/:id/withdraw` | Student | Withdraw an active application |
| `GET` | `/api/employer/applications` | Employer | View applicants for employer's posted jobs |
| `PATCH` | `/api/applications/:id/status` | Employer/Admin | Update applicant status (Shortlist, Select, Reject, etc.) |

### Student Profile & Resumes (`/api/profile` & `/api/resumes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Student | Get student profile details |
| `PATCH` | `/api/profile` | Student | Update phone, college, degree, skills, links |
| `POST` | `/api/resumes` | Student | Upload PDF resume (Multer with 5MB limit) |
| `GET` | `/api/resumes` | Student | List uploaded resumes for student |
| `GET` | `/api/resumes/:id/view` | Authorized | Stream/view PDF resume in browser |
| `DELETE` | `/api/resumes/:id` | Student/Admin | Delete resume file from server and database |

### Bookmarks (`/api/saved-jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/saved-jobs` | Student | Retrieve saved jobs |
| `POST` | `/api/saved-jobs/:jobId` | Student | Save a job to bookmarks |
| `DELETE` | `/api/saved-jobs/:jobId` | Student | Remove job from bookmarks |

### Administrator (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Total platform counts (students, employers, jobs, apps) |
| `GET` | `/api/admin/users` | Admin | List all registered users with search/role filters |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Toggle user active/deactivated status |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user account and cascade cleanup |
| `GET` | `/api/admin/jobs` | Admin | List all job postings across employers |
| `DELETE` | `/api/admin/jobs/:id` | Admin | Remove inappropriate job listing |

---

## 🛡️ Security Implementation Details

1. **Password Hashing**: Passwords are encrypted using `bcryptjs` with an automated pre-save hook and a salt work factor of 10. Passwords are stripped before returning JSON responses.
2. **Role-Based Authorization (RBAC)**: All sensitive routes pass through `authenticate` and `authorizeRoles(...)` middlewares.
3. **Strict PDF Upload Validation**: Multer checks both the file extension (`.pdf`) and the MIME type (`application/pdf`). Non-PDF files are rejected with friendly error messages. Max upload size is strictly clamped at 5MB.
4. **Authorized Resume Streaming**: Direct disk access to resumes is blocked. The `/api/resumes/:id/view` route verifies whether the requesting user is the resume owner, an employer who received an application containing that resume, or an admin.
5. **No Duplicate Applications**: A MongoDB compound unique index `{ studentId: 1, jobId: 1 }` prevents race conditions and ensures a candidate can only apply once to any job.
6. **Security Headers & Throttling**: Configured with `helmet` for secure HTTP headers, `cors` for credentials support, and `express-rate-limit` to prevent brute-force attacks on authentication endpoints.

---

## 🎓 College Viva & Demo Presentation Guide

When presenting this project during viva or an evaluation session, follow this step-by-step demonstration:

1. **Architecture Explanation**:
   - Explain that the application follows the MVC (Model-View-Controller) architectural pattern using Node.js, Express, and MongoDB on the backend with pure HTML5, CSS3, and Vanilla JavaScript on the frontend.
2. **Show Database Seeding**:
   - Run `npm run seed` in the terminal to demonstrate how collections are initialized with realistic relationships.
3. **Demonstrate Role 1: Student (Rahul Sharma)**:
   - Log in using `rahul@student.com` (use the 1-click demo button).
   - Show the **Student Dashboard** with live counts for applications, bookmarks, and registered skills.
   - Show the **Recommended Jobs** section and explain how the recommendation algorithm compares profile skills against job requirements.
   - Open a job (e.g. *Full Stack Web Developer*), point out the **Skill Fit Analysis** card (Match score, matching skills, missing skills).
   - Demonstrate the **Apply Modal**: select an uploaded PDF resume, type a cover letter, and submit.
   - Navigate to **My Applications** to verify the new application appears with status `Applied`.
4. **Demonstrate Role 2: Employer (Microsoft Recruiter)**:
   - Log out and log in as `careers@microsoft.com` / `employer123`.
   - Open **Employer Dashboard** and show real-time candidate statistics.
   - Navigate to **Review Applicants**: show Rahul's application, open his **PDF Resume** to demonstrate authorized file streaming, and update his status from `Applied` to `Shortlisted`.
   - Open **Manage Jobs** and toggle a listing's status to `Closed`.
5. **Demonstrate Role 3: Administrator**:
   - Log in as `admin@careerconnect.com` / `adminpassword123`.
   - Show platform statistics (total students, employers, jobs, applications).
   - In **User Accounts**, demonstrate searching for a user and deactivating/reactivating an account.
   - In **Job Moderation**, demonstrate removing an inappropriate job posting.

---

## 📄 License
This project is developed for educational and academic presentation purposes under the ISC License.

