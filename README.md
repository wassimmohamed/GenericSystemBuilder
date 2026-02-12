# GenericSystemBuilder

A monorepo containing a React + Vite frontend and a .NET 8 Minimal API backend.

## Project Structure

```
/root
  /frontend   (React + Vite)
  /backend    (.NET 8 Minimal API)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- .NET 8 SDK
- npm or yarn

### Frontend (React + Vite)

The frontend is built with React and Vite for fast development and optimized production builds.

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (.NET 8 Minimal API)

The backend is a minimal API built with .NET 8, featuring Swagger documentation.

```bash
cd backend
dotnet run
```

The backend will be available at `http://localhost:5000` (or `https://localhost:5001`)

#### Backend Endpoints

- `GET /weatherforecast` - Sample weather forecast endpoint
- `/swagger` - Swagger UI documentation (development only)

## Development

### Running Both Applications

You can run both the frontend and backend simultaneously in separate terminal windows:

Terminal 1 (Frontend):
```bash
cd frontend && npm run dev
```

Terminal 2 (Backend):
```bash
cd backend && dotnet run
```

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```

The production-ready files will be in `frontend/dist/`

### Backend
```bash
cd backend
dotnet publish -c Release -o out
```

The published application will be in `backend/out/`