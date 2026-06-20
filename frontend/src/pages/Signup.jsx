import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const from = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
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
        <h1 className="font-serif text-3xl text-maroon mb-2">Create Account</h1>
        <p className="text-gray-500 text-sm">Join Dyntra for a seamless shopping experience</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gold/20 p-8 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Phone (optional)</label>
          <input
            type="tel"
            pattern="[6-9][0-9]{9}"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm"
            placeholder="10-digit mobile"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Password</label>
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Confirm Password</label>
          <input
            required
            type="password"
            value={form.confirm}
            onChange={(e) => update('confirm', e.target.value)}
            className="w-full px-4 py-2.5 border border-gold/30 focus:outline-none focus:border-maroon text-sm"
            placeholder="Repeat password"
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <p className="text-xs text-gray-500 leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link to="/terms-and-conditions" className="text-maroon hover:underline">Terms & Conditions</Link>
          {' '}and{' '}
          <Link to="/privacy-policy" className="text-maroon hover:underline">Privacy Policy</Link>.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-maroon hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
