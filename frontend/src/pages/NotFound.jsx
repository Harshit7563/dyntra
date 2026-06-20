import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-gold text-xs uppercase tracking-[0.3em] mb-4">404</p>
      <h1 className="font-serif text-3xl text-maroon mb-4">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="inline-block px-8 py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark">
        Back to Home
      </Link>
    </div>
  );
}
