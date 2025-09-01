# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint` (with auto-fix) or `npm run lint:check` (check only)
- **Format code**: `npm run format` (format files) or `npm run format:check` (check only)
- **Type check**: `npm run typecheck` (when TypeScript is added)

## Project Architecture

This is a Vue 3 activation monitoring application built with:
- **Frontend**: Vue 3 + Vite + PrimeVue UI components
- **State Management**: Pinia stores
- **Routing**: Vue Router with role-based access control
- **Styling**: SCSS + CSS variables
- **HTTP Client**: Axios with centralized API service

### Key Architecture Patterns

#### Store Management
- Centralized store system in `src/stores/index.js` with utilities for initialization, synchronization, and error handling
- Individual stores for auth, activations, clients, warehouse, users, and reports
- Store hydration utilities for data persistence and restoration

#### API Architecture
- Centralized API service in `src/services/api.js` with automatic token refresh, error handling, and request interceptors
- Service layer pattern with specialized services (authService, userService, clientService, etc.)
- Base URL configured for localhost:8080/api

#### Component Structure
- Component organization by feature: buttons/, cards/, charts/, form-components/, tables/, ui/
- Reusable base components in ui/ directory (BaseAlert, BaseButton, BaseCard, etc.)
- Business components organized by domain (activations/, clients/, warehouses/, etc.)

#### Authentication & Authorization
- Role-based routing with guards in `src/router/index.js`
- Roles: ADMIN, ACTIVATION_MANAGER, CLIENT, PROMOTER, WAREHOUSE_MANAGER
- Token-based authentication with localStorage persistence
- Route metadata includes `requiresAuth` and `roles` for access control

#### View Structure
- Feature-based view organization matching the routing structure
- Dashboard views differentiated by user role
- CRUD operations for main entities (activations, clients, users, warehouses)

### File Import Patterns
- Path aliases configured: `@` maps to `src/`
- Vue runtime compilation enabled for template compilation
- Centralized component exports in `src/components/index.js`

### Dependencies
- PrimeVue 4.0 RC with Aura theme for UI components
- Chart.js with vue-chartjs for data visualization
- Vuelidate for form validation
- Firebase integration for additional services
- Moment.js for date handling
- SCSS/Sass for styling

### API Integration
- Services expect backend running on localhost:8080
- RESTful API patterns with consistent error handling
- File upload/download capabilities
- Pagination support for list endpoints
- Batch request utilities for multiple operations

## Important Notes

- The project is named "Activation Monitor" - a professional activation monitoring and management system
- Role-based access control is implemented throughout the application
- The codebase includes comprehensive error handling and loading states
- Store synchronization ensures data consistency across different parts of the application

## Code Quality Tools

- **ESLint**: Configured with Vue 3 and Prettier integration
- **Prettier**: Code formatting with consistent style rules
- **Pre-commit hooks**: Automated code quality checks before commits
- **Environment variables**: Use `.env.example` as template for configuration

## Security Implementations

- Consolidated token storage using consistent keys
- Global error handling for better user experience
- Route-based code splitting for performance
- Input validation composable for form security

## Available Composables

- `useValidation`: Comprehensive form validation with common rules
- `useLoading`: Loading state management for UI feedback
- `useAuth`: Authentication state and methods
- `useToaster`: Toast notifications
- `usePermissions`: Role-based access control