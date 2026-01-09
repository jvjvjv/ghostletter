# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## TODO: Issues to Fix

1. **Photo Preview**: "Click to view photo" should display a blurred version of the photo instead of placeholder text.
2. **Expiration Time Configuration**: Expiration time should be controlled via API call rather than hardcoded magic numbers in the UI source code.
3. **Use better icons**: When I didn't specify, Github Copilot did not choose good icons. Need to replace them with actually nice looking ones, that better fit the mobile device vibe.
4. **Turn off camera when not on Camera page**: Right now the camera stays on even when navigating away from the Camera page, wasting resources, battery, and probably causing privacy concerns.

## Project Overview

Ghost Letter is an ephemeral messaging platform (similar to Snapchat) built as a pnpm monorepo with:

- **UI**: Next.js 16 frontend with React 19, Mantine UI component library, and Redux Toolkit
- **API**: Laravel 12 backend with Sanctum authentication and RESTful API

## Development Commands

### Root Level (Monorepo)

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Run both UI and API concurrently
pnpm dev:ui               # Run frontend only (port 3000)
pnpm dev:api              # Run backend only (port 8000)
pnpm build                # Build both projects
pnpm lint                 # Lint all projects
```

### UI-Specific Commands

```bash
pnpm --filter ghost-letter-ui dev      # Start dev server with Turbopack
pnpm --filter ghost-letter-ui build    # Production build
pnpm --filter ghost-letter-ui lint     # Run ESLint
```

### API-Specific Commands

```bash
pnpm --filter ghost-letter-api dev             # Start Laravel server
pnpm --filter ghost-letter-api test            # Run PHPUnit tests
pnpm --filter ghost-letter-api migrate         # Run migrations
pnpm --filter ghost-letter-api migrate:fresh   # Reset database with seed data
pnpm --filter ghost-letter-api lint            # Run Laravel Pint (code formatter)

# Direct Laravel commands (from API directory)
cd API
php artisan test                        # Run all tests
php artisan test --filter=MessageTest  # Run specific test
php artisan migrate:fresh --seed       # Reset DB with seeds
php artisan pint                        # Format code
php artisan storage:link                # Link storage for images
```

### Initial Setup

```bash
# From root
pnpm install

# Setup API
cd API
cp .env.example .env      # Create environment file
php artisan key:generate  # Generate app key
php artisan migrate       # Run migrations
php artisan storage:link  # Link storage directory
```

## Architecture

### Monorepo Structure

```
ghostletter/
├── UI/                  # Next.js 16 frontend
│   ├── src/
│   │   ├── app/        # Next.js App Router pages
│   │   ├── components/ # React components
│   │   ├── store/      # Redux slices (auth, friends, messages, users)
│   │   ├── clientApi/  # API client functions
│   │   ├── lib/        # Utilities
│   │   └── types/      # TypeScript types
│   └── package.json
├── API/                 # Laravel 12 backend
│   ├── app/
│   │   ├── Http/Controllers/Api/  # API controllers
│   │   ├── Models/                # Eloquent models
│   │   ├── Repositories/          # Data access layer
│   │   ├── Services/              # Business logic layer
│   │   └── Actions/Fortify/       # Auth actions
│   ├── routes/api.php             # API routes (all protected by auth:sanctum)
│   ├── database/migrations/       # Database schema
│   └── tests/                     # PHPUnit tests
└── package.json         # Monorepo scripts
```

### API Architecture Pattern

The Laravel backend follows a **Repository-Service-Controller** pattern:

1. **Controllers** (`app/Http/Controllers/Api/`): Handle HTTP requests/responses, delegate to Services
2. **Services** (`app/Services/`): Contain business logic, orchestrate operations
3. **Repositories** (`app/Repositories/`): Handle database queries and data persistence
4. **Models** (`app/Models/`): Eloquent ORM models (User, Friend, Message, Image)

**Flow**: Request → Controller → Service → Repository → Model → Database

### UI Architecture

- **App Router**: Uses Next.js 16 App Router with route groups:

  - `(auth)/`: Authentication pages (sign-in)
  - `(legal)/`: Terms and privacy pages
  - `main/`: Protected main app (chat, camera, send-to)

- **State Management**: Redux Toolkit with slices:

  - `authSlice`: User authentication state
  - `friendsSlice`: Friends list and relationships
  - `messagesSlice`: Messages and conversations
  - `usersSlice`: User profiles

- **API Communication**: Client API functions in `src/clientApi/` handle backend requests

### Database Schema

**Core Models**:

- `users`: User accounts with 2FA support, avatar, initials, color
- `friends`: Bilateral friendship relationships (user_id, friend_id)
- `messages`: Text and image messages with read/viewed tracking, expiry timestamps
- `images`: Uploaded image files with storage paths

**Key Relationships**:

- Users have many Friends (many-to-many through friends table)
- Users have many Messages (sent and received)
- Messages may have one Image

### Authentication Flow

- **Backend**: Laravel Fortify + Bspdx/Authkit with Sanctum tokens

  - Supports email/password, 2FA (TOTP), and passkeys (WebAuthn)
  - All API routes protected by `auth:sanctum` middleware

- **Frontend**: Redux manages auth state with token storage
  - Auth endpoints: `/register`, `/login`, `/logout`, `/two-factor-authentication`

### API Endpoints

All endpoints require authentication except login/register (handled by Fortify).

**Friends**: `/api/friends` (CRUD), `/api/friends-list`
**Messages**: `/api/messages`, `/api/conversations/{friendId}`, mark-read, mark-viewed
**Images**: `/api/images/upload`
**User**: `/api/user`

See `API/routes/api.php` for complete route definitions.

## Key Technical Details

- **Next.js**: Uses Turbopack for dev server, experimental view transitions enabled
- **Mantine**: Component library with built-in theming, hooks, and form management
- **Laravel**: v12 with PHP 8.4+, uses SQLite for testing (in-memory)
- **Testing**: PHPUnit for API tests (Feature and Unit suites)
- **Image Handling**: Laravel storage with symbolic link, Next.js Image component with remote patterns
- **Ephemeral Messages**: Messages track `viewed_at` and `expires_at` for self-destruct functionality
