# BorrowBuddy — Borrow & Return Tracker 🤝📦

> **Share items. Build better habits.**  
> A full-stack **MERN** (MongoDB, Express.js, React, Node.js) web application designed to track shared items, manage group inventories, record item checkouts/returns, and eliminate overdue or forgotten loans.

---

## 🎨 UI & Design System

BorrowBuddy is crafted to precisely reflect modern, tactile design principles:
- **Midnight Indigo (`#001F44`)**: Sidebar navigation, high-contrast branding, primary action buttons, and dark cards.
- **Vanilla Cream (`#FFFDF3`)**: Warm, easy-on-the-eyes main background.
- **Surface White (`#FFFFFF`)**: Crisp, elevated content cards with subtle borders (`#E8E3D2`).
- **Semantic Badges**:
  - 🟢 **Available / Active**: Soft green (`#E6F4EA` bg, `#137333` text)
  - 🟡 **Borrowed**: Warm amber (`#FEF3C7` bg, `#B45309` text)
  - 🔴 **Overdue**: Coral red (`#FCE8E6` bg, `#C5221F` text)
  - ⚪ **Returned**: Slate gray (`#F1F5F9` bg, `#475569` text)
- **Responsive Layout**:
  - Full desktop layout with fixed Midnight Indigo sidebar.
  - Dedicated mobile bottom navigation bar (`Home`, `Groups`, `Loans`, `Profile`).

---

## 🚀 Features

1. **Authentication & Authorization**:
   - Register, login, and secure logout.
   - Passwords hashed with `bcryptjs`.
   - JWT token-based authentication with protected API endpoints and React protected routes.
2. **Dashboard Overview**:
   - Real-time database metrics: **Total Items**, **Active Loans**, **Overdue**, and **Groups**.
   - Recent activity feed showing who borrowed or returned what item and relative timestamps.
   - Quick access shortcuts.
3. **Inventory Management**:
   - Add, edit, view, and delete items.
   - Categorization: Books, Electronics, Sports, Tools, Lab Equipment, and Others.
   - Real-time search filter and status tabs: `All`, `Available`, `Borrowed`, `Overdue`.
4. **Borrow Item Workflow**:
   - Select available items, pick borrowers (or type custom borrower names), choose due dates, and attach optional notes.
   - Automatically prevents duplicate loans on the same item.
5. **Return Item Workflow**:
   - One-click item return with actual return date and optional condition notes.
   - Immediately restores item availability to `Available`.
6. **Active & Overdue Loans**:
   - Categorized tabs: `Active`, `Overdue`, and `Returned`.
   - Automatic overdue calculation based on due date vs current date.
7. **Groups & Collaboration**:
   - Create groups (e.g., *Friends Group*, *College Group*), invite members, and associate items with groups.
   - Access control ensuring group items and members stay scoped to group participants.
8. **Borrowing History**:
   - Complete historical log with timeframe filters (`Last 30 days`, `Last 60 days`, `All time`).
9. **User Profile**:
   - View profile, avatar initial, joined groups, and edit contact information or update password.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Axios, Lucide React icons, and custom CSS.
- **Backend**: Node.js, Express.js REST API.
- **Database**: MongoDB with Mongoose ODM.
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, CORS, input sanitation.

---

## 📁 Project Structure

```text
Borrow_Buddy/
├── package.json               # Monorepo root scripts (run both client & server)
├── .gitignore                 # Git ignore rules
├── .env.example               # Example root environment file
├── README.md                  # Complete documentation and setup guide
│
├── server/                    # Express.js REST API
│   ├── package.json
│   ├── .env.example
│   ├── .env                   # Local backend configuration
│   └── src/
│       ├── config/
│       │   └── db.js          # Mongoose database connection module
│       ├── models/
│       │   ├── User.js        # User model with bcrypt pre-save hashing
│       │   ├── Group.js       # Group model with member references
│       │   ├── Item.js        # Item model with categories & status
│       │   ├── Loan.js        # Loan model with checkout/return tracking
│       │   └── Activity.js    # Activity logs for recent updates
│       ├── middleware/
│       │   ├── authMiddleware.js   # JWT protect middleware
│       │   └── errorMiddleware.js  # Centralized error handler
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── itemController.js
│       │   ├── loanController.js
│       │   ├── groupController.js
│       │   ├── activityController.js
│       │   └── statsController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── itemRoutes.js
│       │   ├── loanRoutes.js
│       │   ├── groupRoutes.js
│       │   ├── activityRoutes.js
│       │   └── statsRoutes.js
│       ├── seed.js            # Demo database seeder matching UI mockups
│       └── server.js          # Main Express server entry point
│
└── client/                    # React frontend with Vite
    ├── package.json
    ├── vite.config.js         # Vite proxy configuration
    ├── index.html
    └── src/
        ├── api/
        │   └── axios.js       # Axios instance with auth interceptor
        ├── context/
        │   └── AuthContext.jsx# React auth context provider
        ├── components/
        │   ├── Sidebar.jsx    # Desktop Midnight Indigo sidebar
        │   ├── Header.jsx     # Top greeting & user profile pill
        │   ├── MobileNav.jsx  # Mobile bottom navigation bar
        │   ├── Layout.jsx     # Master layout
        │   ├── Badge.jsx      # Semantic status badges
        │   ├── CategoryIcon.jsx # Dynamic icon renderer
        │   ├── AddItemModal.jsx
        │   ├── BorrowModal.jsx
        │   ├── ReturnModal.jsx
        │   ├── CreateGroupModal.jsx
        │   └── EditProfileModal.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── GroupsPage.jsx
        │   ├── InventoryPage.jsx
        │   ├── LoansPage.jsx
        │   ├── HistoryPage.jsx
        │   └── ProfilePage.jsx
        ├── styles/
        │   └── index.css      # CSS styling matching UI reference
        ├── App.jsx            # Route definitions
        └── main.jsx           # App bootstrapping
```

---

## ⚡ Quick Start Guide (Beginner Friendly)

### 1. Prerequisites
Make sure **Node.js** (v18+ or v20+) and **npm** are installed:
```powershell
node -v
npm -v
```

---

### 2. Configure MongoDB

You have two simple options for MongoDB:

#### Option A: MongoDB Atlas (Cloud - Recommended & Free)
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and sign up for a free account.
2. Click **Create a Deployment** and select the free **M0** cluster.
3. In **Security Quickstart**:
   - Create a Database User (e.g. Username: `borrowbuddy_admin`, Password: `YourSecurePassword123`).
   - Under **Where would you like to connect from?**, select **Allow Access from Anywhere (`0.0.0.0/0`)** and click **Add Entry**.
4. Click **Finish and Close**.
5. On the Database Deployments screen, click **Connect** -> **Drivers** -> Copy the connection string:
   ```text
   mongodb+srv://borrowbuddy_admin:<password>@cluster0.abcde.mongodb.net/borrowbuddy?retryWrites=true&w=majority
   ```
6. Open `server/.env` in a text editor and update `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://borrowbuddy_admin:YourSecurePassword123@cluster0.abcde.mongodb.net/borrowbuddy?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB Instance
If you have MongoDB Community Edition installed on your computer:
1. Start MongoDB:
   ```powershell
   mongod --dbpath="C:\data\db"
   ```
2. Your `server/.env` is already configured for local MongoDB:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/borrowbuddy
   ```

---

### 3. Install Dependencies

In the root directory, install dependencies for the root, backend, and frontend:
```powershell
npm run install:all
```
*(Or navigate into `server` and `client` separately and run `npm install`)*

---

### 4. Seed the Database with Demo Data

Populate the database with the exact items, groups, active loans, and activities shown in the design mockup:
```powershell
npm run seed
```

**Pre-seeded Demo Credentials:**
- **Email:** `srikar@example.com`
- **Password:** `password123`

---

### 5. Run the Application

From the root directory, run both backend and frontend concurrently:
```powershell
npm start
```

Or run them in two separate terminal windows:
- **Terminal 1 (Backend API):**
  ```powershell
  cd server
  npm run dev
  ```
  *(Server starts on `http://localhost:5000`)*

- **Terminal 2 (Frontend Client):**
  ```powershell
  cd client
  npm run dev
  ```
  *(Frontend opens on `http://localhost:5173`)*

Visit **`http://localhost:5173`** in your browser!

---

## 🧪 Manual Testing Checklist

Use this checklist to test all features:

1. **Authentication**:
   - [ ] Visit `http://localhost:5173/login`.
   - [ ] Log in with `srikar@example.com` and `password123`.
   - [ ] Verify you are redirected to the Dashboard.
   - [ ] Click **Logout** at the bottom of the sidebar; verify you are redirected to `/login`.
   - [ ] Go to `/register` and create a new user account.
2. **Dashboard**:
   - [ ] Check metric cards: Total Items (12), Active Loans (3), Overdue (1), Groups (2).
   - [ ] Check Recent Activity items showing relative dates (e.g. "2 days ago").
3. **Inventory**:
   - [ ] Navigate to `/inventory`.
   - [ ] Search for "Physics Book" in the search box.
   - [ ] Filter by category "Electronics".
   - [ ] Click the filter pills: `All`, `Available`, `Borrowed`, `Overdue`.
   - [ ] Click **+ Add Item**, fill out the form, and save. Verify the new item appears in the list.
4. **Borrow an Item**:
   - [ ] Find an item with status `Available` (e.g. "Water Bottle").
   - [ ] Click **Borrow**, pick a borrower from the dropdown, choose a due date, and submit.
   - [ ] Verify the item badge changes to `Borrowed` and active loan count increments.
5. **Active Loans & Returning**:
   - [ ] Navigate to `/loans`.
   - [ ] Verify tabs: `Active`, `Overdue`, and `Returned`.
   - [ ] On an active loan, click **Return**.
   - [ ] Choose the return date, optionally enter a note, and click **Confirm Return**.
   - [ ] Verify the item transitions back to `Available` and moves to the `Returned` tab.
6. **Groups**:
   - [ ] Navigate to `/groups`.
   - [ ] Click **Friends Group** to view members and shared group items.
   - [ ] Click **+ Create Group**, enter a name and description, select members with checkboxes, and click **Create Group**.
7. **History**:
   - [ ] Navigate to `/history`.
   - [ ] View loan records and switch timeframe between `Last 30 days`, `Last 60 days`, and `All time`.
8. **Profile**:
   - [ ] Navigate to `/profile`.
   - [ ] Verify user details, avatar initial, and joined groups.
   - [ ] Click **Edit Profile** to change phone number or password.
9. **Responsive Design**:
   - [ ] Open developer tools (`F12`), toggle device toolbar (mobile view < 768px).
   - [ ] Verify the desktop sidebar hides and the mobile bottom navigation bar (`Home`, `Groups`, `Loans`, `Profile`) appears.
