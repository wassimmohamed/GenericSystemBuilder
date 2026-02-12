# GenericSystemBuilder

A **Generic System Builder Platform** where admin users can dynamically configure systems, pages, forms, fields, permissions, and validations — and end users interact with dynamically rendered UIs based on those configurations.

Built as a **monorepo** with a React frontend and .NET 8 backend, storing all configuration in a single PostgreSQL table using JSONB with versioning.

## Project Structure

```
/root
  /frontend   (React + Vite + Bootstrap + Redux Toolkit + React Router)
  /backend    (.NET 8 Minimal API + EF Core + FluentValidation)
```

### Backend Structure

```
/backend
  /Data                  → AppDbContext (EF Core + PostgreSQL)
  /DTOs                  → Request/Response DTOs
  /Endpoints             → Minimal API endpoint definitions
  /Mappings              → Entity ↔ DTO mapping extensions
  /Models                → SystemConfiguration entity + JSONB models
  /Validators            → FluentValidation validators
  Program.cs             → Application entry point
```

### Frontend Structure

```
/frontend/src
  /api                   → API service layer (systemConfigApi)
  /store                 → Redux Toolkit store + slices
  /components
    /layout              → AppLayout, Navbar, Sidebar
    /fields              → DynamicField (all field types)
    DynamicForm.jsx      → Dynamic form renderer with validation
    DynamicList.jsx      → Dynamic list/table renderer
  /pages
    /admin               → SystemList, SystemBuilder, PageBuilder, FieldBuilder
    /runtime             → Dashboard, DynamicPage
```

## Features

- **Dynamic System Configuration**: Create/edit systems with pages, forms, fields, and permissions
- **12 Field Types**: Text, Password, Number, Date, DateTime, TextArea, Slider, Radio, Checkbox, MultiSelect, Autocomplete, MultiSelectAutocomplete
- **Dynamic Validation**: Required, min/max length, range, unique, regex, disabled-on-edit, custom rules — enforced on both frontend and backend
- **Export Collections**: Reusable field collections that can be referenced by autocomplete fields across pages
- **Permission System**: System-level, page-level (List/Create/Edit/Delete), and field-level (View/Edit) permissions
- **Configuration Versioning**: Every update creates a new version; retrieve latest or historical versions
- **Single-Table JSONB Storage**: All configurations stored in one PostgreSQL table
- **Lazy Loading**: Frontend routes use React.lazy for code splitting
- **CORS Support**: Configurable cross-origin settings for frontend-backend communication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- .NET 8 SDK
- PostgreSQL
- npm

### Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE generic_system_builder;
```

Update the connection string in `backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=generic_system_builder;Username=postgres;Password=postgres"
  }
}
```

The database table is auto-created on first run in development mode.

### Frontend (React + Vite)

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

```bash
cd backend
dotnet run
```

The backend will be available at `http://localhost:5000`

#### Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/system-configurations` | List all active systems (latest versions) |
| GET | `/api/system-configurations/{systemKey}` | Get system by key (latest version) |
| GET | `/api/system-configurations/{systemKey}/versions` | List all versions of a system |
| GET | `/api/system-configurations/{systemKey}/versions/{version}` | Get specific version |
| POST | `/api/system-configurations` | Create new system |
| PUT | `/api/system-configurations/{systemKey}` | Update system (creates new version) |
| DELETE | `/api/system-configurations/{systemKey}` | Soft-delete system |
| GET | `/api/system-configurations/{systemKey}/pages/{pageKey}/collections/{name}` | Get export collection |
| GET | `/api/system-configurations/user/{userId}/accessible` | Get user-accessible systems |
| `/swagger` | Swagger UI documentation (development only) |

## Development

### Running Both Applications

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