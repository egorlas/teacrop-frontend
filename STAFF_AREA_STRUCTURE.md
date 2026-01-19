# Staff Area Structure

## Folder Structure

```
viettea-web/
├── middleware.ts                          # Route protection for /staff/*
├── src/
│   ├── app/
│   │   └── staff/
│   │       ├── layout.tsx                 # Staff area layout (sidebar + topbar)
│   │       ├── page.tsx                   # Dashboard page (/staff)
│   │       └── orders/
│   │           └── page.tsx               # Create Order page (/staff/orders)
│   ├── components/
│   │   └── staff/
│   │       ├── StaffSidebar.tsx           # Left sidebar navigation
│   │       ├── StaffTopbar.tsx            # Top header bar
│   │       └── StaffGuard.tsx             # Client-side authorization guard
│   ├── lib/
│   │   ├── auth/
│   │   │   └── staffAuth.ts               # Staff authorization utilities
│   │   └── strapi/
│   │       ├── strapiClient.ts            # Strapi API client wrapper
│   │       └── auth.ts                    # Strapi authentication functions
│   └── store/
│       └── staffAuth.ts                   # Staff auth state store (Zustand)
```

## Routes

- `/staff` - Dashboard (minimal placeholder)
- `/staff/orders` - Create Order page (minimal placeholder form)

## Key Features

### Authentication & Authorization
- **Middleware** (`middleware.ts`): Protects `/staff/*` routes at server level
- **StaffGuard**: Client-side component that checks user role before rendering
- **Role-based access**: Only users with `staff` or `admin` role can access

### Components
- **StaffSidebar**: Left navigation with Dashboard, Create Order (TODO: Inventory, Warehouse)
- **StaffTopbar**: Header with user dropdown and logout
- **StaffLayout**: Wraps all staff pages with sidebar + topbar layout

### Strapi Integration
- **strapiClient**: Fetch wrapper with auth token injection
- **strapi/auth**: Login, logout, getMe functions
- **staffAuth**: Role checking utilities

## TODO Items (Marked in Code)

### Security & Authentication
- [ ] Move JWT storage from localStorage to httpOnly cookie via route handler
- [ ] Replace cookie-based role check with JWT validation in middleware
- [ ] Add server-side logout route handler to clear httpOnly cookie
- [ ] Set STRAPI_URL in `.env.local`

### Strapi Integration
- [ ] Map real Strapi role schema (currently placeholder)
- [ ] Integrate with actual Strapi user role response structure
- [ ] Create Strapi Order content type
- [ ] Implement order creation API endpoint

### Order Creation
- [ ] Connect form to POST `/api/orders`
- [ ] Implement product selector component
- [ ] Add form validation and error handling
- [ ] Add success/error notifications
- [ ] Connect to Strapi orders API

### Future Features (Not Implemented)
- [ ] Inventory management page
- [ ] Warehouse management page
- [ ] Other staff tasks as needed

## Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_STRAPI_URL=http://192.168.31.187:1337
```

## Usage

1. User logs in via existing login flow
2. After login, if user has `staff` or `admin` role:
   - Role cookie is set (temporary solution)
   - User can access `/staff/*` routes
3. Middleware checks role cookie before allowing access
4. StaffGuard provides extra client-side protection

## Architecture Notes

- **Separation**: Staff area is completely separate from public site
- **Extensible**: Easy to add new staff pages in `/app/staff/`
- **Protected**: Multiple layers of protection (middleware + guard)
- **Strapi-ready**: All integration points marked with TODO for future Strapi connection
