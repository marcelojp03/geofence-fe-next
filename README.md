# Geofence Management System

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![PrimeReact](https://img.shields.io/badge/PrimeReact-10.9-orange)](https://primereact.org/)
[![AWS Amplify](https://img.shields.io/badge/Deploy-AWS%20Amplify-orange)](https://aws.amazon.com/amplify/)

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

The project uses environment-specific files:

- **Development/Test:** `.env.local` (already configured for localhost:3000)
- **Production:** `.env.production` (configured for AWS App Runner)

To modify environment variables, edit the corresponding file.

### 4. Run development server

```bash
npm run dev
```

Application will be available at [http://localhost:3000](http://localhost:3000)

## Available Commands

| Command | Description | Environment |
|---------|-------------|-------------|
| `npm run dev` | Start development server | Uses `.env.local` |
| `npm run build` | Build for production | Uses `.env.production` |
| `npm start` | Run production server | Uses built production code |
| `npm run lint` | Run ESLint | - |
| `npm run format` | Format code with Prettier | - |

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | Yes | Development: `http://localhost:3000`<br>Production: `https://i8s2qej2p3.us-east-1.awsapprunner.com` |
| `NEXT_PUBLIC_GEOSERVER_URL` | GeoServer WMS endpoint | No | `http://localhost:8080/geoserver` |
| `NODE_ENV` | Environment mode | Auto | `development` or `production` |

## Technology Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **UI Library:** PrimeReact 10.9
- **Styling:** PrimeFlex, SCSS
- **Maps:** Leaflet 1.9, React-Leaflet 5.0
- **HTTP Client:** Axios 1.13.2
- **Language:** TypeScript 5.7
- **Deployment:** AWS Amplify (SSR)

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

## Deployment

This project is configured for **AWS Amplify** with SSR support.

### Deploy to AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Select the `main` branch
3. Amplify will auto-detect Next.js and use `amplify.yml`
4. Add environment variable: `NEXT_PUBLIC_API_URL`

## Documentation

For detailed information about features, architecture, and API integration, see:
- [DOCUMENTATION.md](DOCUMENTATION.md) - Project documentation
- [API_REFERENCE.md](API_REFERENCE.md) - Backend API reference

