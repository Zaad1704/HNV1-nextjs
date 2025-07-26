# HNV1 React to Next.js Migration - Remaining Tasks

## Critical Missing Components

### 1. App Router Pages (HIGH PRIORITY)
```bash
# Create missing route pages
mkdir -p src/app/{forgot-password,reset-password,auth/google,terms,privacy,pricing,plans,verify-email,admin}
```

### 2. API Client Enhancement (HIGH PRIORITY)
- Replace basic `lib/api.ts` with React's sophisticated `api/client.ts`
- Add rate limiting, Render.com detection, comprehensive error handling

### 3. Missing Routes to Create:
- `app/forgot-password/page.tsx`
- `app/reset-password/[token]/page.tsx`
- `app/auth/google/callback/page.tsx`
- `app/terms/page.tsx`
- `app/privacy/page.tsx`
- `app/pricing/page.tsx`
- `app/plans/page.tsx`
- `app/verify-email/[token]/page.tsx`
- `app/admin/*/page.tsx` (all admin routes)
- Dashboard detail routes for payments, tenants, properties

### 4. Context Providers (MEDIUM PRIORITY)
- Enhance `app/providers.tsx` with all React contexts
- Add ThemeProvider, LanguageProvider, CurrencyProvider

### 5. Missing Utilities (MEDIUM PRIORITY)
- PWA service worker registration
- Offline indicators
- Error boundaries
- Security utilities

### 6. Forms Migration (LOW PRIORITY)
- Migrate `forms/RegisterForm.tsx`

## Quick Commands to Complete Migration:

```bash
# 1. Copy API client
cp frontend/src/api/client.ts frontend-nextjs/src/lib/api.ts

# 2. Copy missing utilities
cp -r frontend/src/utils/* frontend-nextjs/src/utils/

# 3. Create missing app routes
# (Manual creation needed for each route)

# 4. Update providers
# (Enhance app/providers.tsx with all contexts)
```

## Estimated Completion: 2-3 hours for critical items