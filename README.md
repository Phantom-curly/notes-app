# 📝 Notes App

A full‑stack note‑taking app with user authentication, rich text editing, and a clean interface.

🔗 **Live Demo**: [https://your-frontend-url.vercel.app]()  
🔗 **API**: [https://your-backend-url.onrender.com/api/notes]()

---

## ✨ Features

- 🔐 JWT authentication (login / register)
- ✍️ Rich text editor (bold, italic, lists, quotes)
- 🏷️ Organise notes with tags and search/filter
- 📱 Responsive design

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, TipTap  
- **Backend**: Node.js, Express, Prisma, PostgreSQL  
- **Deployment**: Vercel (frontend), Render (backend)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/notes-app.git
cd notes-app
2. Backend
bash
cd notes-app-server
npm install
cp .env.example .env   # add DATABASE_URL & JWT_SECRET
npx prisma migrate dev
npm run dev
3. Frontend
bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
Open http://localhost:5173.

🔒 Environment Variables
Variable	Description
DATABASE_URL	PostgreSQL connection string
JWT_SECRET	Secret for JWT tokens
VITE_API_URL	Backend URL

📄 License
MIT – see LICENSE.

👤 Author
Dilmurod 
