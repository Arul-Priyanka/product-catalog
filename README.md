# product-catalog
a product catalogue with filters
# Product Catalog App

An elegant three-column product catalog with type filtering, built with ReactJS and NodeJS (no MongoDB).

## Setup

1. Install dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
2. Run locally:
   - Backend: `cd backend && npm start` (runs on http://localhost:5000)
   - Frontend: `cd frontend && npm start` (runs on http://localhost:3000)

## Deployment to Render (Free Tier)

1. Push to GitHub.
2. Create two services on Render:
   - **Backend (Web Service)**:
     - Runtime: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Root Directory: `backend`
   - **Frontend (Static Site)**:
     - Build Command: `npm install && npm run build`
     - Publish Directory: `build`
     - Root Directory: `frontend`
3. Update `frontend/src/App.js` API URLs to your Render backend URL.
4. Redeploy frontend after changes.

## Features
- Three-column responsive grid.
- Filter by product type via dropdown.
- Data from JSON file (editable in backend/products.json).
- Secure with Helmet and CORS.
