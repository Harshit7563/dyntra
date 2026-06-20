import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-maroon mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm">Enter your email and we&apos;ll send a reset link</p>
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

        {error && <p className="text-red-500 text-xs">{error}</p>}
        {message && <p className="text-green-700 text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-maroon text-white text-sm uppercase tracking-widest hover:bg-maroon-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link to="/login" className="text-maroon hover:underline">Back to Sign In</Link>
      </p>
    </div>
  );
}
