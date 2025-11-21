# Ghost Letter

Send private, disappearing messages to your friends! A Snapchat-like ephemeral messaging platform with self-destructing images and secure communication.

## 🏗️ Monorepo Structure

This project is organized as a pnpm monorepo with two main packages:

```
ghostletter/
├── UI/          # Next.js 16 frontend
├── API/         # Laravel 12 backend
└── package.json # Monorepo scripts
```

### UI (Frontend)
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit
- **Features**:
  - User authentication with 2FA
  - Real-time messaging
  - Camera integration for photo capture
  - Ephemeral image viewing (10-second countdown)
  - Friend management

### API (Backend)
- **Framework**: Laravel 12
- **Authentication**: Bspdx/Authkit with Laravel Fortify
- **Features**:
  - RESTful API with Laravel Sanctum
  - Two-factor authentication (2FA)
  - User management with passkeys support
  - Message and friend management
  - Image upload and storage
  - Ephemeral message expiry logic

## 🚀 Getting Started

### Prerequisites
- PHP 8.4+
- Composer 2.8+
- Node.js 18+
- pnpm 10+

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up the API**:
   ```bash
   cd API
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan storage:link
   ```

3. **Run both servers concurrently**:
   ```bash
   # From root directory
   pnpm dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Frontend (port 3000)
   pnpm dev:ui

   # Terminal 2 - Backend (port 8000)
   pnpm dev:api
   ```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api

## 📁 Project Structure

### Database Schema

**Users**
- Standard Laravel user fields
- `initials`, `color`, `avatar_url` for UI personalization

**Friends**
- Bilateral friendship relationships
- Links users together

**Messages**
- Support for text and image types
- Ephemeral image viewing with expiry timestamps
- Read status tracking

## 🔒 Authentication

The API uses Laravel Fortify with Bspdx/Authkit for:
- Standard email/password authentication
- Two-factor authentication (2FA)
- Passkey support (WebAuthn)
- API token management via Sanctum

## 📡 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login with credentials
- `POST /logout` - Logout current user
- `POST /two-factor-authentication` - Enable/disable 2FA

### Friends
- `GET /api/friends` - List all friends
- `GET /api/friends-list` - Simple friends list
- `POST /api/friends` - Add a friend
- `DELETE /api/friends/{id}` - Remove friend

### Messages
- `GET /api/messages` - List all messages
- `GET /api/conversations/{friendId}` - Get conversation
- `POST /api/messages` - Send message
- `POST /api/messages/{id}/mark-read` - Mark as read
- `POST /api/messages/{id}/mark-viewed` - Mark image as viewed
- `DELETE /api/messages/{id}` - Delete message

### Images
- `POST /api/images/upload` - Upload image

## 🛠️ Development

### Available Scripts

**Root level**:
- `pnpm dev` - Run both UI and API concurrently
- `pnpm dev:ui` - Run UI only
- `pnpm dev:api` - Run API only
- `pnpm build` - Build both projects
- `pnpm lint` - Lint all projects

**UI**:
- `pnpm --filter ghost-letter-ui dev`
- `pnpm --filter ghost-letter-ui build`
- `pnpm --filter ghost-letter-ui lint`

**API**:
- `pnpm --filter ghost-letter-api dev`
- `pnpm --filter ghost-letter-api test`
- `pnpm --filter ghost-letter-api migrate`

## 📝 License

Creative Commons Zero (CC0-1.0)
