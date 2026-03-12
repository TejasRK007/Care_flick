 🏥 Careflick Dashboard

A care management dashboard built with React and TypeScript for the Careflick Frontend Internship Assignment. It lets you browse users from an API, manage their profiles, fill out care forms, and even upload PDF health assessments to extract patient data right in the browser.

**[🔗 Live Demo →](https://careflick.vercel.app)**

---

## ✨ What It Does

### 👤 Users Tab
- Fetches all users from the [JSONPlaceholder API](https://jsonplaceholder.typicode.com/users) and displays them in a responsive card grid
- Each card shows the user's name, email, and phone — click any card to see full details (address, company, website)
- Search bar with debounce to filter users by name or email in real-time
- Full CRUD: add new users, edit existing ones, or delete them (simulated locally since the API is read-only)
- Pagination showing 6 users per page
- A "Submitted Care Forms" section inside each user's modal to see all forms linked to them

### 📋 Care Forms Tab
- Pick a user, select a form type, and fill it out — fields are generated dynamically from form schemas
- Validation on required fields, email format, and phone numbers (powered by React Hook Form)
- **PDF Upload:** drag-and-drop a Health Assessment PDF and the app extracts patient data (vitals, symptoms, demographics) using PDF.js — all client-side, no server needed
- After extracting, you get a preview card to review the data before confirming
- Every submitted form gets linked to the selected user and shows up in their profile

---

## 🛠️ Setup Instructions

**Prerequisites:** Node.js 18+ and npm

```bash
# 1. Clone the repo
git clone https://github.com/TejasRK007/Care_flick.git
cd Care_flick

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be running at `http://localhost:5174`.

---

## 🧰 Technologies Used

| Tech | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety across the app |
| **Vite** | Fast dev server + production bundler |
| **React Router DOM** | Client-side routing (Users / Care Forms tabs) |
| **React Hook Form** | Form state management and validation |
| **Axios** | HTTP requests to JSONPlaceholder API |
| **PDF.js (pdfjs-dist)** | Client-side PDF text extraction |
| **Lucide React** | Clean, consistent icons |
| **React Hot Toast** | Toast notifications for success/error feedback |
| **Custom CSS** | Hand-written styles, no CSS framework |
| **Vercel** | Deployment |

---

## 📂 Project Structure

```
src/
├── components/
│   ├── forms/           # Care form components
│   │   ├── CareForm.tsx          — Dynamic form renderer (from schema)
│   │   ├── FormField.tsx         — Individual field component
│   │   ├── PdfReader.tsx         — PDF upload + text extraction + preview
│   │   ├── SubmittedFormsTable.tsx — Table of submitted forms with detail modal
│   │   └── FormStats.tsx         — Stats cards (total, recent, etc.)
│   ├── users/           # User-related components
│   │   ├── UserCard.tsx          — User card for the grid
│   │   ├── UserModal.tsx         — User detail popup (with submitted forms)
│   │   ├── UserForm.tsx          — Add/Edit user form
│   │   └── UserSearch.tsx        — Search input with icon
│   ├── layout/          # App shell
│   │   └── Navbar.tsx            — Top navigation bar
│   └── ui/              # Reusable UI bits
│       └── SkeletonCard.tsx      — Loading placeholder cards
│
├── pages/
│   ├── UsersPage.tsx             — Users tab (grid + search + pagination)
│   └── CareFormsPage.tsx         — Care Forms tab (form + PDF upload + table)
│
├── hooks/
│   ├── useUsers.ts               — Fetches users from API, handles loading/error
│   └── useDebounce.ts            — Debounces search input
│
├── context/
│   └── AppContext.tsx             — Global state (users, form submissions, CRUD ops)
│
├── services/
│   └── userService.ts            — Axios API calls
│
├── types/
│   ├── user.ts                   — User, Address, Company interfaces
│   └── form.ts                   — FormSubmission, FormSchema types
│
├── data/
│   └── forms.ts                  — Care form schema definitions
│
├── App.tsx                       — Router setup
├── main.tsx                      — Entry point
└── index.css                     — Global styles + CSS variables
```

---

## 📝 Key Design Decisions

- **No backend required** — everything runs client-side. User CRUD is simulated in React state, and PDF parsing happens in the browser via PDF.js.
- **Context API for state** — keeps users+submissions in sync across tabs without pulling in a heavier state library.
- **Schema-driven forms** — care forms are generated from JSON schemas, making it easy to add new form types without writing new components.
- **Co-located styles** — each component has its own CSS file right next to it, keeping things easy to find.

---

Built by **Tejas RK** for the Careflick Frontend Internship.
