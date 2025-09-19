
# Shanture - MERN Sales Analytics (minimal deliverable)

This archive contains a minimal backend (Express + Mongoose) and frontend (React) implementing:
- Date-range aggregation endpoint
- Sample seed script that populates orders across 2 years with regions & categories
- Frontend UI with date picker and charts (ECharts)

## How to run locally

### Backend
1. Install dependencies
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # edit .env to set MONGODB_URI if necessary
   npm run seed   # optionally seed the DB (requires running MongoDB)
   npm run dev
   ```

### Frontend
1. Install dependencies
   ```bash
   cd frontend
   npm install
   npm start
   ```

Open `http://localhost:3000` for the frontend and `http://localhost:4000` for the backend. Adjust ports in `.env` if needed.
