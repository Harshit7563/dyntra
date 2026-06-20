import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await loginUser({ email, password });
      login(user, token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-maroon mb-2">Welcome Back</h1>
        <p className="text-gray-500 text-sm">Sign in to your Dyntra account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gold/20 p-8 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Password</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm"
            placeholder="Your password"
          />
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-xs text-maroon hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-maroon hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
