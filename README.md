# MATCHBOX 📦

A student project team matching platform that connects university students with complementary skills for collaborative projects.

## 📁 Project Structure

```
matchbox/
├── MagicPatternsCode/      # Frontend (React + Vite)
│   └── Front End/          # Main frontend application
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── context/
│       │   └── App.tsx
│       ├── package.json
│       └── vite.config.ts
│
└── backend/                # Backend API (Node.js + Express + TypeScript)
    ├── src/
    │   ├── models/         # MongoDB models
    │   ├── controllers/    # Request handlers
    │   ├── routes/         # API routes
    │   ├── middleware/     # Auth & error handling
    │   ├── config/         # Database config
    │   └── server.ts       # Entry point
    ├── package.json
    └── README.md           # Backend documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v6+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd matchbox
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Setup Frontend
```bash
cd "MagicPatternsCode/Front End"
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📖 Documentation

- **Backend API Documentation**: See [backend/README.md](backend/README.md)
- **API Reference**: See [backend/API_REFERENCE.md](backend/API_REFERENCE.md)
- **Quick Start Guide**: See [backend/QUICKSTART.md](backend/QUICKSTART.md)
- **Project Structure**: See [backend/STRUCTURE.md](backend/STRUCTURE.md)

## 🎯 Features

- ✅ User authentication with .edu email validation
- ✅ Profile management with skills rating
- ✅ Project creation and management
- ✅ Team role-based applications
- ✅ Dual-approval matching system ("BOXED")
- ✅ Direct messaging and group chats
- ✅ Smart recommendations
- ✅ Availability calendar
- ✅ Resume/profile uploads

## 🛠️ Tech Stack

### Frontend
- React 18.3.1
- TypeScript 5.5.4
- Vite 5.2.0
- React Router DOM 6.26.2
- Tailwind CSS 3.4.17
- Lucide React (icons)

### Backend
- Node.js with TypeScript
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Helmet for security

## 👥 Team

MOR 531 Project Team

## 📝 License

MIT

---

**Built with ❤️ for student collaboration**
