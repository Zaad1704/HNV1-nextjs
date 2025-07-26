import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-secondary mb-6">Page Not Found</h2>
        <p className="text-text-muted mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="btn-gradient px-6 py-3 rounded-2xl font-semibold inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}