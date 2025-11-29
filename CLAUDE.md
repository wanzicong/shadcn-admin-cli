# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## 回答问题
永远用中文回答
## Repository Overview

This is a modern React 19 + TypeScript admin dashboard built with Vite, featuring Shadcn UI components and comprehensive development tooling. This is version 2.2.1 and represents a mature, production-ready admin template.

## Key Technology Stack

- **React 19.2.0** with TypeScript (strict mode)
- **Vite 7.2.4** with SWC for fast compilation
- **TanStack Router** with file-system routing and auto code-splitting
- **TanStack Query** for server state management
- **Zustand** for client-side state management
- **TailwindCSS 4.1.17** with Vite integration
- **Shadcn UI** (Radix UI + TailwindCSS) for component library
- **ESLint 9.39.1** with modern flat config
- **Prettier** with TailwindCSS and import sorting plugins

## Development Commands

```bash
# Core Development
pnpm install          # Install dependencies
pnpm dev              # Start development server (Vite + HMR)
pnpm build            # Build for production (TypeScript + Vite)
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint (strict TypeScript + React rules)
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
pnpm knip             # Find unused code and dependencies
```

## Project Architecture

### Directory Structure
```
src/
├── assets/           # Static assets (icons, logos)
├── components/       # Reusable components
│   ├── ui/          # Shadcn UI base components (ignored by ESLint)
│   ├── layout/      # Layout-specific components
│   ├── data-table/  # Reusable data table components
│   └── [various].tsx # Custom components
├── config/          # Configuration files
├── context/         # React context providers
├── features/        # Feature-based organization
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and configurations
├── routes/          # TanStack Router file-based routes
├── stores/          # Zustand stores
└── styles/          # Global styles and CSS
```

### Key Architectural Patterns

1. **Feature-Based Organization**: Code is organized by features in `src/features/[feature]/`
2. **Type Safety**: Comprehensive TypeScript usage with strict configuration, no `any` types
3. **Import Order**: Node.js → React → Third-party → Internal modules (@/ path)
4. **Component Reusability**: Base UI components in `src/components/ui/`

### State Management Hierarchy

1. **URL State** - For shareable state (filters, pagination) via TanStack Router
2. **TanStack Query** - Server state management with caching and synchronization
3. **Zustand** - Global client state (authentication, theme preferences)
4. **useState** - Local component state
5. **React Hook Form** - Form state with Zod validation

## Routing System

**TanStack Router** provides file-system routing with these route groups:
- `/` - Root layout
- `/_authenticated/` - Protected routes requiring authentication
- `/(auth)/` - Authentication pages (sign-in, sign-up, etc.)
- `/(errors)/` - Error pages (401, 403, 404, 500, 503)
- `/clerk/` - Clerk authentication integration routes

## Code Quality Standards

### ESLint Configuration Highlights
- **No console statements** in production (enforced as errors)
- **TypeScript strict mode** with no `any` types
- **React hooks** rules enforcement
- **TanStack Query** best practices
- **Type-only imports** for better tree-shaking
- **UI components ignored**: `src/components/ui/` directory is excluded from linting

### Prettier Configuration
- **Import sorting**: Node.js → React → Third-party → Internal modules
- **TailwindCSS class sorting** for better maintainability
- **Consistent formatting**: 2-space indentation, 80-char line width

## Authentication System

The app includes dual authentication approaches:
1. **Custom JWT-based auth** using Zustand store with cookie persistence
2. **Clerk integration** for production-ready authentication

### Auth Store Pattern
- Cookie-based token persistence in Zustand store
- Automatic token refresh and cleanup
- User state management with role-based access
- Session expiration handling

## API Integration Patterns

### HTTP Client Configuration
- **Axios** with unified interceptors that return `response.data` directly
- **Automatic token injection** for authenticated requests
- **Consistent error handling** across the application via `handleServerError` utility

### Error Handling Strategy
- **Centralized error handling** with toast notifications via Sonner
- **Global query error boundaries** in TanStack Query
- **Consistent user feedback** patterns

## RTL (Right-to-Left) Support

This project includes enhanced RTL support for internationalization:
- **Customized Shadcn components** with RTL-aware positioning
- **Direction context provider** for runtime language switching
- **Modified UI components**: alert-dialog, calendar, command, dialog, dropdown-menu, select, table, sheet, sidebar, switch

> When updating Shadcn components via CLI, the RTL-modified components may need manual merging to preserve RTL support.

## Development Tools Integration

### Vite Configuration
- **Path aliases**: `@/*` → `./src/*`
- **Auto code splitting** with TanStack Router plugin
- **SWC compilation** for faster builds
- **TailwindCSS Vite plugin** integration

### TypeScript Configuration
- **Project references**: Separate configs for app and node environments
- **Strict mode**: No implicit any, comprehensive type checking
- **Path resolution**: `@/` alias for clean imports

## Performance Optimizations

1. **Code Splitting**: Automatic route-based code splitting with TanStack Router
2. **Bundle Optimization**: Tree shaking with type-only imports
3. **Caching Strategy**: TanStack Query with 10-second stale time
4. **Development Tools**: React Query DevTools and Router DevTools in dev mode
5. **Unused Code Detection**: Knip integration for bundle size optimization

## Key Dependencies

### Core Libraries
- `@tanstack/react-router` - File-system routing with type safety
- `@tanstack/react-query` - Server state management
- `@tanstack/react-table` - Table components with sorting/filtering
- `zustand` - Global client state management
- `axios` - HTTP client with interceptors
- `react-hook-form` + `@hookform/resolvers` - Form handling with Zod validation

### UI Components
- `@radix-ui/*` - Accessible component primitives
- `lucide-react` - Icon library
- `recharts` - Chart components
- `react-day-picker` - Date picker component
- `cmdk` - Command palette functionality

## Development Workflow

### Before Committing
1. Run `pnpm lint` to check for ESLint errors
2. Run `pnpm format` to format code
3. Run `pnpm build` to ensure successful build
4. Run `pnpm knip` to check for unused code

### File Naming Conventions
- **Components**: PascalCase (e.g., `DataTable.tsx`)
- **Files**: kebab-case (e.g., `user-profile.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)

### Import Organization
```typescript
// 1. Node.js built-ins
import path from 'path'

// 2. React
import { useState, useEffect } from 'react'

// 3. Third-party libraries
import { QueryClient } from '@tanstack/react-query'

// 4. Internal modules (@/ path)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
```

## Build & Deployment

- **Production builds**: TypeScript compilation + Vite bundling
- **Static site ready**: Compatible with Netlify, Vercel, etc.
- **Environment variables**: `VITE_` prefix for client-side access
- **Development server**: Hot Module Replacement with Vite

This codebase represents a modern, production-ready React admin template with excellent developer experience, comprehensive tooling, and thoughtful architectural patterns that prioritize maintainability, performance, and accessibility.