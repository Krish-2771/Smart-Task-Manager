AI Smart Task Manager (MERN)

AI-powered task management system with role-based dashboards, secure authentication, analytics, and productivity insights. Built using the MERN stack for portfolio and academic use.

Features :
1. JWT authentication and role-based access (User/Admin)
2. Task creation, editing, deletion, and tracking
3. Admin panel for managing users and system analytics
4. Productivity analytics with charts
5. AI-generated task productivity suggestions
6. Tech Stack

Frontend :
React 18 + Vite
Tailwind CSS
Recharts
Axios

Backend :
Node.js
Express.js
MongoDB + Mongoose
JWT Authentication
bcrypt

Project Structure :

smart-task-manager/
├── client/    # React frontend
└── server/    # Node/Express backend

Setup

1. Clone the repository :
git clone https://github.com/your-username/smart-task-manager.git
cd smart-task-manager

2. Backend
cd server
npm install
cp .env.example .env
npm run dev

4. Frontend
cd client
npm install
npm run dev

Frontend: http://localhost:5173

Backend: http://localhost:5000

Environment Variables
Create server/.env:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

Future Improvements :
1. Email notifications
2. Real-time collaboration
3. Calendar integration
4. PWA support
   
License:
MIT License
