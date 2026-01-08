# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 to-do app with AI task enhancement via N8N workflows and WhatsApp integration.

### Tech Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Supabase** (PostgreSQL) for persistence
- **Tailwind CSS 4** with custom hand-drawn theme (Caveat font)
- **N8N** for AI enhancement workflows (external)

### Key Patterns

**API Routes** (`src/app/api/`):
- Use `createServerClient()` from `@/lib/supabase` for database operations
- Return typed `ApiResponse<T>` with `{ success, data?, error? }`
- Service role key used for all DB operations (no client auth)

**Client Components**:
- All interactive components use `'use client'`
- `useTasks` hook manages task CRUD and AI enhancement polling
- User identified by email stored in localStorage

**AI Enhancement Flow**:
1. Task created via POST `/api/tasks`
2. Client polls for `enhanced_title` (3s intervals, max 5 attempts)
3. N8N webhook calls PATCH `/api/tasks` with enhanced title

**Webhook Handler** (`/api/webhook/n8n`):
- Actions: `create_task`, `list_tasks`, `complete_task`, `update_enhanced_title`
- Optional secret validation via `x-webhook-secret` header

### Database Schema

```sql
users: id (UUID), email (UNIQUE), name, created_at
tasks: id (UUID), user_id (FK), title, enhanced_title, completed, created_at, updated_at
```

Schema in `supabase-schema.sql`. RLS enabled with service role bypass.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
N8N_WEBHOOK_SECRET (optional)
```

### Type Definitions

All types in `src/lib/types.ts`: `User`, `Task`, `CreateTaskPayload`, `UpdateTaskPayload`, `WebhookPayload`, `ApiResponse<T>`

### Styling

CSS variables defined in `globals.css`. Key classes: `.input-hand`, `.btn-hand`, `.checkbox-hand`. Mobile-first responsive design with touch-optimized targets.
