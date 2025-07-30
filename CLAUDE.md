# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Promotor Connect Hub (Portal DMC Promo) - A management system for promoters/sales representatives with features for advance payment requests, kilometer reimbursements, meal vouchers, medical certificates, purchase orders, and internal communications.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **State Management**: React Context (AuthContext) + TanStack Query
- **Design Approach**: Mobile-first for promoters, Desktop-first for administrators

## Commands

```bash
# Development
npm run dev          # Start dev server on port 8080

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Code Quality
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## Key Project Structure

```
/src
  /components
    /dashboard      # Admin and Promotor dashboards
    /forms          # Forms for requests (advances, reimbursements, etc)
    /ui             # Shadcn/ui component library
  /contexts         # AuthContext for authentication
  /hooks            # Custom React hooks
  /integrations     # Supabase client setup
  /pages            # Page components
/supabase           # Database migrations
```

## Database Schema

The complete database structure is defined in planejamento.md and includes:

1. **profiles** - User profiles extending auth.users (admin/promotor roles)
2. **adiantamentos** - Advance payment requests
3. **reembolsos_km** - Kilometer reimbursement requests  
4. **vale_refeicao** - Meal voucher requests
5. **atestados** - Medical certificates
6. **pedidos_compra** - Purchase orders
7. **comprovantes** - Document uploads
8. **avisos** - Company announcements
9. **notificacoes** - In-app notifications

All tables have RLS policies for security.

## Development Status & Roadmap

The project follows a 30-day development plan (see planejamento.md):

### Completed
- Project setup with Vite + React + TypeScript
- Tailwind CSS and Shadcn/ui integration
- Basic project structure
- Supabase integration setup

### Current Phase - Week 1: Foundation
- [ ] Day 1: Setup and Authentication
  - Configure Supabase project
  - Create all database tables
  - Configure RLS policies
  - Setup Storage buckets
  - Integrate Supabase Auth
  - Create AuthContext
  - Implement login/logout

### Upcoming Phases
- Week 2: Core Features (advances, km reimbursements, meal vouchers)
- Week 3: Advanced Features (purchase orders, announcements, notifications)
- Week 4: Refinement (UX improvements, search, performance, security)
- Week 5: Testing, deployment, and training

## Development Guidelines

### User Types
1. **Promoters** (Mobile-first)
   - Simple interface with large icons
   - Gesture navigation
   - Visual dashboards
   - 1-2 click actions
   
2. **Administrators** (Desktop-first)
   - Data tables with bulk actions
   - Complex filters
   - Multiple tabs/windows
   - Detailed reports

### Key Reusable Components to Build
- UploadButton - With preview and progress
- MoneyInput - BRL formatting
- StatusBadge - Standardized colors
- DateRangePicker - Mobile friendly
- ApprovalCard - Quick actions
- EmptyState - With illustration and CTA

### Supabase Configuration
- **Project URL**: Available via MCP tool `mcp__supabase__get_project_url`
- **Anon Key**: Available via MCP tool `mcp__supabase__get_anon_key`
- **Storage Buckets**: atestados, comprovantes, avisos

### Color Scheme
- Primary: Blue (#1e40af)
- Secondary: Gray
- Status Colors:
  - Pending: Yellow
  - Approved: Green
  - Rejected: Red
  - Urgent: Red

### Mobile-First Principles
- Large touch targets (min 44px)
- Bottom navigation for promoters
- Pull-to-refresh on lists
- Skeleton loaders
- Offline capability with localStorage

### Security Considerations
- All data access through RLS policies
- Client + server validation
- Input sanitization
- Session timeout (30 min)
- Audit logs for important actions

## MCP Tools Available

The project has Supabase MCP tools configured for:
- Database operations (execute_sql, apply_migration)
- Branch management (create, merge, reset branches)
- Schema inspection (list_tables, list_extensions)
- Documentation search (search_docs)
- Edge Functions deployment
- TypeScript types generation

## Current Tasks

When implementing features, follow the detailed prompts in planejamento.md for each module. The planning document contains specific implementation details, UI/UX requirements, and example prompts for complex features.

## Important Notes

1. Always check planejamento.md for detailed requirements before implementing features
2. Use mobile-first approach for promoter interfaces
3. Implement real-time updates using Supabase subscriptions where applicable
4. Follow the established color scheme and component patterns
5. Test on mobile devices for promoter features
6. Ensure all monetary values use Brazilian Real (R$) formatting
7. All user-facing text should be in Portuguese