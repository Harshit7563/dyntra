import { useEffect, useState } from 'react';
import { adminApi, formatPrice } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-6">Dashboard</h1>
        <AdminAlert message={error} type="error" />
        <p className="text-sm text-gray-500">Make sure you are logged in as admin and the backend is running on port 5001.</p>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const cards = [
    { label: 'Products', value: stats.products },
    { label: 'Categories', value: stats.categories },
    { label: 'Orders', value: stats.orders },
    { label: 'Users', value: stats.users },
    { label: 'Revenue', value: formatPrice(stats.revenue) },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-gold/20 p-5 rounded">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{card.label}</p>
            <p className="text-xl sm:text-2xl font-medium text-charcoal">{card.value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-8">
        Changes in Products, Hero, Testimonials and Categories appear on the live store immediately.
      </p>
    </div>
  );
}
