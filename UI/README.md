# Ghost Letter UI

The frontend for Ghost Letter - an ephemeral messaging platform built with Next.js 16 and React 19.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit
- **HTTP Client**: Native Fetch API
- **Forms**: React Hook Form + Zod
- **Testing**: Playwright (E2E)
- **Dev Server**: Turbopack

## 📁 Project Structure

```
UI/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages (sign-in)
│   │   ├── (legal)/           # Legal pages (terms, privacy)
│   │   └── main/              # Protected app pages
│   │       ├── camera/        # Camera capture
│   │       ├── chat/          # Message list & conversations
│   │       └── send-to/       # Image sending
│   ├── clientApi/             # API client functions
│   │   ├── client.ts          # Base HTTP client with auth
│   │   ├── auth.ts            # Authentication API
│   │   ├── friends.ts         # Friends API
│   │   ├── messages.ts        # Messages API
│   │   ├── images.ts          # Image upload API
│   │   └── user.ts            # User profile API
│   ├── components/            # React components
│   │   ├── Avatar.tsx
│   │   ├── GhostForm/         # Form component
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities
│   │   └── apiConfig.ts       # API configuration
│   ├── store/                 # Redux state management
│   │   ├── authSlice.ts       # Authentication state
│   │   ├── friendsSlice.ts    # Friends state
│   │   ├── messagesSlice.ts   # Messages state
│   │   ├── usersSlice.ts      # Users state
│   │   └── hooks.ts           # Typed Redux hooks
│   └── types/                 # TypeScript types
│       ├── api.ts             # API response types
│       ├── User.ts            # User types & mappers
│       ├── Friend.ts          # Friend types & mappers
│       └── Message.ts         # Message types & mappers
├── e2e/                       # Playwright E2E tests
│   ├── auth.spec.ts           # Authentication tests
│   └── README.md              # Testing documentation
├── public/                    # Static assets
└── playwright.config.ts       # Playwright configuration
```

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Laravel API running on `http://localhost:8000`

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

### Development
```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Testing
```bash
# Unit Tests (Vitest)
pnpm test               # Run unit tests
pnpm test:watch         # Run unit tests in watch mode
pnpm test:coverage      # Run unit tests with coverage report

# E2E Tests (Playwright)
pnpm test:e2e           # Run E2E tests (headless)
pnpm test:e2e:ui        # Run E2E tests with UI mode
pnpm test:e2e:headed    # Run E2E tests in headed browser
pnpm test:e2e:debug     # Debug E2E tests step-by-step
```

## 🔌 API Integration

The UI connects to the Laravel backend via a custom API client built on native Fetch API.

### Authentication Flow

1. User logs in with username/password at `/sign-in`
2. API returns user data + JWT token
3. Token stored in cookie (`auth-token`)
4. All API requests automatically include `Authorization: Bearer {token}` header
5. 401 responses automatically clear auth state and redirect to login

### API Client Features

- **Automatic token injection** from cookies
- **Centralized error handling** (401 redirects, network errors)
- **Type-safe responses** with TypeScript generics
- **Request/response logging** in development
- **Base URL configuration** via environment variables

### Using the API Client

```typescript
import { login } from '@/clientApi/auth';
import { getFriendsList } from '@/clientApi/friends';
import { sendMessage } from '@/clientApi/messages';

// Login
const result = await login('demo01', 'demo01');

// Get friends
const friends = await getFriendsList();

// Send message
await sendMessage(recipientId, 'Hello!', 'text', currentUserId);
```

## 🗂️ State Management

Redux Toolkit manages application state with the following slices:

### Auth Slice (`authSlice.ts`)
- Current user data
- Authentication token
- Login/logout thunks
- Session management

### Friends Slice (`friendsSlice.ts`)
- Friends list
- Fetch friends thunk
- Friend selection

### Messages Slice (`messagesSlice.ts`)
- All messages by friend ID
- Conversation loading states
- Send/fetch/mark-read/mark-viewed thunks
- Message expiry tracking

### Users Slice (`usersSlice.ts`)
- User profiles cache
- User lookup by ID

## 🎨 Styling

The app uses **Tailwind CSS 4** with:
- Custom theme configuration
- shadcn/ui components
- Tailwind Animate for animations
- PostCSS compilation

### Adding New Styles

1. Use Tailwind utility classes in components
2. For complex components, use `cn()` helper from `lib/utils`
3. Global styles in `app/globals.css`

## 🧪 Testing

Ghost Letter UI uses two testing approaches:

1. **Unit Tests** (Vitest + React Testing Library) - Test individual functions, components, and logic
2. **E2E Tests** (Playwright) - Test complete user flows in a real browser

### Unit Testing

Unit tests validate individual pieces of code in isolation.

**Running Unit Tests:**

```bash
# Run all unit tests
pnpm test

# Watch mode (re-runs tests on file changes)
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

**Test Files:**

Unit tests are located next to the files they test with a `.test.ts` or `.test.tsx` suffix:

- `src/clientApi/auth.test.ts` - API client functions
- `src/store/authSlice.test.ts` - Redux slice logic
- `src/types/User.test.ts` - Type mapper functions

**Example test locations:**
```
src/
├── clientApi/
│   ├── auth.ts
│   └── auth.test.ts          ← Unit test for auth API
├── store/
│   ├── authSlice.ts
│   └── authSlice.test.ts     ← Unit test for auth slice
└── types/
    ├── User.ts
    └── User.test.ts          ← Unit test for User mappers
```

**Writing Unit Tests:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### End-to-End Testing

E2E tests validate complete user flows in a real browser environment.

**Prerequisites:**

Before running E2E tests, ensure:
1. API backend is running (`http://localhost:8000`)
2. Database is seeded with demo user (username: `demo01`, password: `demo01`)

**Running E2E Tests:**

```bash
# Run all E2E tests (headless)
pnpm test:e2e

# Interactive UI mode (recommended for development)
pnpm test:e2e:ui

# See the browser (useful for debugging)
pnpm test:e2e:headed

# Debug mode (step through tests)
pnpm test:e2e:debug
```

**E2E Test Files:**

End-to-end tests are in the `e2e/` directory:

- `e2e/auth.spec.ts` - User authentication flows

### Test Coverage

**Unit Tests:**
- ✅ API client functions (auth, user, messages, friends, images)
- ✅ Redux slices (auth, messages, friends, users)
- ✅ Type mappers (User, Message, Friend)

**E2E Tests:**
- ✅ User authentication (login, validation)
- 🔜 Message sending/receiving
- 🔜 Image upload and ephemeral viewing
- 🔜 Friend management

See [e2e/README.md](e2e/README.md) for detailed E2E testing documentation.

## 🔐 Authentication

The app uses **username-based authentication** (not email).

### Default Credentials

For development/testing:
- **Username**: `demo01`
- **Password**: `demo01`

### Token Storage

Auth tokens are stored in cookies:
- Cookie name: `auth-token`
- Expiration: 7 days
- SameSite: Strict
- Secure: Only in production

## 📱 Key Features

### Camera Integration
- Real-time camera access via `getUserMedia`
- Photo capture to canvas
- Base64 image storage in localStorage
- File object conversion for upload

### Ephemeral Images
- Images expire after viewing
- 10-second countdown timer
- Automatic blur effect after expiry
- Backend tracking of view timestamps

### Message Types
- **Text**: Standard text messages
- **Image**: Photos with ephemeral viewing

### Friend Management
- Add/remove friends
- Friend list with avatars
- Initials and color generation for avatars

## 🐛 Debugging

### API Issues

Check the browser console for API errors. The client logs all requests/responses in development mode.

### State Issues

Install [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/) to inspect state changes.

### Routing Issues

Check Next.js console output for routing errors. Use `console.log` in page components to debug.

## 📚 Code Conventions

### TypeScript
- Use strict type checking
- Define interfaces for all API responses
- Use type mappers to convert API types to frontend types

### Components
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic to custom hooks

### Naming
- Components: PascalCase (`Avatar.tsx`)
- Files: camelCase (`apiConfig.ts`)
- Types: PascalCase (`User`, `Message`)
- Functions: camelCase (`getFriendsList`)

### API Client
- One file per domain (`auth.ts`, `friends.ts`, etc.)
- Export functions, not classes
- Use async/await
- Handle errors with try/catch

## 🔧 Troubleshooting

### "API_BASE_URL is not defined"
Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`

### "401 Unauthorized" on all requests
Your session expired. Sign in again or check that the API is running.

### Images not loading
Run `php artisan storage:link` in the API directory.

### Tests failing
1. Ensure API is running on port 8000
2. Ensure database is seeded with demo user
3. Check Playwright browser installation: `pnpm exec playwright install chromium`

## 🤝 Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Run linting: `pnpm lint`
4. Run tests: `pnpm test:e2e`
5. Create a pull request to `dev` branch

## 📄 License

Creative Commons Zero (CC0-1.0)
