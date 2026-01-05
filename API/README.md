# Ghost Letter API

Laravel 12 backend for Ghost Letter, an ephemeral messaging platform with self-destructing messages.

## Features

-   RESTful API with Laravel Sanctum authentication
-   Repository-Service-Controller architecture pattern
-   Advanced authentication with 2FA (TOTP) and WebAuthn passkeys via Bspdx/Authkit
-   Ephemeral messaging with automatic expiration
-   Image upload and storage with automatic cleanup
-   Friend management system
-   Read/viewed message tracking

## Tech Stack

-   **Framework**: Laravel 12
-   **PHP**: 8.2+
-   **Database**: SQLite (default), MySQL, PostgreSQL, MariaDB supported
-   **Authentication**: Laravel Fortify + Sanctum + Bspdx/Authkit
-   **Testing**: PHPUnit with Feature and Unit test suites
-   **Code Quality**: Laravel Pint (PSR-12 style)

## Quick Start

### Prerequisites

-   PHP 8.2 or higher
-   Composer
-   SQLite (or MySQL/PostgreSQL)
-   pnpm (for monorepo setup)

### Installation

From the monorepo root:

```bash
# Install all dependencies
pnpm install

# Start API development server
pnpm dev:api
```

Or from the API directory directly:

```bash
cd API

# Copy environment file
cp .env.example .env

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Run migrations with seed data
php artisan migrate:fresh --seed

# Link storage directory for image uploads
php artisan storage:link

# Start development server (http://localhost:8000)
php artisan serve
```

## Development Commands

### From Monorepo Root

```bash
pnpm dev                    # Run both UI and API
pnpm dev:api                # Run API only
pnpm --filter ghost-letter-api test
pnpm --filter ghost-letter-api migrate
pnpm --filter ghost-letter-api lint
```

### From API Directory

```bash
# Development
php artisan serve           # Start development server
php artisan queue:work      # Process background jobs
php artisan pail            # Real-time log viewer

# Database
php artisan migrate         # Run pending migrations
php artisan migrate:fresh   # Reset database
php artisan migrate:fresh --seed  # Reset with sample data
php artisan db:seed         # Seed database

# Testing
php artisan test            # Run all tests
php artisan test --filter=MessageTest  # Run specific test
php artisan test --coverage # Generate coverage report

# Code Quality
php artisan pint            # Format code (Laravel Pint)
php artisan pint --test     # Check formatting without changes

# Utilities
php artisan storage:link    # Create storage symbolic link
php artisan config:cache    # Cache configuration
php artisan route:list      # List all routes
php artisan tinker          # Interactive REPL
```

## Architecture

### Directory Structure

```
API/
├── app/
│   ├── Actions/Fortify/       # Authentication actions
│   ├── Http/
│   │   ├── Controllers/Api/   # API endpoints
│   │   └── Middleware/        # Custom middleware
│   ├── Models/                # Eloquent models
│   ├── Repositories/          # Data access layer
│   └── Services/              # Business logic layer
├── config/                    # Configuration files
├── database/
│   ├── factories/             # Model factories
│   ├── migrations/            # Database migrations
│   └── seeders/               # Database seeders
├── routes/
│   └── api.php                # API routes
├── storage/                   # File storage
│   └── app/
│       └── public/            # Publicly accessible files
└── tests/
    ├── Feature/               # Feature tests
    └── Unit/                  # Unit tests
```

### Layered Architecture

Ghost Letter API follows the **Repository-Service-Controller** pattern:

```
Request → Controller → Service → Repository → Model → Database
```

**Controllers** ([app/Http/Controllers/Api/](app/Http/Controllers/Api/))

-   Handle HTTP requests and responses
-   Validate input
-   Return JSON responses
-   Delegate business logic to Services

**Services** ([app/Services/](app/Services/))

-   Contain business logic
-   Orchestrate operations across multiple repositories
-   Handle complex workflows (e.g., message expiration)
-   Independent of HTTP layer (testable)

**Repositories** ([app/Repositories/](app/Repositories/))

-   Handle all database queries
-   Abstract data persistence
-   Return Eloquent models or collections
-   Single responsibility: data access

**Models** ([app/Models/](app/Models/))

-   Eloquent ORM models
-   Define relationships
-   Contain model-specific logic (accessors, mutators, scopes)

### Database Schema

**Core Models:**

-   **users**: User accounts with 2FA support, avatars, initials, color schemes
-   **friends**: Bilateral friendship relationships (many-to-many through pivot)
-   **messages**: Text and image messages with read/viewed tracking, expiry timestamps
-   **images**: Uploaded image files with storage paths and metadata

**Key Relationships:**

-   User has many Friends (bidirectional through friends table)
-   User has many Messages (as sender and recipient)
-   Message belongs to one Image (optional)
-   Message belongs to User (sender and receiver)

### Authentication System

**Stack:** Laravel Fortify + Sanctum + Bspdx/Authkit

**Features:**

-   **Username/password authentication** (username-based, not email)
-   Two-factor authentication (TOTP)
-   WebAuthn passkeys support
-   Sanctum API token authentication
-   CSRF protection for SPA

**Default Demo User:**
- Username: `demo01`
- Password: `demo01`

> **Note:** This API uses username-based authentication. The Fortify configuration has been updated to use `username` instead of `email` as the authentication field.

**Auth Endpoints** (handled by Fortify):

-   `POST /register` - User registration
-   `POST /login` - User login
-   `POST /logout` - User logout
-   `POST /two-factor-authentication` - Enable/disable 2FA
-   `POST /user/confirm-password` - Password confirmation

**Protected Routes:**
All `/api/*` routes require `auth:sanctum` middleware except auth endpoints.

## API Endpoints

Base URL: `http://localhost:8000/api`

### Authentication

```http
# Get authenticated user
GET /api/user
Authorization: Bearer {token}
```

### Friends

```http
# List all friends
GET /api/friends

# Get specific friend
GET /api/friends/{id}

# Send friend request
POST /api/friends
Content-Type: application/json
{
  "friend_id": 123
}

# Accept/reject friend request
PUT /api/friends/{id}

# Remove friend
DELETE /api/friends/{id}

# Get friends list (simplified)
GET /api/friends-list
```

### Messages

```http
# List all messages
GET /api/messages

# Get specific message
GET /api/messages/{id}

# Send message
POST /api/messages
Content-Type: application/json
{
  "receiver_id": 123,
  "content": "Hello!",
  "image_id": 456  // optional
}

# Get conversation with friend
GET /api/conversations/{friendId}

# Mark message as read
POST /api/messages/{id}/mark-read

# Mark image message as viewed (starts expiry timer)
POST /api/messages/{id}/mark-viewed

# Delete message
DELETE /api/messages/{id}
```

### Images

```http
# Upload image
POST /api/images/upload
Content-Type: multipart/form-data
image: [file]
```

See [routes/api.php](routes/api.php) for complete route definitions.

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Application
APP_NAME="Ghost Letter API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (SQLite by default)
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite

# Or use MySQL/PostgreSQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ghostletter
# DB_USERNAME=root
# DB_PASSWORD=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000

# Message Settings
MESSAGE_EXPIRY_SECONDS=30
```

### Custom Configuration

**Message Expiry** ([config/app.php](config/app.php#L137))

```php
'message_expiry_seconds' => env('MESSAGE_EXPIRY_SECONDS', 30)
```

Controls how long image messages remain viewable after being opened.

**Sanctum Stateful Domains** ([config/sanctum.php](config/sanctum.php#L18))

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:3000'))
```

Domains that receive stateful authentication cookies (your frontend).

## Testing

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/MessageTest.php

# Run specific test method
php artisan test --filter test_user_can_send_message

# Run with coverage
php artisan test --coverage

# Run with parallel execution
php artisan test --parallel
```

### Test Database

Tests use **in-memory SQLite** for speed and isolation (configured in `phpunit.xml`).

### Writing Tests

**Feature Tests** ([tests/Feature/](tests/Feature/))
Test API endpoints, authentication, and user workflows.

```php
public function test_user_can_send_message()
{
    $user = User::factory()->create();
    $friend = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/messages', [
        'receiver_id' => $friend->id,
        'content' => 'Hello!',
    ]);

    $response->assertStatus(201);
}
```

**Unit Tests** ([tests/Unit/](tests/Unit/))
Test services, repositories, and business logic in isolation.

## Image Storage

### Configuration

Images are stored in `storage/app/public/images/`.

**Important:** Run `php artisan storage:link` to create a symbolic link from `public/storage` to `storage/app/public`.

### Image Upload Flow

1. Client uploads image via `POST /api/images/upload`
2. ImageService validates and stores file
3. ImageRepository creates database record
4. Returns image ID for use in messages
5. Messages reference image by ID
6. Image expires when message expires

### Storage Drivers

Supports multiple storage backends via Laravel filesystems:

-   **local**: Local filesystem (default)
-   **public**: Publicly accessible local storage
-   **s3**: Amazon S3
-   **Custom**: Any Laravel-supported driver

Configure in [config/filesystems.php](config/filesystems.php) and `.env`.

## Code Quality

### Laravel Pint

Uses Laravel Pint (PSR-12 style) for code formatting:

```bash
# Format all files
php artisan pint

# Check without formatting
php artisan pint --test

# Format specific directory
php artisan pint app/Services
```

### PHPStan / Larastan

Static analysis (if configured):

```bash
./vendor/bin/phpstan analyse
```

## Deployment

### Production Checklist

```bash
# 1. Install dependencies (production only)
composer install --no-dev --optimize-autoloader

# 2. Generate application key
php artisan key:generate

# 3. Run migrations
php artisan migrate --force

# 4. Link storage
php artisan storage:link

# 5. Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Set permissions
chmod -R 775 storage bootstrap/cache
```

### Environment Settings

```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Use production database
DB_CONNECTION=mysql
DB_HOST=your-db-host

# Enable caching
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
```

### Queue Workers

Run queue workers for background jobs:

```bash
php artisan queue:work --tries=3 --timeout=90
```

Use supervisor or systemd to keep workers running.

## Troubleshooting

### Common Issues

**Storage link broken**

```bash
php artisan storage:link
```

**Database not found (SQLite)**

```bash
touch database/database.sqlite
php artisan migrate
```

**Sanctum authentication fails**
Check `SANCTUM_STATEFUL_DOMAINS` includes your frontend URL.

**CORS errors**
Verify `config/cors.php` and frontend URL configuration.

**Migration errors**

```bash
php artisan migrate:fresh  # Warning: destroys data
```

### Debugging

**Enable query logging:**

```php
DB::enableQueryLog();
// ... code ...
dd(DB::getQueryLog());
```

**Use Tinker for debugging:**

```bash
php artisan tinker
>>> User::count()
>>> Message::with('sender', 'receiver')->first()
```

**Check logs:**

```bash
tail -f storage/logs/laravel.log
# Or use Pail for real-time logs
php artisan pail
```

## Contributing

1. Follow PSR-12 coding standards (enforced by Pint)
2. Write tests for new features
3. Run `php artisan test` before committing
4. Run `php artisan pint` to format code
5. Update documentation for API changes

## License

[MIT License](../LICENSE)

## Resources

-   [Laravel Documentation](https://laravel.com/docs/12.x)
-   [Laravel Sanctum](https://laravel.com/docs/12.x/sanctum)
-   [Laravel Fortify](https://laravel.com/docs/12.x/fortify)
-   [Bspdx/Authkit](https://github.com/bspdx/authkit)
-   [PHPUnit Documentation](https://phpunit.de/documentation.html)
