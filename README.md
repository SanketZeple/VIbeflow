# Fullstack Project Starter

A production‑ready fullstack starter with React (Vite) + Tailwind frontend and FastAPI (Python) backend.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios
- **Backend**: FastAPI, SQLAlchemy, Alembic, JWT authentication
- **Database**: PostgreSQL
- **Tooling**: ESLint, PostCSS, Vite proxy

## Project Structure

```
.
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── utils/         # Utility functions
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py        # FastAPI app entry
│   │   ├── api/           # Route handlers
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── core/          # Config, security, utils
│   │   └── db/            # Database session & base
│   ├── tests/
│   ├── alembic/           # Database migrations
│   ├── alembic.ini
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Python 3.11+
- pip (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. The API will be available at `http://localhost:8000`. OpenAPI docs at `http://localhost:8000/docs`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The frontend will be available at `http://localhost:3000` and proxies API requests to `http://localhost:8000`.

## Docker Deployment

The entire stack can be run with Docker Compose. This is the easiest way to get the application running with a single command.

### Prerequisites

- Docker and Docker Compose installed.

### Steps

1. Clone the repository (if not already).
2. Create `.env` files with the required environment variables (see Environment Variables section below).
3. From the project root, run:

   ```bash
   docker-compose up
   ```

4. Wait for the containers to build and start. The frontend will be accessible at **http://localhost:8080**.

### What's included

- **PostgreSQL** database with a volume mount (`postgres_data`) that persists data across container restarts.
- **Backend** FastAPI service running on port 8000 (internally) with automatic migrations.
- **Frontend** React app built and served on port 3000 (mapped to host port 8080).

### Stopping the stack

Press `Ctrl+C` or run `docker-compose down` to stop and remove containers. To also remove the database volume, use `docker-compose down -v`.

### Running tests inside Docker

To run the backend tests inside the backend container:

```bash
docker-compose exec backend pytest
```

All tests should pass.

## Development

### Backend

- The backend uses FastAPI with automatic OpenAPI documentation.
- Database models are defined in `app/models/`.
- Migrations are managed via Alembic (see `alembic/`).
- JWT authentication is pre‑configured in `app/core/security.py`.

### Frontend

- The frontend uses Vite for fast builds and HMR.
- Tailwind CSS is configured for utility‑first styling.
- Axios instance with interceptors is set up in `src/services/api.js`.
- Example components, hooks, and pages are provided as placeholders.

## Environment Variables

The application requires two `.env` files for Docker Compose deployment:

### 1. Root `.env` file (for Docker Compose)
Create `.env` in the project root with:

```env
# PostgreSQL Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=vibeflow
POSTGRES_PORT=5432

# Backend Service Configuration
BACKEND_PORT=8001
SECRET_KEY=your-secure-secret-key-change-this-in-production
DEBUG=False

# Frontend Service Configuration
FRONTEND_PORT=8080
VITE_API_BASE_URL=http://localhost:8001

# Database URL (used by backend)
DATABASE_URL=postgresql+psycopg2://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
```

### 2. Backend `.env` file
Create `backend/.env` with:

```env
APP_NAME=Backend API
DEBUG=False
SECRET_KEY=your-secure-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql+psycopg2://postgres:postgres@postgres:5432/vibeflow
```

**Note**: Both `.env` files are gitignored. Use these templates to create your own configuration files.

## Running Tests

Backend tests (placeholder):
```bash
cd backend
pytest
```

Frontend tests (to be added):
```bash
cd frontend
npm test
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

The built static files will be in `dist/`.

### Backend
Ensure you set `DEBUG=False` and use a production‑grade ASGI server like `uvicorn` with workers or `gunicorn` with `uvicorn` workers.

## License

MIT