# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 + Vite application with Element Plus UI framework. The project uses TypeScript-style JSDoc comments but is written in JavaScript. This is an address book management application with JWT authentication.

Backend API: `http://localhost:8000`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
vite build

# Preview production build
npm run preview
```

## Architecture

### API Module System

The API layer is centralized and modular:

- **Base instance**: `src/api/index.js` - Creates axios instance with baseURL `http://localhost:8000`, 10s timeout
- **Interceptors**: `src/api/interceptors.js` - Must be imported in `src/main.js` for setup
  - Request interceptor: Adds JWT Bearer token from auth store, timestamp to GET requests, handles FormData
  - Response interceptor: Handles HTTP status codes (400, 401, 403, 404, 422, 429, 500, 502-504), auto-redirects to login on 401
- **API modules**: `src/api/modules/*.js` - Feature-specific API functions
  - Each module exports both named functions and an API object (e.g., `addressBookApi.getList()` and `getList()`)
  - Modules are re-exported through `src/api/modules/index.js`

Example API module structure:
```javascript
import request from "../index";

export const featureApi = {
  getItem(id) {
    return request({ url: `/resource/${id}`, method: "get" });
  }
};

export const getItem = featureApi.getItem;
```

### Authentication Flow

JWT-based authentication using Pinia store:

- **Store**: `src/stores/auth.js` (Composition API style)
  - Persists tokens and member data to localStorage
  - Provides: `isLoggedIn`, `memberName`, `memberEmail`, `memberId` computed properties
  - Actions: `login()`, `logout()`, `refreshAccessToken()`, `fetchCurrentMember()`, `checkAuth()`
- **Login API**: Uses `application/x-www-form-urlencoded` format with URLSearchParams (FastAPI OAuth2PasswordRequestForm requirement)
- **Token handling**: Access token added to Authorization header via request interceptor

### Router Configuration

- **Guards**: `src/router/index.js`
  - `beforeEach`: Checks `meta.requiresAuth`, redirects to `/login` if unauthenticated
  - Sets document title from `meta.title`
  - Prevents authenticated users from accessing `/login` (redirects to `/`)
- **Routes**: All routes imported at the top (no lazy loading)
- Address book routes: `/address-book` (list), `/address-book/add`, `/address-book/edit/:id`

### Component Registration

- All Element Plus icons registered globally in `src/main.js` (lines 14-18)
- Can use icons directly: `<el-icon><HomeFilled /></el-icon>`

## Key Technical Details

- **Path alias**: `@` resolves to `./src` (configured in `vite.config.js`)
- **Rolldown-vite**: Uses `rolldown-vite@7.2.2` instead of standard Vite (specified in package.json overrides)
- **API response format**: Interceptor expects `{ code: 200, data: {}, message: '' }` or direct data
- **Error handling**: ElMessage used for user-facing errors throughout API interceptors
