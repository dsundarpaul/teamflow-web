# TeamFlow API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
   - [Authentication Module](#authentication-module)
   - [Users Module](#users-module)
   - [Teams Module](#teams-module)
6. [Business Flows](#business-flows)
7. [Error Handling](#error-handling)
8. [Frontend Integration Guide](#frontend-integration-guide)

---

## Overview

TeamFlow API is a NestJS-based RESTful API for managing teams, users, and team memberships. The API provides authentication, user management, and comprehensive team management features with role-based access control at the team level.

**Base URL**: `http://localhost:3000` (default)

**API Version**: v1 (implicit)

**Content-Type**: `application/json`

---

## Architecture

### Module Structure

The application follows NestJS modular architecture:

```
src/
├── app.module.ts          # Root module
├── auth/                   # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── guard/              # Auth guards
│   ├── decorators/         # Custom decorators
│   └── jwt.strategy.ts
├── users/                  # Users module
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/                # Data Transfer Objects
├── teams/                  # Teams module
│   ├── teams.controller.ts
│   ├── teams.service.ts
│   ├── teams.module.ts
│   ├── guards/             # Team-specific guards
│   ├── decorators/         # Team decorators
│   └── dto/                # Team DTOs
└── prisma.service.ts       # Database service
```

### Technology Stack

- **Framework**: NestJS
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer

---

## Authentication & Authorization

### Authentication Flow

1. **User Registration/Login**: User provides credentials
2. **Token Generation**: Server generates JWT access token
3. **Token Usage**: Client includes token in `Authorization` header for protected routes
4. **Token Validation**: Server validates token on each request

### JWT Token Structure

```json
{
  "email": "user@example.com",
  "sub": "user-uuid"
}
```

### Authorization Header Format

```
Authorization: Bearer <access_token>
```

### Public vs Protected Routes

- **Public Routes**: Marked with `@IsPublic()` decorator, no authentication required
- **Protected Routes**: Require valid JWT token in Authorization header

### Team-Level Authorization

- **Team Member**: User must be a member of the team
- **Team Admin**: User must have ADMIN role in the team
- **Last Admin Protection**: Cannot remove/demote the last admin of a team

---

## Data Models

### User Model

```typescript
{
  id: string;              // UUID
  email: string;           // Unique email address
  password: string;        // Hashed password (not returned in responses)
  username: string;        // Unique username
  avatar: string;          // Avatar URL/path
  role: Role;             // System role: USER | ADMIN | SUPER_ADMIN
  createdAt: DateTime;    // ISO 8601 timestamp
  updatedAt: DateTime;    // ISO 8601 timestamp
  teams: TeamMember[];     // Array of team memberships
}
```

### Team Model

```typescript
{
  id: string;             // UUID
  name: string;           // Unique team name
  icon: string | null;    // Team icon URL/path (optional)
  description: string | null;  // Team description (optional)
  createdAt: DateTime;    // ISO 8601 timestamp
  updatedAt: DateTime;    // ISO 8601 timestamp
  members: TeamMember[];  // Array of team members
}
```

### TeamMember Model

```typescript
{
  id: string;            // UUID
  userId: string;         // Reference to User.id
  teamId: string;        // Reference to Team.id
  role: TeamRole;         // MEMBER | ADMIN
  createdAt: DateTime;    // ISO 8601 timestamp
  updatedAt: DateTime;    // ISO 8601 timestamp
  user: User;             // Populated user object (in responses)
  team: Team;             // Populated team object (in responses)
}
```

### Enums

#### Role (System-level)
- `USER` - Default user role
- `ADMIN` - System administrator
- `SUPER_ADMIN` - Super administrator

#### TeamRole (Team-level)
- `MEMBER` - Regular team member
- `ADMIN` - Team administrator

---

## API Endpoints

### Authentication Module

#### 1. Login

Authenticate user and receive access token.

**Endpoint**: `POST /auth/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing or invalid request body

**Flow**:
1. Client sends email and password
2. Server validates credentials
3. Server generates JWT token
4. Client stores token for subsequent requests

---

#### 2. Register

Register a new user account.

**Endpoint**: `POST /auth/registre`

**Access**: Public

**Note**: Currently not fully implemented (endpoint exists but returns empty)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser"
}
```

---

#### 3. Get Current User Profile

Get authenticated user's profile information.

**Endpoint**: `GET /auth/profile`

**Access**: Protected (requires authentication)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "userId": "user-uuid",
  "email": "user@example.com"
}
```

**Error Responses**:
- `401 Unauthorized` - Missing or invalid token

---

### Users Module

#### 1. Create User

Create a new user account.

**Endpoint**: `POST /users`

**Access**: Public

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

**Validation Rules**:
- `email`: Required, must be valid email format
- `password`: Required, string
- `username`: Required, string, must be unique

**Success Response** (201 Created):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "username",
  "avatar": "",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request` - Validation errors or duplicate email/username
- `409 Conflict` - Email or username already exists

---

#### 2. Get All Users

Retrieve a paginated list of users with optional filtering.

**Endpoint**: `GET /users`

**Access**: Protected

**Query Parameters**:
- `page` (required): Page number (default: 0)
- `limit` (required): Items per page (default: 10)
- `sort` (required): Sort order - `'asc'` or `'desc'`
- `role` (optional): Filter by system role - `USER | ADMIN | SUPER_ADMIN`
- `search` (optional): Search term (currently not implemented)

**Example Request**:
```
GET /users?page=0&limit=10&sort=asc&role=USER
```

**Success Response** (200 OK):
```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "avatar": "",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Pagination Notes**:
- Uses offset-based pagination: `skip = page * limit`
- Results are ordered by `username` field

---

#### 3. Get User by ID

Retrieve a specific user by their ID.

**Endpoint**: `GET /users/:id`

**Access**: Protected

**Path Parameters**:
- `id`: User UUID

**Success Response** (200 OK):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "username",
  "avatar": "",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found` - User not found

---

#### 4. Get User by Email

Retrieve a specific user by their email.

**Endpoint**: `GET /users/:email`

**Access**: Protected

**Note**: This endpoint conflicts with `GET /users/:id` - use ID endpoint instead

**Path Parameters**:
- `email`: User email address

---

#### 5. Update User

Update user information.

**Endpoint**: `PUT /users/:id`

**Access**: Protected

**Path Parameters**:
- `id`: User UUID

**Request Body** (all fields optional):
```json
{
  "email": "newemail@example.com",
  "username": "newusername",
  "avatar": "https://example.com/avatar.jpg",
  "role": "ADMIN"
}
```

**Success Response** (200 OK):
```json
{
  "id": "user-uuid",
  "email": "newemail@example.com",
  "username": "newusername",
  "avatar": "https://example.com/avatar.jpg",
  "role": "ADMIN",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found` - User not found
- `400 Bad Request` - Validation errors

---

#### 6. Delete User

Delete a user account.

**Endpoint**: `DELETE /users/:id`

**Access**: Protected

**Path Parameters**:
- `id`: User UUID

**Success Response** (200 OK):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  ...
}
```

**Error Responses**:
- `404 Not Found` - User not found

**Note**: Deleting a user will cascade delete their team memberships (TeamMember records)

---

### Teams Module

#### 1. Create Team

Create a new team. The creator automatically becomes the team admin.

**Endpoint**: `POST /teams`

**Access**: Protected (authenticated users only)

**Request Body**:
```json
{
  "name": "Development Team",
  "icon": "https://example.com/icon.png",
  "description": "Team responsible for product development",
  "memberIds": ["user-uuid-1", "user-uuid-2"]
}
```

**Validation Rules**:
- `name`: Required, string, must be unique across all teams
- `icon`: Optional, string
- `description`: Optional, string
- `memberIds`: Optional, array of user UUIDs to add as members

**Success Response** (201 Created):
```json
{
  "id": "team-uuid",
  "name": "Development Team",
  "icon": "https://example.com/icon.png",
  "description": "Team responsible for product development",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "members": [
    {
      "id": "member-uuid",
      "userId": "creator-uuid",
      "teamId": "team-uuid",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "creator-uuid",
        "email": "creator@example.com",
        "username": "creator",
        "avatar": ""
      }
    },
    {
      "id": "member-uuid-2",
      "userId": "user-uuid-1",
      "teamId": "team-uuid",
      "role": "MEMBER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid-1",
        "email": "member1@example.com",
        "username": "member1",
        "avatar": ""
      }
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request` - Team name already exists or validation errors
- `404 Not Found` - One or more user IDs in memberIds not found

**Business Logic**:
1. Creator is automatically added as ADMIN
2. Users in `memberIds` are added as MEMBER role
3. Creator's ID is excluded from memberIds if present

---

#### 2. Get All Teams

Retrieve all teams the authenticated user is a member of.

**Endpoint**: `GET /teams`

**Access**: Protected

**Query Parameters**:
- `page` (optional): Page number (default: 0)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for team name or description

**Example Request**:
```
GET /teams?page=0&limit=10&search=development
```

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "team-uuid",
      "name": "Development Team",
      "icon": "https://example.com/icon.png",
      "description": "Team description",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "members": [...]
    }
  ],
  "meta": {
    "total": 25,
    "page": 0,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Business Logic**:
- Only returns teams where the authenticated user is a member
- Results ordered by creation date (newest first)
- Search matches team name or description

---

#### 3. Get Team Details

Retrieve detailed information about a specific team.

**Endpoint**: `GET /teams/:id`

**Access**: Protected (Team Member only)

**Guards**: `TeamMemberGuard` - Ensures user is a member of the team

**Path Parameters**:
- `id`: Team UUID

**Success Response** (200 OK):
```json
{
  "id": "team-uuid",
  "name": "Development Team",
  "icon": "https://example.com/icon.png",
  "description": "Team description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "members": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "teamId": "team-uuid",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "username": "username",
        "avatar": ""
      }
    }
  ]
}
```

**Error Responses**:
- `404 Not Found` - Team not found or user is not a member
- `403 Forbidden` - User is not a member of the team

---

#### 4. Update Team

Update team information (name, icon, description).

**Endpoint**: `PUT /teams/:id`

**Access**: Protected (Team Admin only)

**Guards**: `TeamAdminGuard` - Ensures user is an admin of the team

**Path Parameters**:
- `id`: Team UUID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Team Name",
  "icon": "https://example.com/new-icon.png",
  "description": "Updated description"
}
```

**Success Response** (200 OK):
```json
{
  "id": "team-uuid",
  "name": "Updated Team Name",
  "icon": "https://example.com/new-icon.png",
  "description": "Updated description",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "members": [...]
}
```

**Error Responses**:
- `404 Not Found` - Team not found
- `403 Forbidden` - User is not an admin of the team
- `400 Bad Request` - New team name already exists

**Business Logic**:
- Team name must remain unique if changed
- Only admins can update team details

---

#### 5. Delete Team

Delete a team and all its memberships.

**Endpoint**: `DELETE /teams/:id`

**Access**: Protected (Team Admin only)

**Guards**: `TeamAdminGuard` - Ensures user is an admin of the team

**Path Parameters**:
- `id`: Team UUID

**Success Response** (200 OK):
```json
{
  "message": "Team deleted successfully"
}
```

**Error Responses**:
- `404 Not Found` - Team not found
- `403 Forbidden` - User is not an admin of the team

**Business Logic**:
- Deleting a team cascades to delete all TeamMember records
- All team memberships are removed

---

#### 6. Add Team Member

Add a user to the team.

**Endpoint**: `POST /teams/:id/members`

**Access**: Protected (Team Admin only)

**Guards**: `TeamAdminGuard` - Ensures user is an admin of the team

**Path Parameters**:
- `id`: Team UUID

**Request Body**:
```json
{
  "userId": "user-uuid",
  "role": "MEMBER"
}
```

**Validation Rules**:
- `userId`: Required, string (UUID)
- `role`: Optional, enum - `MEMBER` (default) or `ADMIN`

**Success Response** (201 Created):
```json
{
  "id": "member-uuid",
  "userId": "user-uuid",
  "teamId": "team-uuid",
  "role": "MEMBER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "avatar": ""
  }
}
```

**Error Responses**:
- `404 Not Found` - Team or user not found
- `403 Forbidden` - User is not an admin of the team
- `400 Bad Request` - User is already a member of the team

**Business Logic**:
- Default role is MEMBER if not specified
- Cannot add the same user twice (unique constraint)

---

#### 7. Remove Team Member

Remove a user from the team.

**Endpoint**: `DELETE /teams/:id/members/:userId`

**Access**: Protected (Team Admin only)

**Guards**: `TeamAdminGuard` - Ensures user is an admin of the team

**Path Parameters**:
- `id`: Team UUID
- `userId`: User UUID to remove

**Success Response** (200 OK):
```json
{
  "message": "Member removed successfully"
}
```

**Error Responses**:
- `404 Not Found` - Team or member not found
- `403 Forbidden` - User is not an admin of the team
- `400 Bad Request` - Cannot remove the last admin

**Business Logic**:
- **Last Admin Protection**: Cannot remove a member if they are the only admin
- Admin must promote another member to admin first

---

#### 8. Update Member Role

Promote or demote a team member.

**Endpoint**: `PATCH /teams/:id/members/:userId/role`

**Access**: Protected (Team Admin only)

**Guards**: `TeamAdminGuard` - Ensures user is an admin of the team

**Path Parameters**:
- `id`: Team UUID
- `userId`: User UUID to update

**Request Body**:
```json
{
  "role": "ADMIN"
}
```

**Validation Rules**:
- `role`: Required, enum - `MEMBER` or `ADMIN`

**Success Response** (200 OK):
```json
{
  "id": "member-uuid",
  "userId": "user-uuid",
  "teamId": "team-uuid",
  "role": "ADMIN",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "avatar": ""
  }
}
```

**Error Responses**:
- `404 Not Found` - Team or member not found
- `403 Forbidden` - User is not an admin of the team
- `400 Bad Request` - Cannot demote the last admin

**Business Logic**:
- **Last Admin Protection**: Cannot demote an admin if they are the only admin
- Admin must promote another member to admin first before demoting

---

#### 9. Leave Team

Allow a team member to voluntarily leave the team.

**Endpoint**: `POST /teams/:id/leave`

**Access**: Protected (Team Member only)

**Guards**: `TeamMemberGuard` - Ensures user is a member of the team

**Path Parameters**:
- `id`: Team UUID

**Success Response** (200 OK):
```json
{
  "message": "Successfully left the team"
}
```

**Error Responses**:
- `404 Not Found` - Team not found or user is not a member
- `403 Forbidden` - User is not a member of the team
- `400 Bad Request` - Cannot leave as the last admin

**Business Logic**:
- **Last Admin Protection**: Admins cannot leave if they are the only admin
- Admin must promote another member or delete the team
- Regular members can leave at any time

---

## Business Flows

### User Registration and Authentication Flow

```
1. User Registration
   POST /users
   → Creates user account
   → Returns user object

2. User Login
   POST /auth/login
   → Validates credentials
   → Returns JWT access_token

3. Store Token
   → Frontend stores token (localStorage/sessionStorage)

4. Authenticated Requests
   → Include token in Authorization header
   → Server validates token on each request
```

### Team Creation and Management Flow

```
1. Create Team
   POST /teams
   → User creates team
   → Creator automatically becomes ADMIN
   → Optional: Add initial members

2. View Teams
   GET /teams
   → Returns all teams user is member of
   → Supports pagination and search

3. Team Details
   GET /teams/:id
   → View team information and members
   → Only accessible to team members

4. Manage Members (Admin Only)
   POST /teams/:id/members          → Add member
   DELETE /teams/:id/members/:userId → Remove member
   PATCH /teams/:id/members/:userId/role → Change role

5. Update Team (Admin Only)
   PUT /teams/:id
   → Update name, icon, description

6. Leave Team
   POST /teams/:id/leave
   → Member voluntarily leaves
   → Cannot leave if last admin
```

### Role Management Flow

```
1. Team Creation
   → Creator = ADMIN

2. Adding Members
   → Default role = MEMBER
   → Can specify ADMIN role

3. Promoting Members
   PATCH /teams/:id/members/:userId/role
   → MEMBER → ADMIN

4. Demoting Admins
   PATCH /teams/:id/members/:userId/role
   → ADMIN → MEMBER
   → Blocked if last admin

5. Removing Members
   DELETE /teams/:id/members/:userId
   → Blocked if removing last admin
```

### Last Admin Protection Flow

```
Scenario: Only one admin in team

1. Attempt to Remove Last Admin
   DELETE /teams/:id/members/:adminId
   → Returns 400 Bad Request
   → Error: "Cannot remove the last admin..."

2. Attempt to Demote Last Admin
   PATCH /teams/:id/members/:adminId/role
   → Returns 400 Bad Request
   → Error: "Cannot demote the last admin..."

3. Attempt to Leave as Last Admin
   POST /teams/:id/leave
   → Returns 400 Bad Request
   → Error: "Cannot leave as the last admin..."

Solution:
1. Promote another member to ADMIN first
2. Then remove/demote/leave
```

---

## Error Handling

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data or business rule violation
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error message description",
  "error": "Bad Request"
}
```

### Common Error Scenarios

#### Authentication Errors

```json
// Missing token
{
  "statusCode": 401,
  "message": "No token provided",
  "error": "Unauthorized"
}

// Invalid token
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

#### Authorization Errors

```json
// Not a team member
{
  "statusCode": 404,
  "message": "Team not found or user is not a member",
  "error": "Not Found"
}

// Not a team admin
{
  "statusCode": 403,
  "message": "Only team admins can perform this action",
  "error": "Forbidden"
}
```

#### Validation Errors

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password should not be empty"
  ],
  "error": "Bad Request"
}
```

#### Business Rule Violations

```json
// Last admin protection
{
  "statusCode": 400,
  "message": "Cannot remove the last admin. Promote another member to admin first.",
  "error": "Bad Request"
}

// Duplicate team name
{
  "statusCode": 400,
  "message": "Team name already exists",
  "error": "Bad Request"
}

// User already a member
{
  "statusCode": 400,
  "message": "User is already a member of this team",
  "error": "Bad Request"
}
```

---

## Frontend Integration Guide

### 1. Authentication Setup

#### Store Token

```typescript
// After successful login
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { access_token } = await response.json();
localStorage.setItem('access_token', access_token);
```

#### Create API Client

```typescript
// api/client.ts
const API_BASE_URL = 'http://localhost:3000';

export class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // User methods
  async createUser(data: CreateUserDto) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getUsers(params: FindAllUsersDto) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/users?${query}`);
  }

  // Team methods
  async createTeam(data: CreateTeamDto) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTeams(params?: FindAllTeamsDto) {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return this.request(`/teams${query ? `?${query}` : ''}`);
  }

  async getTeam(id: string) {
    return this.request(`/teams/${id}`);
  }

  async updateTeam(id: string, data: UpdateTeamDto) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTeam(id: string) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE'
    });
  }

  async addTeamMember(teamId: string, userId: string, role?: TeamRole) {
    return this.request(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role })
    });
  }

  async removeTeamMember(teamId: string, userId: string) {
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE'
    });
  }

  async updateMemberRole(teamId: string, userId: string, role: TeamRole) {
    return this.request(`/teams/${teamId}/members/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }

  async leaveTeam(teamId: string) {
    return this.request(`/teams/${teamId}/leave`, {
      method: 'POST'
    });
  }
}
```

### 2. React Query Integration Example

```typescript
// hooks/use-teams.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useTeams(params?: FindAllTeamsDto) {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => apiClient.getTeams(params)
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => apiClient.getTeam(id),
    enabled: !!id
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTeamDto) => apiClient.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDto }) =>
      apiClient.updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', variables.id] });
    }
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ teamId, userId, role }: { teamId: string; userId: string; role?: TeamRole }) =>
      apiClient.addTeamMember(teamId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });
}
```

### 3. TypeScript Types

```typescript
// types/index.ts

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum TeamRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'email' | 'username' | 'avatar'>;
}

export interface CreateUserDto {
  email: string;
  password: string;
  username: string;
}

export interface CreateTeamDto {
  name: string;
  icon?: string;
  description?: string;
  memberIds?: string[];
}

export interface UpdateTeamDto {
  name?: string;
  icon?: string;
  description?: string;
}

export interface AddMemberDto {
  userId: string;
  role?: TeamRole;
}

export interface UpdateMemberRoleDto {
  role: TeamRole;
}

export interface FindAllTeamsDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FindAllUsersDto {
  page: string;
  limit: string;
  sort: 'asc' | 'desc';
  role?: Role;
  search?: string;
}
```

### 4. UI Component Examples

#### Team List Component

```typescript
// components/TeamList.tsx
import { useTeams } from '../hooks/use-teams';

export function TeamList() {
  const { data, isLoading, error } = useTeams({ page: 0, limit: 10 });

  if (isLoading) return <div>Loading teams...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(team => (
        <div key={team.id}>
          <h3>{team.name}</h3>
          <p>{team.description}</p>
          <p>Members: {team.members.length}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Create Team Form

```typescript
// components/CreateTeamForm.tsx
import { useState } from 'react';
import { useCreateTeam } from '../hooks/use-teams';

export function CreateTeamForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createTeam = useCreateTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTeam.mutateAsync({ name, description });
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create team:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Team name"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <button type="submit" disabled={createTeam.isPending}>
        Create Team
      </button>
    </form>
  );
}
```

### 5. Error Handling in UI

```typescript
// utils/error-handler.ts
export function handleApiError(error: any): string {
  if (error.response?.data?.message) {
    if (Array.isArray(error.response.data.message)) {
      return error.response.data.message.join(', ');
    }
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
}

// Usage in component
try {
  await createTeam.mutateAsync(data);
} catch (error) {
  const message = handleApiError(error);
  toast.error(message);
}
```

### 6. Permission Checks

```typescript
// utils/permissions.ts
export function isTeamAdmin(team: Team, userId: string): boolean {
  const membership = team.members.find(m => m.userId === userId);
  return membership?.role === TeamRole.ADMIN;
}

export function isTeamMember(team: Team, userId: string): boolean {
  return team.members.some(m => m.userId === userId);
}

// Usage
const canEditTeam = isTeamAdmin(team, currentUser.id);
const canViewTeam = isTeamMember(team, currentUser.id);
```

---

## Best Practices

### 1. Token Management
- Store tokens securely (consider httpOnly cookies for production)
- Implement token refresh mechanism
- Clear tokens on logout
- Handle token expiration gracefully

### 2. Error Handling
- Always handle API errors in UI
- Display user-friendly error messages
- Log errors for debugging
- Implement retry logic for network failures

### 3. Data Fetching
- Use React Query or similar for caching
- Implement optimistic updates where appropriate
- Invalidate queries after mutations
- Use pagination for large datasets

### 4. Type Safety
- Define TypeScript interfaces for all API responses
- Use type guards for runtime validation
- Keep types in sync with backend

### 5. Performance
- Implement pagination for list endpoints
- Use debouncing for search inputs
- Cache frequently accessed data
- Lazy load team details

---

## Testing Endpoints

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Teams (with token)
curl -X GET http://localhost:3000/teams \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create Team
curl -X POST http://localhost:3000/teams \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Team","description":"Team description"}'
```

### Using Postman

1. Create a collection for TeamFlow API
2. Set base URL: `http://localhost:3000`
3. Create environment variable for `access_token`
4. Add pre-request script to include token:
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.environment.get('access_token')
   });
   ```

---

## Notes

1. **Password Security**: Currently passwords are stored in plain text. In production, implement password hashing (bcrypt).

2. **Token Expiration**: JWT tokens expire after 1 hour. Implement refresh token mechanism for production.

3. **CORS**: Configure CORS settings in `main.ts` for frontend integration.

4. **Validation**: All DTOs use class-validator for request validation.

5. **Database**: Currently using SQLite for development. Consider PostgreSQL for production.

6. **Error Messages**: Error messages are user-friendly and descriptive for frontend integration.

---

## Support

For issues or questions:
- Check error responses for detailed messages
- Verify authentication token is valid
- Ensure user has proper permissions for team operations
- Review business rules (e.g., last admin protection)

---

**Last Updated**: 2024-01-01
**API Version**: 1.0.0

