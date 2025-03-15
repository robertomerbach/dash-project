# Dashboard Project Architecture

## Overview
Dashboard is a platform for management and performance analysis for blogs that use Google AdSense and Facebook Ads. Built with modern technologies, the project uses TypeScript for both frontend and backend, allowing a cohesive and typed development experience.

## Project Structure
The project is organized in a Next.js directory structure, with clear separation of responsibilities:

### Main Components

- `src/app`: Next.js Application Router
  - Technology: Next.js 14+
  - Purpose: Provides the application routes and pages
  - Key responsibilities: Page rendering, API routes, navigation flows

- `src/components`: Component Library
  - Technology: React + ShadCN UI
  - Purpose: Reusable interface components
  - Responsibilities: UI elements, tables, charts, forms, layouts

- `src/lib`: Libraries and Configurations
  - Purpose: Configurations and integrations with external services
  - Contents: Prisma configuration, Auth.js, integrations with external APIs

- `src/services`: Service Layer
  - Purpose: Business logic isolated from the interface
  - Responsibilities: Data manipulation, interaction with external APIs

- `src/actions`: Server Actions
  - Technology: Next.js Server Actions
  - Purpose: Mutations and data processing on the server
  - Responsibilities: Validation, data persistence, security

- `src/hooks`: Custom Hooks
  - Purpose: Reusable logic for React components
  - Responsibilities: State management, data requests, API interactions

## Technology Stack

### Frontend
- Framework: Next.js (App Router)
- UI Library: ShadCN UI (Tailwind CSS)
- State Management: React Context + React Query
- Charts and Visualizations: ReCharts

### Backend
- API Routes: Next.js API Routes
- Server Actions: Next.js Server Actions
- HTTP Client: Axios
- Validation: Zod

### Data Layer
- ORM: Prisma
- Database: PostgreSQL
- Schema: Relational model with main entities (User, Team, Site, Account, Integration)

### Authentication
- System: Auth.js (NextAuth)
- Method: OAuth 2.0 for Google and Facebook integrations
- Authorization: Role-based system (ADMIN, MANAGER, MEMBER)

### External Integrations
- Google AdSense API
  - Purpose: Obtaining metrics and sites
  - Implementation: OAuth + REST API

- Facebook Ads API
  - Purpose: Obtaining campaign and ad metrics
  - Implementation: OAuth + Graph API

## Data Architecture

### Main Entities
- **User**: Platform users with different access levels
- **Team**: Work teams that group users
- **Site**: Sites/blogs monitored by the platform
- **Account**: Connected external accounts (AdSense/Facebook)
- **Integration**: Integration details and access tokens
- **Report**: Saved reports and configurations

### Data Flows
1. **Authentication**:
   - Login via credentials or OAuth
   - Session maintenance via Auth.js

2. **Account Integration**:
   - OAuth authorization with Google/Facebook
   - Secure token storage
   - Automatic refresh when needed

3. **Data Collection**:
   - Scheduled requests to external APIs
   - Storage and normalization of received data
   - Caching of frequent requests

4. **Visualization and Analysis**:
   - Data aggregation by different dimensions
   - Rendering of charts and tables
   - Dynamic filters by site, source, country, etc.

## Security and Performance

### Security
- Robust authentication via Auth.js
- Role-based authorization
- Limited scope tokens for external APIs
- Input validation with Zod

### Performance
- SSR/SSG for static pages when possible
- Optimized caching with React Query
- Optimized requests for external APIs
- Pagination and on-demand loading

### Separation of Concerns
- **UI**: React components focused on rendering
- **Server Actions**: Secure operations on the server side
- **Services**: Isolated business logic
- **Hooks**: State management and requests

## Scalability
- Modular architecture for adding new integrations
- Customizable reporting system
- Support for multiple users and teams
- Database design prepared for data growth

This document represents the high-level architecture of the Dashboard Project, highlighting the main components, data flows, and technological decisions that form the basis of the platform.