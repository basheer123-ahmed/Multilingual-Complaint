# Citizen Grievance Portal

A full-stack MERN application for citizens to report civic issues and authorities to resolve them. Includes geospatial tracking and high-fidelity analytics.

### Stack
- **Frontend**: React.js, TailwindCSS v4, Framer Motion, Lucide-React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Geospatial Indexing)
- **Auth**: JWT (Stateless)
- **Visualization**: Chart.js

### Quick Start
1. **Navigate to backend and install**:
   ```bash
   cd backend
   npm install
   ```

2. **Navigate to frontend and install**:
   ```bash
   cd ../frontend
   npm install
   ```

3. **Seed the database (Run from root folder)**:
   ```bash
   # Make sure MongoDB is running locally
   node seed.js
   ```

4. **Run Application**:
   - Backend: `npm run dev` in `/backend`
   - Frontend: `npm run dev` in `/frontend`

### User Roles (Seeded Accounts)
- **Admin**: admin@city.gov / password123
- **Citizen**: alex@gmail.com / password123
- **Officer**: john@pwd.gov / password123

### Features
- **Geospatial Hotspot Map**: Identify clusters of complaints using MongoDB 2dsphere index.
- **Priority Engine**: Issues automatically categorized as Low/Medium/High/Critical based on category and severity.
- **Dynamic Resolution Timeline**: Real-time status updates tracked in a history stack.
- **Advanced Dashboard**: Glassmorphism UI with interactive charts for executive tracking.
