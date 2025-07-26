# HNV Property Management - Next.js

This is the Next.js version of the HNV Property Management frontend application.

## Migration from React + Vite to Next.js

### Key Changes Made:

1. **Routing System**
   - Converted from React Router to Next.js App Router
   - File-based routing structure in `src/app/`
   - Middleware for route protection

2. **Project Structure**
   ```
   src/
   ├── app/                 # Next.js App Router pages
   │   ├── layout.tsx       # Root layout
   │   ├── page.tsx         # Home page
   │   ├── login/           # Login page
   │   ├── dashboard/       # Dashboard pages
   │   └── providers.tsx    # Client-side providers
   ├── components/          # React components
   ├── lib/                 # Utilities and API client
   ├── hooks/              # Custom hooks
   ├── contexts/           # React contexts
   ├── styles/             # CSS files
   └── utils/              # Utility functions
   ```

3. **Dependencies Updated**
   - Removed: `react-router-dom`, `vite`, `@vitejs/plugin-react`
   - Added: `next`, `eslint-config-next`
   - Updated: API client configuration for Next.js

4. **Configuration Files**
   - `next.config.js` - Next.js configuration
   - `middleware.ts` - Route protection
   - Updated `tsconfig.json` for Next.js

## Getting Started

### Installation

```bash
cd frontend-nextjs
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Key Features Preserved

- ✅ All existing components and functionality
- ✅ Authentication system with Zustand
- ✅ Internationalization (i18n)
- ✅ Tailwind CSS styling
- ✅ React Query for data fetching
- ✅ TypeScript support
- ✅ PWA capabilities
- ✅ Responsive design

## API Integration

The app uses API routes that proxy to the backend server:
- Development: `http://localhost:5001/api`
- Production: Configure in `next.config.js`

## Deployment

This Next.js app can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker containers

## Migration Notes

1. **Client Components**: Components using hooks are marked with `'use client'`
2. **Navigation**: `useNavigate()` replaced with `useRouter()` from `next/navigation`
3. **Links**: `<Link>` from React Router replaced with Next.js `<Link>`
4. **API Client**: Updated to work with Next.js API routes
5. **Middleware**: Added for authentication and route protection

## Next Steps

1. Test all existing functionality
2. Update remaining components with Next.js patterns
3. Optimize for SSR/SSG where beneficial
4. Configure production deployment