# Society Management System - Server Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Libraries](#tech-stack--libraries)
3. [Project Architecture](#project-architecture)
4. [Module: Auth (Login & Reset Password)](#module-auth)
5. [Module: Residents](#module-residents)
6. [Module: Apartments](#module-apartments)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Database Schema](#database-schema)
9. [Authentication & Authorization](#authentication--authorization)
10. [Error Handling](#error-handling)

---

## Project Overview

**Society Management System** is a backend API server for managing residential societies/apartments. It handles user authentication, resident management, apartment management, and related operations. The project follows **Clean Architecture** with Domain-Driven Design (DDD) principles using a modular folder structure.

**Runtime:** Node.js with TypeScript
**Entry Point:** `src/server.ts` → `dist/server.js`

---

## Tech Stack & Libraries

### Core Framework
| Library | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.2.1 | HTTP web framework for building REST APIs |
| `cors` | ^2.8.6 | Cross-Origin Resource Sharing middleware |
| `cookie-parser` | ^1.4.7 | Parse HTTP request cookies |
| `dotenv` |j^17.4.2 | Load environment variables from `.env` |

### Database & ORM
| Library | Version | Purpose |
|---------|---------|---------|
| `sequelize` | ^6.37.8 | ORM for PostgreSQL database operations |
| `pg` | ^8.21.0 | PostgreSQL client driver |
| `pg-hstore` | ^2.3.4 | Serialize/deserialize JSON data to hstore format |

### Authentication & Security
| Library | Version | Purpose |
|---------|---------|---------|
| `jsonwebtoken` | ^9.0.3 | Generate and verify JWT access/refresh tokens |
| `bcrypt` | ^6.0.0 | Hash and compare passwords (salt rounds: 10) |
| `bcryptjs` | ^3.0.3 | Alternative bcrypt implementation (available) |

### Validation
| Library | Version | Purpose |
|---------|---------|---------|
| `joi` | ^18.2.3 | Request body/query validation with schema definitions |
| `express-validator` | ^7.3.2 | Alternative validation library (available) |

### Email Service
| Library | Version | Purpose |
|---------|---------|---------|
| `nodemailer` | ^9.0.1 | Send emails via SMTP (password reset, invitations) |

### File Handling
| Library | Version | Purpose |
|---------|---------|---------|
| `multer` | ^2.2.0 | Handle multipart/form-data file uploads (Excel import) |
| `xlsx` | ^0.18.5 | Parse Excel (.xlsx/.xls) files for bulk data import |

### Real-time Communication
| Library | Version | Purpose |
|---------|---------|---------|
| `socket.io` | ^4.8.3 | WebSocket server for real-time notifications |

### Scheduled Tasks
| Library | Version | Purpose |
|---------|---------|---------|
| `node-cron` | ^4.6.0 | Cron job scheduler for periodic tasks |

### Other
| Library | Version | Purpose |
|---------|---------|---------|
| `cloudinary` | ^2.10.0 | Cloud image/file storage |
| `puppeteer` | ^25.3.0 | Headless browser for PDF generation |
| `resend` | ^6.14.0 | Alternative email service provider |

### Dev Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^6.0.3 | TypeScript compiler |
| `ts-node` | ^10.9.2 | Run TypeScript directly without compilation |
| `nodemon` | ^3.1.14 | Auto-restart server on file changes |
| `sequelize-cli` | ^6.6.5 | Sequelize migration and seed commands |

---

## Project Architecture

The project follows **Clean Architecture** with 4 layers per module:

```
src/
├── server.ts                          # Entry point - starts HTTP server + Socket.io + Cron jobs
├── app.ts                             # Express app setup with global middleware
├── routes.ts                          # Central route registry for all modules
│
├── modules/                           # Feature modules (DDD-style)
│   ├── auth/                          # Authentication module
│   │   ├── domain/                    #   Entities, interfaces, errors
│   │   ├── application/               #   Use cases, DTOs
│   │   ├── infrastructure/            #   Sequelize models, repository implementations, services
│   │   ├── presentation/              #   Controllers, routes, validators, config
│   │   └── container.ts               #   Dependency injection / IoC container
│   │
│   ├── residents/                     # Resident management module
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── container.ts
│   │
│   ├── apartments/                    # Apartment management module
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── container.ts
│   │
│   ├── complaints/
│   ├── document-requests/
│   ├── family-members/
│   ├── maintenance/
│   ├── notices/
│   ├── notifications/
│   ├── tenant-requests/
│   ├── vehicles/
│   └── visitors/
│
└── shared/                            # Cross-cutting concerns
    ├── config/                        # env.ts, db.ts, sequelize.ts
    ├── errors/                        # AppError base class
    ├── jobs/                          # Cron job scheduler
    ├── middleware/                     # jwtMiddleware, rbacMiddleware, errorHandler
    ├── services/
    ├── socket/                        # Socket.io setup
    ├── types/                         # AuthenticatedRequest, Pagination
    ├── utils/                         # ApiResponse, validateRequest
    └── voting/
```

---

## Module: Auth

### Overview
Handles all authentication-related operations: user registration, login, logout, token refresh, password reset, profile management, and password change.

### User Roles
| Role | Description |
|------|-------------|
| `admin` | Full system access, can create users, manage all residents/apartments |
| `resident` | Can view own profile, manage apartment-related data |
| `security` | Limited access for security personnel |

### User Entity Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER (PK, auto) | Unique user identifier |
| `name` | STRING(100) | Full name |
| `email` | STRING(150), UNIQUE | Email address (used for login) |
| `passwordHash` | STRING(255) | Bcrypt hashed password |
| `phone` | STRING(15) | Phone number (used for login by residents) |
| `role` | ENUM | admin / resident / security |
| `isActive` | BOOLEAN (default: true) | Whether user account is active |
| `mustResetPassword` | BOOLEAN (default: false) | Forces password reset on next login |
| `createdAt` | DATE | Account creation timestamp |
| `updatedAt` | DATE | Last update timestamp |

### Features

#### 1. Login
- **Endpoint:** `POST /api/auth/login`
- **Validation:** Joi schema (`identifier` + `password`)
- **Behavior:**
  - Accepts email OR phone number as `identifier`
  - Email format detection via regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
  - Phone login is **RESIDENT-only** (non-residents cannot login via phone)
  - Validates password against bcrypt hash
  - Checks `isActive` status (inactive users rejected)
  - Generates **access token** (JWT, 15min default expiry) and **refresh token** (JWT, 7 days default expiry)
  - Stores refresh token in database with 7-day expiry
  - Sets refresh token as **httpOnly cookie** (secure in production, sameSite: strict)
  - Returns `AuthResponseDto` with `accessToken` and `user` data
  - If `mustResetPassword` is true, frontend should redirect to reset password page

#### 2. Token Refresh
- **Endpoint:** `POST /api/auth/refresh`
- **Behavior:**
  - Reads refresh token from `req.cookies.refreshToken`
  - Verifies JWT signature and checks database for active token
  - Implements **Refresh Token Rotation (RTR)**: deletes old token, issues new pair
  - Validates user still active
  - Returns new access token + refresh token

#### 3. Logout
- **Endpoint:** `POST /api/auth/logout`
- **Behavior:**
  - Reads refresh token from cookies
  - Deletes refresh token from database (invalidates session)
  - Clears the refresh token cookie

#### 4. Get Current User
- **Endpoint:** `GET /api/auth/me` (Protected)
- **Behavior:**
  - Requires valid JWT access token
  - Returns user data + linked resident profile (if exists)
  - `UserResponseDto` includes `residentId` and `resident` summary

#### 5. Update Profile
- **Endpoint:** `PUT /api/auth/me` (Protected)
- **Validation:** `name` (min 2 chars), `phone` (exactly 10 digits)
- **Behavior:** Updates user name and phone number

#### 6. Change Password
- **Endpoint:** `PUT /api/auth/me/password` (Protected)
- **Validation:** `currentPassword`, `newPassword` (8+ chars, uppercase, number, special char)
- **Behavior:**
  - Verifies current password is correct
  - Hashes and stores new password

#### 7. Forgot Password
- **Endpoint:** `POST /api/auth/forgot-password` (Public)
- **Validation:** `email` (valid format)
- **Behavior:**
  - Looks up user by email
  - **Silently returns success** if user not found (security: never reveals email existence)
  - Deletes any existing reset token for the user
  - Generates cryptographically secure random token (`crypto.randomBytes(32)`)
  - Creates `PasswordResetToken` entity with **10-minute expiry**
  - Sends email with reset link: `{CLIENT_URL}/reset-password?token={rawToken}`
  - Email contains styled HTML with reset button and fallback link

#### 8. Reset Password
- **Endpoint:** `POST /api/auth/reset-password` (Public)
- **Validation:** `token`, `newPassword` (8+ chars, uppercase, number, special char)
- **Behavior:**
  - Finds token in database
  - Checks expiry (deletes expired tokens)
  - Hashes new password, updates user
  - Clears `mustResetPassword` flag
  - Deletes used token (one-time use)

#### 9. Create User (Admin Only)
- **Endpoint:** `POST /api/auth/users` (Admin JWT + RBAC)
- **Validation:** `name`, `email`, `password`, `phone`, `role`
- **Behavior:**
  - Checks email uniqueness
  - Hashes password, creates User entity
  - Auto-sets `isActive: true`, `mustResetPassword: false`

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

### Cookie Configuration
```typescript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

### Email Service (Nodemailer)
- Uses SMTP transport with configurable host/port/auth
- Logs email content to console in development
- Gracefully handles SMTP failures (doesn't break flow)
- Supports TLS

---

## Module: Residents

### Overview
Manages resident profiles, linking users to apartments with ownership/tenancy status.

### Resident Entity Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER (PK, auto) | Unique resident identifier |
| `userId` | INTEGER (FK → users.id) | Linked user account |
| `apartmentId` | INTEGER (FK → apartments.id) | Assigned apartment |
| `isOwner` | BOOLEAN | Owner of the apartment vs tenant |
| `isCommitteeMember` | BOOLEAN | Society committee member status |
| `isOccupant` | BOOLEAN | Currently living in the apartment |
| `moveInDate` | DATE | When the resident moved in |
| `moveOutDate` | DATE (nullable) | When the resident moved out |
| `isActive` | BOOLEAN | Whether resident record is active |
| `createdAt` | DATE | Record creation timestamp |
| `updatedAt` | DATE | Last update timestamp |

### Features

#### 1. Create Resident (Admin Only)
- **Endpoint:** `POST /api/residents` (Admin JWT + RBAC)
- **Validation:** `name`, `email`, `password`, `phone`, `apartmentId` (optional)
- **Behavior:**
  - Checks email uniqueness (creates a new User)
  - Checks apartment is not already occupied by an active resident
  - Creates User with `role: RESIDENT`
  - Creates Resident with `isOwner: true` (admin-created residents are always owners)
  - Sets `isOccupant: true` if `moveInDate <= now`
  - Auto-sets `isCommitteeMember: false`, `isActive: true`

#### 2. List Residents (Admin Only)
- **Endpoint:** `GET /api/residents` (Admin JWT + RBAC)
- **Query Params:** `pageNumber`, `pageSize`, `apartmentId`, `isActive`, `isOwner`, `search`
- **Behavior:**
  - Paginated results with `items`, `totalCount`, `pageNumber`, `pageSize`, `totalPages`, `hasNextPage`, `hasPreviousPage`
  - Filters: by apartment, active status, owner status
  - Search: matches `name` or `email` (case-insensitive via `iLike`)
  - Includes `user` (name, email, phone) and `apartment` (block, floor, unit, type) data
  - Returns `stats`: `totalCount`, `totalActive`, `totalOwners`, `totalTenants`
  - Sorted by `createdAt DESC`

#### 3. Get Single Resident (Admin Only)
- **Endpoint:** `GET /api/residents/:id` (Admin JWT + RBAC)
- **Behavior:** Returns resident with linked user and apartment data

#### 4. Update Resident (Admin Only)
- **Endpoint:** `PUT /api/residents/:id` (Admin JWT + RBAC)
- **Validation:** `name`, `phone`, `isOwner`, `moveOutDate` (optional, min 1 field)
- **Behavior:**
  - Only owners can be edited directly (tenants are managed via tenant request workflow)
  - Updates user fields (name, phone) if provided
  - Updates resident fields (isOwner, moveOutDate)
  - If `moveOutDate` is set: deactivates both resident and linked user

#### 5. Deactivate Resident (Admin Only)
- **Endpoint:** `DELETE /api/residents/:id` (Admin JWT + RBAC)
- **Behavior:**
  - Only owners can be deactivated directly
  - **Blocks deactivation** if the apartment has an active tenant
  - Sets `isActive: false`, `isOccupant: false`, `moveOutDate: now` on resident
  - Deactivates the linked user account

#### 6. Get My Resident Profile (Resident Only)
- **Endpoint:** `GET /api/residents/me` (Resident JWT + RBAC)
- **Behavior:** Returns the authenticated user's own resident profile

#### 7. List Apartment Tenants (Resident/Owner Only)
- **Endpoint:** `GET /api/residents/my/tenants` (Resident JWT + RBAC)
- **Behavior:**
  - Only the apartment **owner** can view tenant history
  - Returns list of tenants (non-owners) for the owner's apartment

#### 8. Import Residents (Admin Only)
- **Endpoint:** `POST /api/residents/import` (Admin JWT + RBAC)
- **File Upload:** Excel (.xlsx/.xls), 5MB limit via multer memory storage
- **Excel Columns Required:** `Name`, `Email`, `Password`, `Phone`, `Block`, `Floor Number`, `Unit Number`
- **Behavior:**
  - Validates every row: name (2-100 chars), email (valid format), password (8+ chars with uppercase, number, special), phone (10 digits), block (single letter A-Z), floor (1-100 integer), unit (1-2 digits, not "00")
  - Detects duplicates within the Excel file (email + apartment)
  - For each valid row:
    - Checks user email doesn't already exist in database
    - Resolves apartment by block + floor + unit
    - Verifies apartment is not occupied
    - Hashes password, creates User + Resident (owner)
  - Uses **database transaction** (rolls back on error)
  - Returns: `successCount`, `failedCount`, `failedItems[]` (with row number, identifier, reason)

#### 9. Promote Occupants (Admin Only)
- **Endpoint:** `POST /api/residents/promote-occupants` (Admin JWT + RBAC)
- **Behavior:**
  - Finds active tenants whose `moveInDate` has passed but `isOccupant` is still false
  - Promotes them to occupant (`isOccupant: true`)
  - **Demotes** all other active occupants in the same apartment (e.g., owner yields to tenant)
  - Only affects tenants, never owners

### Database Relationships
- `Resident` belongsTo `User` (FK: userId)
- `Resident` belongsTo `Apartment` (FK: apartmentId)
- `User` hasOne `Resident`
- `Apartment` hasMany `Resident`

---

## Module: Apartments

### Overview
Manages apartment units within the society - creation, listing, updating, and bulk import.

### Apartment Entity Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER (PK, auto) | Unique apartment identifier |
| `block` | STRING(1) | Building block letter (A-Z) |
| `floorNumber` | INTEGER | Floor number (1-100) |
| `unitNumber` | STRING | Unit number (1-2 digits, zero-padded) |
| `areaSqft` | FLOAT | Area in square feet |
| `type` | ENUM | Apartment type |
| `createdAt` | DATE | Record creation timestamp |
| `updatedAt` | DATE | Last update timestamp |

### Apartment Types (Enum)
| Value | Description |
|-------|-------------|
| `studio` | Studio apartment |
| `1bhk` | 1 Bedroom Hall Kitchen |
| `2bhk` | 2 Bedroom Hall Kitchen |
| `3bhk` | 3 Bedroom Hall Kitchen |
| `4bhk` | 4 Bedroom Hall Kitchen |

### Display Name Format
`{block}-{floorNumber}{unitNumber}` → e.g., `A-101`, `B-025`

### Features

#### 1. Create Apartment (via Import Only)
- No single-create endpoint exposed in routes
- Apartments are created via bulk Excel import

#### 2. List Apartments (Admin, Security, Resident)
- **Endpoint:** `GET /api/apartments` (JWT + RBAC for all 3 roles)
- **Query Params:** `pageNumber`, `pageSize`, `search`, `type`, `isOccupied`
- **Behavior:**
  - Paginated results with occupancy status per apartment
  - Search: matches concatenated `block+floorNumber+unitNumber` (case-insensitive)
  - Filters: by apartment type, occupancy status
  - Occupancy determined by active residents with `isOccupant: true`
  - Returns `stats`: `totalOccupied`, `totalVacant`, `totalCount`, `occupancyRate` (percentage)
  - Sorted by block ASC, floor ASC, unit ASC

#### 3. Get Single Apartment (Admin, Security, Resident)
- **Endpoint:** `GET /api/apartments/:id` (JWT + RBAC for all 3 roles)
- **Behavior:**
  - Returns apartment with `isOccupied` flag
  - Includes current occupant's user data (name, email, phone)

#### 4. Update Apartment (Admin Only)
- **Endpoint:** `PUT /api/apartments/:id` (Admin JWT + RBAC)
- **Validation:** `block`, `floorNumber`, `unitNumber`, `areaSqft`, `type` (optional, min 1 field)
- **Behavior:**
  - If block/floor/unit changes, checks uniqueness constraint
  - Uses domain method `updateDetails()` which auto-pads unitNumber to 2 digits

#### 5. Import Apartments (Admin Only)
- **Endpoint:** `POST /api/apartments/import` (Admin JWT + RBAC)
- **File Upload:** Excel (.xlsx/.xls), 5MB limit via multer memory storage
- **Excel Columns Required:** `Block`, `Floor Number`, `Unit Number`, `Area (Sqft)`, `Type`
- **Behavior:**
  - Validates every row: block (single letter), floor (1-100), unit (1-2 digits, not "00"), area (positive number), type (valid enum)
  - Detects duplicates within the Excel file (block + floor + unit)
  - For each valid row:
    - Checks apartment doesn't already exist in database
    - Creates apartment record
  - Uses **database transaction** (rolls back on error)
  - Returns: `successCount`, `failedCount`, `failedItems[]`

### Database Constraints
- Unique index on `(block, floor_number, unit_number)`

---

## API Endpoints Reference

### Auth Routes (`/api/auth`)
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/login` | No | Public | Login with email/phone + password |
| POST | `/refresh` | Cookie | Public | Refresh access token |
| POST | `/logout` | Cookie | Public | Invalidate session |
| POST | `/forgot-password` | No | Public | Request password reset email |
| POST | `/reset-password` | No | Public | Reset password with token |
| GET | `/me` | JWT | Any | Get current user profile |
| PUT | `/me` | JWT | Any | Update own profile |
| PUT | `/me/password` | JWT | Any | Change own password |
| POST | `/users` | JWT | Admin | Create new user |

### Resident Routes (`/api/residents`)
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | JWT | Admin | Create resident |
| POST | `/import` | JWT | Admin | Bulk import from Excel |
| GET | `/` | JWT | Admin | List residents (paginated) |
| GET | `/my/tenants` | JWT | Resident | View apartment tenants (owner only) |
| GET | `/me` | JWT | Resident | Get own resident profile |
| POST | `/promote-occupants` | JWT | Admin | Auto-promote tenants to occupants |
| GET | `/:id` | JWT | Admin | Get resident by ID |
| PUT | `/:id` | JWT | Admin | Update resident |
| DELETE | `/:id` | JWT | Admin | Deactivate resident |

### Apartment Routes (`/api/apartments`)
| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/import` | JWT | Admin | Bulk import from Excel |
| GET | `/` | JWT | Admin/Security/Resident | List apartments (paginated) |
| GET | `/:id` | JWT | Admin/Security/Resident | Get apartment by ID |
| PUT | `/:id` | JWT | Admin | Update apartment |

### Other Module Routes (mounted in `routes.ts`)
| Path | Module |
|------|--------|
| `/api/residents/:residentId/family-members` | Family Members (nested under resident) |
| `/api/family-members` | Family Members (apartment-level) |
| `/api/residents/:residentId/vehicles` | Vehicles (nested under resident) |
| `/api/vehicles` | Vehicles (apartment-level) |
| `/api/notices` | Notices |
| `/api/complaints` | Complaints |
| `/api/maintenance` | Maintenance |
| `/api/notifications` | Notifications |
| `/api/tenant-requests` | Tenant Requests |
| `/api/document-requests` | Document Requests |
| `/api/visitors` | Visitors |

---

## Database Schema

### `users` Table
```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(15) NOT NULL,
  role          ENUM('admin', 'resident', 'security') NOT NULL,
  is_active     BOOLEAN DEFAULT true NOT NULL,
  must_reset_password BOOLEAN DEFAULT false NOT NULL,
  created_at    TIMESTAMP,
  updated_at    TIMESTAMP
);
```

### `residents` Table
```sql
CREATE TABLE residents (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id),
  apartment_id        INTEGER NOT NULL REFERENCES apartments(id),
  is_owner            BOOLEAN DEFAULT false NOT NULL,
  is_committee_member BOOLEAN DEFAULT false NOT NULL,
  is_occupant         BOOLEAN DEFAULT true NOT NULL,
  move_in_date        TIMESTAMP NOT NULL,
  move_out_date       TIMESTAMP,
  is_active           BOOLEAN DEFAULT true NOT NULL,
  created_at          TIMESTAMP,
  updated_at          TIMESTAMP
);
```

### `apartments` Table
```sql
CREATE TABLE apartments (
  id            SERIAL PRIMARY KEY,
  block         CHAR(1) NOT NULL,
  floor_number  INTEGER NOT NULL,
  unit_number   VARCHAR NOT NULL,
  area_sqft     FLOAT NOT NULL,
  type          ENUM('studio', '1bhk', '2bhk', '3bhk', '4bhk') NOT NULL,
  created_at    TIMESTAMP,
  updated_at    TIMESTAMP,
  UNIQUE(block, floor_number, unit_number)
);
```

---

## Authentication & Authorization

### JWT Configuration
| Setting | Default | Description |
|---------|---------|-------------|
| Access Token Secret | `JWT_ACCESS_SECRET` env var | Signs access tokens |
| Refresh Token Secret | `JWT_REFRESH_SECRET` env var | Signs refresh tokens |
| Access Token Expiry | 15 minutes | Short-lived token |
| Refresh Token Expiry | 7 days | Long-lived token, stored in DB + httpOnly cookie |

### JWT Middleware (`jwtMiddleware`)
1. Extracts `Authorization: Bearer <token>` header
2. Verifies token signature
3. Attaches `user` object to request: `{ userId, email, role, mustResetPassword }`
4. **Blocks access** if `mustResetPassword` is true (returns 403)
5. Returns 401 for missing/invalid tokens

### RBAC Middleware (`rbacMiddleware`)
1. Checks `req.user` exists (401 if missing)
2. Compares user's role against allowed roles
3. Returns 403 if role not permitted

### Role Permissions Summary
| Feature | Admin | Resident | Security |
|---------|-------|----------|----------|
| Create Users | Yes | No | No |
| Login (email) | Yes | Yes | Yes |
| Login (phone) | No | Yes | No |
| Manage Residents | Yes | No | No |
| Manage Apartments | Yes | No | View only |
| View Apartments | Yes | Yes | Yes |
| View Own Profile | Yes | Yes | Yes |
| Import Data (Excel) | Yes | No | No |

---

## Error Handling

### Error Handler Middleware
Located at `src/shared/middleware/errorHandler.ts`. Handles:

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| `TokenExpiredError` | 401 | JWT access token expired |
| `JsonWebTokenError` | 401 | Invalid JWT signature |
| `AppError` | Custom | Base error class with `statusCode` |
| Domain errors | Custom | Errors with `statusCode` property |
| Default | 500 | Internal server error |

### Custom Error Classes

**Auth Errors** (`src/modules/auth/domain/errors/AuthErrors.ts`):
- `UserAlreadyExistsError` (409)
- `InvalidCredentialsError` (401)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `UserNotFoundError` (404)
- `InactiveUserError` (403)
- `RefreshTokenNotFoundError` (401)
- `InvalidRefreshTokenError` (401)
- `InvalidResetTokenError` (400)
- `ExpiredResetTokenError` (400)

**Resident Errors** (`src/modules/residents/domain/errors/ResidentErrors.ts`):
- `ResidentNotFoundError` (404)
- `ResidentAlreadyInactiveError` (400)
- `ApartmentAlreadyOccupiedError` (409)
- `OwnerHasActiveTenantError` (400)

**Apartment Errors** (`src/modules/apartments/domain/errors/ApartmentErrors.ts`):
- `ApartmentNotFoundError` (404)
- `ApartmentAlreadyExistsError` (409)

### API Response Format
All responses follow consistent structure via `ApiResponse` utility:
```json
// Success
{
  "success": true,
  "message": "Success",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### Validation Error Format
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Field X is required", "Field Y must be at least 8 characters"]
}
```

---

## Server Startup

1. Load environment variables via `dotenv`
2. Connect to PostgreSQL via Sequelize
3. Initialize cron jobs (`initScheduledJobs()`)
4. Create HTTP server with Express app
5. Initialize Socket.io for real-time features
6. Listen on configured port (default: 5000)
7. Graceful shutdown handling on SIGINT/SIGTERM (closes Sequelize connections)

### Environment Variables Required
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `CLIENT_URL` | http://localhost:5173 | Frontend URL for CORS and email links |
| `NODE_ENV` | development | Environment mode |
| `DATABASE_HOST` | localhost | PostgreSQL host |
| `DATABASE_PORT` | 5432 | PostgreSQL port |
| `DATABASE_USER` | postgres | PostgreSQL user |
| `DATABASE_PASSWORD` | (empty) | PostgreSQL password |
| `DATABASE_NAME` | postgres | PostgreSQL database name |
| `DATABASE_URL` | - | Full database connection URL |
| `JWT_ACCESS_SECRET` | - | Access token signing secret |
| `JWT_REFRESH_SECRET` | - | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | 15m | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | 7d | Refresh token expiry |
| `SMTP_HOST` | - | SMTP server host |
| `SMTP_PORT` | 587 | SMTP server port |
| `SMTP_USER` | - | SMTP username |
| `SMTP_PASSWORD` | - | SMTP password |
| `SMTP_FROM_NAME` | - | Email sender name |
| `SMTP_FROM_EMAIL` | - | Email sender address |
| `CLOUDINARY_CLOUD_NAME` | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | - | Cloudinary API secret |
| `SOCIETY_NAME` | My Society | Society name for display |
| `SOCIETY_ADDRESS` | 123 Main St... | Society address |
