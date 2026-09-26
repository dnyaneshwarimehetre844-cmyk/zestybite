zestybite/
├── frontend/   # Customer website
├── admin/      # Admin panel
└── backend/    # Node.js + Express API/ Node.js + Express + MongoDB API used by both apps

Technologies Used-
React + Vite
Node.js + Express
MongoDB + Mongoose
JWT + bcrypt
Axios
Stripe (optional)
Nodemailer (optional)
Google Generative AI (optional)


Project setup-

cd backend
npm install

cd ../frontend
npm install

cd ../admin
npm install

Backend-
MONGO_URI=your_mongodb_url
PORT=5000
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

Frontend-
VITE_API_URL=http://localhost:5000/api

Admin-
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173

add data direct to database-
npm run seed            
npm run seed:categories 
npm run seed:admin      

Run Project-

Open 3 terminals:

cd backend
npm run dev
cd frontend
npm run dev
cd admin
npm run dev