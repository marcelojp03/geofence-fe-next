# Geofence Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![PrimeReact](https://img.shields.io/badge/PrimeReact-10.8-orange)](https://primereact.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

Web application for real-time geofence monitoring and location tracking management.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/marcelojp03/geofence-fe-next.git
cd geofence-fe-next
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GEOSERVER_URL=http://localhost:8080/geoserver
```

### 4. Run development server

```bash
npm run dev
```

Application will be available at [http://localhost:3000](http://localhost:3000)

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | Yes |
| `NEXT_PUBLIC_GEOSERVER_URL` | GeoServer WMS endpoint | No |

## Technology Stack

- **Framework:** Next.js 15.5 (App Router)
- **UI Library:** PrimeReact 10.8
- **Styling:** PrimeFlex, SCSS
- **Maps:** Leaflet 1.9, React-Leaflet 5.0
- **HTTP Client:** Axios 1.7
- **Language:** TypeScript 5.7

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── (full-page)/       # Public pages
│   └── (main)/            # Protected pages
├── components/            # React components
├── lib/                   # Business logic
│   ├── api/              # API services
│   ├── auth/             # Authentication
│   └── types/            # TypeScript definitions
├── layout/               # Layout components
└── public/               # Static assets
```

## Documentation

For detailed information about features, architecture, and API integration, see [DOCUMENTATION.md](DOCUMENTATION.md)

## License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.

## Academic Context

**Institution:** Universidad Autónoma Gabriel René Moreno (UAGRM)  
**Course:** Sistemas de Información Geográfica  
**Semester:** 2-2025
