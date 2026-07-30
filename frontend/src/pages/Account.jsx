import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders, formatPrice, scheduleAccountDeletion, cancelAccountDeletion } from '../api';

export default function Account() {
  const { user, loading, logout, isLoggedIn, login, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [deleteMsg, setDeleteMsg] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setOrdersLoading(false));
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/account' } }} />;
  }

  const deletionDate = user.deletion_effective_at
    ? new Date(user.deletion_effective_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleDeleteConfirm = async () => {
    setDeleteBusy(true);
    setDeleteMsg('');
    try {
      const data = await scheduleAccountDeletion();
      if (data.user) login(data.user, token);
      setShowDeleteConfirm(false);
      setDeleteMsg(
        data.message ||
          'Aapka account 7 din mein automatically permanently delete ho jayega.'
      );
    } catch (err) {
      setDeleteMsg(err.message || 'Could not schedule deletion');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleCancelDelete = async () => {
    setDeleteBusy(true);
    setDeleteMsg('');
    try {
      const data = await cancelAccountDeletion();
      if (data.user) login(data.user, token);
      setDeleteMsg(data.message || 'Account deletion cancelled.');
    } catch (err) {
      setDeleteMsg(err.message || 'Could not cancel deletion');
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="font-serif text-3xl text-maroon mb-1">My Account</h1>
          <p className="text-gray-500 text-sm">Welcome, {user.name}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 border border-maroon text-maroon text-xs uppercase tracking-wider hover:bg-maroon hover:text-white transition-colors shrink-0"
        >
          Logout
        </button>
      </div>

      {user.deletion_requested_at && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4 mb-8">
          Your account is scheduled for deletion
          {deletionDate ? ` on ${deletionDate}` : ' in 7 days'}.
          It will be permanently removed automatically. You can cancel below.
        </div>
      )}

      <section className="bg-white border border-gold/20 p-6 mb-8">
        <h2 className="font-serif text-xl text-maroon mb-4">Profile</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</dt>
            <dd>{user.email}</dd>
          </div>
          {user.phone && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</dt>
              <dd>{user.phone}</dd>
            </div>
          )}
        </dl>
      </section>

      <section>
        <h2 className="font-serif text-xl text-maroon mb-4">Order History</h2>

        {ordersLoading ? (
          <p className="text-gray-500 text-sm">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gold/20 p-8 text-center">
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link
              to="/products"
              className="inline-block px-6 py-2.5 bg-maroon text-white text-xs uppercase tracking-widest hover:bg-maroon-dark transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/order-success/${order.order_number}`}
                className="block bg-white border border-gold/20 p-5 hover:border-maroon/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-medium text-sm">{order.order_number}</span>
                  <span className="text-xs uppercase tracking-wider text-gold">{order.status}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                  <span>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-maroon font-medium">{formatPrice(Number(order.total))}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {(order.items?.length || 0)} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-red-200 p-6 mt-10">
        <h2 className="font-serif text-xl text-maroon mb-2">Delete Account</h2>
        <p className="text-sm text-gray-500 mb-4">
          Account delete karne par yeh 7 din baad automatically permanently delete ho jayega.
          Usse pehle aap yahan se cancel bhi kar sakte ho.
        </p>
        {deleteMsg && <p className="text-sm text-maroon mb-4">{deleteMsg}</p>}

        {showDeleteConfirm && !user.deletion_requested_at && (
          <div className="bg-red-50 border border-red-200 p-4 mb-4 text-sm text-gray-800">
            <p className="font-medium text-red-800 mb-2">Confirm account deletion</p>
            <p className="mb-4">
              Aapka account <strong>7 din</strong> mein automatically permanently delete ho jayega.
              Kya aap continue karna chahte ho?
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 bg-red-700 text-white text-xs uppercase tracking-wider hover:bg-red-800 transition-colors disabled:opacity-60"
              >
                {deleteBusy ? 'Please wait…' : 'Yes, delete in 7 days'}
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {user.deletion_requested_at ? (
          <button
            type="button"
            disabled={deleteBusy}
            onClick={handleCancelDelete}
            className="px-4 py-2.5 border border-maroon text-maroon text-xs uppercase tracking-wider hover:bg-maroon hover:text-white transition-colors disabled:opacity-60"
          >
            {deleteBusy ? 'Please wait…' : 'Cancel Deletion'}
          </button>
        ) : (
          !showDeleteConfirm && (
            <button
              type="button"
              disabled={deleteBusy || !!user.is_admin}
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 bg-red-700 text-white text-xs uppercase tracking-wider hover:bg-red-800 transition-colors disabled:opacity-60"
            >
              Delete Account
            </button>
          )
        )}
      </section>
    </div>
  );
}
