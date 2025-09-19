
# Shanture Backend (minimal)

## Setup
1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Seed sample data:
   ```bash
   npm run seed
   ```
4. Start server:
   ```bash
   npm run dev
   ```

## Endpoints
- `GET /api/health` - health check
- `POST /api/reports/date-range` - body: { startDate: ISOString, endDate: ISOString } -> returns aggregated report


New endpoints:
- GET /api/reports/history
- GET /api/reports/:id/export (CSV)
- Socket.IO emits 'reportGenerated' when a report is saved
