import { useEffect, useState } from 'react';
import { adminApi, formatPrice } from '../../api';
import AdminAlert from '../../components/admin/AdminAlert';
import { useAdminAction } from '../../hooks/useAdminAction';

const STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [data, setData] = useState({ orders: [], page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { alert, run, clearAlert } = useAdminAction();

  const load = async () => {
    setLoading(true);
    try {
      setData(await adminApi.orders({ page, limit: 15 }));
    } catch (err) {
      await run(() => Promise.reject(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const updateStatus = async (orderId, status) => {
    await run(async () => {
      await adminApi.updateOrderStatus(orderId, status);
      await load();
    }, 'Order status updated');
  };

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-maroon mb-6">Orders ({data.total || 0})</h1>

      <AdminAlert message={alert.message} type={alert.type} onClose={clearAlert} />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : data.orders.length === 0 ? (
        <p className="text-gray-500 bg-white border border-gold/20 p-8 text-center">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {data.orders.map((order) => (
            <div key={order.id} className="bg-white border border-gold/20 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-gray-500">{order.customer_name} · {order.email}</p>
                  <p className="text-xs text-gray-400">{order.phone}</p>
                </div>
                <p className="text-maroon font-medium">{formatPrice(order.total)}</p>
              </div>
              {order.items?.length > 0 && (
                <p className="text-xs text-gray-500 mb-3">{order.items.length} item(s) in order</p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="px-3 py-1.5 border text-sm bg-white capitalize"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.pages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm">Page {page}/{data.pages}</span>
          <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
