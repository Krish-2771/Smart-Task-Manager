# 🧠 AI-Based Smart Task Management System

A full-stack MERN application with Admin/User dashboards, JWT auth, AI productivity insights, and rich analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### 1. Clone & Setup

```bash
git clone <your-repo>
cd smart-task-manager
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

App runs at: `http://localhost:5173`  
API runs at: `http://localhost:5000`

## 📁 Project Structure

```
smart-task-manager/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── hooks/
│       └── utils/
├── server/          # Node + Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── controllers/
└── README.md
```

## 🔐 Default Roles
- **User** – Manage own tasks, view analytics
- **Admin** – Full system access, user management

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
